"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/contexts/auth-context";
import { formatPrice } from "@/lib/format";
import { loginRedirectPath, storeReturnUrl } from "@/lib/auth-utils";
import { validateCoupon } from "@/lib/coupons";
import { useCoupons } from "@/hooks/use-coupons";
import { useSettings } from "@/hooks/use-settings";
import { DEFAULT_RETURN_POLICY } from "@/lib/constants";
import { toast } from "sonner";

type PendingRemove = {
  productId: string;
  size: string;
  color: string;
  name: string;
};

function variantLabel(size: string, color: string) {
  if (color && color !== "Default") return `${color} · Size ${size}`;
  return `Size ${size}`;
}

export function CartContent() {
  const { settings } = useSettings();
  const freeShippingThreshold = settings.freeShippingThreshold ?? 2499;
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotal,
    getShippingCost,
    setCoupon,
    couponCode,
    discount,
  } = useCartStore();
  const { coupons } = useCoupons();
  const [couponInput, setCouponInput] = useState("");
  const [removeTarget, setRemoveTarget] = useState<PendingRemove | null>(null);
  const [couponSuccessOpen, setCouponSuccessOpen] = useState(false);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");

  const shipping = getShippingCost();
  const subtotal = getSubtotal();
  const total = getTotal();

  const applyCoupon = () => {
    if (coupons.length === 0) {
      toast.error("No coupons available yet");
      return;
    }
    const result = validateCoupon(couponInput, subtotal, coupons);
    if (result.valid) {
      setCoupon(couponInput.toUpperCase(), result.discount);
      setCouponSuccessMsg(result.message);
      setCouponSuccessOpen(true);
    } else {
      toast.error(result.message);
    }
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    removeItem(removeTarget.productId, removeTarget.size, removeTarget.color);
    setRemoveTarget(null);
  };

  const handleCheckout = () => {
    if (!user) {
      storeReturnUrl("/checkout");
      toast.message("Sign in to complete your order");
      router.push(loginRedirectPath("/checkout"));
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-14 w-14 text-noire-border" />
        <h1 className="font-display mt-6 text-2xl">Your cart is empty</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-noire-muted">
          Add something from the shop — the rotation is waiting.
        </p>
        <Button asChild className="mt-8">
          <Link href="/shop">Shop now</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">Cart</h1>

        <div className="space-y-4">
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;
            const atMin = item.quantity <= (item.minOrderQty ?? 1);
            const atMax = item.quantity >= (item.maxOrderQty ?? 99);
            return (
              <article
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-4 rounded-lg border border-noire-border bg-noire-charcoal/40 p-3 sm:p-4"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-24 w-20 shrink-0 overflow-hidden border border-noire-border sm:h-28 sm:w-24"
                >
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/product/${item.slug}`} className="block truncate font-medium hover:text-accent-cyan">
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-noire-muted">{variantLabel(item.size, item.color)}</p>
                      <p className="mt-1 text-sm text-accent-cyan">{formatPrice(item.price)} each</p>
                    </div>
                    <p className="shrink-0 text-sm font-medium">{formatPrice(lineTotal)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center rounded border border-noire-border">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                        }
                        disabled={atMin}
                        className="flex h-9 w-9 items-center justify-center disabled:opacity-40"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                        }
                        disabled={atMax}
                        className="flex h-9 w-9 items-center justify-center disabled:opacity-40"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setRemoveTarget({
                          productId: item.productId,
                          size: item.size,
                          color: item.color,
                          name: item.name,
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center text-noire-muted hover:text-accent-pink"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-noire-muted">
          <RotateCcw className="h-3.5 w-3.5" />
          {DEFAULT_RETURN_POLICY} on all orders
        </p>

        <section className="mt-8 rounded-lg border border-noire-border bg-noire-charcoal/30 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-noire-muted">Order summary</h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-noire-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent-cyan">
                <span>Discount ({couponCode})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-noire-muted">Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            {subtotal < freeShippingThreshold && (
              <p className="text-xs text-noire-muted">
                Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping
              </p>
            )}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs uppercase tracking-widest text-noire-muted">Coupon</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={applyCoupon} className="shrink-0">
                Apply
              </Button>
            </div>
          </div>

          <div className="mt-5 flex justify-between border-t border-noire-border pt-4 text-base font-medium">
            <span>Total</span>
            <span className="text-accent-cyan">{formatPrice(total)}</span>
          </div>

          <Button size="lg" className="mt-5 w-full" onClick={handleCheckout}>
            Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove item?"
        description={removeTarget ? `Remove "${removeTarget.name}" from your cart?` : undefined}
        confirmLabel="Remove"
        cancelLabel="Keep"
        variant="destructive"
        onConfirm={confirmRemove}
      />

      <Dialog open={couponSuccessOpen} onOpenChange={setCouponSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coupon applied</DialogTitle>
            <DialogDescription>{couponSuccessMsg}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setCouponSuccessOpen(false)} className="w-full">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
