"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <span className="text-4xl" aria-hidden="true">🪳</span>
      <h1 className="font-display mt-6 text-2xl">Checkout hit a wall</h1>
      <p className="mt-3 text-sm text-noire-muted">
        Payment tunnel glitched. Your cart is safe — try again or head back to shop.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button asChild variant="outline">
          <Link href="/cart">View Cart</Link>
        </Button>
      </div>
    </div>
  );
}
