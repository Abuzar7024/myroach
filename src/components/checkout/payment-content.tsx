"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentProcessingOverlay } from "@/components/checkout/payment-processing-overlay";
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
];

function goToPaymentFailed(
  router: ReturnType<typeof useRouter>,
  reason: string,
  paymentId?: string
) {
  const params = new URLSearchParams({ reason });
  if (paymentId) params.set("paymentId", paymentId);
  router.push(`/checkout/failed?${params.toString()}`);
}

export function PaymentContent() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
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
  const registerOrder = useOrderStore((s) => s.registerOrder);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("Processing your payment…");
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

  const customerName = `${checkoutShipping.firstName} ${checkoutShipping.lastName}`;

  const shippingAddressForAdmin = {
    name: customerName,
    email: checkoutShipping.email,
    phone: checkoutShipping.phone,
    address: checkoutShipping.street,
    city: checkoutShipping.city,
    state: checkoutShipping.state,
    zip: checkoutShipping.postalCode,
    country: checkoutShipping.country || "India",
  };

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
      fullName: customerName,
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

  const processRazorpayPayment = async () => {
    const idToken = firebaseUser ? await firebaseUser.getIdToken() : "";
    if (!idToken) {
      throw new Error("Please sign in again to complete your payment.");
    }

    // Send only what we want to buy — the server re-prices it authoritatively.
    const serverItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const createRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        items: serverItems,
        couponCode: couponCode || undefined,
        customerEmail: checkoutShipping.email,
        customerPhone: checkoutShipping.phone,
        customerName,
        notes: { paymentMethod: method },
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
          name: customerName,
          email: checkoutShipping.email,
          contact: checkoutShipping.phone,
        },
        theme: { color: "#00f0ff" },
        handler: async (response) => {
          try {
            setLoading(false);
            setReviewOpen(false);
            setProcessingLabel("Verifying payment and creating your order…");
            setProcessing(true);

            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                items: serverItems,
                couponCode: couponCode || undefined,
                customerName,
                customerEmail: checkoutShipping.email,
                customerPhone: checkoutShipping.phone,
                paymentMethod: method,
                shippingAddress: shippingAddressForAdmin,
              }),
            });

            const verifyData = (await verifyRes.json().catch(() => ({}))) as {
              error?: string;
              orderId?: string;
              orderNumber?: string;
              orderCreatedInAdmin?: boolean;
            };

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            let orderIdForSuccess: string;

            if (
              verifyData.orderCreatedInAdmin &&
              verifyData.orderId &&
              verifyData.orderNumber
            ) {
              const order = registerOrder({
                ...buildOrderInput({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  paymentStatus: "paid",
                }),
                id: verifyData.orderId,
                orderNumber: verifyData.orderNumber,
              });
              orderIdForSuccess = order.id;
            } else {
              const order = await createOrder(
                buildOrderInput({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  paymentStatus: "paid",
                })
              );
              orderIdForSuccess = order.id;
              if (!verifyData.orderCreatedInAdmin) {
                toast.warning(
                  "Payment received. If the order is missing in admin, check Firebase service account config.",
                  { duration: 8000 }
                );
              }
            }

            clearCart();
            setProcessing(false);
            toast.success("Payment successful — full send confirmed!");
            router.push(`/checkout/success?orderId=${orderIdForSuccess}`);
            resolve();
          } catch (error) {
            setProcessing(false);
            const message =
              error instanceof Error ? error.message : "Payment verification failed";
            goToPaymentFailed(router, message, response.razorpay_payment_id);
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setProcessing(false);
            goToPaymentFailed(router, "Payment was cancelled before completion.");
            reject(new Error("Payment cancelled"));
          },
        },
      });

      checkout.on("payment.failed", (response: unknown) => {
        setLoading(false);
        setProcessing(false);
        const failed = response as { error?: { description?: string; reason?: string } };
        const reason =
          failed?.error?.description ||
          failed?.error?.reason ||
          "Your bank or UPI app declined the payment.";
        goToPaymentFailed(router, reason);
        reject(new Error("Payment failed"));
      });

      checkout.open();
    });
  };

  const processPayment = async () => {
    setLoading(true);
    setReviewOpen(false);

    try {
      await processRazorpayPayment();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      if (message !== "Payment cancelled" && message !== "Payment failed") {
        toast.error(message);
        goToPaymentFailed(router, message);
      }
      setLoading(false);
      setProcessing(false);
    }
  };

  return (
    <>
      {processing && <PaymentProcessingOverlay label={processingLabel} />}

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
        <h1 className="font-display mb-4 text-3xl font-light tracking-wide">Payment</h1>
        <p className="mb-12 text-sm text-noire-muted">
          Secure checkout powered by Razorpay
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
                {method === "upi" ? "UPI (Razorpay)" : "Card (Razorpay)"}
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
