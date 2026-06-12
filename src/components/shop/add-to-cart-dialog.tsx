"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productImage: string;
  price: number;
  quantity?: number;
}

export function AddToCartDialog({
  open,
  onOpenChange,
  productName,
  productImage,
  price,
  quantity = 1,
}: AddToCartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-accent-lime/40 shadow-[0_0_24px_rgba(57,255,20,0.2)] max-sm:fixed max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none">
        <DialogHeader>
          <DialogTitle className="text-accent-lime">Added to Cart — Full Send?</DialogTitle>
          <DialogDescription className="text-noire-muted">
            Your drip is locked in. Keep stacking or checkout now, bhai.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 rounded border border-noire-border bg-noire-black/50 p-4">
          <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-accent-cyan/30">
            <Image src={productImage} alt={productName} fill className="object-cover" sizes="64px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{productName}</p>
            <p className="text-sm text-accent-cyan">
              {formatPrice(price * quantity)}
              {quantity > 1 && <span className="text-noire-muted"> × {quantity}</span>}
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild size="lg" className="w-full">
            <Link href="/cart" onClick={() => onOpenChange(false)}>
              View Cart
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => onOpenChange(false)}>
            Continue Shopping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
