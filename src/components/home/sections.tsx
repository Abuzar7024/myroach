"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Shimmer } from "@/components/ui/shimmer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { ComingSoonBlock } from "@/components/home/empty-states";
import { PROMO_FALLBACK_IMAGE, SHOP_TEASER_IMAGE } from "@/lib/home-fallbacks";
import { testimonials, instagramPosts } from "@/data/mock-data";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/firebase/services/product.service";
import { isMockDataMode } from "@/lib/config";
import { useState } from "react";

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  viewAllHref: string;
  loading?: boolean;
  limit?: number;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  loading = false,
  limit = 4,
  emptyTitle = "Drop loading…",
  emptySubtitle = "Nothing in the rotation yet — admin's stacking heat as we speak. Pull up later for the full send, no cap.",
}: ProductSectionProps) {
  const showSkeletons = loading && products.length === 0;
  const visible = products.slice(0, limit);

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="neon-divider mb-10" />
        <FadeIn className="mb-10 flex items-end justify-between">
          <div>
            {showSkeletons ? (
              <>
                <Shimmer className="mb-3 h-6 w-28 bg-noire-charcoal" />
                <Shimmer className="h-10 w-48 bg-noire-charcoal md:w-64" />
              </>
            ) : (
              <>
                <span className="sticker sticker-lime mb-3">{subtitle}</span>
                <h2 className="font-display mt-2 text-4xl tracking-wide md:text-5xl">{title}</h2>
              </>
            )}
          </div>
          {showSkeletons ? (
            <Shimmer className="hidden h-11 w-28 bg-noire-charcoal sm:block" />
          ) : products.length > 0 ? (
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href={viewAllHref}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </FadeIn>
        {showSkeletons ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {Array.from({ length: Math.min(limit, 4) }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div
            className={
              limit > 4
                ? "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
                : "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
            }
          >
            {visible.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        ) : (
          <ComingSoonBlock title={emptyTitle} subtitle={emptySubtitle} ctaHref="/shop" />
        )}
        <div className="mt-8 text-center sm:hidden">
          {showSkeletons ? (
            <Shimmer className="mx-auto h-11 w-full max-w-xs bg-noire-charcoal" />
          ) : products.length > 0 ? (
            <Button asChild variant="outline">
              <Link href={viewAllHref}>View All</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PromoBanner({
  title,
  subtitle,
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD,
}: {
  title?: string;
  subtitle?: string;
  freeShippingThreshold?: number;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <FadeIn className="flex flex-col justify-center bg-noire-charcoal px-8 py-20 text-noire-white lg:px-16">
          <span className="sticker sticker-pink mb-4 w-fit">neon certified deal</span>
          <h2 className="font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
            {title || `FREE SHIP OVER ${formatPrice(freeShippingThreshold)}`}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-noire-white/70">
            {subtitle ||
              "Stack your cart, skip the shipping fee. More drip for your bread — the rotation got you, bhai."}
          </p>
          <Button asChild variant="drip" className="mt-8 w-fit">
            <Link href="/shop">Full Send → Shop</Link>
          </Button>
        </FadeIn>
        <FadeIn className="relative aspect-square lg:aspect-auto lg:min-h-[400px]">
          <Image
            src={PROMO_FALLBACK_IMAGE}
            alt="MY ROACH promo"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-accent-cyan/10 mix-blend-overlay" />
        </FadeIn>
      </div>
    </section>
  );
}

export function ShopTeaserSection() {
  return (
    <section className="relative overflow-hidden py-4">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[280px] overflow-hidden border border-accent-cyan/30 sm:min-h-[360px]">
          <Image
            src={SHOP_TEASER_IMAGE}
            alt="Explore MY ROACH streetwear"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-noire-black/90 via-noire-black/60 to-transparent" />
          <div className="relative z-[1] flex h-full min-h-[280px] flex-col justify-center p-8 sm:min-h-[360px] sm:p-12 lg:p-16">
            <span className="sticker sticker-lime w-fit">explore everything</span>
            <h2 className="font-display mt-4 max-w-xl text-3xl tracking-wide text-noire-white sm:text-4xl md:text-5xl">
              THE FULL ROTATION AWAITS
            </h2>
            <p className="mt-4 max-w-md text-sm text-noire-white/75">
              Every fit, every lane — hoodies to accessories. Drip check yourself before the group chat does, bhai.
            </p>
            <Button asChild variant="neon" size="lg" className="mt-8 w-fit">
              <Link href="/shop">
                Enter the Shop
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandStory() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeIn className="relative aspect-[4/5] overflow-hidden border border-accent-cyan/30 neon-border-hover">
            <Image
              src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=75"
              alt="MY ROACH crew"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
            <span className="sticker sticker-neon absolute left-4 top-4">🪳 glitch gang</span>
          </FadeIn>
          <FadeIn>
            <span className="sticker mb-4">the lore</span>
            <h2 className="font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
              BORN UNBOTHERED<br />STAYED FIRE
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-noire-muted">
              MY ROACH started when the youth got called unkillable and turned it into drip.
              We make streetwear for the underground — loud when it counts, chaotic when
              it matters, built different always.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-noire-muted">
              No luxury pretense. Heavy fabrics, bold graphics, and fits that make your
              group chat go &ldquo;bhai where&apos;d you get that?&rdquo; Main character verified.
            </p>
            <Button asChild variant="cyber" className="mt-8">
              <Link href="/about">Read the Lore</Link>
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-noire-black py-20 text-noire-white lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 text-center">
          <span className="sticker sticker-lime mb-3">real talk</span>
          <h2 className="font-display text-4xl tracking-wide">
            THE ROTATION SAID WHAT
          </h2>
        </FadeIn>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <FadeIn key={t.id}>
              <blockquote className="cyber-card p-8">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-accent-cyan">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-noire-white/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-6">
                  <cite className="not-italic">
                    <span className="text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-noire-white/50">{t.role}</span>
                  </cite>
                </footer>
              </blockquote>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstagramGallery() {
  return (
    <section className="py-16 lg:py-24">
      <FadeIn className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <span className="sticker sticker-pink mb-3">@myroach.fit</span>
        <h2 className="font-display text-4xl tracking-wide">
          FIT CHECKS ONLY
        </h2>
      </FadeIn>
      <div className="mt-10 grid grid-cols-2 gap-px md:grid-cols-3 lg:grid-cols-6">
        {instagramPosts.map((src, i) => (
          <FadeIn key={i} delay={i * 0.03}>
            <div className="group relative aspect-square overflow-hidden border border-noire-border neon-border-hover">
              <Image
                src={src}
                alt={`Fit check ${i + 1}`}
                fill
                className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                sizes="(max-width: 768px) 50vw, 16vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-accent-cyan/0 transition-colors duration-300 group-hover:bg-accent-cyan/10" />
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export function Newsletter() {
  const [successOpen, setSuccessOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!isMockDataMode()) {
        await subscribeNewsletter(email);
      }
      setSuccessOpen(true);
      setEmail("");
    } catch {
      toast.error("Could not subscribe — try again, bhai");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="border-y border-accent-cyan/20 py-16 lg:py-20">
        <div className="neon-divider mb-10" />
        <FadeIn className="mx-auto max-w-xl px-6 text-center lg:px-8">
          <span className="sticker sticker-lime mb-3">join the rotation</span>
          <h2 className="font-display text-3xl tracking-wide md:text-4xl">
            SQUAD UP
          </h2>
          <p className="mt-3 text-sm text-noire-muted">
            Early drops, secret sales, and fit inspo straight to your inbox. No spam — just heat, bhai.
          </p>
          <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-accent-cyan/40 bg-noire-charcoal px-4 py-3 text-sm text-noire-white placeholder:text-noire-muted focus:outline-none focus:border-accent-cyan focus:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={submitting}
              className="border border-accent-pink bg-accent-pink px-8 py-3 text-xs font-bold uppercase tracking-widest text-noire-white transition-[background-color,box-shadow] duration-200 hover:bg-accent-cyan hover:border-accent-cyan hover:text-noire-black hover:shadow-[0_0_12px_rgba(0,240,255,0.35)] disabled:opacity-50"
            >
              I&apos;m In
            </button>
          </form>
        </FadeIn>
      </section>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="border-accent-lime/40 shadow-[0_0_24px_rgba(57,255,20,0.2)]">
          <DialogHeader>
            <span className="sticker sticker-lime mx-auto mb-2 w-fit">you&apos;re in</span>
            <DialogTitle className="text-center text-accent-lime">You&apos;re In the Rotation</DialogTitle>
            <DialogDescription className="text-center">
              You&apos;re on the list, bhai. First dibs on drops, secret sales, and fit inspo — straight to your inbox.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)} className="w-full">
              Full Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
