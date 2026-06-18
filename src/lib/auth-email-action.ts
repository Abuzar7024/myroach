import { SITE_URL } from "@/lib/constants";

export const EMAIL_VERIFICATION_ACTION_PATH = "/auth/action";

/** Continue URL embedded in Firebase verification emails. */
export function getEmailVerificationContinueUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) {
    return `${configured}${EMAIL_VERIFICATION_ACTION_PATH}`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${EMAIL_VERIFICATION_ACTION_PATH}`;
  }
  return `${SITE_URL.replace(/\/$/, "")}${EMAIL_VERIFICATION_ACTION_PATH}`;
}

export function isEmailVerificationActionPath(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith(EMAIL_VERIFICATION_ACTION_PATH));
}
