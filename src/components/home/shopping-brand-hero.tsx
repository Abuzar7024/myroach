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

export function ShoppingBrandHero({
  products,
  storeName = "MY ROACH",
  freeShippingThreshold,
}: ShoppingBrandHeroProps) {
  const showcase = products.filter((p) => p.images[0]).slice(0, 4);
  const lead = showcase[0];

  return (
    <section className="relative -mt-16 w-full overflow-hidden border-b border-accent-cyan/20 bg-noire-black lg:-mt-20">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.1fr_0.9fr] lg:min-h-[min(88vh,720px)]">
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <span className="sticker sticker-neon w-fit">new season drop</span>
          <h1 className="font-display mt-5 text-4xl leading-[1.02] tracking-wide text-noire-white sm:text-5xl lg:text-6xl">
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
                Shop all fits
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {lead && (
              <Button asChild variant="cyber" size="lg">
                <Link href={`/product/${lead.slug}`}>Featured fit</Link>
              </Button>
            )}
          </div>
          {freeShippingThreshold != null && freeShippingThreshold > 0 && (
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent-lime">
              Free shipping over {formatPrice(freeShippingThreshold)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 p-4 sm:gap-3 sm:p-6 lg:p-8">
          {showcase.map((product, index) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className={`group relative overflow-hidden border border-noire-border bg-noire-charcoal neon-border-hover ${
                index === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"
              }`}
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noire-black/85 via-noire-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="truncate text-sm font-medium text-noire-white">{product.name}</p>
                <p className="text-xs text-accent-cyan">{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}
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
