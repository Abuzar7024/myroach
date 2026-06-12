import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { FREE_SHIPPING_THRESHOLD, SITE_NAME } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: `Shipping, delivery, and return policy for ${SITE_NAME}.`,
};

/**
 * Shipping content adapted from imaginefuture.site/shipping.
 * Returns policy expanded for MY ROACH e-commerce operations.
 */
export default function ShippingReturnsPage() {
  return (
    <LegalPageLayout
      title="Shipping & Returns"
      subtitle="MY ROACH pieces are prepared after verified payment. Delivery timelines depend on product, production queue, courier route, and destination PIN code."
    >
      <section>
        <h2 className="font-display text-lg text-noire-white">Order Processing</h2>
        <p className="mt-3">
          {SITE_NAME} pieces are prepared after verified payment. Production and dispatch
          typically begin within 1–2 business days. You&apos;ll receive a confirmation
          email once your order is placed and tracking details once shipped.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Shipping Rates & Timelines</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>Standard (5–7 business days): ₹99</li>
          <li>Express (2–3 business days): ₹199</li>
          <li>Overnight (next business day): ₹399</li>
          <li>
            Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </li>
        </ul>
        <p className="mt-3">
          Delivery timelines depend on the selected product, production queue, courier
          route, and destination PIN code. Remote or non-serviceable PIN codes may take
          longer — we&apos;ll notify you if there are delays.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Tracking</h2>
        <p className="mt-3">
          Once dispatched, you&apos;ll receive tracking via email and SMS. You can also
          view order status in your account under Order History.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Returns & Exchanges</h2>
        <p className="mt-3">
          Not feeling the fit? Return unworn items with tags attached within 14 days of
          delivery for a full refund or exchange. Sale items are final unless defective.
        </p>
        <p className="mt-3">
          To start a return, email crew@myroach.in with your order number. We&apos;ll
          send a prepaid return label for eligible orders within India.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Damaged or Wrong Items</h2>
        <p className="mt-3">
          Received the wrong size or a damaged piece? Contact us within 48 hours of
          delivery with photos of the item and packaging. We&apos;ll replace or refund —
          the rotation got your back.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Cancellations</h2>
        <p className="mt-3">
          Orders can be cancelled before production begins. Once printing or fulfilment
          has started, cancellation may not be possible. Contact support immediately if
          you need to cancel — we&apos;ll do our best to help.
        </p>
      </section>

      <section>
        <p className="text-noire-white">
          Need sizing help? Check our{" "}
          <Link href="/size-guide" className="text-accent-cyan hover:underline">
            Size Guide
          </Link>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
