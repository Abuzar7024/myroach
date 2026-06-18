"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { useOrderStore } from "@/store/order-store";
import { formatPrice } from "@/lib/format";

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const getOrderById = useOrderStore((s) => s.getOrderById);
  const hydrated = useOrderStore((s) => s.hydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hydrated) {
    return <PageLoader label="Loading order" />;
  }

  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <p className="text-noire-muted">Order not found.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const phone = order.customerPhone || order.shippingAddress.phone;
  const email = order.customerEmail || order.shippingAddress.email;

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 lg:py-32">
      <div className="text-center animate-success-pop">
        <CheckCircle className="mx-auto h-16 w-16 text-accent-cyan drop-shadow-[0_0_12px_rgba(0,240,255,0.5)]" />
        <h1 className="font-display mt-6 text-3xl font-light">Order Confirmed</h1>
        <p className="mt-2 text-sm text-noire-muted">
          Thank you — we&apos;ve received your order and will start processing it shortly.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <div className="flex gap-3">
          <Truck className="mt-0.5 h-5 w-5 shrink-0 text-accent-cyan" />
          <div>
            <p className="text-sm font-medium text-zinc-100">Track your shipment</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              {order.trackingNumber
                ? `Your tracking number is ${order.trackingNumber}. Use it on the courier website to follow your package.`
                : "We'll update your order status as it ships. Check Account → Orders anytime for live status and tracking details."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 cyber-card p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-noire-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-noire-muted">Order ID</p>
            <p className="mt-1 font-medium">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-noire-muted">Total</p>
            <p className="mt-1 text-lg font-medium text-accent-cyan">
              {formatPrice(order.total)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-800 p-4 text-sm">
          <p className="text-xs uppercase tracking-widest text-noire-muted">Deliver to</p>
          <p className="mt-2 font-medium">{order.shippingAddress.fullName}</p>
          {phone && <p className="text-noire-muted">Phone: {phone}</p>}
          {email && <p className="text-noire-muted">Email: {email}</p>}
          <p className="mt-1 text-noire-muted">
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-noire-cream">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex flex-1 justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-noire-muted">
                    {item.color} / {item.size} × {item.quantity}
                  </p>
                </div>
                <p>{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-noire-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-noire-muted">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-accent-cyan">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-noire-muted">Shipping</span>
            <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between pt-2 font-medium">
            <span>Total Paid</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {order.paymentMethod && (
          <p className="mt-4 text-xs text-noire-muted capitalize">
            Paid via {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/account/orders">
            <Package className="mr-2 h-4 w-4" />
            Track in My Orders
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
