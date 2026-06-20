import { initializeAppCheck, ReCaptchaV3Provider, getToken, type AppCheck } from "firebase/app-check";
import type { FirebaseApp } from "firebase/app";

let appCheck: AppCheck | undefined;
let appCheckReady: Promise<void> | undefined;

/** Google public test key — dev only, works with App Check debug tokens. */
const DEV_RECAPTCHA_FALLBACK = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

function hasFirebaseClientConfig(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return Boolean(apiKey && projectId && apiKey !== "your_api_key_here");
}

function resolveRecaptchaSiteKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_KEY ||
    null
  );
}

/** Must run before `initializeApp` / `initializeAppCheck` on the client. */
export function setFirebaseAppCheckDebugToken(): void {
  if (typeof window === "undefined") return;

  const token = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
  if (!token) return;

  (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
    token;
}

export function initFirebaseAppCheck(app: FirebaseApp): AppCheck | null {
  if (typeof window === "undefined" || !hasFirebaseClientConfig()) {
    return null;
  }

  if (appCheck) {
    return appCheck;
  }

  setFirebaseAppCheckDebugToken();

  const siteKey = resolveRecaptchaSiteKey();
  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
  const forceAppCheck = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_ENABLED === "true";

  if (process.env.NODE_ENV === "development" && !forceAppCheck && !debugToken && !siteKey) {
    return null;
  }

  const providerKey =
    siteKey ?? (process.env.NODE_ENV === "development" && debugToken ? DEV_RECAPTCHA_FALLBACK : null);

  if (!providerKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firebase App Check] Add NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY or a debug token for local Firestore/Auth."
      );
    }
    return null;
  }

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(providerKey),
    isTokenAutoRefreshEnabled: true,
  });

  appCheckReady = getToken(appCheck, false)
    .then(() => undefined)
    .catch((err: unknown) => {
      console.warn("[Firebase App Check] token fetch failed:", err);
    });

  return appCheck;
}

export async function ensureAppCheckReady(timeoutMs = 10_000): Promise<void> {
  if (!appCheckReady) return;
  await Promise.race([
    appCheckReady,
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

export function getAppCheck(): AppCheck | null {
  return appCheck ?? null;
}
