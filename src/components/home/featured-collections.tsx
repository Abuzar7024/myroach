"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback } from "react";
import { categories } from "@/data/mock-data";
import { FadeIn } from "@/components/ui/motion";

export function FeaturedCollections() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <FadeIn className="mb-14 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Collections
            </p>
            <h2 className="font-display text-4xl font-light tracking-tight lg:text-5xl">
              Curated for You
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={scrollPrev}
              className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:bg-foreground hover:text-background"
              aria-label="Previous"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:bg-foreground hover:text-background"
              aria-label="Next"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </FadeIn>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative min-w-[280px] flex-[0_0_85%] overflow-hidden sm:flex-[0_0_45%] lg:flex-[0_0_32%]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={cat.image!}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 85vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 text-white">
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/60">
                      Collection
                    </p>
                    <h3 className="font-display text-3xl font-light">{cat.name}</h3>
                    <p className="mt-2 max-w-xs text-sm text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
