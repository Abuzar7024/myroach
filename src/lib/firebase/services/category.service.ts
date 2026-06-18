import { subscribeCollection } from "../realtime";
import { mapCategory } from "../mappers";
import { COLLECTIONS } from "../models";
import { getReadFirestore } from "../config";
import { isMockDataMode } from "@/lib/config";
import { collection, getDocs } from "firebase/firestore";
import type { Category } from "@/types";

export function subscribeCategories(
  onData: (categories: Category[]) => void,
  onError?: (error: Error) => void
) {
  return subscribeCollection(
    COLLECTIONS.CATEGORIES,
    [],
    mapCategory,
    (items) =>
      onData(items.filter((c) => c.isActive).sort((a, b) => a.order - b.order)),
    onError
  );
}

export async function fetchCategoriesOnce(): Promise<Category[]> {
  if (isMockDataMode()) {
    const { categories } = await import("@/data/mock-data");
    return categories.filter((c) => c.isActive);
  }
  const db = getReadFirestore();
  if (!db) return [];
  const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
  return snap.docs
    .map((d) => mapCategory(d.id, d.data() as Record<string, unknown>))
    .filter((c) => c.isActive)
    .sort((a, b) => a.order - b.order);
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await fetchCategoriesOnce();
  return all.find((c) => c.slug === slug) ?? null;
}
