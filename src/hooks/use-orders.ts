"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useOrderStore } from "@/store/order-store";

export function useOrders() {
  const { user } = useAuth();
  const orders = useOrderStore((s) => s.orders);
  const hydrated = useOrderStore((s) => s.hydrated);
  const syncFromFirestore = useOrderStore((s) => s.syncFromFirestore);
  const getOrdersForUser = useOrderStore((s) => s.getOrdersForUser);
  const createOrder = useOrderStore((s) => s.createOrder);
  const getOrderById = useOrderStore((s) => s.getOrderById);

  useEffect(() => {
    if (user?.id) {
      syncFromFirestore(user.id);
    }
  }, [user?.id, syncFromFirestore]);

  const userOrders = getOrdersForUser(user?.id);

  return {
    orders: userOrders,
    allOrders: orders,
    hydrated,
    user,
    createOrder,
    getOrderById,
    syncFromFirestore,
  };
}
