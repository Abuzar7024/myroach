/**
 * End-to-end test of /api/razorpay/create-order against a locally running app.
 * Mints a real Firebase ID token (via the service account), picks a real active
 * product from Firestore, and calls create-order. Creating an order does NOT
 * charge anyone.
 *
 *   SA_PATH=... WEB_API_KEY=... BASE_URL=http://localhost:3939 \
 *     node scripts/test-create-order.cjs
 */
const fs = require("fs");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const sa = JSON.parse(fs.readFileSync(process.env.SA_PATH, "utf8"));
const apiKey = process.env.WEB_API_KEY;
const base = process.env.BASE_URL || "http://localhost:3939";
initializeApp({ credential: cert(sa) });

(async () => {
  try {
    const snap = await getFirestore().collection("products").limit(15).get();
    const doc =
      snap.docs.find((d) => {
        const x = d.data();
        const active = x.active !== false && x.isActive !== false;
        return active && typeof x.price === "number" && x.price > 0;
      }) || snap.docs[0];
    if (!doc) throw new Error("No products in Firestore to test with.");
    const p = doc.data();
    console.log(`Product: ${doc.id}  price=${p.price}  "${p.title || p.name}"`);

    const uid = "healthcheck-" + Math.random().toString(36).slice(2, 8);
    const customToken = await getAuth().createCustomToken(uid);
    const ex = await (
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: customToken, returnSecureToken: true }) }
      )
    ).json();
    if (!ex.idToken) throw new Error("Token exchange failed: " + JSON.stringify(ex));
    console.log(`Minted ID token for uid ${uid}`);

    const res = await fetch(`${base}/api/razorpay/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ex.idToken}` },
      body: JSON.stringify({
        items: [{ productId: doc.id, quantity: 1, size: "M", color: "Default" }],
        customerEmail: "healthcheck@example.com",
        customerName: "Healthcheck",
        notes: { paymentMethod: "upi" },
      }),
    });
    const text = await res.text();
    console.log(`\ncreate-order → HTTP ${res.status}`);
    console.log("body:", text.slice(0, 500));

    let ok = false;
    try {
      const j = JSON.parse(text);
      ok = res.ok && typeof j.orderId === "string" && j.orderId.startsWith("order_");
      if (ok) console.log(`\nRESULT: ✅ create-order WORKS → ${j.orderId}  server-priced total ₹${j.pricing && j.pricing.total}`);
    } catch {}
    if (!ok) console.log("\nRESULT: ❌ create-order did not return a Razorpay order (see body above).");
    process.exit(ok ? 0 : 2);
  } catch (e) {
    console.error("\nRESULT: ❌ test error:", (e && e.message) || e);
    process.exit(3);
  }
})();
