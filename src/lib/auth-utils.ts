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
