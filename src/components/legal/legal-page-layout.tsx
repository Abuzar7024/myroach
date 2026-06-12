import Link from "next/link";
import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, subtitle, children }: LegalPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 pb-8 sm:px-6 lg:px-8 lg:py-32">
      <span className="sticker sticker-neon mb-4">legal stuff 🪳</span>
      <h1 className="font-display text-2xl tracking-wide sm:text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 text-base text-noire-muted">{subtitle}</p>
      <div className="prose-legal mt-10 space-y-8 text-base leading-relaxed text-noire-muted sm:mt-12">
        {children}
      </div>
      <div className="mt-16 flex flex-wrap gap-4 border-t border-noire-border pt-8">
        <Link href="/" className="text-sm text-accent-cyan hover:underline">
          Home
        </Link>
        <Link href="/shop" className="text-sm text-accent-cyan hover:underline">
          Shop
        </Link>
        <Link href="/contact" className="text-sm text-accent-cyan hover:underline">
          Contact
        </Link>
      </div>
    </div>
  );
}
