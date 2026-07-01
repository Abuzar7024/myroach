import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay/server";
import { getPublicRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay/config";
import { logRazorpayEvent } from "@/lib/razorpay/events";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  computeServerPricing,
  ServerPricingError,
  ServerPricingUnavailableError,
  type ServerOrderItemInput,
} from "@/lib/checkout/server-pricing";

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay is not configured on the server" }, { status: 503 });
  }

  // Secure checkout requires the Firebase Admin SDK so the server can (a) verify
  // who is paying and (b) re-price the cart from Firestore. Without it we fail
  // closed rather than trust a client-supplied amount (audit H1/H2/H6).
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json(
      { error: "Secure checkout is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const idToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!idToken) {
    return NextResponse.json({ error: "Please sign in to continue to payment." }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    userId = decoded.uid;
  } catch {
    return NextResponse.json(
      { error: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      items?: ServerOrderItemInput[];
      couponCode?: string;
      receipt?: string;
      notes?: Record<string, string>;
      customerEmail?: string;
      customerPhone?: string;
      customerName?: string;
    };

    // Authoritative pricing — the client's numbers are never trusted.
    const pricing = await computeServerPricing({
      items: body.items ?? [],
      couponCode: body.couponCode,
    });

    const receipt = String(body.receipt || `rcpt_${Date.now()}`).slice(0, 40);
    const order = await createRazorpayOrder({
      amountInr: pricing.total,
      receipt,
      notes: {
        ...body.notes,
        userId,
        ...(pricing.couponCode ? { coupon: pricing.couponCode } : {}),
      },
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
      pricing: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shippingCharge: pricing.shippingCharge,
        total: pricing.total,
        couponCode: pricing.couponCode ?? null,
      },
    });
  } catch (error) {
    if (error instanceof ServerPricingUnavailableError) {
      return NextResponse.json(
        { error: "Secure checkout is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }
    if (error instanceof ServerPricingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[razorpay/create-order]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create Razorpay order" },
      { status: 500 }
    );
  }
}
