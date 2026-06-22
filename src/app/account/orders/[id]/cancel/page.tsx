"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Repeat, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useOrders } from "@/hooks/use-orders";
import { useSettings } from "@/hooks/use-settings";
import { getStorePolicy } from "@/lib/policies";
import {
  canSubmitCancellationRequest,
  requestStatusLabel,
  requestTypeLabel,
  type OrderRequestType,
} from "@/lib/order-request";
import {
  submitCancellationRequest,
  subscribeOrderRequestsForOrder,
} from "@/lib/firebase/services/order-request.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/page-loader";
import { formatPrice } from "@/lib/format";
import type { OrderRequest } from "@/lib/order-request";

export default function OrderCancellationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getOrderById, hydrated } = useOrders();
  const order = getOrderById(params.id);

  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [resolution, setResolution] = useState<OrderRequestType>("refund");
  const [reason, setReason] = useState("");
  const [exchangeDetails, setExchangeDetails] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const { settings } = useSettings();
  const returnPolicy = getStorePolicy(settings, "returnPolicy");

  useEffect(() => {
    if (!params.id) return;
    const unsub = subscribeOrderRequestsForOrder(params.id, setRequests);
    return unsub;
  }, [params.id]);

  const pendingRequest = requests.find((r) => r.status === "pending");
  const latestRequest = submittedId
    ? requests.find((r) => r.id === submittedId) ?? pendingRequest
    : pendingRequest;

  if (!hydrated) {
    return <PageLoader label="Loading order" fullPage className="pt-20" />;
  }

  if (!order || (order.userId && user?.id && order.userId !== user.id)) {
    return (
      <div className="py-16 text-center">
        <p className="text-noire-muted">Order not found.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/account/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  if (!canSubmitCancellationRequest(order.status) && !latestRequest) {
    return (
      <div className="py-16 text-center">
        <p className="text-noire-muted">This order cannot be cancelled or returned.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href={`/account/orders/${order.id}`}>Back to tracking</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !order) {
      toast.error("Order not found.");
      return;
    }
    if (!policyAccepted) {
      toast.error("Accept the cancellation policy to continue.");
      return;
    }
    if (reason.trim().length < 10) {
      toast.error("Please add a few more details (min. 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const id = await submitCancellationRequest(
        order,
        user.id,
        resolution,
        reason,
        resolution === "exchange" ? exchangeDetails : undefined
      );
      setSubmittedId(id);
      toast.success("Request submitted — our team is reviewing it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  }

  if (latestRequest || submittedId) {
    const active = latestRequest!;
    return (
      <div className="mx-auto max-w-lg space-y-6 py-4">
        <Button asChild variant="ghost" size="sm" className="px-2">
          <Link href={`/account/orders/${order.id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to order
          </Link>
        </Button>

        <div className="cyber-card p-8 text-center">
          {active.status === "pending" ? (
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent-cyan" />
          ) : active.status === "approved" ? (
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent-cyan" />
          ) : (
            <RefreshCw className="mx-auto h-12 w-12 text-accent-pink" />
          )}
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-accent-pink">Request status</p>
          <h1 className="font-display mt-2 text-3xl text-accent-cyan">
            {requestStatusLabel(active.status)}
          </h1>
          <p className="mt-3 text-sm text-noire-muted">
            Your {requestTypeLabel(active.type).toLowerCase()} request for{" "}
            <span className="text-noire-white">{order.orderNumber}</span> is{" "}
            {active.status === "pending"
              ? "with our team. You'll see updates here and on your orders page."
              : active.status === "approved"
                ? "approved. Check the message below for next steps."
                : "declined. See the message below for details."}
          </p>

          <div className="mt-6 rounded-md border border-noire-border bg-noire-black/40 p-4 text-left text-sm">
            <p className="text-xs uppercase tracking-wider text-noire-muted">Your request</p>
            <p className="mt-2 text-zinc-300">{active.reason}</p>
            {active.exchangeDetails ? (
              <p className="mt-2 text-noire-muted">
                Exchange for: <span className="text-zinc-300">{active.exchangeDetails}</span>
              </p>
            ) : null}
          </div>

          {active.adminResponse ? (
            <div className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-left text-sm text-emerald-50">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
                Message from MY ROACH
              </p>
              <p className="mt-2">{active.adminResponse.message}</p>
            </div>
          ) : null}

          <Button asChild className="mt-8 w-full">
            <Link href="/account/orders">View all orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4">
      <Button asChild variant="ghost" size="sm" className="px-2">
        <Link href={`/account/orders/${order.id}`}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to order
        </Link>
      </Button>

      <div>
        <h1 className="font-display text-3xl text-accent-cyan">Cancel order</h1>
        <p className="mt-2 text-sm text-noire-muted">
          {order.orderNumber} · {formatPrice(order.total)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="cyber-card p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-accent-cyan">
            What do you need?
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setResolution("refund")}
              className={`rounded-md border p-4 text-left transition-colors ${
                resolution === "refund"
                  ? "border-accent-cyan bg-accent-cyan/10"
                  : "border-noire-border hover:border-accent-cyan/40"
              }`}
            >
              <Wallet className="h-5 w-5 text-accent-cyan" />
              <p className="mt-3 font-medium text-noire-white">Refund</p>
              <p className="mt-1 text-xs text-noire-muted">
                Cancel the order and get your money back if approved.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setResolution("exchange")}
              className={`rounded-md border p-4 text-left transition-colors ${
                resolution === "exchange"
                  ? "border-accent-cyan bg-accent-cyan/10"
                  : "border-noire-border hover:border-accent-cyan/40"
              }`}
            >
              <Repeat className="h-5 w-5 text-accent-cyan" />
              <p className="mt-3 font-medium text-noire-white">Exchange</p>
              <p className="mt-1 text-xs text-noire-muted">
                Swap for a different size or product if approved.
              </p>
            </button>
          </div>
        </section>

        <section className="cyber-card p-6 space-y-4">
          <div>
            <Label htmlFor="reason">Tell us what happened</Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Why are you cancelling? Include any details that help us review faster."
              className="mt-2 w-full rounded-md border border-noire-border bg-noire-charcoal px-3 py-2 text-sm text-zinc-100 placeholder:text-noire-muted focus:border-accent-cyan focus:outline-none"
            />
          </div>

          {resolution === "exchange" && (
            <div>
              <Label htmlFor="exchange">What do you want instead?</Label>
              <Input
                id="exchange"
                value={exchangeDetails}
                onChange={(e) => setExchangeDetails(e.target.value)}
                placeholder="e.g. Size L instead of M, or Black hoodie instead of White"
                className="mt-2"
              />
            </div>
          )}
        </section>

        {returnPolicy ? (
        <section className="cyber-card p-6">
          <h2 className="text-sm font-medium text-noire-white">Return & cancellation policy</h2>
          <p className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-noire-muted">
            {returnPolicy}
          </p>
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={policyAccepted}
              onChange={(e) => setPolicyAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-noire-border accent-accent-cyan"
            />
            <span className="text-noire-muted">
              I have read and agree to the return and cancellation policy above.
            </span>
          </label>
        </section>
        ) : (
        <section className="cyber-card p-6">
          <p className="text-sm text-noire-muted">
            Return policy has not been published yet. Contact support if you need help with this order.
          </p>
        </section>
        )}

        <div className="flex flex-col gap-3">
          <Button type="submit" loading={submitting} disabled={!policyAccepted || !returnPolicy}>
            Submit request
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Keep my order
          </Button>
        </div>
      </form>
    </div>
  );
}
