import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestore } from "./config";
import { isMockDataMode } from "@/lib/config";

export type SnapshotHandler<T> = (data: T) => void;
export type ErrorHandler = (error: Error) => void;

/** Subscribe to a Firestore collection with real-time updates. Returns unsubscribe fn. */
export function subscribeCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[],
  mapDoc: (id: string, data: Record<string, unknown>) => T,
  onData: SnapshotHandler<T[]>,
  onError?: ErrorHandler
): Unsubscribe | (() => void) {
  if (isMockDataMode()) {
    return () => {};
  }

  const db = getFirestore();
  if (!db) {
    onError?.(new Error("Firestore not initialized"));
    return () => {};
  }

  const q = query(collection(db, collectionPath), ...constraints);
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

/** Subscribe to a single Firestore document. */
export function subscribeDocument<T>(
  collectionPath: string,
  docId: string,
  mapDoc: (id: string, data: Record<string, unknown>) => T,
  onData: SnapshotHandler<T | null>,
  onError?: ErrorHandler
): Unsubscribe | (() => void) {
  if (isMockDataMode()) {
    return () => {};
  }

  const db = getFirestore();
  if (!db) {
    onError?.(new Error("Firestore not initialized"));
    return () => {};
  }

  return onSnapshot(
    doc(db, collectionPath, docId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(mapDoc(snapshot.id, snapshot.data() as Record<string, unknown>));
    },
    (err) => onError?.(err)
  );
}

export { where, orderBy };
