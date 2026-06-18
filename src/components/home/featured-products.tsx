"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shop/product-card";
import { FadeIn } from "@/components/ui/motion";
import { Shimmer } from "@/components/ui/shimmer";
import { ComingSoonBlock } from "@/components/home/empty-states";

const VISIBLE_COUNT = 3;

function chunk<T>(items: T[], size: number): T[][] {
  const slides: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    slides.push(items.slice(i, i + size));
  }
  return slides;
}

function slideDurationMs(products: Product[], fallbackSeconds: number): number {
  const cappedFallback = Math.min(40, Math.max(3, fallbackSeconds));
  const seconds = products.map((p) =>
    Math.min(40, Math.max(3, p.featuredDisplaySeconds ?? cappedFallback))
  );
  const max = Math.max(...seconds, cappedFallback);
  return max * 1000;
}

interface FeaturedProductsProps {
  products: Product[];
  rotateSeconds?: number;
  loading?: boolean;
}

export function FeaturedProducts({
  products,
  rotateSeconds = 5,
  loading = false,
}: FeaturedProductsProps) {
  const featured = useMemo(
    () => products.filter((p) => p.isFeatured && p.isActive),
    [products]
  );

  const slides = useMemo(() => chunk(featured, VISIBLE_COUNT), [featured]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setSlideIndex(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    setSlideIndex(0);
  }, [featured.length]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const current = slides[slideIndex] ?? [];
    const timer = window.setTimeout(
      () => goTo(slideIndex + 1),
      slideDurationMs(current, rotateSeconds)
    );
    return () => window.clearTimeout(timer);
  }, [slideIndex, slides, paused, rotateSeconds, goTo]);

  if (loading && featured.length === 0) {
    return (
      <section className="border-y border-white/5 bg-zinc-950/40 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Shimmer className="mx-auto mb-10 h-8 w-48 bg-noire-charcoal" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Shimmer key={i} className="aspect-[3/4] border border-noire-border bg-noire-charcoal" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!loading && featured.length === 0) return null;

  const currentSlide = slides[slideIndex] ?? [];

  return (
    <section
      className="border-y border-noire-border bg-noire-charcoal/30 py-14 lg:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured products"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-noire-muted">
              Curated picks
            </p>
            <h2 className="mt-2 font-display text-3xl font-light tracking-wide text-noire-white md:text-4xl">
              Featured
            </h2>
          </div>
          {slides.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(slideIndex - 1)}
                className="flex h-10 w-10 items-center justify-center border border-noire-border text-noire-muted transition-colors hover:border-accent-cyan hover:text-accent-cyan"
                aria-label="Previous featured products"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-xs text-noire-muted">
                {slideIndex + 1} / {slides.length}
              </span>
              <button
                type="button"
                onClick={() => goTo(slideIndex + 1)}
                className="flex h-10 w-10 items-center justify-center border border-noire-border text-noire-muted transition-colors hover:border-accent-cyan hover:text-accent-cyan"
                aria-label="Next featured products"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentSlide.map((product) => (
            <FadeIn key={product.id}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 transition-all ${
                  i === slideIndex ? "w-8 bg-accent-cyan" : "w-1.5 bg-noire-border hover:bg-noire-muted"
                }`}
                aria-label={`Go to featured slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
