"use client";

import { useMemo } from "react";
import { SplitScreenHero } from "@/components/home/split-screen-hero";
import { FeaturedCollections } from "@/components/home/hero-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import {
  ProductSection,
  PromoBanner,
  BrandStory,
  ShopTeaserSection,
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

  const heroProducts = useMemo(
    () => products.filter((p) => p.isFeatured && p.images[0]).slice(0, 4),
    [products]
  );

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
      <SplitScreenHero
        banners={banners}
        featuredProducts={heroProducts}
        loading={bannersLoading}
      />

      {homepage.showFeaturedProducts !== false && (
        <FeaturedProducts
          products={products}
          rotateSeconds={homepage.featuredRotateSeconds ?? 5}
          loading={productsLoading}
        />
      )}

      {homepage.showFeatured !== false && (
        <FeaturedCollections categories={featuredCategories} loading={categoriesLoading} />
      )}

      <ProductSection
        title="LATEST DROPS"
        subtitle="just landed 🔥"
        products={latestProducts.length > 0 ? latestProducts : products}
        viewAllHref="/shop?sort=newest"
        loading={productsLoading}
        limit={8}
        emptyTitle="First drop loading"
        emptySubtitle="The roach is in the lab cooking fits. Latest heat posts here the second admin hits publish — W in chat soon, bhai."
      />

      {homepage.showNewArrivals !== false && (
        <ProductSection
          title="FRESH HEAT"
          subtitle="just dropped 🪳"
          products={newArrivals}
          viewAllHref="/shop?filter=new"
          loading={productsLoading}
          emptyTitle="New arrivals incoming"
          emptySubtitle="Nothing tagged fresh yet — but the underground never sleeps. New fits drop without warning, stay locked in."
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
          emptyTitle="Best sellers TBD"
          emptySubtitle="Nobody's copped yet 'cause the rotation's still loading. Be the first to full send when heat lands."
        />
      )}

      {homepage.showShopTeaser !== false && <ShopTeaserSection />}
      {homepage.showBrandStory !== false && <BrandStory />}
      {homepage.showNewsletter !== false && <Newsletter />}
    </>
  );
}
