import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";
import { getRazorpayKeyId, getRazorpayKeySecret, isRazorpayConfigured } from "./config";

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured");
  }

  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  });
}

export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const secret = getRazorpayKeySecret();
  if (!secret) return false;

  const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(input.razorpaySignature));
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function createRazorpayOrder(input: {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = getRazorpayClient();
  const amountPaise = Math.round(input.amountInr * 100);

  if (amountPaise < 100) {
    throw new Error("Minimum order amount is ₹1");
  }

  return client.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
}
