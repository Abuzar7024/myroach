import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirestore } from "@/lib/firebase/config";
import { shouldAttemptFirestore } from "@/lib/firebase/firestore-utils";
import type { Order } from "@/types";
import {
  normalizeRequestType,
  type OrderRequest,
  type OrderRequestType,
  type OrderResponseTemplateKey,
} from "@/lib/order-request";

const COL = "orderRequests";

function fromFirestore(id: string, data: Record<string, unknown>): OrderRequest {
  const admin = data.adminResponse as Record<string, unknown> | undefined;
  return {
    id,
    orderId: String(data.orderId ?? ""),
    orderNumber: String(data.orderNumber ?? ""),
    userId: String(data.userId ?? ""),
    customerName: String(data.customerName ?? ""),
    customerEmail: data.customerEmail != null ? String(data.customerEmail) : undefined,
    orderTotal: typeof data.orderTotal === "number" ? data.orderTotal : 0,
    type: normalizeRequestType(data.type),
    status: (data.status as OrderRequest["status"]) ?? "pending",
    reason: String(data.reason ?? ""),
    exchangeDetails:
      data.exchangeDetails != null ? String(data.exchangeDetails) : undefined,
    policyAccepted: data.policyAccepted === true,
    adminResponse: admin
      ? {
          templateKey: String(admin.templateKey ?? "refund_processing") as OrderResponseTemplateKey,
          message: String(admin.message ?? ""),
          refundDays: typeof admin.refundDays === "number" ? admin.refundDays : undefined,
          customNote: admin.customNote != null ? String(admin.customNote) : undefined,
          sentAt:
            admin.sentAt instanceof Timestamp
              ? admin.sentAt.toDate().toISOString()
              : String(admin.sentAt ?? new Date().toISOString()),
        }
      : undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : String(data.createdAt ?? new Date().toISOString()),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : String(data.updatedAt ?? new Date().toISOString()),
  };
}

export async function submitCancellationRequest(
  order: Order,
  userId: string,
  type: OrderRequestType,
  reason: string,
  exchangeDetails?: string
): Promise<string> {
  if (!shouldAttemptFirestore()) throw new Error("Firestore unavailable");
  const db = getFirestore();
  if (!db) throw new Error("Firestore not initialized");

  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    throw new Error("Please describe your request in at least 10 characters.");
  }

  if (type === "exchange" && !exchangeDetails?.trim()) {
    throw new Error("Tell us what you want to exchange for (size, color, or product).");
  }

  const existing = await getDocs(query(collection(db, COL), where("orderId", "==", order.id)));
  const hasPending = existing.docs.some(
    (d) => d.data().userId === userId && d.data().status === "pending"
  );
  if (hasPending) {
    throw new Error("You already have a request processing for this order.");
  }

  const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload: Record<string, unknown> = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId,
    customerName: order.shippingAddress.fullName,
    customerEmail: order.customerEmail || order.shippingAddress.email || "",
    orderTotal: order.total,
    type,
    status: "pending",
    reason: trimmed,
    policyAccepted: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (type === "exchange" && exchangeDetails?.trim()) {
    payload.exchangeDetails = exchangeDetails.trim();
  }

  await setDoc(doc(db, COL, id), payload);
  return id;
}

/** @deprecated Use submitCancellationRequest */
export async function submitOrderRequest(
  order: Order,
  userId: string,
  type: OrderRequestType,
  reason: string
): Promise<string> {
  return submitCancellationRequest(order, userId, type, reason);
}

export function subscribeUserOrderRequests(
  userId: string,
  onData: (requests: OrderRequest[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!shouldAttemptFirestore()) {
    onData([]);
    return () => {};
  }
  const db = getFirestore();
  if (!db) {
    onError?.(new Error("Firestore not initialized"));
    return () => {};
  }

  const q = query(collection(db, COL), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snap) => {
      const requests = snap.docs
        .map((d) => fromFirestore(d.id, d.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(requests);
    },
    (err) => onError?.(err instanceof Error ? err : new Error(String(err)))
  );
}

export function subscribeOrderRequestsForOrder(
  orderId: string,
  onData: (requests: OrderRequest[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!shouldAttemptFirestore()) {
    onData([]);
    return () => {};
  }
  const db = getFirestore();
  if (!db) {
    onError?.(new Error("Firestore not initialized"));
    return () => {};
  }

  const q = query(collection(db, COL), where("orderId", "==", orderId));
  return onSnapshot(
    q,
    (snap) => {
      const requests = snap.docs
        .map((d) => fromFirestore(d.id, d.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(requests);
    },
    (err) => onError?.(err instanceof Error ? err : new Error(String(err)))
  );
}
