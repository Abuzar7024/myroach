"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shop/product-card";
import { ShopFilters } from "@/components/shop/shop-filters";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";

const QuickViewModal = dynamic(
  () => import("@/components/shop/quick-view-modal").then((m) => m.QuickViewModal),
  { ssr: false }
);

export function ShopContent() {
  const searchParams = useSearchParams();
  const { products, loading: productsLoading, filter } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);

  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const filterParam = searchParams.get("filter");
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;

  useEffect(() => {
    setPage(1);
  }, [search, category, sort, minPrice, maxPrice, filterParam]);

  const result = useMemo(
    () =>
      filter({
        search,
        category,
        minPrice,
        maxPrice,
        sort: filterParam === "new" ? "newest" : sort,
        page,
        limit: 12,
      }),
    [filter, search, category, minPrice, maxPrice, sort, filterParam, page, products]
  );

  const isLoading = productsLoading || categoriesLoading;

  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
      <div className="mb-12 text-center animate-fade-in">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-accent-cyan">
          explore the scene
        </p>
        <h1 className="font-display mt-3 text-3xl font-light tracking-wide sm:text-4xl md:text-5xl">
          The Collection
        </h1>
        <p className="mt-3 text-sm text-noire-muted">
          {isLoading ? "Loading drip..." : `${result.total} ${result.total === 1 ? "piece" : "pieces"} — drip check passed`}
        </p>
        {search && !isLoading && (
          <p className="mt-2 text-xs text-accent-cyan">
            Results for &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <ShopFilters categories={categories} />

        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="mt-4 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : result.products.length === 0 ? (
            <div className="py-20 text-center animate-fade-in">
              <span className="sticker sticker-pink mx-auto mb-4 inline-block">no matches</span>
              <p className="font-display text-xl tracking-wide">Nothing Slaps Here, Bhai</p>
              <p className="mt-2 text-sm text-noire-muted">
                No fits match your filters. Try widening the search — the rotation has more heat.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <a href="/shop">Clear Filters</a>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
                {result.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>

              {result.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-noire-muted">
                    Page {page} of {result.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= result.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
