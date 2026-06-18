import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ComingSoonBlockProps {
  title?: string;
  subtitle?: string;
  emoji?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function ComingSoonBlock({
  title = "Heat incoming",
  subtitle = "New items will appear here soon. Check back or browse the shop.",
  emoji = "🪳",
  ctaHref = "/shop",
  ctaLabel = "Browse shop",
}: ComingSoonBlockProps) {
  return (
    <div className="cyber-card flex flex-col items-center justify-center border border-dashed border-accent-cyan/35 px-6 py-14 text-center sm:px-10 sm:py-16">
      <span className="text-5xl sm:text-6xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="sticker sticker-pink mt-5">coming soon</span>
      <h3 className="font-display mt-5 text-2xl tracking-wide sm:text-3xl">{title}</h3>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-noire-muted">{subtitle}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-accent-cyan/80">
        updated from the admin panel
      </p>
      {ctaHref && (
        <Button asChild variant="cyber" className="mt-8">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export function ComingSoonProductGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex aspect-[3/4] flex-col items-center justify-center border border-noire-border bg-noire-charcoal/80 p-4 text-center"
        >
          <span className="text-2xl opacity-60">🪳</span>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-accent-cyan">
            slot {i + 1}
          </p>
          <p className="mt-1 text-xs text-noire-muted">drop loading</p>
        </div>
      ))}
    </div>
  );
}
