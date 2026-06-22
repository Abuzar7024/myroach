"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Banner, Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { Shimmer } from "@/components/ui/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  banners?: Banner[];
  featuredProducts?: Product[];
  loading?: boolean;
}

type Slide = {
  id: string;
  image: string;
  tagline: string;
  headline: string;
  subline: string;
  link: string;
};

function buildSlides(banners: Banner[]): Slide[] {
  const adminSlides = banners.filter((b) => b.image);
  return adminSlides.map((b) => ({
    id: b.id,
    image: b.image,
    tagline: b.subtitle || "neon certified",
    headline: b.title,
    subline: b.subtitle || "",
    link: b.link || "/shop",
  }));
}

/** Split hero — image panel + copy panel; admin banners or editorial fallback. */
export function SplitScreenHero({
  banners = [],
  featuredProducts = [],
  loading = false,
}: HeroCarouselProps) {
  const adminSlides = banners.filter((b) => b.image);
  const slides = buildSlides(banners);
  const heroProducts = featuredProducts.filter((p) => p.images[0]).slice(0, 4);

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeProduct, setActiveProduct] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageReady, setImageReady] = useState<Record<number, boolean>>({});

  const slideCount = slides.length;
  const slide = slides[activeSlide];
  const product = heroProducts[activeProduct] ?? heroProducts[0];

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
        <div className="grid lg:min-h-[min(88vh,720px)] lg:grid-cols-2">
          <Shimmer className="aspect-[4/5] min-h-[300px] w-full sm:aspect-[16/10] lg:aspect-auto lg:min-h-0" />
          <Shimmer className="min-h-[280px] border-t border-accent-cyan/10 lg:border-l lg:border-t-0" />
        </div>
      </section>
    );
  }

  if (!loading && slides.length === 0) {
    return (
      <section className="relative -mt-16 w-full lg:-mt-20">
        <div className="flex min-h-[min(60vh,480px)] flex-col items-center justify-center border-b border-accent-cyan/10 bg-noire-black px-4 py-24 text-center text-noire-white">
          <span className="sticker sticker-neon">🪳 MY ROACH</span>
          <h1 className="font-display mt-6 text-4xl tracking-wide md:text-5xl">Storefront loading</h1>
          <p className="mt-4 max-w-md text-sm text-noire-white/60">
            Hero banners and products appear here once you add them in the admin panel.
          </p>
          {featuredProducts.length > 0 && (
            <Button asChild variant="drip" size="lg" className="mt-8">
              <Link href="/shop">Browse shop</Link>
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative -mt-16 w-full overflow-hidden lg:-mt-20 lg:min-h-[min(88vh,720px)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero"
    >
      <div className="grid lg:min-h-[min(88vh,720px)] lg:grid-cols-2">
        <div className="relative aspect-[4/5] min-h-[300px] scanline-overlay sm:aspect-[16/10] md:min-h-[380px] lg:aspect-auto lg:min-h-0 lg:h-full">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                i === activeSlide ? "opacity-100" : "opacity-0"
              )}
            >
              {!imageReady[i] && (
                <Shimmer className="absolute inset-0 z-[1] bg-noire-charcoal" aria-hidden />
              )}
              <Image
                src={s.image}
                alt={s.headline.replace("\n", " ")}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                onLoad={() => setImageReady((prev) => ({ ...prev, [i]: true }))}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-noire-black/85 via-noire-black/25 to-noire-black/45 lg:bg-gradient-to-r lg:from-noire-black/20 lg:via-noire-black/10 lg:to-noire-black/60" />

          <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] sm:left-6 sm:top-6 lg:left-10 lg:top-10">
            <span className="sticker sticker-neon sticker-rotate-right">🪳 MY ROACH</span>
          </div>

          {slideCount > 1 && (
            <div className="absolute bottom-6 left-4 flex gap-3 sm:bottom-8 sm:left-6 lg:bottom-12 lg:left-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className="group flex h-11 min-w-[44px] items-center justify-center"
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <span
                    className={cn(
                      "block h-0.5 transition-all duration-300",
                      i === activeSlide
                        ? "w-10 bg-accent-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                        : "w-4 bg-white/40 group-hover:bg-accent-cyan/70"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex flex-col justify-between border-t border-accent-cyan/10 bg-noire-black px-4 py-8 text-noire-white sm:px-6 sm:py-10 md:px-8 md:py-12 lg:border-l lg:border-t-0 lg:px-14 lg:py-16">
          <div key={activeSlide} className="flex flex-1 flex-col justify-center animate-fade-in">
            <span className="sticker sticker-lime mb-4 max-w-full">{slide.tagline}</span>
            <h1 className="hero-headline glitch-text font-display whitespace-pre-line text-3xl leading-[1.05] tracking-wide sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              {slide.headline}
            </h1>
            {slide.subline ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-noire-white/75 sm:mt-6 sm:text-base">
                {slide.subline}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button asChild variant="drip" size="lg" className="w-full sm:w-auto">
                <Link href={slide.link}>
                  Shop the Drop
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="cyber" size="lg" className="w-full sm:w-auto">
                <Link href="/about">The Lore</Link>
              </Button>
            </div>
          </div>

          {product && (
            <div className="mt-8 border-t border-accent-cyan/20 pt-6 sm:pt-8">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-lime">
                In Rotation
              </p>
              <div className="flex items-center gap-3 sm:gap-5">
                {heroProducts.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveProduct((prev) => (prev - 1 + heroProducts.length) % heroProducts.length)
                    }
                    className="hidden h-11 w-11 shrink-0 items-center justify-center text-noire-white/40 transition-colors hover:text-accent-cyan md:flex"
                    aria-label="Previous product"
                  >
                    ←
                  </button>
                )}

                <div key={product.id} className="flex min-w-0 flex-1 items-center gap-3 animate-fade-in sm:gap-4">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden border border-accent-cyan/50 shadow-[0_0_8px_rgba(0,240,255,0.2)] sm:h-16 sm:w-14">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="block truncate text-sm font-medium transition-colors hover:text-accent-cyan"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-noire-white/50">{formatPrice(product.price)}</p>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="shrink-0 py-2 text-xs font-semibold uppercase tracking-widest text-accent-cyan transition-colors hover:text-accent-pink"
                  >
                    Peep →
                  </Link>
                </div>

                {heroProducts.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveProduct((prev) => (prev + 1) % heroProducts.length)
                    }
                    className="hidden h-11 w-11 shrink-0 items-center justify-center text-noire-white/40 transition-colors hover:text-accent-cyan md:flex"
                    aria-label="Next product"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block">
        <div className="animate-scroll-bounce flex flex-col items-center gap-2 text-white/50">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
          <span className="block h-8 w-px bg-accent-cyan/50 shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
        </div>
      </div>
    </section>
  );
}
