import type { Metadata } from "next";
import { CheckoutAuthWrapper } from "@/components/checkout/checkout-auth-wrapper";

import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Checkout",
  description: `Complete your ${SITE_NAME} order.`,
};

export default function CheckoutPage() {
  return <CheckoutAuthWrapper />;
}
