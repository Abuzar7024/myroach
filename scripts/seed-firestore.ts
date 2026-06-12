/**
 * Seed Firestore with mock data for MY ROACH.
 *
 * Prerequisites:
 *   1. Enable Cloud Firestore API in Google Cloud Console
 *   2. Create a Firestore database in Firebase Console (production mode)
 *   3. Deploy security rules: firebase deploy --only firestore:rules
 *
 * Usage:
 *   npm run seed
 *
 * Uses the Firebase client SDK with credentials from .env.local.
 * Writes require admin rules bypass — run while signed in as admin, or
 * temporarily allow writes in rules for seeding, then redeploy production rules.
 *
 * For production seeding, prefer Firebase Admin SDK with a service account.
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
import {
  products,
  categories,
  banners,
  reviews,
  coupons,
} from "../src/data/mock-data";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function main() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Missing NEXT_PUBLIC_FIREBASE_* env vars. Load .env.local first.");
    process.exit(1);
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`Seeding Firestore project: ${firebaseConfig.projectId}`);

  let batch = writeBatch(db);
  let ops = 0;

  const commitIfNeeded = async () => {
    if (ops >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  };

  const collections: { name: string; items: { id: string }[] }[] = [
    { name: "categories", items: categories },
    { name: "products", items: products },
    { name: "banners", items: banners },
    { name: "reviews", items: reviews },
    { name: "coupons", items: coupons },
  ];

  for (const { name, items } of collections) {
    for (const item of items) {
      batch.set(doc(db, name, item.id), item);
      ops++;
      await commitIfNeeded();
    }
  }

  if (ops > 0) {
    await batch.commit();
  }

  console.log(
    `Done: ${categories.length} categories, ${products.length} products, ` +
      `${banners.length} banners, ${reviews.length} reviews, ${coupons.length} coupons`
  );
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("PERMISSION_DENIED") || message.includes("Firestore API")) {
    console.error(
      "Firestore is not enabled or rules block writes.\n" +
        "Enable the API, create the database, and deploy rules — see FIREBASE_SETUP.md"
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
