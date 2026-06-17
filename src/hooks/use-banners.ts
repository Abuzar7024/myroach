"use client";

import { useEffect, useState } from "react";
import { subscribeBanners } from "@/lib/firebase/services/banner.service";
import { isMockDataMode } from "@/lib/config";
import type { Banner } from "@/types";

export function useBanners(position?: Banner["position"]) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockDataMode()) {
      import("@/data/mock-data").then(({ banners }) => {
        setBanners(banners.filter((b) => b.isActive && (!position || b.position === position)));
        setLoading(false);
      });
      return;
    }

    setLoading(true);
    const unsub = subscribeBanners(
      position,
      (items) => {
        setBanners(items);
        setLoading(false);
      },
      () => {
        setBanners([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [position]);

  return { banners, loading };
}
