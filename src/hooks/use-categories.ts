"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/firebase/services/categories";
import type { Category } from "@/types";
import type { DataSource } from "@/lib/firebase/services/products";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<DataSource>("mock");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchCategories();
        if (!cancelled) {
          setCategories(result.data);
          setSource(result.source);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, source };
}
