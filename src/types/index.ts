export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  color: string;
  colorHex: string;
  sizes: string[];
  stock: Record<string, number>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  categorySlug: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  sku: string;
  material?: string;
  careInstructions?: string;
  isActive: boolean;
  /** Total units in stock (from admin `stock` or sum of variant stock). */
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  colorHex: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  addedAt: string;
}

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
  updatedAt: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export type PaymentMethod = "upi" | "card" | "cod";

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  shippingAddress: Address;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  position: "hero" | "promo" | "sidebar";
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  /** Admin-approved reviews only shown on storefront. */
  isApproved?: boolean;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  limit?: number;
}
