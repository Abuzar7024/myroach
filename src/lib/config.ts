/** App config from env — shared by Firebase layer and UI. */

export function isMockDataMode(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

export const ADMIN_PANEL_URL =
  process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || "https://myroach-admin.vercel.app";

export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "INR";

export const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "myroach-6cc80";

export const PLACEHOLDER_PRODUCT_IMAGE = "/icon.svg";
