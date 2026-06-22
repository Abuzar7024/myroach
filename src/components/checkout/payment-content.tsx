"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, Smartphone, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartStore } from "@/store/cart-store";
import { useOrderStore } from "@/store/order-store";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/hooks/use-settings";
import { formatPrice } from "@/lib/format";
import { loadRazorpayCheckout } from "@/lib/razorpay/checkout";
import type { PaymentMethod } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

const paymentOptions: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: "upi",
    label: "UPI",
    description: "GPay, PhonePe, Paytm — powered by Razorpay",
    icon: Smartphone,
  },
  {
    id: "card",
    label: "Debit / Credit Card",
    description: "Visa, Mastercard, RuPay — powered by Razorpay",
    icon: CreditCard,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your drip arrives",
    icon: Banknote,
  },
];

export function PaymentContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSettings();
  const storeName = settings.storeName || SITE_NAME;
  const {
    items,
    checkoutShipping,
    getSubtotal,
    getShippingCost,
    getTotal,
    discount,
    couponCode,
    clearCart,
  } = useCartStore();
  const createOrder = useOrderStore((s) => s.createOrder);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [loading, setLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const shipping = getShippingCost();
  const subtotal = getSubtotal();
  const total = getTotal();

  if (items.length === 0 || !checkoutShipping) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <p className="text-noire-muted">
          {!checkoutShipping
            ? "Please complete shipping details first."
            : "Your cart is empty."}
        </p>
        <Button asChild className="mt-6">
          <Link href={checkoutShipping ? "/checkout" : "/shop"}>
            {checkoutShipping ? "Back to Checkout" : "Continue Shopping"}
          </Link>
        </Button>
      </div>
    );
  }

  const buildOrderInput = (extras?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paymentStatus?: "pending" | "paid";
  }) => ({
    userId: user?.id,
    customerEmail: checkoutShipping.email,
    customerPhone: checkoutShipping.phone,
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),
    subtotal,
    shipping,
    discount,
    total,
    couponCode: couponCode || undefined,
    shippingAddress: {
      id: "addr-checkout",
      label: "Shipping",
      fullName: `${checkoutShipping.firstName} ${checkoutShipping.lastName}`,
      street: checkoutShipping.street,
      city: checkoutShipping.city,
      state: checkoutShipping.state,
      postalCode: checkoutShipping.postalCode,
      country: checkoutShipping.country,
      isDefault: false,
      phone: checkoutShipping.phone,
      email: checkoutShipping.email,
    },
    paymentMethod: method,
    ...extras,
  });

  const processCodOrder = async () => {
    const order = await createOrder(
      buildOrderInput({ paymentStatus: "pending" })
    );
    clearCart();
    toast.success("Order placed — pay on delivery!");
    router.push(`/checkout/success?orderId=${order.id}`);
  };

  const processRazorpayPayment = async () => {
    const createRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: total,
        receipt: `order_${Date.now()}`,
        customerEmail: checkoutShipping.email,
        customerPhone: checkoutShipping.phone,
        customerName: `${checkoutShipping.firstName} ${checkoutShipping.lastName}`,
        notes: {
          userId: user?.id || "guest",
          paymentMethod: method,
        },
      }),
    });

    if (!createRes.ok) {
      const err = (await createRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || "Could not start Razorpay checkout");
    }

    const { orderId, keyId, amount } = (await createRes.json()) as {
      orderId: string;
      keyId: string;
      amount: number;
    };

    const loaded = await loadRazorpayCheckout();
    if (!loaded || !window.Razorpay) {
      throw new Error("Razorpay checkout could not be loaded");
    }

    await new Promise<void>((resolve, reject) => {
      const checkout = new window.Razorpay!({
        key: keyId,
        amount,
        currency: "INR",
        name: storeName,
        description: "Order payment",
        order_id: orderId,
        prefill: {
          name: `${checkoutShipping.firstName} ${checkoutShipping.lastName}`,
          email: checkoutShipping.email,
          contact: checkoutShipping.phone,
        },
        theme: { color: "#00f0ff" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount: total,
                customerEmail: checkoutShipping.email,
                customerPhone: checkoutShipping.phone,
                customerName: `${checkoutShipping.firstName} ${checkoutShipping.lastName}`,
                paymentMethod: method,
              }),
            });

            if (!verifyRes.ok) {
              const err = (await verifyRes.json().catch(() => ({}))) as { error?: string };
              throw new Error(err.error || "Payment verification failed");
            }

            const order = await createOrder(
              buildOrderInput({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                paymentStatus: "paid",
              })
            );

            clearCart();
            toast.success("Payment successful — full send confirmed!");
            router.push(`/checkout/success?orderId=${order.id}`);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            reject(new Error("Payment cancelled"));
          },
        },
      });

      checkout.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
        reject(new Error("Payment failed"));
      });

      checkout.open();
    });
  };

  const processPayment = async () => {
    setLoading(true);
    setReviewOpen(false);

    try {
      if (method === "cod") {
        await processCodOrder();
        return;
      }

      await processRazorpayPayment();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      if (message !== "Payment cancelled") {
        toast.error(message);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
        <h1 className="font-display mb-4 text-3xl font-light tracking-wide">Payment</h1>
        <p className="mb-12 text-sm text-noire-muted">
          Secure checkout powered by Razorpay Live
        </p>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-widest">Select Method</h2>
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMethod(option.id)}
                  className={cn(
                    "flex w-full items-center gap-4 border p-4 text-left transition-[border-color,box-shadow] duration-200",
                    method === option.id
                      ? "border-accent-cyan bg-noire-charcoal shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                      : "border-noire-border hover:border-accent-cyan/40"
                  )}
                >
                  <Icon className="h-5 w-5 text-accent-cyan" />
                  <div>
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-noire-muted">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="h-fit cyber-card p-6 lg:p-8">
            <h2 className="text-sm font-medium uppercase tracking-widest">Order Total</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-noire-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent-cyan">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-noire-muted">Shipping</span>
                <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-noire-border pt-3 text-lg font-medium">
                <span>Total</span>
                <span className="text-accent-cyan">{formatPrice(total)}</span>
              </div>
            </div>
            <Button
              size="lg"
              className="mt-8 w-full"
              loading={loading}
              onClick={() => setReviewOpen(true)}
            >
              Review & Pay
            </Button>
            <Button asChild variant="ghost" className="mt-3 w-full">
              <Link href="/checkout">Back to Shipping</Link>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-accent-cyan/30 shadow-[0_0_32px_rgba(0,240,255,0.15)] max-sm:fixed max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none">
          <DialogHeader>
            <span className="sticker sticker-neon mb-2 w-fit">final check</span>
            <DialogTitle className="text-accent-cyan">Review Order — Full Send?</DialogTitle>
            <DialogDescription>
              Double-check your drip before we lock it in. No take-backs once you pay, bhai.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-48 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                <div className="relative h-14 w-11 shrink-0 overflow-hidden border border-noire-border">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="44px" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-xs text-noire-muted">
                    {item.color} / {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm text-accent-cyan">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t border-noire-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-noire-muted">Ship to</span>
              <span className="text-right text-xs">
                {checkoutShipping.firstName} {checkoutShipping.lastName}<br />
                {checkoutShipping.phone}<br />
                {checkoutShipping.street}, {checkoutShipping.city}, {checkoutShipping.state}{" "}
                {checkoutShipping.postalCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-noire-muted">Payment</span>
              <span className="capitalize">
                {method === "cod"
                  ? "Cash on Delivery"
                  : method === "upi"
                    ? "UPI (Razorpay)"
                    : "Card (Razorpay)"}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-base font-medium">
              <span>Total</span>
              <span className="text-accent-lime">{formatPrice(total)}</span>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button size="lg" className="w-full" loading={loading} onClick={processPayment}>
              Confirm & Pay — Full Send
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => setReviewOpen(false)}>
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
