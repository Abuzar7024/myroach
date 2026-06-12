import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getFirestore } from "../config";
import { COLLECTIONS } from "../models";
import { withFirestoreFallback } from "../firestore-utils";
import { banners as mockBanners } from "@/data/mock-data";
import type { Banner } from "@/types";
import type { DataSource } from "./products";

function filterByPosition(banners: Banner[], position?: Banner["position"]) {
  return position ? banners.filter((b) => b.position === position) : banners;
}

const activeMockBanners = (position?: Banner["position"]) =>
  filterByPosition(mockBanners.filter((b) => b.isActive), position);

export async function fetchBanners(
  position?: Banner["position"]
): Promise<{ data: Banner[]; source: DataSource }> {
  return withFirestoreFallback(
    () => ({ data: activeMockBanners(position), source: "mock" as DataSource }),
    async () => {
      const db = getFirestore();
      if (!db) {
        return { data: activeMockBanners(position), source: "mock" as DataSource };
      }

      const snapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.BANNERS),
          where("isActive", "==", true),
          orderBy("order", "asc")
        )
      );

      if (snapshot.empty) {
        return { data: activeMockBanners(position), source: "mock" as DataSource };
      }

      const data = filterByPosition(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Banner),
        position
      );

      return { data, source: "firestore" as DataSource };
    }
  );
}
