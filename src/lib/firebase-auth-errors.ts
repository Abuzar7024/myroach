/** Map Firebase Auth / Firestore client errors to short user-facing messages. */
export function mapFirebaseAuthError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Sign in or reset your password.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email sign-up is disabled in Firebase. Enable Email/Password in Authentication → Sign-in method.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/missing-continue-uri":
    case "auth/invalid-continue-uri":
    case "auth/unauthorized-continue-uri":
      return "Verification link misconfigured. Add this site URL to Firebase → Authentication → Authorized domains.";
    case "permission-denied":
      return "Could not save your profile (Firestore blocked). Check App Check / Firestore rules for this project.";
    case "app-check/app-check-token-error":
    case "app-check/recaptcha-error":
      return "Security check failed (App Check). Add the reCAPTCHA site key on Vercel or disable App Check enforcement for Auth.";
    default:
      if (message.includes("ADMIN_USE_PANEL")) {
        return "Admin accounts sign in at the admin panel, not the store.";
      }
      if (message.includes("Firebase is not configured")) {
        return "Sign-in is not configured. Contact support.";
      }
      return message || "Something went wrong. Please try again.";
  }
}
