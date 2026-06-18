"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { AddToCartDialog } from "@/components/shop/add-to-cart-dialog";

interface QuickViewModalProps {
  product: Product | null;
  open?: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [cartDialogOpen, setCartDialogOpen] = useState(false);

  if (!product) return null;

  const variant = product.variants.find((v) => v.color === selectedColor) || product.variants[0];
  const sizes = variant?.sizes || [];

  const handleAddToCart = () => {
    const color = selectedColor || product.variants[0].color;
    const size = selectedSize || product.variants[0].sizes[0];
    const colorVariant = product.variants.find((v) => v.color === color)!;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: 1,
      size,
      color,
      colorHex: colorVariant.colorHex,
    });
    onClose();
    setCartDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open ?? !!product} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-h-[100dvh] max-w-3xl overflow-y-auto border-accent-cyan/30 shadow-[0_0_32px_rgba(0,240,255,0.15)] sm:max-h-[90vh] max-sm:fixed max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none">
          <DialogHeader>
            <span className="sticker sticker-lime mb-2 w-fit text-[10px]">quick peep</span>
            <DialogTitle className="text-xl">{product.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative aspect-[3/4] overflow-hidden border border-accent-cyan/20 bg-noire-black">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                unoptimized={product.images[0]?.startsWith("data:")}
                className="object-cover"
                sizes="400px"
              />
            </div>
            <div className="space-y-4">
              <p className="text-xl font-medium text-accent-cyan">{formatPrice(product.price)}</p>
              <p className="text-sm leading-relaxed text-noire-muted">{product.shortDescription}</p>

              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-accent-lime">Color</p>
                <div className="flex gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.color}
                      onClick={() => setSelectedColor(v.color)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        (selectedColor || product.variants[0].color) === v.color
                          ? "border-accent-cyan scale-110 shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: v.colorHex }}
                      aria-label={v.color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-accent-lime">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] border px-3 py-2.5 text-xs transition-all ${
                        (selectedSize || sizes[0]) === size
                          ? "border-accent-cyan bg-accent-cyan text-noire-black shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                          : "border-noire-border hover:border-accent-cyan/60"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button onClick={handleAddToCart} className="flex-1">
                  Add to Cart — Full Send
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/product/${product.slug}`} onClick={onClose}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddToCartDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        productName={product.name}
        productImage={product.images[0]}
        price={product.price}
      />
    </>
  );
}
