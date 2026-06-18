export const RETURN_URL_KEY = "returnUrl";
export const VERIFICATION_RETURN_KEY = "verificationReturnUrl";
export const VERIFICATION_WAITING_ROOM_PATH = "/account/verify";

export function normalizeReturnPath(path: string | null | undefined, fallback = "/shop"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  if (
    path.startsWith(VERIFICATION_WAITING_ROOM_PATH) ||
    path.startsWith("/auth/action") ||
    path.startsWith("/login") ||
    path.startsWith("/register")
  ) {
    return fallback;
  }
  return path;
}

export function storeReturnUrl(path: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(RETURN_URL_KEY, path);
  }
}

export function storeVerificationReturnUrl(path: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(VERIFICATION_RETURN_KEY, normalizeReturnPath(path));
  }
}

export function peekVerificationReturnUrl(fallback = "/shop"): string {
  if (typeof window === "undefined") return fallback;

  const fromStorage = sessionStorage.getItem(VERIFICATION_RETURN_KEY);
  const fromQuery = new URLSearchParams(window.location.search).get("redirect");
  return normalizeReturnPath(fromStorage || fromQuery, fallback);
}

export function getAndClearVerificationReturnUrl(fallback = "/shop"): string {
  const url = peekVerificationReturnUrl(fallback);
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(VERIFICATION_RETURN_KEY);
  }
  return url;
}

export function isVerificationWaitingRoomPath(pathname: string | null): boolean {
  return Boolean(
    pathname === VERIFICATION_WAITING_ROOM_PATH ||
      pathname?.startsWith(`${VERIFICATION_WAITING_ROOM_PATH}/`)
  );
}

export function isVerificationExemptPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return isVerificationWaitingRoomPath(pathname) || pathname.startsWith("/auth/action");
}

export function verificationWaitingRoomPath(returnPath: string): string {
  const safe = normalizeReturnPath(returnPath);
  return `${VERIFICATION_WAITING_ROOM_PATH}?redirect=${encodeURIComponent(safe)}`;
}

export function describeReturnPath(path: string): string {
  if (path.startsWith("/checkout/payment")) return "payment";
  if (path.startsWith("/checkout")) return "checkout";
  if (path.startsWith("/cart")) return "your cart";
  if (path.startsWith("/account")) return "your account";
  if (path.startsWith("/product/")) return "the product you were viewing";
  if (path.startsWith("/shop")) return "the shop";
  return "where you left off";
}

export function getAndClearReturnUrl(fallback = "/account"): string {
  if (typeof window === "undefined") return fallback;

  const fromSession = sessionStorage.getItem(RETURN_URL_KEY);
  const fromQuery = new URLSearchParams(window.location.search).get("redirect");
  sessionStorage.removeItem(RETURN_URL_KEY);

  const url = fromSession || fromQuery || fallback;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return fallback;
}

export function loginRedirectPath(returnPath: string): string {
  return `/login?redirect=${encodeURIComponent(returnPath)}`;
}

export function isValidIndianMobile(digits: string): boolean {
  return /^[6-9]\d{9}$/.test(digits);
}

/** Dev/test credentials — no Firebase SMS or reCAPTCHA required */
export const TEST_PHONE = "8770206120";
export const TEST_OTP = "123456";

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function isTestCredentials(phone: string, otp: string): boolean {
  return normalizePhoneDigits(phone) === TEST_PHONE && otp === TEST_OTP;
}

export function formatIndianPhoneE164(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  return `+91${digits}`;
}
