import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirestore } from "../config";
import { COLLECTIONS } from "../models";
import { withFirestoreFallback } from "../firestore-utils";
import { categories as mockCategories } from "@/data/mock-data";
import type { Category } from "@/types";
import type { DataSource } from "./products";

const activeMockCategories = () => mockCategories.filter((c) => c.isActive);

export async function fetchCategories(): Promise<{
  data: Category[];
  source: DataSource;
}> {
  return withFirestoreFallback(
    () => ({ data: activeMockCategories(), source: "mock" as DataSource }),
    async () => {
      const db = getFirestore();
      if (!db) {
        return { data: activeMockCategories(), source: "mock" as DataSource };
      }

      const q = query(
        collection(db, COLLECTIONS.CATEGORIES),
        orderBy("order", "asc")
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { data: activeMockCategories(), source: "mock" as DataSource };
      }

      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Category
      );
      return { data: data.filter((c) => c.isActive), source: "firestore" as DataSource };
    }
  );
}
