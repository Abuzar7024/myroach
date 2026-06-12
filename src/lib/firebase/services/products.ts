import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "../config";
import { COLLECTIONS } from "../models";
import { withFirestoreFallback } from "../firestore-utils";
import {
  products as mockProducts,
  getProductBySlug as getMockProductBySlug,
  getRelatedProducts as getMockRelatedProducts,
  getNewArrivals as getMockNewArrivals,
  getBestSellers as getMockBestSellers,
  getFeaturedProducts as getMockFeaturedProducts,
} from "@/data/mock-data";
import { filterProductsList, type ProductFilterOptions } from "@/lib/product-filters";
import type { Product } from "@/types";

export type DataSource = "firestore" | "mock";

const activeMockProducts = () => mockProducts.filter((p) => p.isActive);

async function fetchAllProducts(): Promise<{ data: Product[]; source: DataSource }> {
  return withFirestoreFallback(
    () => ({ data: activeMockProducts(), source: "mock" as DataSource }),
    async () => {
      const db = getFirestore();
      if (!db) {
        return { data: activeMockProducts(), source: "mock" as DataSource };
      }

      const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      if (snapshot.empty) {
        return { data: activeMockProducts(), source: "mock" as DataSource };
      }

      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Product
      );
      return { data: data.filter((p) => p.isActive), source: "firestore" as DataSource };
    }
  );
}

export async function fetchProducts() {
  return fetchAllProducts();
}

export async function fetchProductBySlug(slug: string) {
  const { data, source } = await fetchAllProducts();
  const product = data.find((p) => p.slug === slug);
  if (product) return { product, source };
  const mock = getMockProductBySlug(slug);
  return { product: mock, source: "mock" as DataSource };
}

export async function fetchRelatedProducts(
  productId: string,
  categorySlug: string,
  limit = 4
) {
  const { data } = await fetchAllProducts();
  const related = data
    .filter(
      (p) =>
        p.id !== productId && p.categorySlug === categorySlug && p.isActive
    )
    .slice(0, limit);

  if (related.length > 0) return related;
  return getMockRelatedProducts(productId, categorySlug, limit);
}

export async function fetchNewArrivals() {
  const { data } = await fetchAllProducts();
  const items = data.filter((p) => p.isNewArrival);
  return items.length > 0 ? items : getMockNewArrivals();
}

export async function fetchBestSellers() {
  const { data } = await fetchAllProducts();
  const items = data.filter((p) => p.isBestSeller);
  return items.length > 0 ? items : getMockBestSellers();
}

export async function fetchFeaturedProducts() {
  const { data } = await fetchAllProducts();
  const items = data.filter((p) => p.isFeatured);
  return items.length > 0 ? items : getMockFeaturedProducts();
}

export function filterProducts(
  products: Product[],
  options: ProductFilterOptions
) {
  return filterProductsList(products, options);
}
