"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";
import { getDefaultShippingCharge, getFreeShippingThreshold } from "@/lib/pricing-settings";

export interface CheckoutShipping {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  price: number;
  days: string;
  provider?: string;
}

function clampQty(item: CartItem, quantity: number) {
  const min = item.minOrderQty ?? 1;
  const max = item.maxOrderQty ?? 99;
  return Math.min(Math.max(quantity, min), max);
}

interface CartStore {
  items: CartItem[];
  _syncedUid: string | null;
  couponCode: string | null;
  discount: number;
  shippingId: string;
  shippingOptions: ShippingOption[] | null;
  checkoutShipping: CheckoutShipping | null;
  addItem: (item: CartItem) => void;
  setItems: (items: CartItem[]) => void;
  setSyncedUid: (uid: string | null) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  changeSize: (productId: string, oldSize: string, color: string, newSize: string) => void;
  setCoupon: (code: string | null, discount: number) => void;
  setShippingId: (id: string) => void;
  setShippingOptions: (options: ShippingOption[] | null) => void;
  setCheckoutShipping: (shipping: CheckoutShipping | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTotal: (shipping?: number) => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _syncedUid: null,
      couponCode: null,
      discount: 0,
      shippingId: "standard",
      shippingOptions: null,
      checkoutShipping: null,

      setItems: (items) => set({ items }),
      setSyncedUid: (uid) => set({ _syncedUid: uid }),

      addItem: (item) => {
        const qty = clampQty(item, item.quantity);
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === item.color
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId &&
                i.size === item.size &&
                i.color === item.color
                  ? { ...i, quantity: clampQty(i, i.quantity + qty) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        });
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productId === productId && i.size === size && i.color === color)
          ),
        }));
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity: clampQty(i, quantity) }
              : i
          ),
        }));
      },

      changeSize: (productId, oldSize, color, newSize) => {
        if (oldSize === newSize) return;
        set((state) => {
          const item = state.items.find(
            (i) => i.productId === productId && i.size === oldSize && i.color === color
          );
          if (!item) return {};
          const rest = state.items.filter(
            (i) => !(i.productId === productId && i.size === oldSize && i.color === color)
          );
          const existing = rest.find(
            (i) => i.productId === productId && i.size === newSize && i.color === color
          );
          if (existing) {
            return {
              items: rest.map((i) =>
                i === existing ? { ...i, quantity: clampQty(i, i.quantity + item.quantity) } : i
              ),
            };
          }
          return { items: [...rest, { ...item, size: newSize }] };
        });
      },

      setCoupon: (code, discount) => set({ couponCode: code, discount }),
      setShippingId: (id) => set({ shippingId: id }),
      setShippingOptions: (options) => {
        set({ shippingOptions: options });
        if (options?.length && !options.find((o) => o.id === get().shippingId)) {
          set({ shippingId: options[0].id });
        }
      },
      setCheckoutShipping: (shipping) => set({ checkoutShipping: shipping }),

      clearCart: () =>
        set({
          items: [],
          couponCode: null,
          discount: 0,
          checkoutShipping: null,
          shippingOptions: null,
          shippingId: "standard",
        }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getShippingCost: () => {
        const subtotal = get().getSubtotal();
        if (subtotal >= getFreeShippingThreshold()) return 0;
        const options = get().shippingOptions;
        if (options?.length) {
          const selected = options.find((o) => o.id === get().shippingId);
          if (selected) return selected.price;
        }
        return getDefaultShippingCharge();
      },

      getTotal: (shipping) => {
        const subtotal = get().getSubtotal();
        const shippingCost = shipping ?? get().getShippingCost();
        return Math.max(0, subtotal - get().discount + shippingCost);
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "myroach-cart",
      storage: createJSONStorage(() => localStorage),
      // v1: one-time reset that flushes carts leaked by the previous
      // (no-clear-on-logout) logic so guests start empty. Signed-in users'
      // carts are restored from Firestore by CartSync.
      version: 1,
    }
  )
);
