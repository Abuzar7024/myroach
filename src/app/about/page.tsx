import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { teamMembers, timeline } from "@/data/mock-data";
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

      <section className="bg-noire-charcoal py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-center text-2xl md:text-3xl">The Crew</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-full border border-accent-cyan/50 shadow-[0_0_16px_rgba(0,240,255,0.2)]">
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-4 font-medium">{member.name}</h3>
                <p className="text-xs uppercase tracking-widest text-accent-cyan">{member.role}</p>
                <p className="mt-2 text-sm text-noire-muted">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
        <h2 className="font-display text-center text-2xl md:text-3xl">Our Journey</h2>
        <div className="relative mt-12">
          <div className="absolute left-4 top-0 h-full w-px bg-noire-border md:left-1/2" />
          {timeline.map((item, i) => (
            <div
              key={item.year + item.title}
              className={`relative mb-12 flex ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              <div className="hidden w-1/2 md:block" />
              <div className="absolute left-4 h-3 w-3 -translate-x-1/2 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)] md:left-1/2" />
              <div className="ml-10 md:ml-0 md:w-1/2 md:px-8">
                <span className="text-sm font-medium text-accent-cyan">{item.year}</span>
                <h3 className="mt-1 font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-noire-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-noire-border py-16 text-center">
        <Button asChild variant="drip">
          <Link href="/shop">Shop the Drop</Link>
        </Button>
      </section>
    </>
  );
}
