import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay/server";
import { getPublicRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay/config";
import { logRazorpayEvent } from "@/lib/razorpay/events";

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay is not configured on the server" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      amount?: number;
      receipt?: string;
      notes?: Record<string, string>;
      customerEmail?: string;
      customerPhone?: string;
      customerName?: string;
    };

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const receipt = String(body.receipt || `rcpt_${Date.now()}`).slice(0, 40);
    const order = await createRazorpayOrder({
      amountInr: amount,
      receipt,
      notes: body.notes,
    });

    await logRazorpayEvent({
      id: `order_${order.id}`,
      eventType: "order.created",
      status: "created",
      amount: Number(order.amount) / 100,
      currency: order.currency || "INR",
      razorpayOrderId: order.id,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      customerName: body.customerName,
      source: "checkout",
      message: `Razorpay order created for ${(Number(order.amount) / 100).toFixed(2)} INR`,
      payload: { receipt: order.receipt, notes: order.notes },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getPublicRazorpayKeyId(),
    });
  } catch (error) {
    console.error("[razorpay/create-order]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create Razorpay order" },
      { status: 500 }
    );
  }
}
