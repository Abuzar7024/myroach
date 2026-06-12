import type { Metadata } from "next";
import {
  SplitScreenHero,
  FeaturedCollections,
} from "@/components/home/hero-section";
import {
  ProductSection,
  PromoBanner,
  BrandStory,
  Testimonials,
  InstagramGallery,
  Newsletter,
} from "@/components/home/sections";
import {
  fetchNewArrivals,
  fetchBestSellers,
  fetchFeaturedProducts,
} from "@/lib/firebase/services/products";
import { fetchCategories } from "@/lib/firebase/services/categories";
import {
  categories as mockCategories,
  getNewArrivals as mockNewArrivals,
  getBestSellers as mockBestSellers,
  getFeaturedProducts as mockFeaturedProducts,
} from "@/data/mock-data";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Main Character Streetwear`,
  description:
    "MY ROACH — Gen Z streetwear for the underground. Squad up, survived the plot, still standing.",
};

export default async function HomePage() {
  let newArrivals: Awaited<ReturnType<typeof fetchNewArrivals>> = [];
  let bestSellers: Awaited<ReturnType<typeof fetchBestSellers>> = [];
  let featuredProducts: Awaited<ReturnType<typeof fetchFeaturedProducts>> = [];
  let categories: Awaited<ReturnType<typeof fetchCategories>>["data"] = [];

  try {
    [newArrivals, bestSellers, featuredProducts, { data: categories }] =
      await Promise.all([
        fetchNewArrivals(),
        fetchBestSellers(),
        fetchFeaturedProducts(),
        fetchCategories(),
      ]);
  } catch {
    newArrivals = mockNewArrivals();
    bestSellers = mockBestSellers();
    featuredProducts = mockFeaturedProducts();
    categories = mockCategories.filter((c) => c.isActive);
  }

  return (
    <>
      <SplitScreenHero featuredProducts={featuredProducts} />
      <FeaturedCollections categories={categories} />
      <ProductSection
        title="FRESH HEAT"
        subtitle="just dropped 🪳"
        products={newArrivals}
        viewAllHref="/shop?filter=new"
      />
      <PromoBanner />
      <ProductSection
        title="CERTIFIED HEAT"
        subtitle="most copped"
        products={bestSellers}
        viewAllHref="/shop?sort=popular"
      />
      <BrandStory />
      <Testimonials />
      <InstagramGallery />
      <Newsletter />
    </>
  );
}
