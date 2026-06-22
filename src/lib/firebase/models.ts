import type {
  User,
  Product,
  Category,
  Order,
  Cart,
  Wishlist,
  Coupon,
  Banner,
  Review,
} from "@/types";

/**
 * Firestore collection schemas for NOIRÉ e-commerce
 *
 * Collections:
 * - users/{userId}
 * - products/{productId}
 * - categories/{categoryId}
 * - orders/{orderId}
 * - cart/{userId}
 * - wishlist/{userId}
 * - coupons/{couponId}
 * - banners/{bannerId}
 * - reviews/{reviewId}
 */

export type FirestoreCollections = {
  users: User;
  products: Product;
  categories: Category;
  orders: Order;
  cart: Cart;
  wishlist: Wishlist;
  coupons: Coupon;
  banners: Banner;
  reviews: Review;
};

export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  CATEGORIES: "categories",
  ORDERS: "orders",
  CART: "cart",
  WISHLIST: "wishlist",
  COUPONS: "coupons",
  BANNERS: "banners",
  REVIEWS: "reviews",
  SUBSCRIBERS: "subscribers",
  SETTINGS: "settings",
  RAZORPAY_EVENTS: "razorpay_events",
} as const;

export const SETTINGS_DOCS = {
  GENERAL: "general",
  HOMEPAGE: "homepage",
} as const;
