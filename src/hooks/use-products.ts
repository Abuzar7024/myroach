"use client";

import { useEffect, useState } from "react";
import { subscribeProducts, subscribeProductBySlug } from "@/lib/firebase/services/product.service";
import { isMockDataMode } from "@/lib/config";
import { filterProductsList, type ProductFilterOptions } from "@/lib/product-filters";
import type { Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMockDataMode()) {
      import("@/data/mock-data").then(({ products: mock }) => {
        setProducts(mock.filter((p) => p.isActive));
        setLoading(false);
      });
      return;
    }

    setLoading(true);
    const unsub = subscribeProducts(
      (items) => {
        setProducts(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setProducts([]);
        setLoading(false);
        setError(err.message);
      }
    );
    return () => unsub();
  }, []);

  const filter = (options: ProductFilterOptions) => filterProductsList(products, options);

  return { products, loading, error, filter };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    if (isMockDataMode()) {
      import("@/data/mock-data").then(({ products }) => {
        setProduct(products.find((p) => p.slug === slug) ?? null);
        setLoading(false);
      });
      return;
    }

    setLoading(true);
    const unsub = subscribeProductBySlug(
      slug,
      (p) => {
        setProduct(p);
        setLoading(false);
      },
      () => {
        setProduct(null);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [slug]);

  return { product, loading };
}
