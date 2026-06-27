import { NextResponse } from "next/server";
import {
  getPublicRazorpayKeyId,
  getRazorpayKeyId,
  getRazorpayMode,
  isRazorpayConfigured,
  keysMatchPublicAndSecret,
  maskRazorpayKeyId,
} from "@/lib/razorpay/config";

export async function GET() {
  const keyId = getPublicRazorpayKeyId();
  const configured = isRazorpayConfigured();
  const keysMatch = keysMatchPublicAndSecret();

  return NextResponse.json({
    configured,
    mode: getRazorpayMode(getRazorpayKeyId()),
    keyId: maskRazorpayKeyId(keyId),
    keysMatch,
    keysMismatchWarning: keysMatch
      ? null
      : "NEXT_PUBLIC_RAZORPAY_KEY_ID must exactly match RAZORPAY_KEY_ID or checkout will fail.",
    webhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    eventsLogging: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
    adminOrderPersist: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
  });
}
