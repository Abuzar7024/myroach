import type { Metadata } from "next";
import { PaymentAuthWrapper } from "@/components/checkout/payment-auth-wrapper";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Payment",
  description: `Complete payment for your ${SITE_NAME} order.`,
};

export default function PaymentPage() {
  return <PaymentAuthWrapper />;
}
