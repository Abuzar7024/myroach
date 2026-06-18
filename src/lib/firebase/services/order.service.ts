import { subscribeCollection, where, orderBy } from "@/lib/firebase/realtime";
import type { Order, OrderStatus, OrderStatusUpdate } from "@/types";

function toIso(value: unknown, fallback = new Date().toISOString()): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return fallback;
}

function mapStatusHistory(raw: unknown): OrderStatusUpdate[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      const status = row.status as OrderStatus;
      if (!status) return null;
      return {
        status,
        at: toIso(row.at),
        by: (row.by as OrderStatusUpdate["by"]) ?? "admin",
        note: row.note != null ? String(row.note) : undefined,
        trackingNumber: row.trackingNumber != null ? String(row.trackingNumber) : undefined,
      } satisfies OrderStatusUpdate;
    })
    .filter(Boolean) as OrderStatusUpdate[];
}

export function mapOrderFromFirestore(id: string, raw: Record<string, unknown>): Order {
  const shipping = (raw.shippingAddress ?? {}) as Record<string, string>;
  return {
    id,
    userId: String(raw.userId ?? ""),
    orderNumber: String(raw.orderNumber ?? id),
    items: Array.isArray(raw.items)
      ? (raw.items as Record<string, unknown>[]).map((item) => ({
          productId: String(item.productId ?? ""),
          name: String(item.title ?? item.name ?? "Item"),
          image: String(item.image ?? ""),
          price: Number(item.price ?? 0),
          quantity: Number(item.quantity ?? 1),
          size: String(item.size ?? ""),
          color: String(item.color ?? ""),
        }))
      : [],
    subtotal: Number(raw.subtotal ?? 0),
    shipping: Number(raw.shipping ?? raw.shippingCharge ?? 0),
    discount: Number(raw.discount ?? 0),
    total: Number(raw.total ?? 0),
    couponCode: raw.couponCode != null ? String(raw.couponCode) : undefined,
    status: (raw.status as OrderStatus) ?? "pending",
    shippingAddress: {
      id: "addr-firestore",
      label: "Shipping",
      fullName: shipping.name || String(raw.customerName ?? ""),
      street: shipping.address || "",
      city: shipping.city || "",
      state: shipping.state || "",
      postalCode: shipping.zip || "",
      country: shipping.country || "India",
      isDefault: false,
      phone: shipping.phone || String(raw.customerPhone ?? ""),
      email: shipping.email || String(raw.customerEmail ?? ""),
    },
    customerEmail: String(raw.customerEmail ?? shipping.email ?? ""),
    customerPhone: String(raw.customerPhone ?? shipping.phone ?? ""),
    trackingNumber: raw.trackingNumber != null ? String(raw.trackingNumber) : undefined,
    paymentStatus: (raw.paymentStatus as Order["paymentStatus"]) ?? "pending",
    paymentMethod: raw.paymentMethod as Order["paymentMethod"],
    statusHistory: mapStatusHistory(raw.statusHistory),
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt ?? raw.createdAt),
  };
}

export function subscribeUserOrders(
  userId: string,
  onData: (orders: Order[]) => void,
  onError?: (error: Error) => void
): () => void {
  return subscribeCollection<Order>(
    "orders",
    [where("userId", "==", userId), orderBy("createdAt", "desc")],
    mapOrderFromFirestore,
    onData,
    onError
  );
}
