export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
}

export function getRazorpayKeySecret() {
  return process.env.RAZORPAY_KEY_SECRET || "";
}

export function isRazorpayConfigured() {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}

export function getPublicRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
}

export function getRazorpayMode(keyId = getRazorpayKeyId()): "live" | "test" | "unknown" {
  if (keyId.startsWith("rzp_live_")) return "live";
  if (keyId.startsWith("rzp_test_")) return "test";
  return "unknown";
}

export function maskRazorpayKeyId(keyId: string) {
  if (!keyId) return "";
  if (keyId.length <= 12) return keyId;
  return `${keyId.slice(0, 8)}…${keyId.slice(-4)}`;
}

export function keysMatchPublicAndSecret(): boolean {
  const publicId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const serverId = process.env.RAZORPAY_KEY_ID || "";
  return !publicId || !serverId || publicId === serverId;
}
