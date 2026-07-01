import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "@/lib/firebase/config";
import { shouldAttemptFirestore } from "@/lib/firebase/firestore-utils";
import type { CartItem } from "@/types";

/**
 * Account-linked cart persistence (audit B3). The cart is stored per user at
 * `cart/{uid}` so it survives logout/login and syncs across devices, while
 * localStorage remains the guest/offline fallback.
 */
const CART_COLLECTION = "cart";

const cartKey = (i: CartItem) => `${i.productId}|${i.size}|${i.color}`;

function clampQty(item: CartItem, qty: number): number {
  const min = item.minOrderQty ?? 1;
  const max = item.maxOrderQty ?? 99;
  return Math.min(Math.max(qty, min), max);
}

/** Guest → account merge: quantities of the same variant are summed (Amazon/Flipkart behaviour). */
export function mergeCartsSum(guest: CartItem[], server: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of [...server, ...guest]) {
    const k = cartKey(item);
    const existing = map.get(k);
    if (existing) {
      map.set(k, { ...existing, quantity: clampQty(existing, existing.quantity + item.quantity) });
    } else {
      map.set(k, { ...item });
    }
  }
  return Array.from(map.values());
}

/**
 * Reload while already signed in: the server is the source of truth for shared
 * variants (prevents double-counting), but keep any local-only items that may
 * not have been flushed to the server yet.
 */
export function reconcileWithServer(server: CartItem[], local: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of server) map.set(cartKey(item), { ...item });
  for (const item of local) {
    const k = cartKey(item);
    if (!map.has(k)) map.set(k, { ...item });
  }
  return Array.from(map.values());
}

export async function fetchUserCart(uid: string): Promise<CartItem[]> {
  if (!shouldAttemptFirestore() || !uid) return [];
  const db = getFirestore();
  if (!db) return [];
  try {
    const snap = await getDoc(doc(db, CART_COLLECTION, uid));
    if (!snap.exists()) return [];
    const data = snap.data() as { items?: CartItem[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function saveUserCart(uid: string, items: CartItem[]): Promise<void> {
  if (!shouldAttemptFirestore() || !uid) return;
  const db = getFirestore();
  if (!db) return;
  try {
    // Firestore rejects `undefined`; JSON round-trip drops undefined fields.
    const clean = JSON.parse(JSON.stringify(items)) as CartItem[];
    await setDoc(doc(db, CART_COLLECTION, uid), { items: clean, updatedAt: serverTimestamp() });
  } catch {
    /* best-effort; local cart still holds the state */
  }
}
