"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCartStore } from "@/store/cart-store";
import {
  fetchUserCart,
  saveUserCart,
  mergeCartsSum,
  reconcileWithServer,
} from "@/lib/firebase/services/cart.service";

/**
 * Keeps the cart linked to the authenticated user (audit B3):
 *  - fresh login            → merge guest cart into the server cart (sum quantities)
 *  - reload while signed in  → reconcile with server (server wins; keep local-only)
 *  - account switch          → do not leak the previous user's items
 *  - logout                  → clear local cart (server copy retained for re-login)
 *  - while signed in         → debounced save of cart changes to the server
 */
export function CartSync() {
  const { user, loading } = useAuth();
  const busyRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    const uid = user?.id ?? null;

    if (uid) {
      if (busyRef.current) return;
      busyRef.current = true;
      void (async () => {
        try {
          const server = await fetchUserCart(uid);
          const state = useCartStore.getState();
          if (state._syncedUid === uid) {
            // Reload while signed in.
            state.setItems(reconcileWithServer(server, state.items));
          } else {
            // Fresh login or account switch.
            const isSwitch = state._syncedUid != null && state._syncedUid !== uid;
            const guestItems = isSwitch ? [] : state.items;
            const merged = mergeCartsSum(guestItems, server);
            state.setItems(merged);
            state.setSyncedUid(uid);
            await saveUserCart(uid, merged);
          }
        } finally {
          busyRef.current = false;
        }
      })();
    } else if (useCartStore.getState()._syncedUid) {
      // Signed out — clear local cart; the server copy is kept for re-login.
      useCartStore.getState().clearCart();
      useCartStore.getState().setSyncedUid(null);
    }
  }, [user, loading]);

  // Debounced push of cart changes to the server while signed in.
  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = useCartStore.subscribe((state) => {
      if (useCartStore.getState()._syncedUid !== uid) return;
      if (timer) clearTimeout(timer);
      const items = state.items;
      timer = setTimeout(() => void saveUserCart(uid, items), 800);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [user]);

  return null;
}
