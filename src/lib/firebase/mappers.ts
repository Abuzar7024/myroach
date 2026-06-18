import type {
  Banner,
  Category,
  Coupon,
  Product,
  Review,
} from "@/types";
import type { HomepageSettings, StoreSettings } from "@/types/settings";
import { mergeFooterConfig, type FooterConfig } from "@/lib/footer-config";
import {
  DEFAULT_MAX_ORDER_QTY,
  DEFAULT_MIN_ORDER_QTY,
  DEFAULT_RETURN_POLICY,
} from "@/lib/constants";
import type { ProductVariant } from "@/types";

type RawDoc = Record<string, unknown>;

function buildProductVariants(raw: RawDoc): ProductVariant[] {
  if (Array.isArray(raw.sizes) && (raw.sizes as unknown[]).length > 0) {
    const sizes = (raw.sizes as unknown[]).filter((s): s is string => typeof s === "string" && s.length > 0);
    if (sizes.length) {
      return [{ color: "Default", colorHex: "#27272a", sizes, stock: {} }];
    }
  }

  const legacy = Array.isArray(raw.variants) ? (raw.variants as Array<Record<string, unknown>>) : [];
  if (legacy.length && legacy[0].sizes) {
    return legacy as unknown as ProductVariant[];
  }

  const sizeValues = legacy
    .filter((v) => v.type === "size" && typeof v.value === "string")
    .map((v) => v.value as string);
  if (sizeValues.length) {
    return [{ color: "Default", colorHex: "#27272a", sizes: sizeValues, stock: {} }];
  }

  return [{ color: "Default", colorHex: "#27272a", sizes: ["M"], stock: {} }];
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function ts(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

import type { User } from "@/types";

export function mapUser(id: string, raw: RawDoc): User {
  const role = str(raw.role) === "admin" ? "admin" : "customer";
  return {
    id,
    email: str(raw.email),
    displayName: str(raw.name) || str(raw.displayName),
    photoURL: raw.photoURL != null ? str(raw.photoURL) : undefined,
    role,
    phone: raw.phone != null ? str(raw.phone) : undefined,
    addresses: Array.isArray(raw.addresses) ? (raw.addresses as User["addresses"]) : [],
    createdAt: ts(raw.createdAt),
    updatedAt: ts(raw.updatedAt),
  };
}

/** Admin panel uses `title`; storefront uses `name`. */
export function mapProduct(id: string, raw: RawDoc): Product {
  const regularPrice = num(raw.price);
  const salePrice = raw.salePrice != null ? num(raw.salePrice) : undefined;
  const onSale = salePrice != null && salePrice < regularPrice;
  const sellingPrice = onSale ? salePrice! : regularPrice;

  const images = Array.isArray(raw.images)
    ? (raw.images as unknown[]).filter((u): u is string => typeof u === "string" && u.length > 0)
    : [];

  const variants = buildProductVariants(raw);

  const stockTotal =
    typeof raw.stock === "number"
      ? raw.stock
      : variants.reduce(
          (sum, v) => sum + Object.values(v.stock || {}).reduce((a, b) => a + b, 0),
          0
        );

  return {
    id,
    name: str(raw.title) || str(raw.name) || "Untitled",
    slug: str(raw.slug) || id,
    description: str(raw.description),
    shortDescription: str(raw.shortDescription) || str(raw.description).slice(0, 120),
    price: sellingPrice,
    compareAtPrice: onSale ? regularPrice : raw.compareAtPrice != null ? num(raw.compareAtPrice) : undefined,
    categoryId: str(raw.categoryId),
    categorySlug: str(raw.categorySlug),
    gender:
      str(raw.gender) === "male" || str(raw.gender) === "female" || str(raw.gender) === "unisex"
        ? (str(raw.gender) as Product["gender"])
        : undefined,
    images,
    variants,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    isFeatured: bool(raw.isFeatured) || bool(raw.featured),
    featuredDisplaySeconds:
      raw.featuredDisplaySeconds != null ? num(raw.featuredDisplaySeconds) : undefined,
    isNewArrival: bool(raw.isNewArrival) || bool(raw.isNew),
    isBestSeller: bool(raw.isBestSeller) || bool(raw.isBestSeller),
    rating: num(raw.rating),
    reviewCount: num(raw.reviewCount),
    sku: str(raw.sku),
    minOrderQty: raw.minOrderQty != null ? num(raw.minOrderQty, DEFAULT_MIN_ORDER_QTY) : DEFAULT_MIN_ORDER_QTY,
    maxOrderQty: raw.maxOrderQty != null ? num(raw.maxOrderQty, DEFAULT_MAX_ORDER_QTY) : DEFAULT_MAX_ORDER_QTY,
    returnPolicy:
      raw.returnPolicy != null ? str(raw.returnPolicy) : DEFAULT_RETURN_POLICY,
    material: raw.material != null ? str(raw.material) : undefined,
    careInstructions: raw.careInstructions != null ? str(raw.careInstructions) : undefined,
    isActive: bool(raw.active, bool(raw.isActive, true)),
    stock: stockTotal,
    createdAt: ts(raw.createdAt),
    updatedAt: ts(raw.updatedAt),
  };
}

export function mapCategory(id: string, raw: RawDoc): Category {
  const genderRaw = str(raw.gender);
  const gender =
    genderRaw === "male" || genderRaw === "female" || genderRaw === "unisex"
      ? genderRaw
      : undefined;
  return {
    id,
    name: str(raw.name) || str(raw.title),
    slug: str(raw.slug) || id,
    description: raw.description != null ? str(raw.description) : undefined,
    image: raw.image != null ? str(raw.image) : undefined,
    gender,
    parentId: raw.parentId != null ? str(raw.parentId) : undefined,
    order: num(raw.order) || num(raw.position),
    isActive: bool(raw.active, bool(raw.isActive, true)),
    createdAt: ts(raw.createdAt),
    updatedAt: ts(raw.updatedAt),
  };
}

export function mapBanner(id: string, raw: RawDoc): Banner {
  const slot = str(raw.slot);
  const rawPosition = raw.position;
  let position: Banner["position"] = "hero";
  let order = 0;

  if (slot === "hero" || slot === "promo" || slot === "sidebar") {
    position = slot;
    order = num(raw.order) || (typeof rawPosition === "number" ? rawPosition : 0);
  } else if (typeof rawPosition === "number") {
    order = rawPosition;
    position = "hero";
  } else if (
    typeof rawPosition === "string" &&
    (rawPosition === "hero" || rawPosition === "promo" || rawPosition === "sidebar")
  ) {
    position = rawPosition;
    order = num(raw.order);
  } else {
    order = num(raw.order) || num(raw.position);
    position = "hero";
  }

  return {
    id,
    title: str(raw.title),
    subtitle: raw.subtitle != null ? str(raw.subtitle) : undefined,
    image: str(raw.image),
    link: str(raw.redirectUrl) || str(raw.link) || "/shop",
    position,
    order,
    isActive: bool(raw.active, bool(raw.isActive, true)),
    createdAt: ts(raw.createdAt),
  };
}

export function mapCoupon(id: string, raw: RawDoc): Coupon {
  const discountType = str(raw.discountType) || str(raw.type);
  return {
    id,
    code: str(raw.code).toUpperCase(),
    type: discountType === "fixed" || discountType === "flat" ? "fixed" : "percentage",
    value: num(raw.discountValue) || num(raw.value),
    minOrderAmount:
      raw.minimumOrderAmount != null
        ? num(raw.minimumOrderAmount)
        : raw.minOrderAmount != null
          ? num(raw.minOrderAmount)
          : undefined,
    maxUses: raw.maxUses != null ? num(raw.maxUses) : undefined,
    usedCount: num(raw.usedCount),
    expiresAt:
      raw.expiryDate != null
        ? ts(raw.expiryDate)
        : raw.expiresAt != null
          ? ts(raw.expiresAt)
          : undefined,
    isActive: bool(raw.active, bool(raw.isActive, true)),
    createdAt: ts(raw.createdAt),
  };
}

export function mapReview(id: string, raw: RawDoc): Review {
  return {
    id,
    productId: str(raw.productId),
    userId: str(raw.userId),
    userName: str(raw.author) || str(raw.userName) || "Customer",
    rating: num(raw.rating, 5),
    title: str(raw.title) || "",
    comment: str(raw.comment),
    isVerified: bool(raw.isVerified),
    isApproved: bool(raw.approved, bool(raw.isApproved, false)),
    createdAt: ts(raw.createdAt),
  };
}

export function mapStoreSettings(raw: RawDoc): StoreSettings {
  const social = (raw.socialLinks as RawDoc) || {};
  const policies = (raw.policies as RawDoc) || {};
  return {
    logo: raw.logo != null ? str(raw.logo) : undefined,
    storeName: raw.storeName != null ? str(raw.storeName) : undefined,
    footerContent: raw.footerContent != null ? str(raw.footerContent) : undefined,
    footerConfig:
      raw.footerConfig != null
        ? mergeFooterConfig(raw.footerConfig as Partial<FooterConfig>)
        : undefined,
    socialLinks: {
      facebook: social.facebook != null ? str(social.facebook) : undefined,
      instagram: social.instagram != null ? str(social.instagram) : undefined,
      twitter: social.twitter != null ? str(social.twitter) : undefined,
    },
    policies: {
      returnPolicy: policies.returnPolicy != null ? str(policies.returnPolicy) : undefined,
      privacyPolicy: policies.privacyPolicy != null ? str(policies.privacyPolicy) : undefined,
      termsAndConditions:
        policies.termsAndConditions != null ? str(policies.termsAndConditions) : undefined,
    },
    contactEmail: raw.contactEmail != null ? str(raw.contactEmail) : undefined,
    phone: raw.phone != null ? str(raw.phone) : undefined,
    address: raw.address != null ? str(raw.address) : undefined,
    shippingCharge: raw.shippingCharge != null ? num(raw.shippingCharge) : undefined,
    freeShippingThreshold:
      raw.freeShippingThreshold != null ? num(raw.freeShippingThreshold) : undefined,
    taxPercentage: raw.taxPercentage != null ? num(raw.taxPercentage) : undefined,
  };
}

export function mapHomepageSettings(raw: RawDoc): HomepageSettings {
  return {
    showFeatured: bool(raw.showFeatured, true),
    showFeaturedProducts: bool(raw.showFeaturedProducts, true),
    featuredRotateSeconds:
      raw.featuredRotateSeconds != null ? num(raw.featuredRotateSeconds, 5) : 5,
    featuredCollectionIds: Array.isArray(raw.featuredCollectionIds)
      ? (raw.featuredCollectionIds as string[])
      : [],
    showBestSellers: bool(raw.showBestSellers, true),
    bestSellerIds: Array.isArray(raw.bestSellerIds) ? (raw.bestSellerIds as string[]) : [],
    showNewArrivals: bool(raw.showNewArrivals, true),
    newArrivalIds: Array.isArray(raw.newArrivalIds) ? (raw.newArrivalIds as string[]) : [],
    showPromo: bool(raw.showPromo, true),
    promoTitle: raw.promoTitle != null ? str(raw.promoTitle) : undefined,
    promoSubtitle: raw.promoSubtitle != null ? str(raw.promoSubtitle) : undefined,
    showShopTeaser: bool(raw.showShopTeaser, true),
    showBrandStory: bool(raw.showBrandStory, true),
    showNewsletter: bool(raw.showNewsletter, true),
  };
}
