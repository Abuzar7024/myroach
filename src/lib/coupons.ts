import type { Coupon } from "@/types";
import { formatPrice } from "@/lib/format";

export function validateCoupon(
  code: string,
  subtotal: number,
  couponList: Coupon[]
): { valid: boolean; discount: number; message: string } {
  const coupon = couponList.find(
    (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
  );

  if (!coupon) {
    return { valid: false, discount: 0, message: "Invalid coupon code" };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, discount: 0, message: "This coupon has expired" };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order of ${formatPrice(coupon.minOrderAmount)} required`,
    };
  }

  const discount =
    coupon.type === "percentage"
      ? Math.round(subtotal * (coupon.value / 100))
      : coupon.value;

  const label =
    coupon.type === "percentage"
      ? `${coupon.value}% off`
      : `${formatPrice(coupon.value)} off`;

  return { valid: true, discount, message: `Coupon applied: ${label}` };
}
