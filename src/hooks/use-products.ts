"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchProducts, filterProducts } from "@/lib/firebase/services/products";
import { products as mockProducts } from "@/data/mock-data";
import type { Product } from "@/types";
import type { ProductFilterOptions } from "@/lib/product-filters";
import type { DataSource } from "@/lib/firebase/services/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<DataSource>("mock");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchProducts();
        if (!cancelled) {
          setProducts(result.data);
          setSource(result.source);
        }
      } catch {
        if (!cancelled) {
          setProducts(mockProducts.filter((p) => p.isActive));
          setSource("mock");
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

  const filter = useCallback(
    (options: ProductFilterOptions) => filterProducts(products, options),
    [products]
  );

  return { products, loading, source, filter };
}
