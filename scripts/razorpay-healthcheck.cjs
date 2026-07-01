/**
 * Razorpay integration healthcheck.
 *
 * Verifies that the configured Razorpay credentials are valid and the API is
 * reachable WITHOUT charging anyone: it creates a ₹1 order (an unpaid order
 * object only), verifies the HMAC signature logic our /verify route relies on,
 * and fetches the order back.
 *
 * Reads keys from the environment so no secret is ever written to a file:
 *   RAZORPAY_KEY_ID=xxx RAZORPAY_KEY_SECRET=yyy node scripts/razorpay-healthcheck.cjs
 */
const Razorpay = require("razorpay");
const crypto = require("crypto");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.error("Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET environment variables.");
  process.exit(1);
}

const mode = keyId.startsWith("rzp_live_")
  ? "LIVE"
  : keyId.startsWith("rzp_test_")
    ? "TEST"
    : "UNKNOWN";
console.log(`Key mode: ${mode}  (${keyId.slice(0, 12)}…)`);

const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

(async () => {
  try {
    // 1) Create a tiny order (does NOT charge — an order object is not a payment).
    const order = await rzp.orders.create({
      amount: 100, // ₹1.00 in paise (Razorpay minimum)
      currency: "INR",
      receipt: `healthcheck_${Date.now()}`,
      notes: { purpose: "integration-healthcheck" },
    });
    console.log(`✅ orders.create OK  → ${order.id}  amount=${order.amount} ${order.currency} status=${order.status}`);

    // 2) HMAC signature round-trip (same algorithm as /api/razorpay/verify).
    const body = `${order.id}|pay_dummy`;
    const a = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    const b = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    console.log(`✅ signature HMAC round-trip ${a === b ? "OK" : "FAILED"}`);

    // 3) Fetch the order back.
    const fetched = await rzp.orders.fetch(order.id);
    console.log(`✅ orders.fetch OK   → status=${fetched.status}`);

    console.log("\nRESULT: ✅ Razorpay credentials are VALID and the API is reachable.");
    process.exit(0);
  } catch (err) {
    console.error("\nRESULT: ❌ Razorpay check FAILED.");
    console.error("statusCode:", err && err.statusCode);
    console.error("details:", (err && (err.error || err.message)) || err);
    process.exit(2);
  }
})();
