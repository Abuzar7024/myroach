"use client";

import { useMemo } from "react";
import { resolveActiveFeaturedCollectionIds } from "@/lib/featured-collection-schedule";
import { SplitScreenHero } from "@/components/home/split-screen-hero";
import { FeaturedCollections } from "@/components/home/hero-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import {
  ProductSection,
  ShopTeaserSection,
  Newsletter,
} from "@/components/home/sections";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useBanners } from "@/hooks/use-banners";
import { useHomepage } from "@/hooks/use-homepage";
import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBrandHero, ShopTrustStrip } from "@/components/home/shopping-brand-hero";
import { CategoryQuickLinks } from "@/components/home/category-quick-links";

export function HomePageLive() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { banners, loading: bannersLoading } = useBanners("hero");
  const { homepage, loading: homepageLoading } = useHomepage();
  const { settings } = useSettings();

  const latestProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [products]
  );

  const newArrivals = useMemo(() => {
    if (homepage.newArrivalIds?.length) {
      const byId = new Map(products.map((p) => [p.id, p]));
      return homepage.newArrivalIds.map((id) => byId.get(id)).filter(Boolean) as typeof products;
    }
    return products.filter((p) => p.isNewArrival);
  }, [products, homepage.newArrivalIds]);

  const bestSellers = useMemo(() => {
    if (homepage.bestSellerIds?.length) {
      const byId = new Map(products.map((p) => [p.id, p]));
      return homepage.bestSellerIds.map((id) => byId.get(id)).filter(Boolean) as typeof products;
    }
    return products.filter((p) => p.isBestSeller);
  }, [products, homepage.bestSellerIds]);

  const featuredCategories = useMemo(() => {
    const activeIds = resolveActiveFeaturedCollectionIds(
      homepage.featuredCollectionSchedules,
      homepage.featuredCollectionIds
    );
    if (activeIds.length) {
      const byId = new Map(categories.map((c) => [c.id, c]));
      return activeIds.map((id) => byId.get(id)).filter(Boolean) as typeof categories;
    }
    return categories.filter((c) => c.isActive);
  }, [categories, homepage.featuredCollectionIds, homepage.featuredCollectionSchedules]);

  const heroProducts = useMemo(
    () => products.filter((p) => p.isFeatured && p.images[0]).slice(0, 4),
    [products]
  );


  const hasBanners = banners.some((b) => b.image);
  const showProductHero = !bannersLoading && !hasBanners && products.length > 0;

  const initialLoad =
    (productsLoading || categoriesLoading || bannersLoading || homepageLoading) &&
    products.length === 0 &&
    banners.length === 0;

  if (initialLoad) {
    return (
      <div className="space-y-8 px-4 py-16">
        <Skeleton className="mx-auto h-[min(88vh,560px)] max-w-7xl" />
        <Skeleton className="mx-auto h-64 max-w-7xl" />
      </div>
    );
  }

  return (
    <>
      {showProductHero ? (
        <ShoppingBrandHero
          products={latestProducts.length > 0 ? latestProducts : products}
          storeName={settings.storeName}
          freeShippingThreshold={settings.freeShippingThreshold}
        />
      ) : (
        <SplitScreenHero
          banners={banners}
          featuredProducts={heroProducts}
          loading={bannersLoading}
        />
      )}

      <ShopTrustStrip freeShippingThreshold={settings.freeShippingThreshold} />

      {categories.filter((c) => c.isActive && c.image).length > 0 && (
        <CategoryQuickLinks categories={categories} />
      )}

      {homepage.showFeaturedProducts === true && (
        <FeaturedProducts
          products={products}
          rotateSeconds={homepage.featuredRotateSeconds ?? 5}
          loading={productsLoading}
        />
      )}

      {homepage.showFeatured === true && featuredCategories.length > 0 && (
        <FeaturedCollections categories={featuredCategories} loading={categoriesLoading} />
      )}

      {latestProducts.length > 0 && (
        <ProductSection
          title="LATEST DROPS"
          subtitle="just landed 🔥"
          products={latestProducts}
          viewAllHref="/shop?sort=newest"
          loading={productsLoading}
          limit={8}
        />
      )}

      {homepage.showNewArrivals === true && newArrivals.length > 0 && (
        <ProductSection
          title="FRESH HEAT"
          subtitle="just dropped 🪳"
          products={newArrivals}
          viewAllHref="/shop?filter=new"
          loading={productsLoading}
        />
      )}

      {homepage.showBestSellers === true && bestSellers.length > 0 && (
        <ProductSection
          title="CERTIFIED HEAT"
          subtitle="most copped"
          products={bestSellers}
          viewAllHref="/shop?sort=popular"
          loading={productsLoading}
        />
      )}

      {homepage.showShopTeaser === true && <ShopTeaserSection />}
      {homepage.showNewsletter === true && <Newsletter />}
    </>
  );
}
