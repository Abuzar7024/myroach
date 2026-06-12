import type { Metadata } from "next";
import { CartContent } from "@/components/cart/cart-content";

import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: `Review your ${SITE_NAME} cart before checkout.`,
};

export default function CartPage() {
  return <CartContent />;
}
