"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { FALLBACK_CATEGORY_TILES } from "@/lib/home-fallbacks";
import { FadeIn } from "@/components/ui/motion";
import { Shimmer } from "@/components/ui/shimmer";
import { ComingSoonBlock } from "@/components/home/empty-states";

export { SplitScreenHero } from "./split-screen-hero";

interface FeaturedCollectionsProps {
  categories: Category[];
  loading?: boolean;
}

export function FeaturedCollections({ categories, loading = false }: FeaturedCollectionsProps) {
  const hasLive = categories.some((c) => c.image);
  const showFallback = !loading && !hasLive;

  if (loading && categories.length === 0) {
    return (
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Shimmer className="mx-auto mb-12 h-10 w-64 bg-noire-charcoal" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="aspect-[4/5] bg-noire-charcoal" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const tiles = showFallback
    ? FALLBACK_CATEGORY_TILES.map((t, i) => ({
        id: `fallback-${i}`,
        name: t.name,
        description: t.tagline,
        slug: "",
        image: t.image,
        comingSoon: true,
      }))
    : categories.filter((c) => c.image).map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        slug: c.slug,
        image: c.image!,
        comingSoon: false,
      }));

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 text-center">
          <span className="sticker sticker-pink mb-4">
            {showFallback ? "lanes loading" : "pick your lane"}
          </span>
          <h2 className="font-display mt-3 text-4xl tracking-wide md:text-5xl">THE ROTATION</h2>
          {showFallback && (
            <p className="mt-3 text-sm text-noire-muted">
              Collections dropping soon — till then, peep the vibe boards below, bhai.
            </p>
          )}
        </FadeIn>

        {tiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {tiles.map((cat) => (
              <FadeIn key={cat.id}>
                {cat.comingSoon ? (
                  <div className="group relative block aspect-[4/5] overflow-hidden border border-noire-border">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover opacity-70"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-noire-black/60" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-noire-white">
                      <span className="sticker sticker-neon text-[10px]">soon™</span>
                      <h3 className="font-display mt-3 text-xl tracking-wide sm:text-2xl">{cat.name}</h3>
                      <p className="mt-1 text-xs text-noire-white/70">{cat.description}</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/collections/${cat.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden border border-noire-border neon-border-hover"
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noire-black/80 via-noire-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-noire-white sm:p-6">
                      <h3 className="font-display text-2xl tracking-wide sm:text-3xl">{cat.name}</h3>
                      {cat.description && (
                        <p className="mt-1 text-sm text-noire-white/70">{cat.description}</p>
                      )}
                      <span className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-widest text-accent-cyan opacity-0 transition-opacity group-hover:opacity-100">
                        Shop Now <ArrowRight className="ml-2 h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                )}
              </FadeIn>
            ))}
          </div>
        ) : (
          <ComingSoonBlock
            title="Collections cooking"
            subtitle="Categories haven't dropped yet. The admin squad is curating the rotation — hoodies, tees, and certified chaos incoming."
            ctaLabel="Browse shop"
          />
        )}
      </div>
    </section>
  );
}
