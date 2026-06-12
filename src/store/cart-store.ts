"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/constants";

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

interface CartStore {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  shippingId: string;
  checkoutShipping: CheckoutShipping | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  setCoupon: (code: string | null, discount: number) => void;
  setShippingId: (id: string) => void;
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
      couponCode: null,
      discount: 0,
      shippingId: "standard",
      checkoutShipping: null,

      addItem: (item) => {
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
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
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
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      setCoupon: (code, discount) => set({ couponCode: code, discount }),
      setShippingId: (id) => set({ shippingId: id }),
      setCheckoutShipping: (shipping) => set({ checkoutShipping: shipping }),

      clearCart: () =>
        set({
          items: [],
          couponCode: null,
          discount: 0,
          checkoutShipping: null,
        }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getShippingCost: () => {
        const subtotal = get().getSubtotal();
        if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
        const rate = SHIPPING_RATES.find((s) => s.id === get().shippingId);
        return rate?.price ?? SHIPPING_RATES[0].price;
      },

      getTotal: (shipping) => {
        const subtotal = get().getSubtotal();
        const shippingCost = shipping ?? get().getShippingCost();
        return Math.max(0, subtotal - get().discount + shippingCost);
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "myroach-cart" }
  )
);
