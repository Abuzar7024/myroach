import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from "firebase/app-check";
import type { FirebaseApp } from "firebase/app";

let appCheck: AppCheck | undefined;

function hasFirebaseClientConfig(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return Boolean(apiKey && projectId && apiKey !== "your_api_key_here");
}

/** Must run before `initializeApp` / `initializeAppCheck` on the client. */
export function setFirebaseAppCheckDebugToken(): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  const token = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
  if (!token) {
    return;
  }

  (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
    token;
}

/**
 * Initialize App Check when a reCAPTCHA site key and/or dev debug token is configured.
 * With a registered debug token, Firebase uses the debug provider locally.
 */
export function initFirebaseAppCheck(app: FirebaseApp): AppCheck | null {
  if (typeof window === "undefined" || !hasFirebaseClientConfig()) {
    return null;
  }

  setFirebaseAppCheckDebugToken();

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY;
  const hasDevDebugToken =
    process.env.NODE_ENV === "development" &&
    Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN);

  if (!siteKey && !hasDevDebugToken) {
    return null;
  }

  if (appCheck) {
    return appCheck;
  }

  if (!siteKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firebase App Check] Debug token is set but NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY is missing. " +
          "Add the reCAPTCHA v3 site key from Firebase Console → App Check to initialize App Check."
      );
    }
    return null;
  }

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  return appCheck;
}

export function getAppCheck(): AppCheck | null {
  return appCheck ?? null;
}
