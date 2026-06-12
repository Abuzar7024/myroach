"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { products as mockProducts } from "@/data/mock-data";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SplitScreenHeroProps {
  featuredProducts?: Product[];
}

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=75",
    tagline: "main character verified",
    headline: "BUILT LIKE A ROACH\nDRESSED LIKE A MENACE",
    subline: "Neon certified underground energy. Oversized fits, loud graphics, zero apologies. Full send only.",
  },
  {
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&q=75",
    tagline: "neon certified",
    headline: "THEY CAN'T SPRAY US\nOUT THE SCENE",
    subline: "Underground drip under city lights. Unbothered. Absurdist humor meets cyber streetwear — bhai, the scene is here.",
  },
  {
    image: "https://images.unsplash.com/photo-1618354691373-d8512795e3fb?w=1600&q=75",
    tagline: "youth certified",
    headline: "SURVIVED THE PLOT\nSTILL STANDING",
    subline: "MY ROACH drops for the rotation. Baggy cargos, neon accents, attitude included. Lowkey the main event.",
  },
];

export function SplitScreenHero({ featuredProducts }: SplitScreenHeroProps) {
  const heroProducts = (featuredProducts?.length
    ? featuredProducts
    : mockProducts.filter((p) => p.isFeatured)
  ).slice(0, 4);

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeProduct, setActiveProduct] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const slide = heroSlides[activeSlide];
  const product = heroProducts[activeProduct] ?? heroProducts[0];

  return (
    <section
      className="relative -mt-16 w-full overflow-hidden lg:-mt-20 lg:h-screen lg:min-h-[640px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid lg:h-full lg:grid-cols-2">
        <div className="relative aspect-[4/5] min-h-[280px] scanline-overlay sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-0">
          {heroSlides.map((s, i) => (
            <Image
              key={s.image}
              src={s.image}
              alt=""
              fill
              priority={i === 0}
              className={cn(
                "object-cover transition-opacity duration-500 ease-out",
                i === activeSlide ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-noire-black/80 via-noire-black/20 to-noire-black/40 lg:bg-gradient-to-r lg:from-noire-black/30 lg:to-noire-black/70" />

          <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] sm:left-6 sm:top-6 lg:left-10 lg:top-10">
            <span className="sticker sticker-neon sticker-rotate-right">🪳 MY ROACH</span>
          </div>

          <div className="absolute bottom-6 left-4 flex gap-3 sm:bottom-8 sm:left-6 lg:bottom-12 lg:left-10">
            {heroSlides.map((_, i) => (
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
        </div>

        <div className="relative flex flex-col justify-between border-t border-accent-cyan/10 bg-noire-black px-4 py-8 text-noire-white sm:px-6 sm:py-10 lg:border-l lg:border-t-0 lg:px-14 lg:py-16">
          <div
            key={activeSlide}
            className="flex flex-1 flex-col justify-center animate-fade-in"
          >
            <span className="sticker sticker-lime mb-4 max-w-full">{slide.tagline}</span>
            <h1 className="hero-headline glitch-text font-display whitespace-pre-line text-3xl leading-[1.05] tracking-wide sm:text-4xl md:text-5xl lg:text-7xl">
              {slide.headline}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-noire-white/70 sm:mt-6 lg:text-base">
              {slide.subline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button asChild variant="drip" size="lg" className="w-full sm:w-auto">
                <Link href="/shop">
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
              <button
                type="button"
                onClick={() =>
                  setActiveProduct(
                    (prev) => (prev - 1 + heroProducts.length) % heroProducts.length
                  )
                }
                className="hidden h-11 w-11 items-center justify-center text-noire-white/40 transition-colors hover:text-accent-cyan lg:flex"
                aria-label="Previous product"
              >
                ←
              </button>

              <div
                key={product.id}
                className="flex min-w-0 flex-1 items-center gap-3 animate-fade-in sm:gap-4"
              >
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
                  <p className="text-xs text-noire-white/50">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <Link
                  href={`/product/${product.slug}`}
                  className="shrink-0 py-2 text-xs font-semibold uppercase tracking-widest text-accent-cyan transition-colors hover:text-accent-pink"
                >
                  Peep →
                </Link>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveProduct((prev) => (prev + 1) % heroProducts.length)
                }
                className="hidden h-11 w-11 items-center justify-center text-noire-white/40 transition-colors hover:text-accent-cyan lg:flex"
                aria-label="Next product"
              >
                →
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block">
        <div className="animate-scroll-bounce flex flex-col items-center gap-2 text-white/50">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
          <span className="block h-8 w-px bg-accent-cyan/50 shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
        </div>
      </div>
    </section>
  );
}
