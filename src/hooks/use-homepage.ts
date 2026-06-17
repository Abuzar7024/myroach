"use client";

import { useEffect, useState } from "react";
import {
  subscribeHomepageSettings,
  defaultHomepageSettings,
} from "@/lib/firebase/services/settings.service";
import { isMockDataMode } from "@/lib/config";
import type { HomepageSettings } from "@/types/settings";

export function useHomepage() {
  const [homepage, setHomepage] = useState<HomepageSettings>(defaultHomepageSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockDataMode()) {
      setHomepage(defaultHomepageSettings);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeHomepageSettings(
      (data) => {
        setHomepage(data);
        setLoading(false);
      },
      () => {
        setHomepage(defaultHomepageSettings);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { homepage, loading };
}
