"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useOrderStore } from "@/store/order-store";
import { PageLoader } from "@/components/ui/page-loader";
import { formatPrice } from "@/lib/format";

export function OrdersContent() {
  const { user } = useAuth();
  const orders = useOrderStore((s) => s.orders);
  const hydrated = useOrderStore((s) => s.hydrated);
  const syncFromFirestore = useOrderStore((s) => s.syncFromFirestore);
  const getOrdersForUser = useOrderStore((s) => s.getOrdersForUser);

  useEffect(() => {
    if (user?.id) {
      syncFromFirestore(user.id);
    }
  }, [user?.id, syncFromFirestore]);

  if (!hydrated) {
    return <PageLoader label="Loading orders" />;
  }

  const userOrders = getOrdersForUser(user?.id);

  return (
    <div>
      <h2 className="font-display text-2xl font-light">Order History</h2>

      {userOrders.length === 0 ? (
        <div className="mt-8 py-12 text-center">
          <p className="text-noire-muted">No orders yet. Time to cop some drip.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block text-sm text-accent-cyan hover:underline"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {userOrders.map((order) => (
            <div key={order.id} className="border border-noire-border p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-noire-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")} · {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                  <p className="text-xs capitalize text-accent-cyan">{order.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
