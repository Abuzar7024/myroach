import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { generateOrderNumber } from "@/lib/utils";

export interface PersistStoreOrderInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    image?: string;
    size?: string;
    color?: string;
    printSide?: "front" | "back";
  }[];
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: string;
  couponCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shippingAddress: Record<string, string>;
}

export async function persistStoreOrder(
  input: PersistStoreOrderInput
): Promise<{ orderId: string; orderNumber: string } | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  if (input.razorpayPaymentId) {
    const existing = await db
      .collection("orders")
      .where("razorpayPaymentId", "==", input.razorpayPaymentId)
      .limit(1)
      .get();
    if (!existing.empty) {
      const doc = existing.docs[0]!;
      const data = doc.data();
      return {
        orderId: doc.id,
        orderNumber: String(data.orderNumber || doc.id),
      };
    }
  }

  const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const orderNumber = generateOrderNumber();

  await db.collection("orders").doc(orderId).set({
    id: orderId,
    orderNumber,
    userId: input.userId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone ?? null,
    items: input.items,
    subtotal: input.subtotal,
    tax: 0,
    shippingCharge: input.shippingCharge,
    discount: input.discount,
    total: input.total,
    status: "pending",
    paymentStatus: input.paymentStatus,
    paymentMethod: input.paymentMethod ?? null,
    couponCode: input.couponCode ?? null,
    razorpayOrderId: input.razorpayOrderId ?? null,
    razorpayPaymentId: input.razorpayPaymentId ?? null,
    shippingAddress: input.shippingAddress,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    statusHistory: [
      {
        // NOTE: Firestore rejects FieldValue.serverTimestamp() inside array
        // elements — use a concrete Timestamp so the write actually succeeds.
        status: "pending",
        at: Timestamp.now(),
        by: "system",
        note: "Order placed after Razorpay payment verification.",
      },
    ],
  });

  return { orderId, orderNumber };
}

/**
 * Reconcile an order's payment status from a verified Razorpay webhook so no
 * paid transaction is ever lost (audit H3). If the order already exists (the
 * normal verify path ran), its paymentStatus is updated; if it doesn't exist
 * yet (e.g. the browser closed before /verify), a minimal flagged order is
 * created from the webhook data for admin review. Idempotent.
 */
export async function reconcileOrderPayment(input: {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  eventStatus: "captured" | "authorized" | "failed" | "refunded";
  amountInr: number;
  userId?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: string;
}): Promise<{ orderId: string; action: "updated" | "created" | "noop" } | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const paymentStatus =
    input.eventStatus === "refunded" ? "refunded" : input.eventStatus === "failed" ? "failed" : "paid";

  // Locate an existing order by payment id first, then by order id.
  let ref: FirebaseFirestore.DocumentReference | undefined;
  let existing: FirebaseFirestore.DocumentData | undefined;
  if (input.razorpayPaymentId) {
    const snap = await db
      .collection("orders")
      .where("razorpayPaymentId", "==", input.razorpayPaymentId)
      .limit(1)
      .get();
    if (!snap.empty) {
      ref = snap.docs[0]!.ref;
      existing = snap.docs[0]!.data();
    }
  }
  if (!ref && input.razorpayOrderId) {
    const snap = await db
      .collection("orders")
      .where("razorpayOrderId", "==", input.razorpayOrderId)
      .limit(1)
      .get();
    if (!snap.empty) {
      ref = snap.docs[0]!.ref;
      existing = snap.docs[0]!.data();
    }
  }

  if (ref && existing) {
    if (existing.paymentStatus === paymentStatus) {
      return { orderId: ref.id, action: "noop" };
    }
    await ref.update({
      paymentStatus,
      razorpayPaymentId: input.razorpayPaymentId ?? existing.razorpayPaymentId ?? null,
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: FieldValue.arrayUnion({
        status: existing.status ?? "pending",
        paymentStatus,
        at: Timestamp.now(),
        by: "webhook",
        note: `Payment ${input.eventStatus} reconciled from Razorpay webhook.`,
      }),
    });
    return { orderId: ref.id, action: "updated" };
  }

  // No order yet. Only create for money-in events so a captured payment is
  // never lost; ignore orphan failed/refund events.
  if (paymentStatus !== "paid") return { orderId: "", action: "noop" };

  // Enrich the fallback order from the customer's profile — the webhook payload
  // carries no name/address, which otherwise shows blank in the admin panel.
  let customerName = "";
  let customerEmail = input.customerEmail ?? null;
  let customerPhone = input.customerPhone ?? null;
  if (input.userId) {
    try {
      const userSnap = await db.collection("users").doc(input.userId).get();
      if (userSnap.exists) {
        const u = (userSnap.data() ?? {}) as Record<string, unknown>;
        customerName = String(u.name || u.displayName || "");
        customerEmail = customerEmail || (u.email ? String(u.email) : null);
        customerPhone = customerPhone || (u.phone ? String(u.phone) : null);
      }
    } catch {
      /* best-effort */
    }
  }

  const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const orderNumber = generateOrderNumber();
  await db
    .collection("orders")
    .doc(orderId)
    .set({
      id: orderId,
      orderNumber,
      userId: input.userId ?? null,
      customerName,
      customerEmail,
      customerPhone,
      items: [],
      subtotal: input.amountInr,
      tax: 0,
      shippingCharge: 0,
      discount: 0,
      total: input.amountInr,
      status: "pending",
      paymentStatus: "paid",
      paymentMethod: input.paymentMethod ?? null,
      couponCode: null,
      razorpayOrderId: input.razorpayOrderId ?? null,
      razorpayPaymentId: input.razorpayPaymentId ?? null,
      shippingAddress: {},
      reconciledFromWebhook: true,
      needsReview: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: [
        {
          status: "pending",
          paymentStatus: "paid",
          at: Timestamp.now(),
          by: "webhook",
          note: "Order created from Razorpay webhook (customer did not return to confirm). Needs review.",
        },
      ],
    });

  return { orderId, action: "created" };
}
