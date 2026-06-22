import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay/server";
import { isRazorpayConfigured } from "@/lib/razorpay/config";
import { logRazorpayEvent } from "@/lib/razorpay/events";

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay is not configured on the server" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      amount?: number;
      customerEmail?: string;
      customerPhone?: string;
      customerName?: string;
      storeOrderId?: string;
      paymentMethod?: string;
    };

    const razorpayOrderId = String(body.razorpayOrderId || "");
    const razorpayPaymentId = String(body.razorpayPaymentId || "");
    const razorpaySignature = String(body.razorpaySignature || "");

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing Razorpay payment details" }, { status: 400 });
    }

    const verified = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!verified) {
      await logRazorpayEvent({
        id: `verify_failed_${razorpayPaymentId}`,
        eventType: "payment.verification_failed",
        status: "failed",
        amount: Number(body.amount) || 0,
        currency: "INR",
        razorpayOrderId,
        razorpayPaymentId,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        customerName: body.customerName,
        storeOrderId: body.storeOrderId,
        source: "verify",
        message: "Payment signature verification failed",
      });

      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    await logRazorpayEvent({
      id: `payment_${razorpayPaymentId}`,
      eventType: "payment.captured",
      status: "captured",
      amount: Number(body.amount) || 0,
      currency: "INR",
      razorpayOrderId,
      razorpayPaymentId,
      paymentMethod: body.paymentMethod,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      customerName: body.customerName,
      storeOrderId: body.storeOrderId,
      source: "verify",
      message: `Payment captured — ${body.amount ? `₹${Number(body.amount).toFixed(2)}` : "amount pending"}`,
    });

    return NextResponse.json({
      verified: true,
      razorpayOrderId,
      razorpayPaymentId,
    });
  } catch (error) {
    console.error("[razorpay/verify]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}
