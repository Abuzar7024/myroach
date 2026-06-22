import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay/server";
import { logRazorpayEvent } from "@/lib/razorpay/events";

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

  if (process.env.RAZORPAY_WEBHOOK_SECRET) {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }
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
          entity?: {
            id?: string;
            amount?: number;
            currency?: string;
            receipt?: string;
          };
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
    const eventId = payment?.id ? `webhook_${payment.id}_${eventType}` : `webhook_${order?.id}_${eventType}`;

    await logRazorpayEvent({
      id: eventId,
      eventType,
      status: mapWebhookStatus(eventType),
      amount,
      currency: entity.currency || "INR",
      razorpayOrderId: payment?.order_id || order?.id,
      razorpayPaymentId: payment?.id,
      paymentMethod: payment?.method,
      customerEmail: payment?.email,
      customerPhone: payment?.contact,
      storeOrderId: payment?.notes?.storeOrderId,
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
