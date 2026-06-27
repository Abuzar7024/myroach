"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";

export function CheckoutFailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "Your payment could not be completed.";
  const paymentId = searchParams.get("paymentId");

  return (
    <FadeIn className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="cyber-card w-full p-10">
        <XCircle className="mx-auto h-14 w-14 text-accent-pink" />
        <h1 className="font-display mt-6 text-3xl text-accent-pink">Payment failed</h1>
        <p className="mt-4 text-sm leading-relaxed text-noire-muted">{reason}</p>
        {paymentId && (
          <p className="mt-3 font-mono text-xs text-noire-muted">Ref: {paymentId}</p>
        )}
        <p className="mt-4 text-xs text-noire-muted">
          No order was created. You can try again — your cart is still saved.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg" className="w-full gap-2">
            <Link href="/checkout/payment">
              <RefreshCw className="h-4 w-4" />
              Try payment again
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/cart">Back to cart</Link>
          </Button>
        </div>
      </div>
    </FadeIn>
  );
}
