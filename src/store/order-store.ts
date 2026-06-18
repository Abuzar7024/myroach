"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { collection, doc, setDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import type { Order, PaymentMethod } from "@/types";
import { getFirestore } from "@/lib/firebase/config";
import {
  isRecoverableFirestoreError,
  markFirestoreAvailable,
  markFirestoreUnavailable,
  shouldAttemptFirestore,
} from "@/lib/firebase/firestore-utils";
import { createOrderInFirestore } from "@/lib/firebase/services/product.service";
import { cancelOrderDirectly } from "@/lib/firebase/services/order-request.service";
import { generateOrderNumber } from "@/lib/utils";
import { toast } from "sonner";

const ORDERS_STORAGE_KEY = "myroach-orders";

interface CreateOrderInput {
  userId?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: Order["items"];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  shippingAddress: Order["shippingAddress"];
  paymentMethod: PaymentMethod;
}

interface OrderStore {
  orders: Order[];
  hydrated: boolean;
  setOrders: (orders: Order[]) => void;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
  getOrdersForUser: (userId?: string) => Order[];
  syncFromFirestore: (userId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  patchOrderStatus: (orderId: string, status: Order["status"]) => void;
}

function loadOrdersFromStorage(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function saveOrdersToStorage(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

async function saveOrderToFirestore(order: Order) {
  if (!shouldAttemptFirestore() || !order.userId) return;
  const db = getFirestore();
  if (!db) return;
  try {
    await setDoc(doc(db, "orders", order.id), order);
  } catch (error) {
    if (isRecoverableFirestoreError(error)) {
      markFirestoreUnavailable();
    }
  }
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      hydrated: false,

      setOrders: (orders) => {
        saveOrdersToStorage(orders);
        set({ orders });
      },

      createOrder: async (input) => {
        const now = new Date().toISOString();
        const order: Order = {
          id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          userId: input.userId,
          orderNumber: generateOrderNumber(),
          items: input.items,
          subtotal: input.subtotal,
          shipping: input.shipping,
          discount: input.discount,
          total: input.total,
          couponCode: input.couponCode,
          status: "confirmed",
          shippingAddress: input.shippingAddress,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          paymentStatus: "paid",
          paymentMethod: input.paymentMethod,
          createdAt: now,
          updatedAt: now,
        };

        const orders = [order, ...get().orders];
        saveOrdersToStorage(orders);
        set({ orders });

        try {
          if (!order.userId) {
            toast.error("Sign in required — order saved on this device only.");
            return order;
          }
          if (shouldAttemptFirestore()) {
            await createOrderInFirestore({
              id: order.id,
              userId: order.userId,
              orderNumber: order.orderNumber,
              customerName: order.shippingAddress.fullName,
              customerEmail: input.customerEmail || order.shippingAddress.email || "",
              customerPhone: input.customerPhone || order.shippingAddress.phone || "",
              items: order.items.map((i) => ({
                productId: i.productId,
                title: i.name,
                quantity: i.quantity,
                price: i.price,
                image: i.image,
              })),
              subtotal: order.subtotal,
              tax: 0,
              shippingCharge: order.shipping,
              discount: order.discount,
              total: order.total,
              status: "pending",
              paymentStatus: order.paymentMethod === "cod" ? "pending" : "paid",
              shippingAddress: {
                name: order.shippingAddress.fullName,
                email: input.customerEmail || order.shippingAddress.email || "",
                phone: input.customerPhone || order.shippingAddress.phone || "",
                address: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                zip: order.shippingAddress.postalCode,
                country: order.shippingAddress.country || "India",
              },
              couponCode: order.couponCode,
              paymentMethod: order.paymentMethod,
            });
            markFirestoreAvailable();
          } else {
            await saveOrderToFirestore(order);
          }
        } catch (error) {
          if (isRecoverableFirestoreError(error)) {
            markFirestoreUnavailable();
          }
          console.error("[order] Firestore sync failed:", error);
          toast.error(
            "Order placed on this device, but admin may not see it yet. Check Firestore rules and try again.",
            { duration: 8000 }
          );
          try {
            await saveOrderToFirestore(order);
          } catch {
            /* local only */
          }
        }

        return order;
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      getOrdersForUser: (userId) => {
        const all = get().orders;
        if (!userId) return all;
        return all.filter((o) => !o.userId || o.userId === userId);
      },

      syncFromFirestore: async (userId) => {
        if (!shouldAttemptFirestore()) return;
        const db = getFirestore();
        if (!db) return;

        try {
          const q = query(
            collection(db, "orders"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
          );
          const snapshot = await getDocs(q);
          const firestoreOrders = snapshot.docs.map((d) => {
            const raw = d.data() as Record<string, unknown>;
            const shipping = (raw.shippingAddress ?? {}) as Record<string, string>;
            const local = loadOrdersFromStorage().find((o) => o.id === d.id);
            return {
              id: d.id,
              ...raw,
              orderNumber: (raw.orderNumber as string) || local?.orderNumber || d.id,
              status: (raw.status as Order["status"]) || local?.status || "pending",
              shipping:
                typeof raw.shipping === "number"
                  ? raw.shipping
                  : typeof raw.shippingCharge === "number"
                    ? raw.shippingCharge
                    : local?.shipping ?? 0,
              trackingNumber: (raw.trackingNumber as string) || local?.trackingNumber,
              paymentStatus: (raw.paymentStatus as Order["paymentStatus"]) || local?.paymentStatus || "paid",
              customerEmail: (raw.customerEmail as string) || shipping.email || "",
              customerPhone: (raw.customerPhone as string) || shipping.phone || "",
              shippingAddress: {
                id: "addr-firestore",
                label: "Shipping",
                fullName: shipping.name || (raw.customerName as string) || "",
                street: shipping.address || "",
                city: shipping.city || "",
                state: shipping.state || "",
                postalCode: shipping.zip || "",
                country: shipping.country || "India",
                isDefault: false,
                phone: shipping.phone || (raw.customerPhone as string) || "",
                email: shipping.email || (raw.customerEmail as string) || "",
              },
            } as Order;
          });

          const localOrders = loadOrdersFromStorage();
          const merged = new Map<string, Order>();
          [...localOrders, ...firestoreOrders].forEach((o) => merged.set(o.id, o));
          const orders = Array.from(merged.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          saveOrdersToStorage(orders);
          set({ orders });
        } catch (error) {
          if (isRecoverableFirestoreError(error)) {
            markFirestoreUnavailable();
          }
        }
      },

      cancelOrder: async (orderId) => {
        await cancelOrderDirectly(orderId);
        const now = new Date().toISOString();
        const orders = get().orders.map((o) =>
          o.id === orderId ? { ...o, status: "cancelled" as const, updatedAt: now } : o
        );
        saveOrdersToStorage(orders);
        set({ orders });
      },

      patchOrderStatus: (orderId, status) => {
        const now = new Date().toISOString();
        const orders = get().orders.map((o) =>
          o.id === orderId ? { ...o, status, updatedAt: now } : o
        );
        saveOrdersToStorage(orders);
        set({ orders });
      },
    }),
    {
      name: ORDERS_STORAGE_KEY,
      partialize: (state) => ({ orders: state.orders }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
