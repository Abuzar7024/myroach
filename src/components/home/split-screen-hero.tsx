"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/types";
import { Shimmer } from "@/components/ui/shimmer";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  banners?: Banner[];
  loading?: boolean;
}

/** Full-bleed hero — banner images only from admin Firestore. */
export function SplitScreenHero({ banners = [], loading = false }: HeroCarouselProps) {
  const slides = banners.filter((b) => b.image);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageReady, setImageReady] = useState<Record<number, boolean>>({});

  const slideCount = slides.length;

  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setActiveSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused || slideCount <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, slideCount]);

  if (loading && slideCount === 0) {
    return (
      <section className="relative -mt-16 w-full lg:-mt-20">
        <Shimmer className="aspect-[4/5] min-h-[280px] w-full sm:aspect-[16/9] lg:min-h-[560px]" />
      </section>
    );
  }

  if (slideCount === 0) {
    return null;
  }

  const current = slides[activeSlide];

  return (
    <section
      className="relative -mt-16 w-full overflow-hidden lg:-mt-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero banners"
    >
      <div className="relative aspect-[4/5] min-h-[280px] w-full sm:aspect-[16/9] lg:min-h-[min(85vh,720px)]">
        {slides.map((banner, i) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              i === activeSlide ? "opacity-100 z-[1]" : "opacity-0 z-0"
            )}
          >
            {!imageReady[i] && (
              <Shimmer className="absolute inset-0 z-[2] bg-noire-charcoal" aria-hidden />
            )}
            {banner.link ? (
              <Link href={banner.link} className="block h-full w-full" aria-label={banner.title}>
                <Image
                  src={banner.image}
                  alt={banner.title || "Hero banner"}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                  onLoad={() => setImageReady((prev) => ({ ...prev, [i]: true }))}
                />
              </Link>
            ) : (
              <Image
                src={banner.image}
                alt={banner.title || "Hero banner"}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="100vw"
                onLoad={() => setImageReady((prev) => ({ ...prev, [i]: true }))}
              />
            )}
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noire-black/40 via-transparent to-noire-black/20" />

        {slideCount > 1 && (
          <div className="absolute bottom-6 left-1/2 z-[3] flex -translate-x-1/2 gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className="flex h-11 min-w-[44px] items-center justify-center"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === activeSlide ? "true" : undefined}
              >
                <span
                  className={cn(
                    "block h-0.5 transition-all duration-300",
                    i === activeSlide
                      ? "w-10 bg-accent-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                      : "w-4 bg-white/50 hover:bg-accent-cyan/70"
                  )}
                />
              </button>
            ))}
          </div>
        )}

        {current?.link && (
          <div className="absolute bottom-6 right-4 z-[3] sm:right-8">
            <span className="sr-only">{current.title}</span>
          </div>
        )}
      </div>
    </section>
  );
}
