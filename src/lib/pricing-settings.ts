/** Runtime store settings synced from Firestore for cart/checkout math. */
let freeShippingThreshold = 2499;
let defaultShippingCharge = 99;

export function setPricingSettings(input: {
  freeShippingThreshold?: number;
  shippingCharge?: number;
}) {
  if (input.freeShippingThreshold != null && input.freeShippingThreshold > 0) {
    freeShippingThreshold = input.freeShippingThreshold;
  }
  if (input.shippingCharge != null && input.shippingCharge >= 0) {
    defaultShippingCharge = input.shippingCharge;
  }
}

export function getFreeShippingThreshold() {
  return freeShippingThreshold;
}

export function getDefaultShippingCharge() {
  return defaultShippingCharge;
}
