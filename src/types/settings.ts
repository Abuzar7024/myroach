export interface StoreSettings {
  logo?: string;
  storeName?: string;
  footerContent?: string;
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

export interface HomepageSettings {
  showFeatured?: boolean;
  featuredCollectionIds?: string[];
  showBestSellers?: boolean;
  bestSellerIds?: string[];
  showNewArrivals?: boolean;
  newArrivalIds?: string[];
  showPromo?: boolean;
  promoTitle?: string;
  promoSubtitle?: string;
}
