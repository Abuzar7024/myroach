"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export function WishlistContent() {
  const { items, removeItem, clearAll } = useWishlistStore();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const handleClearAll = () => {
    clearAll();
    toast.success("Wishlist cleared — fresh slate, bhai");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <Heart className="mx-auto h-16 w-16 text-noire-border" />
        <h1 className="font-display mt-6 text-2xl font-light">Wishlist&apos;s Lonely, Bhai</h1>
        <p className="mt-2 max-w-md mx-auto text-sm text-noire-muted">
          No saved drip yet. Heart some heat while you browse — the rotation keeps tabs on the good stuff.
        </p>
        <span className="sticker sticker-pink mx-auto mt-6 inline-block">save the fits</span>
        <Button asChild className="mt-6"><Link href="/shop">Browse the Drop</Link></Button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-light">Wishlist</h1>
          <Button variant="outline" size="sm" onClick={() => setClearConfirmOpen(true)}>
            Clear All
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.productId} className="group">
              <Link href={`/product/${item.slug}`} className="relative block aspect-[3/4] overflow-hidden border border-noire-border bg-noire-black product-card-glow neon-border-hover">
                <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" sizes="300px" />
              </Link>
              <div className="mt-3 flex items-start justify-between">
                <div>
                  <Link href={`/product/${item.slug}`} className="text-sm font-medium hover:text-accent-cyan">
                    {item.name}
                  </Link>
                  <p className="text-sm text-accent-cyan">{formatPrice(item.price)}</p>
                </div>
                <button onClick={() => removeItem(item.productId)} aria-label="Remove">
                  <Trash2 className="h-4 w-4 text-noire-muted hover:text-accent-pink" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Clear the Whole Wishlist?"
        description="All saved drip gets wiped. You sure you wanna ghost everything, bhai?"
        confirmLabel="Yeah, Clear It"
        cancelLabel="Keep My Fits"
        variant="destructive"
        onConfirm={handleClearAll}
      />
    </>
  );
}
