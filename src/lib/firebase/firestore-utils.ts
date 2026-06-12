import { setLogLevel } from "firebase/firestore";
import { isFirebaseConfigured } from "./config";

type FirestoreAvailability = "unknown" | "available" | "unavailable";

let availability: FirestoreAvailability = "unknown";
let devWarned = false;
let loggingInitialized = false;

const FIRESTORE_TIMEOUT_MS = 4000;

export function initFirestoreLogging(): void {
  if (loggingInitialized) return;
  loggingInitialized = true;
  if (isFirebaseConfigured) {
    setLogLevel("silent");
  }
}

export function isRecoverableFirestoreError(error: unknown): boolean {
  const code = (error as { code?: string })?.code ?? "";
  const message = error instanceof Error ? error.message : String(error);
  return (
    code === "permission-denied" ||
    code === "unavailable" ||
    code === "failed-precondition" ||
    message.includes("PERMISSION_DENIED") ||
    message.includes("Firestore API has not been used") ||
    message.includes("Could not reach Cloud Firestore")
  );
}

export function markFirestoreUnavailable(): void {
  availability = "unavailable";
  if (process.env.NODE_ENV === "development" && !devWarned) {
    devWarned = true;
    console.warn(
      "[MY ROACH] Firestore unavailable — using mock data. See FIREBASE_SETUP.md to enable."
    );
  }
}

export function markFirestoreAvailable(): void {
  availability = "available";
}

/** True when env is set and Firestore has not been marked unavailable. */
export function isFirestoreAvailable(): boolean {
  if (!isFirebaseConfigured) return false;
  return availability !== "unavailable";
}

/** Whether a Firestore read/write should be attempted (skips after first recoverable failure). */
export function shouldAttemptFirestore(): boolean {
  // Server components should not block on Firestore network calls — use mock data instead.
  if (typeof window === "undefined") return false;
  return isFirebaseConfigured && availability !== "unavailable";
}

export async function withFirestoreFallback<T>(
  fallback: () => T | Promise<T>,
  operation: () => Promise<T>
): Promise<T> {
  initFirestoreLogging();

  if (!shouldAttemptFirestore()) {
    return fallback();
  }

  try {
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore timeout")), FIRESTORE_TIMEOUT_MS)
      ),
    ]);
    markFirestoreAvailable();
    return result;
  } catch (error) {
    if (
      isRecoverableFirestoreError(error) ||
      (error instanceof Error && error.message === "Firestore timeout")
    ) {
      markFirestoreUnavailable();
      return fallback();
    }
    throw error;
  }
}
