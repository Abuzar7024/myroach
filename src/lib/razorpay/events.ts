import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";

export const RAZORPAY_EVENTS_COLLECTION = "razorpay_events";

export type RazorpayEventStatus = "created" | "authorized" | "captured" | "failed" | "refunded";

export interface RazorpayEventRecord {
  id: string;
  eventType: string;
  status: RazorpayEventStatus;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  storeOrderId?: string;
  source: "checkout" | "webhook" | "verify";
  message: string;
  payload?: Record<string, unknown>;
  createdAt: FirebaseFirestore.FieldValue;
}

export async function logRazorpayEvent(
  event: Omit<RazorpayEventRecord, "createdAt">
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) {
    console.warn("[razorpay] FIREBASE_SERVICE_ACCOUNT_JSON not set — event not logged:", event.id);
    return;
  }

  await db
    .collection(RAZORPAY_EVENTS_COLLECTION)
    .doc(event.id)
    .set(
      {
        ...event,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}
