import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  runTransaction,
  increment,
} from "firebase/firestore";
import { subscribeCollection } from "../realtime";
import { mapProduct, mapCoupon, mapReview } from "../mappers";
import { COLLECTIONS } from "../models";
import { getFirestore } from "../config";
import { isMockDataMode } from "@/lib/config";
import type { Product, Coupon, Review } from "@/types";

async function loadMockProducts(): Promise<Product[]> {
  const { products } = await import("@/data/mock-data");
  return products.filter((p) => p.isActive).map((p) => ({ ...p, stock: p.stock ?? 99 }));
}

export function subscribeProducts(
  onData: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  return subscribeCollection(
    COLLECTIONS.PRODUCTS,
    [],
    mapProduct,
    (items) => onData(items.filter((p) => p.isActive)),
    onError
  );
}

export function subscribeProductBySlug(
  slug: string,
  onData: (product: Product | null) => void,
  onError?: (error: Error) => void
) {
  return subscribeCollection(
    COLLECTIONS.PRODUCTS,
    [],
    mapProduct,
    (items) => onData(items.find((p) => p.slug === slug && p.isActive) ?? null),
    onError
  );
}

export function subscribeCoupons(onData: (coupons: Coupon[]) => void, onError?: (error: Error) => void) {
  return subscribeCollection(
    COLLECTIONS.COUPONS,
    [],
    mapCoupon,
    (items) => onData(items.filter((c) => c.isActive)),
    onError
  );
}

export function subscribeProductReviews(
  productId: string,
  onData: (reviews: Review[]) => void,
  onError?: (error: Error) => void
) {
  return subscribeCollection(
    COLLECTIONS.REVIEWS,
    [],
    mapReview,
    (items) =>
      onData(items.filter((r) => r.productId === productId && r.isApproved === true)),
    onError
  );
}

export async function fetchProductsOnce(): Promise<Product[]> {
  if (isMockDataMode()) return loadMockProducts();
  const db = getFirestore();
  if (!db) return [];
  const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
  return snap.docs
    .map((d) => mapProduct(d.id, d.data() as Record<string, unknown>))
    .filter((p) => p.isActive);
}

export async function fetchProductBySlugOnce(slug: string): Promise<Product | null> {
  if (isMockDataMode()) {
    const { getProductBySlug } = await import("@/data/mock-data");
    return getProductBySlug(slug) ?? null;
  }
  const products = await fetchProductsOnce();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const all = await fetchProductsOnce();
  const byId = new Map(all.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

export async function fetchRelatedProductsOnce(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<Product[]> {
  const all = await fetchProductsOnce();
  return all
    .filter((p) => p.id !== productId && p.categoryId === categoryId && p.isActive)
    .slice(0, limit);
}

export async function fetchReviewsOnce(productId: string): Promise<Review[]> {
  if (isMockDataMode()) return [];
  const db = getFirestore();
  if (!db) return [];
  const snap = await getDocs(collection(db, COLLECTIONS.REVIEWS));
  return snap.docs
    .map((d) => mapReview(d.id, d.data() as Record<string, unknown>))
    .filter((r) => r.productId === productId && r.isApproved === true);
}

export async function submitReview(input: {
  productId: string;
  userId: string;
  author: string;
  rating: number;
  comment: string;
}) {
  const db = getFirestore();
  if (!db) throw new Error("Firestore unavailable");
  const ref = doc(collection(db, COLLECTIONS.REVIEWS));
  await setDoc(ref, {
    productId: input.productId,
    userId: input.userId,
    author: input.author,
    rating: input.rating,
    comment: input.comment,
    approved: false,
    createdAt: serverTimestamp(),
  });
}

export async function subscribeNewsletter(email: string) {
  const db = getFirestore();
  if (!db) throw new Error("Firestore unavailable");
  const id = email.toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
  await setDoc(
    doc(db, COLLECTIONS.SUBSCRIBERS, id),
    { email: email.toLowerCase(), active: true, createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function createOrderInFirestore(order: {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: { productId: string; title: string; quantity: number; price: number; image: string }[];
  subtotal: number;
  tax: number;
  shippingCharge: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  shippingAddress: Record<string, string>;
  couponCode?: string;
  paymentMethod?: string;
}) {
  const db = getFirestore();
  if (!db) throw new Error("Firestore unavailable");

  await runTransaction(db, async (tx) => {
    for (const item of order.items) {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, item.productId);
      const productSnap = await tx.get(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        if (typeof data.stock === "number") {
          tx.update(productRef, { stock: increment(-item.quantity) });
        }
      }
    }
    tx.set(doc(db, COLLECTIONS.ORDERS, order.id), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function fetchCouponsOnce(): Promise<Coupon[]> {
  if (isMockDataMode()) {
    const { coupons } = await import("@/data/mock-data");
    return coupons.filter((c) => c.isActive);
  }
  const db = getFirestore();
  if (!db) return [];
  const snap = await getDocs(collection(db, COLLECTIONS.COUPONS));
  return snap.docs
    .map((d) => mapCoupon(d.id, d.data() as Record<string, unknown>))
    .filter((c) => c.isActive);
}

export async function getCartDoc(userId: string) {
  const db = getFirestore();
  if (!db) return null;
  const snap = await getDoc(doc(db, COLLECTIONS.CART, userId));
  return snap.exists() ? snap.data() : null;
}

export async function saveCartDoc(
  userId: string,
  items: { productId: string; title: string; quantity: number; price: number; image: string }[]
) {
  const db = getFirestore();
  if (!db) return;
  await setDoc(
    doc(db, COLLECTIONS.CART, userId),
    { items, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
