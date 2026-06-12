import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for shopping at ${SITE_NAME}.`,
};

/**
 * Legal structure adapted from imaginefuture.site/terms (Woke Roach / ImagineFuture policy).
 * Brand references updated to MY ROACH.
 */
export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="These terms explain the role of MY ROACH as an apparel storefront and fulfilment operation."
    >
      <section>
        <h2 className="font-display text-lg text-noire-white">Overview</h2>
        <p className="mt-3">
          These terms apply to product listings, checkout, payment, shipment, and post-order
          support on {SITE_NAME}. By shopping with us, you agree to these terms.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Commercial Role</h2>
        <p className="mt-3">
          {SITE_NAME} operates as an apparel storefront, checkout, shipment, and fulfilment
          channel for printed clothing. We sell garments and arrange payment, production,
          dispatch, tracking, and support. We are not a political organisation, campaign,
          legal body, court, government office, student group, activist group, media house,
          or public authority.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Design Neutrality</h2>
        <p className="mt-3">
          Any slogan, seal, emblem-style artwork, fictional case-file layout, public-record
          style graphic, political phrase, social commentary, meme, symbol, or visual
          reference appearing on a product is treated only as decorative apparel artwork.
          The appearance of a design does not mean that {SITE_NAME}, its owners, printers,
          payment providers, logistics partners, or technology vendors endorse, support,
          oppose, represent, sponsor, or are affiliated with any person, institution,
          movement, party, court matter, government body, organisation, or public controversy.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">No Affiliation Or Official Status</h2>
        <p className="mt-3">
          Product artwork is not presented as an official notice, court record, government
          communication, legal document, political campaign material, public seal,
          institutional statement, or authorised representation of any third party. Any
          resemblance to official documents, seals, marks, names, slogans, or public-facing
          material is not intended to claim authority, approval, sponsorship, certification,
          or association.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Orders & Payment</h2>
        <p className="mt-3">
          All prices are in INR (₹). Orders are confirmed once payment is processed.
          We reserve the right to cancel orders in case of pricing errors, stock issues,
          or suspected fraud — you&apos;ll receive a full refund where applicable.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Intellectual Property And Takedown</h2>
        <p className="mt-3">
          Designs may come from trend-led apparel concepts, independent creative inputs,
          licensed assets, supplier material, or public-style references. If a rights holder
          believes that any product infringes copyright, trademark, design rights, publicity
          rights, personality rights, court order, or any other legal right, they should send
          a written notice through the support channel available in order communications
          with the exact product URL, proof of rights, the allegedly infringing material,
          and the requested action. After receiving a credible notice, we may remove or
          disable the listing, pause fulfilment, cancel unpaid orders, refund where
          appropriate, preserve records, and cooperate with lawful requests.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Customer Understanding</h2>
        <p className="mt-3">
          Customers buy wearable apparel, not legal advice, political representation,
          campaign membership, official endorsement, or participation in any organisation.
          Customers must not use purchased products to falsely claim affiliation, authority,
          official status, identity, or endorsement by any third party.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Limitation</h2>
        <p className="mt-3">
          To the maximum extent permitted by applicable law, {SITE_NAME} is not responsible
          for interpretations, political reactions, third-party claims, public commentary,
          resale use, misuse, or unauthorised representations made by customers or other
          parties after purchase. Nothing in these terms excludes rights or obligations
          that cannot legally be excluded.
        </p>
      </section>
    </LegalPageLayout>
  );
}
