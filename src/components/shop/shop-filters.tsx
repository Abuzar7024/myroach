"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
  categories: Category[];
}

export function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    if (showMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobile]);

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const activeCategory = searchParams.get("category");

  const filterContent = (
    <div className="space-y-8">
      <div>
        <Label htmlFor="search" className="mb-3 block">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-noire-muted" />
          <Input
            id="search"
            placeholder="Search products..."
            defaultValue={searchParams.get("search") || ""}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams("search", (e.target as HTMLInputElement).value || null);
              }
            }}
          />
        </div>
      </div>

      <div>
        <Label className="mb-3 block">Category</Label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParams("category", null)}
            className={cn(
              "block w-full rounded-sm py-2.5 text-left text-sm transition-colors hover:text-accent-cyan",
              !activeCategory ? "font-medium text-accent-cyan" : "text-noire-muted"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParams("category", cat.slug)}
              className={cn(
                "block w-full rounded-sm py-2.5 text-left text-sm transition-colors hover:text-accent-cyan",
                activeCategory === cat.slug ? "font-medium text-accent-cyan" : "text-noire-muted"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-3 block">Sort By</Label>
        <Select
          value={searchParams.get("sort") || "newest"}
          onValueChange={(v) => updateParams("sort", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-3 block">Price Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") || ""}
            onBlur={(e) => updateParams("minPrice", e.target.value || null)}
          />
          <Input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") || ""}
            onBlur={(e) => updateParams("maxPrice", e.target.value || null)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="mb-4 flex h-11 items-center gap-2 rounded-sm border border-noire-border px-4 text-sm transition-colors hover:border-accent-cyan/40 lg:hidden"
        onClick={() => setShowMobile(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      <aside className="hidden lg:block">{filterContent}</aside>

      {showMobile && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-noire-black/80"
            onClick={() => setShowMobile(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto border-t border-accent-cyan/30 bg-noire-charcoal p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg tracking-wide">Filters</h2>
              <button
                type="button"
                onClick={() => setShowMobile(false)}
                className="flex h-11 w-11 items-center justify-center"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
            <button
              type="button"
              onClick={() => setShowMobile(false)}
              className="mt-8 w-full border border-accent-cyan bg-accent-cyan py-3 text-sm font-semibold uppercase tracking-wider text-noire-black"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
