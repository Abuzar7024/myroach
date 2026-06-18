import type { Address, User } from "@/types";
import type { CheckoutShipping } from "@/store/cart-store";
import { isValidIndianMobile, normalizePhoneDigits } from "@/lib/auth-utils";

export function getDefaultAddress(user: User): Address | undefined {
  return user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function buildCheckoutDefaults(
  user: User,
  saved?: CheckoutShipping | null
): Partial<CheckoutShipping> {
  if (saved) {
    return { ...saved, country: saved.country || "India" };
  }

  const addr = getDefaultAddress(user);
  const names = splitFullName(addr?.fullName || user.displayName || "");
  const phone = user.phone ? normalizePhoneDigits(user.phone) : "";

  return {
    firstName: names.firstName,
    lastName: names.lastName,
    email: user.email || "",
    phone: isValidIndianMobile(phone) ? phone : "",
    street: addr?.street ?? "",
    city: addr?.city ?? "",
    state: addr?.state ?? "",
    postalCode: addr?.postalCode ?? "",
    country: addr?.country || "India",
  };
}

export function getProfileGaps(user: User): ("name" | "phone" | "address")[] {
  const gaps: ("name" | "phone" | "address")[] = [];
  if (!user.displayName?.trim()) gaps.push("name");
  const phone = user.phone ? normalizePhoneDigits(user.phone) : "";
  if (!isValidIndianMobile(phone)) gaps.push("phone");
  const addr = getDefaultAddress(user);
  if (!addr?.street?.trim() || !addr.city?.trim() || !addr.state?.trim() || !addr.postalCode?.trim()) {
    gaps.push("address");
  }
  return gaps;
}

export function buildProfileFromCheckout(
  user: User,
  data: CheckoutShipping
): Partial<User> {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const existing = getDefaultAddress(user);
  const addressId = existing?.id ?? `addr-${Date.now()}`;

  const shippingAddress: Address = {
    id: addressId,
    label: existing?.label ?? "Home",
    fullName,
    street: data.street,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country || "India",
    isDefault: true,
  };

  const otherAddresses = user.addresses
    .filter((a) => a.id !== addressId)
    .map((a) => ({ ...a, isDefault: false }));

  return {
    displayName: fullName,
    phone: data.phone,
    addresses: [shippingAddress, ...otherAddresses],
  };
}
