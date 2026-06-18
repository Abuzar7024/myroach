"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, MessageSquare, Package, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useOrderStore } from "@/store/order-store";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import {
  canCancelOrderDirectly,
  canRequestCancel,
  canRequestRefund,
  requestTypeLabel,
  type OrderRequest,
} from "@/lib/order-request";
import {
  submitOrderRequest,
  subscribeUserOrderRequests,
} from "@/lib/firebase/services/order-request.service";

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function requestStatusLabel(status: OrderRequest["status"]) {
  if (status === "pending") return "Under review";
  if (status === "approved") return "Approved";
  return "Declined";
}

export function OrdersContent() {
  const { user } = useAuth();
  const orders = useOrderStore((s) => s.orders);
  const hydrated = useOrderStore((s) => s.hydrated);
  const syncFromFirestore = useOrderStore((s) => s.syncFromFirestore);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const getOrdersForUser = useOrderStore((s) => s.getOrdersForUser);

  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [requestsReady, setRequestsReady] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [requestTarget, setRequestTarget] = useState<{
    orderId: string;
    type: "cancel" | "refund";
  } | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      syncFromFirestore(user.id);
    }
  }, [user?.id, syncFromFirestore]);

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

  useEffect(() => {
    if (user?.id && requests.some((r) => r.status !== "pending")) {
      syncFromFirestore(user.id);
    }
  }, [requests, user?.id, syncFromFirestore]);

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

  const userOrders = getOrdersForUser(user?.id);

  const handleDirectCancel = async () => {
    if (!cancelTarget) return;
    setSubmitting(true);
    try {
      await cancelOrder(cancelTarget);
      toast.success("Order cancelled");
      setCancelTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestTarget || !user?.id || reason.trim().length < 10) return;
    const order = userOrders.find((o) => o.id === requestTarget.orderId);
    if (!order) return;

    setSubmitting(true);
    try {
      await submitOrderRequest(order, user.id, requestTarget.type, reason);
      toast.success(
        `${requestTypeLabel(requestTarget.type)} request submitted — we'll update you here`
      );
      setRequestTarget(null);
      setReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-light">Order History</h2>
      <p className="mt-2 text-sm text-noire-muted">
        Track orders, cancel before dispatch, or request a refund. Admin replies appear below each order.
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

            const showDirectCancel = canCancelOrderDirectly(order.status) && !pendingRequest;
            const showCancelRequest = canRequestCancel(order.status) && !pendingRequest;
            const showRefundRequest =
              canRequestRefund(order.status, order.paymentStatus) && !pendingRequest;

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
                  </div>
                </div>

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
                            Your package has left our warehouse. We&apos;ll add the courier tracking number here shortly.
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
                        {requestTypeLabel(pendingRequest.type)} request — {requestStatusLabel(pendingRequest.status)}
                      </p>
                      <p className="mt-1 text-amber-100/80">{pendingRequest.reason}</p>
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

                {(showDirectCancel || showCancelRequest || showRefundRequest) && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-noire-border pt-4">
                    {showDirectCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                        onClick={() => setCancelTarget(order.id)}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Cancel order
                      </Button>
                    )}
                    {showCancelRequest && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRequestTarget({ orderId: order.id, type: "cancel" });
                          setReason("");
                        }}
                      >
                        Request cancellation
                      </Button>
                    )}
                    {showRefundRequest && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRequestTarget({ orderId: order.id, type: "refund" });
                          setReason("");
                        }}
                      >
                        Request refund
                      </Button>
                    )}
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

      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && !submitting && setCancelTarget(null)}>
        <DialogContent className="border-accent-cyan/30">
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              Your order has not shipped yet. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={submitting}>
              Keep order
            </Button>
            <Button
              variant="drip"
              onClick={handleDirectCancel}
              disabled={submitting}
            >
              {submitting ? "Cancelling..." : "Yes, cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!requestTarget}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setRequestTarget(null);
            setReason("");
          }
        }}
      >
        <DialogContent className="border-accent-cyan/30">
          <DialogHeader>
            <DialogTitle>
              {requestTarget
                ? `Submit ${requestTypeLabel(requestTarget.type).toLowerCase()} request`
                : "Submit request"}
            </DialogTitle>
            <DialogDescription>
              Tell us why you need this — our team will review and reply on this page.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your reason (min. 10 characters)..."
            rows={4}
            className="w-full rounded-md border border-noire-border bg-noire-charcoal px-3 py-2 text-sm text-zinc-100 placeholder:text-noire-muted focus:border-accent-cyan focus:outline-none"
          />
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setRequestTarget(null);
                setReason("");
              }}
              disabled={submitting}
            >
              Back
            </Button>
            <Button onClick={handleSubmitRequest} disabled={submitting || reason.trim().length < 10}>
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
