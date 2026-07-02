"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/config";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
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
      <Shimmer className="aspect-[3/4] w-full border border-noire-border bg-noire-charcoal" />
      <Shimmer className="mt-3 h-3 w-16 bg-noire-charcoal" />
      <Shimmer className="mt-2 h-4 w-4/5 bg-noire-charcoal" />
      <Shimmer className="mt-2 h-4 w-1/3 bg-noire-charcoal" />
    </article>
  );
}

function formatCategory(slug?: string) {
  if (!slug) return null;
  return slug.replace(/-/g, " ");
}

export function ProductCard({ product, onQuickView, priority }: ProductCardProps) {
  const productHref = `/product/${encodeURIComponent(product.slug)}`;
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const outOfStock = product.stock === 0;
  const imageSrc = product.images[0] || PLACEHOLDER_PRODUCT_IMAGE;
  const isDataUrl = imageSrc.startsWith("data:");
  const fromAdmin = Boolean(product.images[0]);
  const categoryLabel = formatCategory(product.categorySlug);
  const hasSale = !outOfStock && Boolean(product.compareAtPrice);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: imageSrc,
      price: product.price,
      addedAt: new Date().toISOString(),
    });
    toast.success(isInWishlist ? "Removed from wishlist" : "Saved to wishlist");
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error("Out of stock");
      return;
    }
    const variant = product.variants[0];
    const sizes = variant?.sizes ?? [];
    // Don't silently add a default size — make the customer choose one first.
    if (sizes.length > 1) {
      if (onQuickView) {
        onQuickView(product);
      } else {
        toast.message("Pick your size", { description: "Choose a size on the product page." });
        router.push(productHref);
      }
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: imageSrc,
      price: product.price,
      quantity: 1,
      size: sizes[0] ?? "One Size",
      color: variant?.color ?? "Default",
      colorHex: variant?.colorHex ?? "#1a1a1a",
    });
    setCartDialogOpen(true);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <>
      <article className="group flex h-full flex-col">
        <div className="relative overflow-hidden border border-noire-border bg-noire-charcoal product-card-glow neon-border-hover">
          <Link href={productHref} className="block">
            <div className="relative aspect-[3/4] overflow-hidden bg-noire-black">
              {fromAdmin && !imageLoaded && (
                <Shimmer className="absolute inset-0 z-[1] bg-noire-charcoal" aria-hidden />
              )}
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                unoptimized={isDataUrl}
                className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
                  fromAdmin && !imageLoaded ? "opacity-0" : "opacity-100"
                }`}
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={priority}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noire-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </Link>

          <div className="pointer-events-none absolute left-2.5 top-2.5 z-[2] flex flex-col gap-1.5 sm:left-3 sm:top-3">
            {outOfStock && (
              <span className="border border-noire-border bg-noire-black/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-noire-muted backdrop-blur-sm">
                Sold out
              </span>
            )}
            {hasSale && (
              <span className="border border-accent-pink/60 bg-accent-pink/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-noire-white">
                Sale
              </span>
            )}
            {!outOfStock && product.isNewArrival && !hasSale && (
              <span className="border border-accent-cyan/50 bg-noire-black/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-cyan backdrop-blur-sm">
                New
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-2.5 top-2.5 z-[3] flex h-9 w-9 items-center justify-center border border-noire-border bg-noire-black/80 text-noire-muted backdrop-blur-sm transition-colors hover:border-accent-pink/60 hover:text-accent-pink sm:right-3 sm:top-3"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-accent-pink text-accent-pink" : ""}`} />
          </button>

          <div className="absolute inset-x-0 bottom-0 z-[3] flex translate-y-full gap-2 p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-lg:hidden">
            {onQuickView && (
              <button
                type="button"
                onClick={handleQuickView}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 border border-noire-border bg-noire-black/95 text-[11px] font-semibold uppercase tracking-wider text-noire-white transition-colors hover:border-accent-cyan hover:text-accent-cyan"
              >
                <Eye className="h-3.5 w-3.5" />
                Quick view
              </button>
            )}
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={outOfStock}
              className={`flex h-10 items-center justify-center gap-1.5 border border-accent-cyan bg-accent-cyan text-[11px] font-semibold uppercase tracking-wider text-noire-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${
                onQuickView ? "flex-1" : "w-full"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add to cart
            </button>
          </div>
        </div>

        <Link href={productHref} className="mt-3 flex flex-1 flex-col">
          {categoryLabel && (
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-noire-muted">
              {categoryLabel}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-noire-white transition-colors group-hover:text-accent-cyan">
            {product.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-accent-cyan">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-noire-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={outOfStock}
          className="mt-3 flex w-full items-center justify-center gap-2 border border-noire-border py-2.5 text-[11px] font-semibold uppercase tracking-wider text-noire-white transition-colors hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {outOfStock ? "Sold out" : "Add to cart"}
        </button>
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
