"use client";

import { useMemo } from "react";
import { SplitScreenHero } from "@/components/home/split-screen-hero";
import { FeaturedCollections } from "@/components/home/hero-section";
import {
  ProductSection,
  PromoBanner,
  BrandStory,
  Newsletter,
} from "@/components/home/sections";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useBanners } from "@/hooks/use-banners";
import { useHomepage } from "@/hooks/use-homepage";
import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";

export function HomePageLive() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { banners, loading: bannersLoading } = useBanners("hero");
  const { homepage, loading: homepageLoading } = useHomepage();
  const { settings } = useSettings();

  const newArrivals = useMemo(() => {
    if (homepage.newArrivalIds?.length) {
      const byId = new Map(products.map((p) => [p.id, p]));
      const picked = homepage.newArrivalIds.map((id) => byId.get(id)).filter(Boolean);
      if (picked.length) return picked as typeof products;
    }
    return products.filter((p) => p.isNewArrival);
  }, [products, homepage.newArrivalIds]);

  const bestSellers = useMemo(() => {
    if (homepage.bestSellerIds?.length) {
      const byId = new Map(products.map((p) => [p.id, p]));
      const picked = homepage.bestSellerIds.map((id) => byId.get(id)).filter(Boolean);
      if (picked.length) return picked as typeof products;
    }
    return products.filter((p) => p.isBestSeller);
  }, [products, homepage.bestSellerIds]);

  const featuredCategories = useMemo(() => {
    if (homepage.featuredCollectionIds?.length) {
      const byId = new Map(categories.map((c) => [c.id, c]));
      const picked = homepage.featuredCollectionIds.map((id) => byId.get(id)).filter(Boolean);
      if (picked.length) return picked as typeof categories;
    }
    return categories;
  }, [categories, homepage.featuredCollectionIds]);

  const loading = productsLoading || categoriesLoading || homepageLoading;

  if (loading && products.length === 0 && banners.length === 0) {
    return (
      <div className="space-y-8 px-4 py-16">
        <Skeleton className="mx-auto h-[420px] max-w-7xl" />
        <Skeleton className="mx-auto h-64 max-w-7xl" />
      </div>
    );
  }

  return (
    <>
      <SplitScreenHero banners={banners} loading={bannersLoading} />
      <FeaturedCollections categories={featuredCategories} />
      {homepage.showNewArrivals !== false && (
        <ProductSection
          title="FRESH HEAT"
          subtitle="just dropped 🪳"
          products={newArrivals}
          viewAllHref="/shop?filter=new"
          loading={productsLoading}
        />
      )}
      {homepage.showPromo !== false && (
        <PromoBanner
          title={homepage.promoTitle}
          subtitle={homepage.promoSubtitle}
          freeShippingThreshold={settings.freeShippingThreshold}
        />
      )}
      {homepage.showBestSellers !== false && (
        <ProductSection
          title="CERTIFIED HEAT"
          subtitle="most copped"
          products={bestSellers}
          viewAllHref="/shop?sort=popular"
          loading={productsLoading}
        />
      )}
      <BrandStory />
      <Newsletter />
    </>
  );
}
