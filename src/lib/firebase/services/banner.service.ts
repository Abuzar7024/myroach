import { subscribeCollection } from "../realtime";
import { mapBanner } from "../mappers";
import { COLLECTIONS } from "../models";
import { getFirestore } from "../config";
import { isMockDataMode } from "@/lib/config";
import { collection, getDocs } from "firebase/firestore";
import type { Banner } from "@/types";

export function subscribeBanners(
  position: Banner["position"] | undefined,
  onData: (banners: Banner[]) => void,
  onError?: (error: Error) => void
) {
  return subscribeCollection(
    COLLECTIONS.BANNERS,
    [],
    mapBanner,
    (items) => {
      const filtered = items
        .filter((b) => b.isActive && (!position || b.position === position))
        .sort((a, b) => a.order - b.order);
      onData(filtered);
    },
    onError
  );
}

export async function fetchBannersOnce(position?: Banner["position"]): Promise<Banner[]> {
  if (isMockDataMode()) {
    const { banners } = await import("@/data/mock-data");
    return banners.filter((b) => b.isActive && (!position || b.position === position));
  }
  const db = getFirestore();
  if (!db) return [];
  const snap = await getDocs(collection(db, COLLECTIONS.BANNERS));
  return snap.docs
    .map((d) => mapBanner(d.id, d.data() as Record<string, unknown>))
    .filter((b) => b.isActive && (!position || b.position === position))
    .sort((a, b) => a.order - b.order);
}
