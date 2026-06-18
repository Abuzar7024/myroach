import type { FooterConfig } from "@/lib/footer-config";

export interface StoreSettings {
  logo?: string;
  storeName?: string;
  footerContent?: string;
  footerConfig?: FooterConfig;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  policies?: {
    returnPolicy?: string;
    privacyPolicy?: string;
    termsAndConditions?: string;
  };
  contactEmail?: string;
  phone?: string;
  address?: string;
  shippingCharge?: number;
  freeShippingThreshold?: number;
  taxPercentage?: number;
}

export interface FeaturedCollectionSchedule {
  categoryId: string;
  startDate: string;
  endDate: string;
}

export interface HomepageSettings {
  showFeatured?: boolean;
  showFeaturedProducts?: boolean;
  featuredRotateSeconds?: number;
  featuredCollectionIds?: string[];
  featuredCollectionSchedules?: FeaturedCollectionSchedule[];
  showBestSellers?: boolean;
  bestSellerIds?: string[];
  showNewArrivals?: boolean;
  newArrivalIds?: string[];
  showPromo?: boolean;
  promoTitle?: string;
  promoSubtitle?: string;
  showShopTeaser?: boolean;
  showBrandStory?: boolean;
  showNewsletter?: boolean;
}
