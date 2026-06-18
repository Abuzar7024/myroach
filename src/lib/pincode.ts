export const INDIAN_PINCODE_REGEX = /^\d{6}$/;

export function normalizeIndianPincode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function isValidIndianPincode(value: string): boolean {
  return INDIAN_PINCODE_REGEX.test(normalizeIndianPincode(value));
}

export interface PincodeLocation {
  pincode: string;
  city: string;
  state: string;
  district: string;
  country: string;
}
