/** Runtime store settings synced from Firestore for cart/checkout math. */
let freeShippingThreshold = 0;
let defaultShippingCharge = 0;

export function setPricingSettings(input: {
  freeShippingThreshold?: number;
  shippingCharge?: number;
}) {
  freeShippingThreshold =
    input.freeShippingThreshold != null && input.freeShippingThreshold > 0
      ? input.freeShippingThreshold
      : 0;
  defaultShippingCharge =
    input.shippingCharge != null && input.shippingCharge >= 0 ? input.shippingCharge : 0;
}

/** Returns Infinity when free shipping is not configured in admin. */
export function getFreeShippingThreshold() {
  return freeShippingThreshold > 0 ? freeShippingThreshold : Number.POSITIVE_INFINITY;
}

export function getDefaultShippingCharge() {
  return defaultShippingCharge;
}
