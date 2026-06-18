import { SITE_URL } from "@/lib/constants";

export const EMAIL_VERIFICATION_ACTION_PATH = "/auth/action";

/** Continue URL embedded in Firebase verification emails. */
export function getEmailVerificationContinueUrl(): string {
  const base =
    typeof window !== "undefined" ? window.location.origin : SITE_URL.replace(/\/$/, "");
  return `${base}${EMAIL_VERIFICATION_ACTION_PATH}`;
}

export function isEmailVerificationActionPath(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith(EMAIL_VERIFICATION_ACTION_PATH));
}
