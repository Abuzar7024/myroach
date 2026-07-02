import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `The lore behind ${SITE_NAME} — Gen Z streetwear born in Mumbai.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="relative -mt-16 flex h-[60vh] min-h-[360px] items-end bg-noire-black lg:-mt-20">
        <img
          src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=75"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <span className="sticker sticker-neon mb-3">the lore 🪳</span>
          <h1 className="font-display mt-3 text-4xl text-noire-white md:text-5xl lg:text-6xl">
            BORN UNBOTHERED,<br />WORN EVERYWHERE
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
        <h2 className="font-display text-2xl md:text-3xl">THE MISSION</h2>
        <p className="mt-6 text-sm leading-relaxed text-noire-muted">
          {SITE_NAME} exists for one reason: make streetwear that survives everything and
          still goes hard. Born from the youth trend — unbothered,
          underground, absurdist humor meets real drip.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-noire-muted">
          Built like a roach, dressed like a menace. Heavy fabrics, bold graphics,
          fits that make your group chat lose it. Squad up — bhai, the scene is here.
        </p>
      </section>

      <section className="border-t border-noire-border py-16 text-center">
        <Button asChild variant="drip">
          <Link href="/shop">Shop the Drop</Link>
        </Button>
      </section>
    </>
  );
}
