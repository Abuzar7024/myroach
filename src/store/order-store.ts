"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { collection, doc, setDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import type { Order, PaymentMethod } from "@/types";
import { getFirestore } from "@/lib/firebase/config";
import {
  isRecoverableFirestoreError,
  markFirestoreUnavailable,
  shouldAttemptFirestore,
} from "@/lib/firebase/firestore-utils";
import { generateOrderNumber } from "@/lib/utils";

const ORDERS_STORAGE_KEY = "myroach-orders";

interface CreateOrderInput {
  userId?: string;
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
          paymentStatus: "paid",
          paymentMethod: input.paymentMethod,
          createdAt: now,
          updatedAt: now,
        };

        const orders = [order, ...get().orders];
        saveOrdersToStorage(orders);
        set({ orders });

        try {
          await saveOrderToFirestore(order);
        } catch {
          // Firestore sync is best-effort; localStorage remains source of truth offline
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
          const firestoreOrders = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Order
          );

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
