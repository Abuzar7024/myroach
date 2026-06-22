import type { StoreSettings } from "@/types/settings";

export type StorePolicyKey = "privacyPolicy" | "termsAndConditions" | "returnPolicy";

export function hasPolicyText(value?: string | null): boolean {
  return Boolean(value?.trim());
}

export function getStorePolicy(settings: StoreSettings, key: StorePolicyKey): string | undefined {
  const text = settings.policies?.[key];
  return hasPolicyText(text) ? text!.trim() : undefined;
}

export function isPolicyRouteAvailable(href: string, settings: StoreSettings): boolean {
  if (href === "/privacy") return Boolean(getStorePolicy(settings, "privacyPolicy"));
  if (href === "/terms") return Boolean(getStorePolicy(settings, "termsAndConditions"));
  if (href === "/shipping-returns") return Boolean(getStorePolicy(settings, "returnPolicy"));
  return true;
}
