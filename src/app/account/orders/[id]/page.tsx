"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { subscribeDocument } from "@/lib/firebase/realtime";
import { mapOrderFromFirestore } from "@/lib/firebase/services/order.service";
import { OrderTrackingTimeline } from "@/components/account/order-tracking-timeline";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { canSubmitCancellationRequest } from "@/lib/order-request";
import type { Order } from "@/types";

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !params.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeDocument<Order>(
      "orders",
      params.id,
      mapOrderFromFirestore,
      (next) => {
        if (next && next.userId && next.userId !== user.id) {
          setOrder(null);
        } else {
          setOrder(next);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [params.id, user?.id]);

  if (loading) {
    return <PageLoader label="Loading tracking" fullPage className="pt-20" />;
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-noire-muted">Order not found.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/account/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="px-2">
          <Link href="/account/orders">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Orders
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="font-display text-2xl font-light">Track order</h2>
        <p className="mt-2 text-sm text-noire-muted">
          {order.orderNumber} · {formatPrice(order.total)} ·{" "}
          {new Date(order.createdAt).toLocaleDateString("en-IN")}
        </p>
      </div>

      <OrderTrackingTimeline order={order} />

      {canSubmitCancellationRequest(order.status) && (
        <Button asChild variant="outline" className="w-full border-red-500/40 text-red-300 hover:bg-red-500/10 sm:w-auto">
          <Link href={`/account/orders/${order.id}/cancel`}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel order — refund or exchange
          </Link>
        </Button>
      )}

      <div className="rounded-lg border border-noire-border p-4 text-sm">
        <p className="text-xs uppercase tracking-wider text-noire-muted">Delivery address</p>
        <p className="mt-2 text-zinc-300">{order.shippingAddress.fullName}</p>
        <p className="text-noire-muted">{order.shippingAddress.street}</p>
        <p className="text-noire-muted">
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.postalCode}
        </p>
      </div>
    </div>
  );
}
