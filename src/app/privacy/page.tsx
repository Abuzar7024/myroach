import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME} — how we handle your data.`,
};

/**
 * Privacy policy for MY ROACH. Structure aligned with imaginefuture.site legal pages;
 * imaginefuture.site/privacy was unavailable (timeout) — content adapted for MY ROACH
 * e-commerce operations with Firebase auth and Firestore.
 */
export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Last updated: June 2025. How MY ROACH collects, uses, and protects your information."
    >
      <section>
        <h2 className="font-display text-lg text-noire-white">Who We Are</h2>
        <p className="mt-3">
          {SITE_NAME} operates as an apparel storefront and fulfilment channel. This policy
          explains how we handle personal data when you browse, create an account, place
          orders, or contact support.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Information We Collect</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>Account details: name, email, phone number (for OTP login)</li>
          <li>Order and shipping information: address, PIN code, delivery preferences</li>
          <li>Payment data processed by our payment partners — we do not store full card numbers</li>
          <li>Device and usage data: browser type, pages visited, cart contents (via cookies/local storage)</li>
          <li>Communications you send us via contact forms or support email</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">How We Use Your Information</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>Process, fulfil, and deliver your orders</li>
          <li>Send order confirmations, shipping updates, and delivery notifications</li>
          <li>Authenticate your account and prevent fraud</li>
          <li>Improve our products, site experience, and customer support</li>
          <li>Send marketing communications only if you opt in</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Firebase, Cookies & Local Storage</h2>
        <p className="mt-3">
          We use Firebase Authentication and Cloud Firestore to manage accounts, orders,
          and product data. Essential cookies and local storage keep your cart and session
          working across visits. Analytics help us understand site performance and which
          products resonate with the rotation.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Sharing With Third Parties</h2>
        <p className="mt-3">
          We share data only as needed to operate the store: payment processors for
          transactions, courier partners for delivery, and cloud infrastructure providers
          (Google Firebase). We do not sell your personal data to advertisers.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Data Retention</h2>
        <p className="mt-3">
          Order records are retained as required for accounting, tax, and dispute resolution.
          Account data is kept while your account is active. You may request deletion of
          your account and associated personal data at any time.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Your Rights</h2>
        <p className="mt-3">
          You may request access, correction, or deletion of your personal data. Email us
          at crew@myroach.in — we respond within 7 business days. Indian residents may
          also have rights under applicable data protection laws.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Security</h2>
        <p className="mt-3">
          We use industry-standard encryption for data in transit (HTTPS) and rely on
          Firebase security rules for database access. No method of transmission over the
          internet is 100% secure; we work to protect your data but cannot guarantee
          absolute security.
        </p>
      </section>
    </LegalPageLayout>
  );
}
