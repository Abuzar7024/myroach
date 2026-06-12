export const RETURN_URL_KEY = "returnUrl";

export function storeReturnUrl(path: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(RETURN_URL_KEY, path);
  }
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
