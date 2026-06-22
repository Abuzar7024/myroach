import { NextResponse } from "next/server";
import { getPublicRazorpayKeyId, isRazorpayConfigured, maskRazorpayKeyId } from "@/lib/razorpay/config";

export async function GET() {
  const keyId = getPublicRazorpayKeyId();
  const configured = isRazorpayConfigured();
  const mode = keyId.startsWith("rzp_live_") ? "live" : keyId.startsWith("rzp_test_") ? "test" : "unknown";

  return NextResponse.json({
    configured,
    mode,
    keyId: maskRazorpayKeyId(keyId),
    webhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    eventsLogging: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
  });
}
