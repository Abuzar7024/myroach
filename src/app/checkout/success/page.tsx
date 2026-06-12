import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccessContent } from "@/components/checkout/checkout-success-content";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: `Your ${SITE_NAME} order has been placed.`,
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
