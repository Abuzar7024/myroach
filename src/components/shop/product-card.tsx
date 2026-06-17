"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/config";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AddToCartDialog } from "@/components/shop/add-to-cart-dialog";
import { Shimmer } from "@/components/ui/shimmer";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

export function ProductCardSkeleton() {
  return (
    <article className="flex h-full flex-col">
      <Shimmer className="aspect-[3/4] w-full bg-noire-charcoal" />
      <Shimmer className="mt-4 h-4 w-3/4 bg-noire-charcoal" />
      <Shimmer className="mt-2 h-4 w-1/3 bg-noire-charcoal" />
    </article>
  );
}

export function ProductCard({ product, onQuickView, priority }: ProductCardProps) {
  const { requireAuth } = useRequireAuth();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const outOfStock = product.stock === 0;
  const imageSrc = product.images[0] || PLACEHOLDER_PRODUCT_IMAGE;
  const displayPrice = product.price;
  const fromAdmin = Boolean(product.images[0]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      toggleWishlist({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: imageSrc,
        price: product.price,
        addedAt: new Date().toISOString(),
      });
      toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist — saved for later, bhai");
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) {
      toast.error("Out of stock, bhai");
      return;
    }
    requireAuth(() => {
      const variant = product.variants[0];
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: imageSrc,
        price: displayPrice,
        quantity: 1,
        size: variant?.sizes[0] ?? "M",
        color: variant?.color ?? "Default",
        colorHex: variant?.colorHex ?? "#1a1a1a",
      });
      setCartDialogOpen(true);
    });
  };

  return (
    <>
      <article className="group flex h-full flex-col">
        <Link href={`/product/${product.slug}`} className="block flex-1">
          <div className="product-card-glow relative aspect-[3/4] overflow-hidden border border-noire-border bg-noire-charcoal neon-border-hover">
            {fromAdmin && !imageLoaded && (
              <Shimmer className="absolute inset-0 z-[1] bg-noire-charcoal" aria-hidden />
            )}
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className={`object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.02] group-hover:opacity-90 ${
                fromAdmin && !imageLoaded ? "opacity-0" : "opacity-100"
              }`}
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              onLoad={() => setImageLoaded(true)}
            />
            {outOfStock && (
              <span className="sticker absolute left-3 top-3 z-[2] bg-noire-muted text-noire-black">
                Out of stock
              </span>
            )}
            {!outOfStock && product.compareAtPrice && (
              <span className="sticker sticker-pink absolute left-3 top-3 z-[2]">Sale</span>
            )}
            {product.isNewArrival && !product.compareAtPrice && !outOfStock && (
              <span className="sticker sticker-lime absolute left-3 top-3 z-[2]">New</span>
            )}
            <div className="absolute inset-x-0 bottom-0 z-[2] flex gap-2 p-3 lg:translate-y-full lg:opacity-0 lg:transition-transform lg:duration-200 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 max-lg:opacity-100">
              <button
                onClick={handleQuickAdd}
                disabled={outOfStock}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 border border-accent-lime bg-noire-charcoal/95 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-lime active:bg-accent-lime active:text-noire-black disabled:opacity-50 lg:text-[10px] lg:hover:bg-accent-lime lg:hover:text-noire-black"
              >
                <ShoppingBag className="h-4 w-4 lg:h-3 lg:w-3" />
                Quick Add
              </button>
              {onQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onQuickView(product);
                  }}
                  className="hidden min-h-[44px] flex-1 border border-accent-cyan bg-noire-charcoal/95 py-2.5 text-[10px] font-bold uppercase tracking-widest text-accent-cyan active:bg-accent-cyan active:text-noire-black sm:flex lg:hover:bg-accent-cyan lg:hover:text-noire-black"
                >
                  Quick View
                </button>
              )}
              <button
                onClick={handleWishlist}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center border border-noire-border bg-noire-charcoal/95 active:border-accent-pink active:text-accent-pink"
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? "fill-accent-pink text-accent-pink" : ""}`} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex min-h-[3.75rem] flex-col justify-end space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold tracking-wide transition-colors group-hover:text-accent-cyan">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-accent-cyan">{formatPrice(displayPrice)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-noire-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>

      <AddToCartDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        productName={product.name}
        productImage={imageSrc}
        price={product.price}
      />
    </>
  );
}
