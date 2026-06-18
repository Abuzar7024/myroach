"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, MessageSquare, Package, Truck, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useOrders } from "@/hooks/use-orders";
import { OrderTrackingTimeline } from "@/components/account/order-tracking-timeline";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import {
  canSubmitCancellationRequest,
  requestStatusLabel,
  requestTypeLabel,
  type OrderRequest,
} from "@/lib/order-request";
import { subscribeUserOrderRequests } from "@/lib/firebase/services/order-request.service";

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function OrdersContent() {
  const { user } = useAuth();
  const { orders: userOrders, hydrated } = useOrders();

  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [requestsReady, setRequestsReady] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setRequests([]);
      setRequestsReady(true);
      return;
    }
    setRequestsReady(false);
    const unsub = subscribeUserOrderRequests(
      user.id,
      (data) => {
        setRequests(data);
        setRequestsReady(true);
      },
      () => setRequestsReady(true)
    );
    return unsub;
  }, [user?.id]);

  const requestsByOrder = useMemo(() => {
    const map = new Map<string, OrderRequest[]>();
    requests.forEach((r) => {
      const list = map.get(r.orderId) ?? [];
      list.push(r);
      map.set(r.orderId, list);
    });
    return map;
  }, [requests]);

  if (!hydrated || !requestsReady) {
    return <PageLoader label="Loading orders" />;
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-light">Order History</h2>
      <p className="mt-2 text-sm text-noire-muted">
        Track orders live, cancel with refund or exchange, and see admin replies here.
      </p>

      {userOrders.length === 0 ? (
        <div className="mt-8 py-12 text-center">
          <Package className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="mt-4 text-noire-muted">No orders yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block text-sm text-accent-cyan hover:underline"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {userOrders.map((order) => {
            const phone = order.customerPhone || order.shippingAddress.phone;
            const email = order.customerEmail || order.shippingAddress.email;
            const isShipped = order.status === "shipped" || order.status === "delivered";
            const orderRequests = requestsByOrder.get(order.id) ?? [];
            const pendingRequest = orderRequests.find((r) => r.status === "pending");
            const latestResponse = orderRequests.find((r) => r.adminResponse);
            const canCancel = canSubmitCancellationRequest(order.status) && !pendingRequest;

            return (
              <article key={order.id} className="rounded-lg border border-noire-border p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-noire-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")} · {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                    <p className="text-xs capitalize text-accent-cyan">{statusLabel(order.status)}</p>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="mt-2 inline-block text-xs text-accent-cyan hover:underline"
                    >
                      Track order
                    </Link>
                  </div>
                </div>

                <OrderTrackingTimeline order={order} compact />

                <div className="mt-4 grid gap-4 border-t border-noire-border pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-noire-muted">Deliver to</p>
                    <p className="mt-1 text-zinc-300">{order.shippingAddress.fullName}</p>
                    <p className="text-noire-muted">{order.shippingAddress.street}</p>
                    <p className="text-noire-muted">
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    {phone && <p className="mt-1 text-noire-muted">Phone: {phone}</p>}
                    {email && <p className="text-noire-muted">Email: {email}</p>}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-noire-muted">Items</p>
                    <ul className="mt-1 space-y-1 text-noire-muted">
                      {order.items.map((item) => (
                        <li key={`${item.productId}-${item.size}-${item.color}`}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {isShipped && (
                  <div className="mt-4 flex gap-3 rounded-md border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      {order.trackingNumber ? (
                        <>
                          <p className="font-medium">Your order is on the way</p>
                          <p className="mt-1 text-cyan-100/80">
                            Tracking ID: <span className="font-mono">{order.trackingNumber}</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">Shipped — tracking update coming soon</p>
                          <p className="mt-1 text-cyan-100/80">
                            Your package has left our warehouse.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {pendingRequest && (
                  <div className="mt-4 flex gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium">
                        {requestTypeLabel(pendingRequest.type)} request —{" "}
                        {requestStatusLabel(pendingRequest.status)}
                      </p>
                      <p className="mt-1 text-amber-100/80">{pendingRequest.reason}</p>
                      {pendingRequest.exchangeDetails ? (
                        <p className="mt-1 text-amber-100/70">
                          Exchange for: {pendingRequest.exchangeDetails}
                        </p>
                      ) : null}
                      <Link
                        href={`/account/orders/${order.id}/cancel`}
                        className="mt-2 inline-block text-xs text-accent-cyan hover:underline"
                      >
                        View request status
                      </Link>
                    </div>
                  </div>
                )}

                {latestResponse?.adminResponse && (
                  <div className="mt-4 flex gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-50">
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium">Message from MY ROACH</p>
                      <p className="mt-1 text-emerald-50/90">{latestResponse.adminResponse.message}</p>
                      <p className="mt-2 text-xs text-emerald-100/60">
                        {new Date(latestResponse.adminResponse.sentAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                )}

                {canCancel && (
                  <div className="mt-4 border-t border-noire-border pt-4">
                    <Button asChild variant="outline" size="sm" className="border-red-500/40 text-red-300 hover:bg-red-500/10">
                      <Link href={`/account/orders/${order.id}/cancel`}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Cancel order — refund or exchange
                      </Link>
                    </Button>
                  </div>
                )}

                {order.status === "cancelled" && (
                  <p className="mt-4 text-xs text-noire-muted">This order was cancelled.</p>
                )}
                {order.status === "refunded" && (
                  <p className="mt-4 text-xs text-noire-muted">This order was refunded.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
