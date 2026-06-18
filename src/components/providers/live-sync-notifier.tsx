"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useBanners } from "@/hooks/use-banners";
import { useHomepage } from "@/hooks/use-homepage";
import { useSettings } from "@/hooks/use-settings";
import { isMockDataMode } from "@/lib/config";

function catalogSignature(
  products: { id: string; updatedAt: string }[],
  categories: { id: string }[],
  banners: { id: string }[],
  homepage: object,
  settings: object
) {
  return JSON.stringify({
    products: products.map((p) => `${p.id}:${p.updatedAt}`).join(","),
    categories: categories.map((c) => c.id).join(","),
    banners: banners.map((b) => b.id).join(","),
    homepage,
    settings,
  });
}

/** Notifies shoppers when admin pushes live catalog/settings updates (dismissible toast). */
export function LiveSyncNotifier() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { banners, loading: bannersLoading } = useBanners();
  const { homepage, loading: homepageLoading } = useHomepage();
  const { settings, loading: settingsLoading } = useSettings();

  const initialized = useRef(false);
  const lastSignature = useRef("");

  useEffect(() => {
    if (isMockDataMode()) return;
    if (
      productsLoading ||
      categoriesLoading ||
      bannersLoading ||
      homepageLoading ||
      settingsLoading
    ) {
      return;
    }

    const sig = catalogSignature(products, categories, banners, homepage, settings);

    if (!initialized.current) {
      initialized.current = true;
      lastSignature.current = sig;
      return;
    }

    if (sig === lastSignature.current) return;
    lastSignature.current = sig;

    toast.message("Store updated", {
      description: "Latest changes from admin are now live.",
      duration: 8000,
    });
  }, [
    products,
    categories,
    banners,
    homepage,
    settings,
    productsLoading,
    categoriesLoading,
    bannersLoading,
    homepageLoading,
    settingsLoading,
  ]);

  return null;
}
