import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function initAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;

  try {
    return initializeApp({
      credential: cert(JSON.parse(json) as object),
    });
  } catch (error) {
    console.error("[firebase-admin] Failed to initialize:", error);
    return null;
  }
}

let cachedFirestore: Firestore | null = null;

export function getAdminFirestore(): Firestore | null {
  if (cachedFirestore) return cachedFirestore;
  const app = initAdminApp();
  if (!app) return null;
  const db = getFirestore(app);
  try {
    // Optional order/event fields (customerPhone, coupon, storeOrderId, …) can
    // legitimately be undefined; ignore them instead of throwing on write.
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    /* settings already applied on this instance */
  }
  cachedFirestore = db;
  return db;
}

export function getAdminAuth(): Auth | null {
  const app = initAdminApp();
  return app ? getAuth(app) : null;
}
