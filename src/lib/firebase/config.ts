import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth as getFirebaseAuth,
  type Auth,
} from "firebase/auth";
import {
  getFirestore as getFirebaseFirestore,
  type Firestore,
} from "firebase/firestore";
import { initFirestoreLogging } from "./firestore-utils";
import {
  getStorage as getFirebaseStorage,
  type FirebaseStorage,
} from "firebase/storage";
import {
  getAnalytics as getFirebaseAnalytics,
  isSupported,
  type Analytics,
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "your_api_key_here"
);

function createFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

let firebaseApp: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
  }
  if (!firebaseApp) {
    firebaseApp = createFirebaseApp();
  }
  return firebaseApp;
}

let auth: Auth | undefined;

export function getAuth(): Auth | null {
  if (!isFirebaseConfigured) {
    return null;
  }
  if (!auth) {
    auth = getFirebaseAuth(getFirebaseApp());
  }
  return auth;
}

let firestore: Firestore | undefined;

export function getFirestore(): Firestore | null {
  if (!isFirebaseConfigured) {
    return null;
  }
  initFirestoreLogging();
  if (!firestore) {
    firestore = getFirebaseFirestore(getFirebaseApp());
  }
  return firestore;
}

let storage: FirebaseStorage | undefined;

export function getStorage(): FirebaseStorage | null {
  if (!isFirebaseConfigured) {
    return null;
  }
  if (!storage) {
    storage = getFirebaseStorage(getFirebaseApp());
  }
  return storage;
}

let analytics: Analytics | null | undefined;

export async function getAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured) {
    return null;
  }

  if (analytics !== undefined) {
    return analytics;
  }

  const supported = await isSupported();
  if (!supported) {
    analytics = null;
    return null;
  }

  analytics = getFirebaseAnalytics(getFirebaseApp());
  return analytics;
}