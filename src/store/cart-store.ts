"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  couponCode: string | null;
  discount: number;
  shippingId: string;
  shippingOptions: ShippingOption[] | null;
  checkoutShipping: CheckoutShipping | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
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
      couponCode: null,
      discount: 0,
      shippingId: "standard",
      shippingOptions: null,
      checkoutShipping: null,

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
        if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
        return SHIPPING_RATES[0].price;
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
    }
  )
);
