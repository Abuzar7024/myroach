import { getAdminFirestore } from "@/lib/firebase/admin";

/**
 * Server-authoritative checkout pricing.
 *
 * SECURITY (audit H1): the browser must never decide what it pays. The client
 * sends only *what* it wants to buy (productId + quantity + variant); this
 * module re-derives every rupee from Firestore — product prices, the store's
 * shipping settings, and the coupon — so a tampered client payload cannot
 * lower the charge. Callers create the Razorpay order for `total` and, on
 * verify, assert the captured amount equals `total`.
 *
 * Requires the Firebase Admin SDK (FIREBASE_SERVICE_ACCOUNT_JSON). If it is not
 * configured this throws `ServerPricingUnavailableError`; payment routes should
 * translate that into a 503 rather than fall back to client-supplied amounts.
 */

export class ServerPricingUnavailableError extends Error {
  constructor() {
    super("Secure checkout is not configured on the server");
    this.name = "ServerPricingUnavailableError";
  }
}

export class ServerPricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerPricingError";
  }
}

export interface ServerOrderItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  printSide?: "front" | "back";
}

export interface PricedItem {
  productId: string;
  title: string;
  quantity: number;
  price: number; // server-authoritative unit price (selling price)
  image?: string;
  size?: string;
  color?: string;
  printSide?: "front" | "back";
}

export interface ServerPricing {
  items: PricedItem[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  couponCode?: string;
  /** Razorpay works in the smallest currency unit (paise). */
  amountInPaise: number;
}

const DEFAULT_MIN_QTY = 1;
const DEFAULT_MAX_QTY = 99;

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Mirrors mapProduct(): selling price = salePrice when it undercuts price. */
function sellingPrice(raw: Record<string, unknown>): number {
  const regular = num(raw.price);
  const sale = raw.salePrice != null ? num(raw.salePrice) : undefined;
  return sale != null && sale < regular ? sale : regular;
}

function isActive(raw: Record<string, unknown>): boolean {
  if (typeof raw.active === "boolean") return raw.active;
  if (typeof raw.isActive === "boolean") return raw.isActive;
  return true;
}

function firstImage(raw: Record<string, unknown>): string | undefined {
  if (Array.isArray(raw.images)) {
    const found = (raw.images as unknown[]).find(
      (u): u is string => typeof u === "string" && u.length > 0
    );
    if (found) return found;
  }
  return undefined;
}

function toIsoDate(v: unknown): Date | null {
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate();
  }
  return null;
}

/**
 * Re-price a cart entirely from Firestore. Throws ServerPricingError on any
 * invalid/unavailable item so the caller rejects the payment (fail closed).
 */
export async function computeServerPricing(input: {
  items: ServerOrderItemInput[];
  couponCode?: string;
  now?: Date;
}): Promise<ServerPricing> {
  const db = getAdminFirestore();
  if (!db) throw new ServerPricingUnavailableError();

  const items = Array.isArray(input.items) ? input.items : [];
  if (items.length === 0) throw new ServerPricingError("Your cart is empty");

  // Batch-read the unique products referenced by the cart.
  const uniqueIds = [...new Set(items.map((i) => str(i.productId)).filter(Boolean))];
  if (uniqueIds.length === 0) throw new ServerPricingError("Invalid cart items");

  const refs = uniqueIds.map((id) => db.collection("products").doc(id));
  const snaps = await db.getAll(...refs);
  const byId = new Map(snaps.map((s) => [s.id, s]));

  const pricedItems: PricedItem[] = [];
  let subtotal = 0;

  for (const line of items) {
    const productId = str(line.productId);
    const snap = productId ? byId.get(productId) : undefined;
    if (!snap || !snap.exists) {
      throw new ServerPricingError(`A product in your cart is no longer available`);
    }
    const raw = (snap.data() ?? {}) as Record<string, unknown>;
    if (!isActive(raw)) {
      throw new ServerPricingError(`A product in your cart is no longer available`);
    }

    const unit = sellingPrice(raw);
    if (!(unit > 0)) {
      throw new ServerPricingError(`A product in your cart has an invalid price`);
    }

    const minQty = raw.minOrderQty != null ? num(raw.minOrderQty, DEFAULT_MIN_QTY) : DEFAULT_MIN_QTY;
    const maxQty = raw.maxOrderQty != null ? num(raw.maxOrderQty, DEFAULT_MAX_QTY) : DEFAULT_MAX_QTY;
    const requestedQty = Math.floor(num(line.quantity, 0));
    if (!(requestedQty >= 1)) {
      throw new ServerPricingError(`Invalid quantity for an item in your cart`);
    }
    const qty = Math.min(Math.max(requestedQty, minQty), maxQty);

    subtotal += unit * qty;

    pricedItems.push({
      productId,
      title: str(raw.title) || str(raw.name) || "Item",
      quantity: qty,
      price: unit,
      image: firstImage(raw),
      size: line.size,
      color: line.color,
      printSide: line.printSide,
    });
  }

  subtotal = round2(subtotal);

  // --- Shipping (from settings/general; mirrors cart-store getShippingCost) ---
  // NOTE: dynamic Shiprocket rates are intentionally NOT trusted here. Shipping
  // is derived from the store's configured default charge + free-shipping
  // threshold. If dynamic per-pincode shipping is enabled later, re-fetch the
  // rate server-side and feed it in.
  const settingsSnap = await db.collection("settings").doc("general").get();
  const settings = (settingsSnap.exists ? settingsSnap.data() : {}) as Record<string, unknown>;
  const freeThreshold =
    settings.freeShippingThreshold != null && num(settings.freeShippingThreshold) > 0
      ? num(settings.freeShippingThreshold)
      : Number.POSITIVE_INFINITY;
  const defaultShipping = settings.shippingCharge != null ? Math.max(0, num(settings.shippingCharge)) : 0;
  const shippingCharge = subtotal >= freeThreshold ? 0 : defaultShipping;

  // --- Coupon (revalidated server-side; mirrors lib/coupons validateCoupon) ---
  let discount = 0;
  let appliedCoupon: string | undefined;
  const code = str(input.couponCode).trim().toUpperCase();
  if (code) {
    const couponsSnap = await db.collection("coupons").get();
    const match = couponsSnap.docs.find(
      (d) => str((d.data() as Record<string, unknown>).code).toUpperCase() === code
    );
    if (match) {
      const c = match.data() as Record<string, unknown>;
      const active = isActive(c);
      const expiry = toIsoDate(c.expiryDate ?? c.expiresAt);
      const now = input.now ?? new Date();
      const notExpired = !expiry || expiry >= now;
      const minOrder =
        c.minimumOrderAmount != null
          ? num(c.minimumOrderAmount)
          : c.minOrderAmount != null
            ? num(c.minOrderAmount)
            : 0;

      if (active && notExpired && subtotal >= minOrder) {
        const type = str(c.discountType) || str(c.type) || "percentage";
        const value = num(c.discountValue) || num(c.value);
        const raw =
          type === "fixed" || type === "flat" ? value : Math.round(subtotal * (value / 100));
        discount = Math.min(Math.max(0, raw), subtotal); // never exceed subtotal
        appliedCoupon = code;
      }
    }
    // Silently ignore an invalid/expired coupon: the customer is charged the
    // correct (undiscounted) amount rather than the checkout failing.
  }

  discount = round2(discount);
  const total = round2(Math.max(0, subtotal - discount + shippingCharge));

  return {
    items: pricedItems,
    subtotal,
    discount,
    shippingCharge,
    total,
    couponCode: appliedCoupon,
    amountInPaise: Math.round(total * 100),
  };
}
