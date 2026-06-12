"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { FadeIn } from "@/components/ui/motion";

export { SplitScreenHero } from "./split-screen-hero";

interface FeaturedCollectionsProps {
  categories: Category[];
}

export function FeaturedCollections({ categories }: FeaturedCollectionsProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 text-center">
          <span className="sticker sticker-pink mb-4">pick your lane</span>
          <h2 className="font-display mt-3 text-4xl tracking-wide md:text-5xl">
            THE ROTATION
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {categories.map((cat) => (
            <FadeIn key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden border border-noire-border neon-border-hover"
              >
                <Image
                  src={cat.image!}
                  alt={cat.name}
                  fill
                  className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noire-black/80 via-noire-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-noire-white">
                  <h3 className="font-display text-3xl tracking-wide">{cat.name}</h3>
                  <p className="mt-1 text-sm text-noire-white/70">{cat.description}</p>
                  <span className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-widest text-accent-cyan opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Shop Now <ArrowRight className="ml-2 h-3 w-3" />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
