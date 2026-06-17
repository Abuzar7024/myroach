"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
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
import { MobileOrderSummary } from "@/components/layout/mobile-order-summary";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { validateCoupon } from "@/lib/coupons";
import { useCoupons } from "@/hooks/use-coupons";
import { SHIPPING_RATES, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { toast } from "sonner";

type PendingRemove = {
  productId: string;
  size: string;
  color: string;
  name: string;
};

function OrderSummaryBody({
  subtotal,
  discount,
  couponCode,
  shipping,
  shippingId,
  setShippingId,
  couponInput,
  setCouponInput,
  applyCoupon,
}: {
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shipping: number;
  shippingId: string;
  setShippingId: (id: string) => void;
  couponInput: string;
  setCouponInput: (v: string) => void;
  applyCoupon: () => void;
}) {
  return (
    <>
      <div className="space-y-3 text-base sm:text-sm">
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
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <p className="text-xs text-noire-muted">
            Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
          </p>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-noire-muted">Shipping Method</p>
        <div className="space-y-2">
          {SHIPPING_RATES.map((rate) => (
            <label
              key={rate.id}
              className={`flex min-h-[44px] cursor-pointer items-center justify-between border p-3 text-base transition-[border-color,box-shadow] duration-200 sm:text-sm ${
                shippingId === rate.id
                  ? "border-accent-cyan bg-noire-charcoal shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                  : "border-noire-border active:border-accent-cyan/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingId === rate.id}
                  onChange={() => setShippingId(rate.id)}
                  className="h-5 w-5 accent-accent-cyan"
                />
                <div>
                  <span>{rate.label}</span>
                  <span className="block text-xs text-noire-muted">{rate.days}</span>
                </div>
              </div>
              <span>{subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : formatPrice(rate.price)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-noire-muted">Coupon Code</p>
        <div className="flex gap-2">
          <Input
            placeholder="ROACH20 or WELCOME10"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={applyCoupon} className="min-h-[44px] shrink-0">
            Apply
          </Button>
        </div>
      </div>
    </>
  );
}

export function CartContent() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
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
    shippingId,
    setShippingId,
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
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    removeItem(removeTarget.productId, removeTarget.size, removeTarget.color);
    toast.success("Removed from cart — drip deleted, bhai");
    setRemoveTarget(null);
  };

  const handleCheckout = () => {
    requireAuth(() => router.push("/checkout"));
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
        <ShoppingBag className="mx-auto h-16 w-16 text-noire-border" />
        <h1 className="font-display mt-6 text-2xl font-light sm:text-3xl">Cart&apos;s Empty, Bhai</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-noire-muted">
          No drip in the bag yet. The rotation is waiting — go full send on some heat.
        </p>
        <span className="sticker sticker-lime mx-auto mt-6 inline-block">built different energy</span>
        <Button asChild className="mt-8 min-h-[44px]">
          <Link href="/shop">Shop the Drop</Link>
        </Button>
      </div>
    );
  }

  const summaryProps = {
    subtotal,
    discount,
    couponCode,
    shipping,
    shippingId,
    setShippingId,
    couponInput,
    setCouponInput,
    applyCoupon,
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-16 lg:px-8 lg:py-32 lg:pb-32">
        <h1 className="font-display mb-8 text-2xl font-light tracking-wide sm:mb-12 sm:text-3xl md:text-4xl">
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-4 border-b border-noire-border pb-6 sm:gap-6 animate-fade-in"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden border border-noire-border bg-noire-black sm:h-40 sm:w-32"
                >
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="128px" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.slug}`} className="text-base font-medium active:text-accent-cyan sm:text-sm">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-noire-muted">
                      {item.color} / {item.size}
                    </p>
                    <p className="mt-2 text-base text-accent-cyan sm:text-sm">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center border border-noire-border">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                        }
                        className="flex h-11 w-11 items-center justify-center active:bg-noire-charcoal"
                        aria-label="Decrease"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] px-2 text-center text-base">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                        }
                        className="flex h-11 w-11 items-center justify-center active:bg-noire-charcoal"
                        aria-label="Increase"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        setRemoveTarget({
                          productId: item.productId,
                          size: item.size,
                          color: item.color,
                          name: item.name,
                        })
                      }
                      className="flex h-11 w-11 items-center justify-center text-noire-muted active:text-accent-pink"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit cyber-card p-4 sm:p-6 lg:p-8">
            <MobileOrderSummary total={total}>
              <OrderSummaryBody {...summaryProps} />
              <div className="mt-4 flex justify-between border-t border-noire-border pt-3 text-base font-medium">
                <span>Total</span>
                <span className="text-accent-cyan">{formatPrice(total)}</span>
              </div>
            </MobileOrderSummary>

            <div className="hidden lg:block">
              <h2 className="text-sm font-medium uppercase tracking-widest">Order Summary</h2>
              <div className="mt-6">
                <OrderSummaryBody {...summaryProps} />
              </div>
              <div className="mt-6 flex justify-between border-t border-noire-border pt-3 text-base font-medium">
                <span>Total</span>
                <span className="text-accent-cyan">{formatPrice(total)}</span>
              </div>
              <Button size="lg" className="mt-8 w-full min-h-[44px]" onClick={handleCheckout}>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed mobile checkout bar */}
      <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-accent-cyan/30 bg-noire-charcoal/98 px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-noire-muted">Total</p>
            <p className="text-lg font-semibold text-accent-cyan">{formatPrice(total)}</p>
          </div>
          <Button size="lg" className="min-h-[44px] flex-1" onClick={handleCheckout}>
            Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove This Drip?"
        description={
          removeTarget
            ? `"${removeTarget.name}" is about to leave your cart. Sure you wanna ghost it, bhai?`
            : undefined
        }
        confirmLabel="Yeah, Remove It"
        cancelLabel="Keep It"
        variant="destructive"
        onConfirm={confirmRemove}
      />

      <Dialog open={couponSuccessOpen} onOpenChange={setCouponSuccessOpen}>
        <DialogContent className="border-accent-lime/40 shadow-[0_0_24px_rgba(57,255,20,0.2)]">
          <DialogHeader>
            <span className="sticker sticker-lime mb-2 w-fit">coupon slaps</span>
            <DialogTitle className="text-accent-lime">Code Applied — Full Send</DialogTitle>
            <DialogDescription>{couponSuccessMsg}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setCouponSuccessOpen(false)} className="w-full min-h-[44px]">
              Let&apos;s Go
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
