"use client";

import { useEffect, useState } from "react";
import { subscribeCategories } from "@/lib/firebase/services/category.service";
import { isMockDataMode } from "@/lib/config";
import type { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockDataMode()) {
      import("@/data/mock-data").then(({ categories }) => {
        setCategories(categories.filter((c) => c.isActive));
        setLoading(false);
      });
      return;
    }

    setLoading(true);
    const unsub = subscribeCategories(
      (items) => {
        setCategories(items);
        setLoading(false);
      },
      () => {
        setCategories([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { categories, loading };
}
