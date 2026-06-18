"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WishlistItem } from "@/types";

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().isInWishlist(item.productId)) return;
        set((state) => ({ items: [...state.items, item] }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      clearAll: () => set({ items: [] }),

      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),

      toggleItem: (item) => {
        if (get().isInWishlist(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },
    }),
    {
      name: "myroach-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
