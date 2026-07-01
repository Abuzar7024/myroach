import { NextResponse } from "next/server";
import { verifyPaymentSignature, getRazorpayClient } from "@/lib/razorpay/server";
import { isRazorpayConfigured } from "@/lib/razorpay/config";
import { logRazorpayEvent } from "@/lib/razorpay/events";
import { getAdminAuth } from "@/lib/firebase/admin";
import { persistStoreOrder } from "@/lib/firebase/admin-orders";
import {
  computeServerPricing,
  ServerPricingUnavailableError,
  type ServerOrderItemInput,
} from "@/lib/checkout/server-pricing";

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay is not configured on the server" }, { status: 503 });
  }

  // Same fail-closed posture as create-order: verification requires the Admin
  // SDK. Because create-order already 503s without it, a paid transaction can
  // never reach this route on a misconfigured server (audit H2/H6).
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json(
      { error: "Secure checkout is temporarily unavailable. Please contact support with your payment id." },
      { status: 503 }
    );
  }

  const idToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!idToken) {
    return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      items?: ServerOrderItemInput[];
      couponCode?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      paymentMethod?: string;
      shippingAddress?: Record<string, string>;
    };

    const razorpayOrderId = String(body.razorpayOrderId || "");
    const razorpayPaymentId = String(body.razorpayPaymentId || "");
    const razorpaySignature = String(body.razorpaySignature || "");

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing Razorpay payment details" }, { status: 400 });
    }

    // Integrity: proves this payment belongs to the server-created order whose
    // amount we set from server-side pricing in create-order (audit H1).
    const verified = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    if (!verified) {
      await logRazorpayEvent({
        id: `verify_failed_${razorpayPaymentId}`,
        eventType: "payment.verification_failed",
        status: "failed",
        amount: 0,
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

    // Fetch the authoritative captured amount/status from Razorpay.
    let paidAmountPaise = 0;
    let paymentStatus = "captured";
    try {
      const client = getRazorpayClient();
      const payment = await client.payments.fetch(razorpayPaymentId);
      paymentStatus = String(payment.status || "captured");
      paidAmountPaise = Number(payment.amount) || 0;
      if (payment.status === "failed") {
        return NextResponse.json({ error: "Payment failed at Razorpay" }, { status: 402 });
      }
    } catch (error) {
      console.warn("[razorpay/verify] Could not fetch payment from Razorpay:", error);
    }

    // Re-derive server-authoritative line items for the persisted record.
    // The order total is the amount Razorpay actually captured (which equals the
    // server-set order amount); pricing provides the trustworthy breakdown.
    let serverItems: { productId: string; title: string; quantity: number; price: number; image?: string; size?: string; color?: string }[] = [];
    let subtotal = 0;
    let discount = 0;
    let shippingCharge = 0;
    let couponCode: string | undefined;
    try {
      const pricing = await computeServerPricing({ items: body.items ?? [], couponCode: body.couponCode });
      serverItems = pricing.items;
      subtotal = pricing.subtotal;
      discount = pricing.discount;
      shippingCharge = pricing.shippingCharge;
      couponCode = pricing.couponCode;
      if (paidAmountPaise && pricing.amountInPaise !== paidAmountPaise) {
        // Non-fatal: prices may have changed mid-checkout. Record the true paid
        // amount and flag the discrepancy for admin reconciliation.
        await logRazorpayEvent({
          id: `amount_mismatch_${razorpayPaymentId}`,
          eventType: "payment.amount_mismatch",
          status: "captured",
          amount: paidAmountPaise / 100,
          currency: "INR",
          razorpayOrderId,
          razorpayPaymentId,
          customerEmail: body.customerEmail,
          source: "verify",
          message: `Paid ₹${(paidAmountPaise / 100).toFixed(2)} but re-priced to ₹${pricing.total.toFixed(2)}`,
        });
      }
    } catch (error) {
      if (error instanceof ServerPricingUnavailableError) {
        return NextResponse.json(
          { error: "Secure checkout is temporarily unavailable. Please contact support with your payment id." },
          { status: 503 }
        );
      }
      // Payment is already captured — never lose it. Persist a minimal record.
      console.warn("[razorpay/verify] Re-pricing failed, persisting minimal order:", error);
    }

    const total = paidAmountPaise ? paidAmountPaise / 100 : subtotal - discount + shippingCharge;

    const persisted = await persistStoreOrder({
      userId,
      customerName: String(body.customerName || ""),
      customerEmail: String(body.customerEmail || ""),
      customerPhone: body.customerPhone,
      items: serverItems,
      subtotal,
      shippingCharge,
      discount,
      total,
      paymentStatus: "paid",
      paymentMethod: body.paymentMethod,
      couponCode,
      razorpayOrderId,
      razorpayPaymentId,
      shippingAddress: body.shippingAddress ?? {},
    });

    await logRazorpayEvent({
      id: `payment_${razorpayPaymentId}`,
      eventType: "payment.captured",
      status: "captured",
      amount: total,
      currency: "INR",
      razorpayOrderId,
      razorpayPaymentId,
      paymentMethod: body.paymentMethod,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      customerName: body.customerName,
      storeOrderId: persisted?.orderId,
      source: "verify",
      message: `Payment ${paymentStatus} — ₹${total.toFixed(2)}`,
    });

    return NextResponse.json({
      verified: true,
      razorpayOrderId,
      razorpayPaymentId,
      orderId: persisted?.orderId,
      orderNumber: persisted?.orderNumber,
      orderCreatedInAdmin: Boolean(persisted),
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
