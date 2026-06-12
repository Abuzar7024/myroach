"use client";

import { useEffect, useState } from "react";
import { fetchBanners } from "@/lib/firebase/services/banners";
import type { Banner } from "@/types";
import type { DataSource } from "@/lib/firebase/services/products";

export function useBanners(position?: Banner["position"]) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<DataSource>("mock");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchBanners(position);
        if (!cancelled) {
          setBanners(result.data);
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
  }, [position]);

  return { banners, loading, source };
}
