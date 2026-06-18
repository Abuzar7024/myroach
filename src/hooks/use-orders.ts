"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { subscribeUserOrders } from "@/lib/firebase/services/order.service";
import { useOrderStore } from "@/store/order-store";

export function useOrders() {
  const { user } = useAuth();
  const orders = useOrderStore((s) => s.orders);
  const hydrated = useOrderStore((s) => s.hydrated);
  const setOrders = useOrderStore((s) => s.setOrders);
  const getOrdersForUser = useOrderStore((s) => s.getOrdersForUser);
  const createOrder = useOrderStore((s) => s.createOrder);
  const getOrderById = useOrderStore((s) => s.getOrderById);

  useEffect(() => {
    if (!user?.id) return;

    const unsub = subscribeUserOrders(
      user.id,
      (liveOrders) => setOrders(liveOrders),
      (error) => console.error("[orders] live sync failed:", error)
    );

    return unsub;
  }, [user?.id, setOrders]);

  const userOrders = getOrdersForUser(user?.id);

  return {
    orders: userOrders,
    allOrders: orders,
    hydrated,
    user,
    createOrder,
    getOrderById,
  };
}
