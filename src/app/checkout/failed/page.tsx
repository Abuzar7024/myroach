import { Suspense } from "react";
import { CheckoutFailedContent } from "@/components/checkout/checkout-failed-content";
import { PageLoader } from "@/components/ui/page-loader";

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading" fullPage className="pt-20" />}>
      <CheckoutFailedContent />
    </Suspense>
  );
}
