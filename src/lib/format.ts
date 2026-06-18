import { CURRENCY } from "@/lib/config";

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function hasDecimalPart(value: number): boolean {
  return Math.abs(Math.round(value * 100) % 100) > 0;
}

/** Indian Rupee display — ₹ symbol, lakhs grouping, decimals only when needed. */
export function formatPrice(amount: number): string {
  if (!Number.isFinite(amount)) {
    return CURRENCY === "INR" ? "₹0" : "0";
  }

  const value = roundMoney(amount);
  const fractionDigits = hasDecimalPart(value) ? 2 : 0;

  if (CURRENCY === "INR") {
    const numberPart = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: 2,
    }).format(value);
    return `₹${numberPart}`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
}
