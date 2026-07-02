"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface ShoppingBrandHeroProps {
  products: Product[];
  storeName?: string;
  freeShippingThreshold?: number;
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1200&q=75&auto=format&fit=crop";

export function ShoppingBrandHero({
  products,
  storeName = "MY ROACH",
  freeShippingThreshold,
}: ShoppingBrandHeroProps) {
  const lead = products.find((p) => p.images[0]);

  return (
    <section className="relative -mt-16 w-full overflow-hidden border-b border-accent-cyan/20 bg-noire-black lg:-mt-20">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent-pink/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:min-h-[min(88vh,760px)]">
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <span className="sticker sticker-neon w-fit">new drop · 2026</span>
          <h1 className="font-display mt-5 text-4xl leading-[1.02] tracking-wide text-noire-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {storeName}
            <span className="mt-2 block text-accent-cyan">Streetwear that hits</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-noire-white/70 sm:text-base">
            Shop hoodies, tees, and accessories built for the rotation. Fresh drops, limited runs,
            main-character energy only.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="drip" size="lg">
              <Link href="/shop">
                Shop the collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {lead && (
              <Button asChild variant="cyber" size="lg">
                <Link href={`/product/${lead.slug}`}>Explore new arrivals</Link>
              </Button>
            )}
          </div>
          {freeShippingThreshold != null && freeShippingThreshold > 0 && (
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent-lime">
              Free shipping over {formatPrice(freeShippingThreshold)}
            </p>
          )}
        </div>

        <div className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-0">
          <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-accent-cyan/30 shadow-[0_0_40px_rgba(0,240,255,0.15)] sm:aspect-[5/6] lg:aspect-[4/5]">
            <Image
              src={HERO_IMAGE}
              alt={`${storeName} streetwear`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noire-black/85 via-noire-black/10 to-transparent" />
            <span className="sticker sticker-neon absolute left-4 top-4">best sellers</span>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-display text-lg text-noire-white">The Rotation</p>
              <p className="text-xs text-accent-cyan">Limited streetwear collection</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShopTrustStrip({ freeShippingThreshold }: { freeShippingThreshold?: number }) {
  const items = [
    {
      icon: Truck,
      title: "Fast shipping",
      body:
        freeShippingThreshold && freeShippingThreshold > 0
          ? `Free over ${formatPrice(freeShippingThreshold)}`
          : "Tracked delivery across India",
    },
    { icon: ShieldCheck, title: "Secure checkout", body: "Protected payments & order updates" },
    { icon: Sparkles, title: "Fresh drops", body: "New fits added from the admin panel" },
  ];

  return (
    <section className="border-b border-accent-cyan/15 bg-noire-charcoal/40">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent-cyan/30 text-accent-cyan">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-noire-white">{title}</p>
              <p className="mt-1 text-xs text-noire-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
