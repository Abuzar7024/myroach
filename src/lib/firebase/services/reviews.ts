import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "../config";
import { COLLECTIONS } from "../models";
import { withFirestoreFallback } from "../firestore-utils";
import { reviews as mockReviews } from "@/data/mock-data";
import type { Review } from "@/types";
import type { DataSource } from "./products";

export async function fetchReviewsByProductId(
  productId: string
): Promise<{ data: Review[]; source: DataSource }> {
  const fallback = mockReviews.filter((r) => r.productId === productId);

  return withFirestoreFallback(
    () => ({ data: fallback, source: "mock" as DataSource }),
    async () => {
      const db = getFirestore();
      if (!db) {
        return { data: fallback, source: "mock" as DataSource };
      }

      const snapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.REVIEWS),
          where("productId", "==", productId)
        )
      );

      if (snapshot.empty) {
        return { data: fallback, source: "mock" as DataSource };
      }

      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Review
      );
      return { data, source: "firestore" as DataSource };
    }
  );
}
