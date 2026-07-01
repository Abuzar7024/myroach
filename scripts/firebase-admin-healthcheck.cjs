/**
 * Firebase Admin service-account healthcheck.
 *
 * Confirms a service account JSON is valid and can reach Firestore + Auth as
 * admin. Reads the JSON path from SA_PATH (no secret is written into this file):
 *   SA_PATH=/path/to/service-account.json node scripts/firebase-admin-healthcheck.cjs
 */
const fs = require("fs");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const saPath = process.env.SA_PATH;
if (!saPath) {
  console.error("Set SA_PATH to the service account JSON file path.");
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(saPath, "utf8"));
initializeApp({ credential: cert(sa) });

(async () => {
  try {
    console.log(`project_id: ${sa.project_id}`);
    console.log(`client_email: ${sa.client_email.split("@")[0]}@…`);

    const db = getFirestore();
    const snap = await db.collection("products").limit(1).get();
    console.log(`✅ Firestore read OK (products sample: ${snap.size})`);

    const users = await getAuth().listUsers(1);
    console.log(`✅ Auth admin OK (listed ${users.users.length} user)`);

    console.log("\nRESULT: ✅ Service account is VALID with Firestore + Auth admin access.");
    process.exit(0);
  } catch (e) {
    console.error("\nRESULT: ❌ Service account check FAILED.");
    console.error(e && (e.message || e));
    process.exit(2);
  }
})();
