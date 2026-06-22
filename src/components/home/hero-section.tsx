"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { FadeIn } from "@/components/ui/motion";
import { Shimmer } from "@/components/ui/shimmer";

export { SplitScreenHero } from "./split-screen-hero";

interface FeaturedCollectionsProps {
  categories: Category[];
  loading?: boolean;
}

function genderBadge(gender?: Category["gender"]) {
  if (gender === "male") return "male";
  if (gender === "female") return "female";
  return "all";
}

function categoryImage(cat: Category) {
  return cat.image || null;
}

export function FeaturedCollections({ categories, loading = false }: FeaturedCollectionsProps) {
  const liveCategories = categories.filter((c) => c.isActive && c.image);

  if (loading && liveCategories.length === 0) {
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

  if (!loading && liveCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 text-center">
          <span className="sticker sticker-pink mb-4">pick your lane</span>
          <h2 className="font-display mt-3 text-4xl tracking-wide md:text-5xl">THE ROTATION</h2>
        </FadeIn>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {liveCategories.map((cat) => {
            const image = categoryImage(cat);
            if (!image) return null;
            return (
              <FadeIn key={cat.id}>
                <Link
                  href={`/collections/${cat.slug}`}
                  className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden border border-noire-border bg-noire-charcoal neon-border-hover"
                >
                  {image && (
                    <Image
                      src={image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-noire-black/90 via-noire-black/35 to-noire-black/20" />
                  <div className="relative z-[1] p-4 sm:p-6">
                    <span className="sticker sticker-neon mb-3 w-fit text-[10px] uppercase">
                      {genderBadge(cat.gender)}
                    </span>
                    <h3 className="font-display text-xl tracking-wide text-noire-white sm:text-2xl">{cat.name}</h3>
                    {cat.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-noire-white/70">{cat.description}</p>
                    )}
                    <span className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-widest text-accent-cyan opacity-80 transition-opacity group-hover:opacity-100">
                      Shop Now <ArrowRight className="ml-2 h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
