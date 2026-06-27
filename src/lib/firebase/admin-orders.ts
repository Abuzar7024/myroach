import { FieldValue } from "firebase-admin/firestore";
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
        status: "pending",
        at: FieldValue.serverTimestamp(),
        by: "system",
        note: "Order placed after Razorpay payment verification.",
      },
    ],
  });

  return { orderId, orderNumber };
}
