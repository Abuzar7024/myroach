import type { Metadata } from "next";
import { ContactContent } from "@/components/contact/contact-content";

import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE_NAME} — the rotation got you.`,
};

export default function ContactPage() {
  return <ContactContent />;
}
