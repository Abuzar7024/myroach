import { NextResponse } from "next/server";
import { verifyPaymentSignature, getRazorpayClient } from "@/lib/razorpay/server";
import { isRazorpayConfigured } from "@/lib/razorpay/config";
import { logRazorpayEvent } from "@/lib/razorpay/events";
import { getAdminAuth } from "@/lib/firebase/admin";
import { persistStoreOrder, type PersistStoreOrderInput } from "@/lib/firebase/admin-orders";

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
      paymentMethod?: string;
      order?: PersistStoreOrderInput;
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
        source: "verify",
        message: "Payment signature verification failed",
      });

      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    let paymentStatus = "captured";
    try {
      const client = getRazorpayClient();
      const payment = await client.payments.fetch(razorpayPaymentId);
      paymentStatus = String(payment.status || "captured");
      if (payment.status === "failed") {
        return NextResponse.json({ error: "Payment failed at Razorpay" }, { status: 402 });
      }
    } catch (error) {
      console.warn("[razorpay/verify] Could not fetch payment from Razorpay:", error);
    }

    const idToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    let userId: string | undefined;
    const adminAuth = getAdminAuth();
    if (idToken && adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        userId = decoded.uid;
      } catch {
        return NextResponse.json({ error: "Invalid sign-in session. Sign in again and retry." }, { status: 401 });
      }
    }

    let orderId: string | undefined;
    let orderNumber: string | undefined;
    let orderCreatedInAdmin = false;

    if (body.order && userId) {
      const persisted = await persistStoreOrder({
        ...body.order,
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        paymentStatus: "paid",
      });
      if (persisted) {
        orderId = persisted.orderId;
        orderNumber = persisted.orderNumber;
        orderCreatedInAdmin = true;
      }
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
      storeOrderId: orderId,
      source: "verify",
      message: `Payment ${paymentStatus} — ${body.amount ? `₹${Number(body.amount).toFixed(2)}` : "amount pending"}`,
    });

    return NextResponse.json({
      verified: true,
      razorpayOrderId,
      razorpayPaymentId,
      orderId,
      orderNumber,
      orderCreatedInAdmin,
      paymentStatus,
    });
  } catch (error) {
    console.error("[razorpay/verify]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}
