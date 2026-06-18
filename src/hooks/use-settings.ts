"use client";

import { useEffect, useState } from "react";
import {
  subscribeStoreSettings,
  defaultStoreSettings,
} from "@/lib/firebase/services/settings.service";
import { isMockDataMode } from "@/lib/config";
import type { StoreSettings } from "@/types/settings";
import { setPricingSettings } from "@/lib/pricing-settings";

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockDataMode()) {
      setSettings(defaultStoreSettings);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeStoreSettings(
      (data) => {
        setSettings(data);
        setPricingSettings({
          freeShippingThreshold: data.freeShippingThreshold,
          shippingCharge: data.shippingCharge,
        });
        setLoading(false);
      },
      () => {
        setSettings(defaultStoreSettings);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { settings, loading };
}
