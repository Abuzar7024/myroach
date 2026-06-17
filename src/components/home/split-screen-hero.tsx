"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Banner } from "@/types";
import { FALLBACK_HERO } from "@/lib/home-fallbacks";
import { Shimmer } from "@/components/ui/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  banners?: Banner[];
  loading?: boolean;
}

/** Full-bleed hero — admin banner images, or branded fallback when empty. */
export function SplitScreenHero({ banners = [], loading = false }: HeroCarouselProps) {
  const adminSlides = banners.filter((b) => b.image);
  const useFallback = !loading && adminSlides.length === 0;

  const slides = useFallback
    ? [
        {
          id: "fallback-hero",
          image: FALLBACK_HERO.image,
          title: FALLBACK_HERO.headline,
          subtitle: FALLBACK_HERO.subtitle,
          link: FALLBACK_HERO.link,
          isFallback: true,
        },
      ]
    : adminSlides.map((b) => ({
        id: b.id,
        image: b.image,
        title: b.title,
        subtitle: b.subtitle || "",
        link: b.link || "/shop",
        isFallback: false,
      }));

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

  if (loading && adminSlides.length === 0) {
    return (
      <section className="relative -mt-16 w-full lg:-mt-20">
        <Shimmer className="aspect-[4/5] min-h-[280px] w-full sm:aspect-[16/9] lg:min-h-[560px]" />
      </section>
    );
  }

  const current = slides[activeSlide];

  return (
    <section
      className="relative -mt-16 w-full overflow-hidden lg:-mt-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero"
    >
      <div className="relative aspect-[4/5] min-h-[320px] w-full sm:aspect-[16/9] lg:min-h-[min(88vh,760px)]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              i === activeSlide ? "z-[1] opacity-100" : "z-0 opacity-0"
            )}
          >
            {!imageReady[i] && (
              <Shimmer className="absolute inset-0 z-[2] bg-noire-charcoal" aria-hidden />
            )}
            <Image
              src={slide.image}
              alt={slide.title.replace("\n", " ") || "MY ROACH hero"}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
              onLoad={() => setImageReady((prev) => ({ ...prev, [i]: true }))}
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noire-black/85 via-noire-black/25 to-noire-black/50" />

        <div className="absolute inset-0 z-[3] flex flex-col justify-end px-4 pb-16 sm:px-8 sm:pb-20 lg:px-14 lg:pb-24">
          <div key={activeSlide} className="max-w-2xl animate-fade-in text-noire-white">
            {useFallback && (
              <span className="sticker sticker-neon mb-4 inline-block">{FALLBACK_HERO.title}</span>
            )}
            {!useFallback && current.subtitle && (
              <span className="sticker sticker-lime mb-4 inline-block">{current.subtitle}</span>
            )}
            <h1 className="hero-headline font-display whitespace-pre-line text-3xl leading-[1.05] tracking-wide sm:text-4xl md:text-5xl lg:text-7xl">
              {useFallback ? FALLBACK_HERO.headline : current.title}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-noire-white/75 sm:text-base">
              {useFallback
                ? FALLBACK_HERO.subtitle
                : current.subtitle || "Certified underground drip — full send only."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild variant="drip" size="lg" className="w-full sm:w-auto">
                <Link href={current.link || "/shop"}>
                  Shop the Drop
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="cyber" size="lg" className="w-full sm:w-auto">
                <Link href="/about">The Lore</Link>
              </Button>
            </div>
          </div>
        </div>

        {slideCount > 1 && (
          <div className="absolute bottom-6 left-1/2 z-[4] flex -translate-x-1/2 gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className="flex h-11 min-w-[44px] items-center justify-center"
                aria-label={`Go to slide ${i + 1}`}
              >
                <span
                  className={cn(
                    "block h-0.5 transition-all duration-300",
                    i === activeSlide
                      ? "w-10 bg-accent-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                      : "w-4 bg-white/50"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
