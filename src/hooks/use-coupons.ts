"use client";

import { useEffect, useState } from "react";
import { subscribeCoupons, subscribeProductReviews } from "@/lib/firebase/services/product.service";
import { isMockDataMode } from "@/lib/config";
import type { Coupon, Review } from "@/types";

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockDataMode()) {
      import("@/data/mock-data").then(({ coupons }) => {
        setCoupons(coupons.filter((c) => c.isActive));
        setLoading(false);
      });
      return;
    }

    setLoading(true);
    const unsub = subscribeCoupons(
      (items) => {
        const now = Date.now();
        setCoupons(
          items.filter(
            (c) => c.isActive && (!c.expiresAt || new Date(c.expiresAt).getTime() > now)
          )
        );
        setLoading(false);
      },
      () => {
        setCoupons([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { coupons, loading };
}

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    if (isMockDataMode()) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeProductReviews(
      productId,
      (items) => {
        setReviews(items);
        setLoading(false);
      },
      () => {
        setReviews([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [productId]);

  return { reviews, loading };
}
