import { subscribeCollection, subscribeDocument, where, orderBy } from "../realtime";
import { mapStoreSettings, mapHomepageSettings } from "../mappers";
import { COLLECTIONS, SETTINGS_DOCS } from "../models";
import type { HomepageSettings, StoreSettings } from "@/types/settings";

const defaultStoreSettings: StoreSettings = {
  storeName: "MY ROACH",
  taxPercentage: 0,
};

const defaultHomepageSettings: HomepageSettings = {
  showFeatured: false,
  showFeaturedProducts: false,
  featuredRotateSeconds: 5,
  showBestSellers: false,
  showNewArrivals: false,
  showPromo: false,
  showShopTeaser: false,
  showBrandStory: false,
  showNewsletter: false,
};

export function subscribeStoreSettings(
  onData: (settings: StoreSettings) => void,
  onError?: (error: Error) => void
) {
  return subscribeDocument(
    COLLECTIONS.SETTINGS,
    SETTINGS_DOCS.GENERAL,
    (_id, raw) => mapStoreSettings(raw),
    (data) => onData(data ?? defaultStoreSettings),
    onError
  );
}

export function subscribeHomepageSettings(
  onData: (settings: HomepageSettings) => void,
  onError?: (error: Error) => void
) {
  return subscribeDocument(
    COLLECTIONS.SETTINGS,
    SETTINGS_DOCS.HOMEPAGE,
    (_id, raw) => mapHomepageSettings(raw),
    (data) => onData(data ?? defaultHomepageSettings),
    onError
  );
}

export { defaultStoreSettings, defaultHomepageSettings };
