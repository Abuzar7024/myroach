"use client";

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface CategoryQuickLinksProps {
  categories: Category[];
}

export function CategoryQuickLinks({ categories }: CategoryQuickLinksProps) {
  const live = categories.filter((c) => c.isActive && c.image);
  if (live.length === 0) return null;

  return (
    <section className="border-b border-noire-border bg-noire-black py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-cyan">
              Shop by category
            </p>
            <h2 className="font-display mt-2 text-2xl tracking-wide text-noire-white md:text-3xl">
              Pick your lane
            </h2>
          </div>
          <Link href="/shop" className="text-xs font-semibold uppercase tracking-widest text-accent-cyan hover:text-accent-pink">
            View all
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {live.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group relative min-w-[140px] shrink-0 overflow-hidden border border-noire-border bg-noire-charcoal sm:min-w-[160px]"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={category.image!}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="160px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noire-black/90 via-noire-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-medium text-noire-white">{category.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
