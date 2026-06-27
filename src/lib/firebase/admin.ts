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

export function getAdminFirestore(): Firestore | null {
  const app = initAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminAuth(): Auth | null {
  const app = initAdminApp();
  return app ? getAuth(app) : null;
}
