import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay/server";
import { logRazorpayEvent } from "@/lib/razorpay/events";
import { reconcileOrderPayment } from "@/lib/firebase/admin-orders";

function mapWebhookStatus(event: string): "created" | "authorized" | "captured" | "failed" | "refunded" {
  if (event.includes("failed")) return "failed";
  if (event.includes("refund")) return "refunded";
  if (event.includes("authorized")) return "authorized";
  if (event.includes("captured")) return "captured";
  return "created";
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  // Fail closed (audit H3): without a configured secret we cannot trust the
  // webhook, so we refuse to process it rather than accept forged events.
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("[razorpay/webhook] RAZORPAY_WEBHOOK_SECRET not set — rejecting webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            amount?: number;
            currency?: string;
            status?: string;
            method?: string;
            email?: string;
            contact?: string;
            notes?: Record<string, string>;
          };
        };
        order?: {
          entity?: { id?: string; amount?: number; currency?: string; receipt?: string };
        };
      };
    };

    const eventType = payload.event || "unknown";
    const payment = payload.payload?.payment?.entity;
    const order = payload.payload?.order?.entity;
    const entity = payment || order;

    if (!entity?.id) {
      return NextResponse.json({ received: true });
    }

    const amount = entity.amount != null ? entity.amount / 100 : 0;
    const status = mapWebhookStatus(eventType);
    const eventId = payment?.id ? `webhook_${payment.id}_${eventType}` : `webhook_${order?.id}_${eventType}`;

    // Reconcile the order (idempotent) so a captured-but-unconfirmed payment is
    // never lost and refunds/failures propagate to the order record.
    let storeOrderId: string | undefined = payment?.notes?.storeOrderId;
    if (payment?.id && (status === "captured" || status === "authorized" || status === "refunded" || status === "failed")) {
      try {
        const result = await reconcileOrderPayment({
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          eventStatus: status,
          amountInr: amount,
          userId: payment.notes?.userId,
          customerEmail: payment.email,
          customerPhone: payment.contact,
          paymentMethod: payment.method,
        });
        if (result?.orderId) storeOrderId = result.orderId;
      } catch (error) {
        console.error("[razorpay/webhook] Reconciliation failed:", error);
      }
    }

    await logRazorpayEvent({
      id: eventId,
      eventType,
      status,
      amount,
      currency: entity.currency || "INR",
      razorpayOrderId: payment?.order_id || order?.id,
      razorpayPaymentId: payment?.id,
      paymentMethod: payment?.method,
      customerEmail: payment?.email,
      customerPhone: payment?.contact,
      storeOrderId,
      source: "webhook",
      message: `Razorpay webhook: ${eventType}`,
      payload: payload as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[razorpay/webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
