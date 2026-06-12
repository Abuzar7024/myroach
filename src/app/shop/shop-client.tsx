"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search, X } from "lucide-react";
import type { Product, Category } from "@/types";
import { ProductCard } from "@/components/shop/product-card";
import { QuickViewModal } from "@/components/shop/quick-view-modal";
import { FadeIn } from "@/components/ui/motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShopClientProps {
  products: Product[];
  categories: Category[];
  initialParams: Record<string, string | undefined>;
}

export function ShopClient({
  products,
  categories,
  initialParams,
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialParams.search || "");

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  };

  const activeCategory = searchParams.get("category");
  const activeSort = searchParams.get("sort") || "newest";

  return (
    <div className="pt-16 lg:pt-20">
      {/* Shop header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <FadeIn>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Collection
            </p>
            <h1 className="font-display text-5xl font-light tracking-tight lg:text-6xl">
              Shop
            </h1>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {/* Toolbar */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            className="relative max-w-sm flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              updateParams("search", searchQuery || null);
            }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-10"
            />
          </form>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>

            <select
              value={activeSort}
              onChange={(e) => updateParams("sort", e.target.value)}
              className="h-9 border border-border bg-transparent px-3 text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sidebar filters */}
          <aside
            className={cn(
              "w-56 shrink-0 space-y-8",
              filtersOpen ? "block" : "hidden lg:block"
            )}
          >
            <div>
              <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Categories
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => updateParams("category", null)}
                    className={cn(
                      "text-sm transition-colors hover:text-accent",
                      !activeCategory && "text-accent"
                    )}
                  >
                    All
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => updateParams("category", cat.slug)}
                      className={cn(
                        "text-sm transition-colors hover:text-accent",
                        activeCategory === cat.slug && "text-accent"
                      )}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Price Range
              </h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  defaultValue={initialParams.minPrice}
                  onBlur={(e) =>
                    updateParams("minPrice", e.target.value || null)
                  }
                  className="h-9"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  defaultValue={initialParams.maxPrice}
                  onBlur={(e) =>
                    updateParams("maxPrice", e.target.value || null)
                  }
                  className="h-9"
                />
              </div>
            </div>

            {(activeCategory || initialParams.search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/shop")}
              >
                <X className="h-3 w-3" />
                Clear filters
              </Button>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <p className="mb-6 text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>

            {products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display text-2xl font-light text-muted-foreground">
                  No products found
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => router.push("/shop")}
                >
                  View all products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
                {products.map((product, i) => (
                  <FadeIn key={product.id} delay={i * 0.05}>
                    <div
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setQuickViewProduct(product);
                      }}
                      role="presentation"
                    >
                      <ProductCard product={product} />
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        className="mt-3 w-full border border-border py-2 text-xs uppercase tracking-widest opacity-0 transition-opacity hover:bg-foreground hover:text-background group-hover:opacity-100"
                        style={{ opacity: undefined }}
                      >
                        Quick View
                      </button>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          open={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
