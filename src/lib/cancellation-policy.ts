import { SITE_NAME } from "@/lib/constants";

export const CANCELLATION_POLICY = {
  title: "Cancellation & return policy",
  summary: `By submitting this request, you agree to ${SITE_NAME}'s cancellation and return terms.`,
  points: [
    "Refund requests are reviewed within 1–2 business days. Approved refunds are processed within 5–7 business days to your original payment method.",
    "Exchange requests require the item to be unworn with tags attached. Our team will confirm size or product availability before dispatching a replacement.",
    "Orders already in production or shipped may not qualify for instant cancellation — we'll approve or decline based on fulfilment status.",
    "Sale items and custom pieces may be final sale unless the product is defective or incorrect.",
    "Once approved, you'll see updates here and in your order tracking timeline.",
  ],
};
