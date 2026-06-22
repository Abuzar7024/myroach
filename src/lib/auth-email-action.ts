export const EMAIL_VERIFICATION_ACTION_PATH = "/auth/action";

const PRODUCTION_SITE_ORIGIN = "https://myroach.vercel.app";

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "");
}

/** Public site origin used in verification emails and action links. */
export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
    ? normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    : "";

  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (configured) {
    return configured;
  }

  return PRODUCTION_SITE_ORIGIN;
}

/** Continue URL embedded in Firebase verification emails — opens MY ROACH /auth/action. */
export function getEmailVerificationContinueUrl(): string {
  return `${getSiteOrigin()}${EMAIL_VERIFICATION_ACTION_PATH}`;
}

export function isEmailVerificationActionPath(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith(EMAIL_VERIFICATION_ACTION_PATH));
}

export function verificationEmailSessionKey(userId: string): string {
  return `myroach-verification-sent-${userId}`;
}

export function markVerificationEmailSent(userId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(verificationEmailSessionKey(userId), String(Date.now()));
}

export function wasVerificationEmailSent(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(sessionStorage.getItem(verificationEmailSessionKey(userId)));
}

/** Read Firebase email action params from search or hash (link format varies). */
export function parseEmailActionSearchParams(searchParams: URLSearchParams): {
  mode: string | null;
  oobCode: string | null;
} {
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode") || searchParams.get("oob_code");

  if (oobCode) {
    return { mode, oobCode };
  }

  if (typeof window === "undefined") {
    return { mode, oobCode: null };
  }

  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    return { mode, oobCode: null };
  }

  const hashParams = new URLSearchParams(hash);
  return {
    mode: mode || hashParams.get("mode"),
    oobCode: hashParams.get("oobCode") || hashParams.get("oob_code"),
  };
}
