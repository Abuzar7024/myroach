"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Heart, Minus, Plus, Star, Truck, RotateCcw } from "lucide-react";
import type { Product, Review } from "@/types";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { FadeIn } from "@/components/ui/motion";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

interface ProductClientProps {
  product: Product;
  reviews: Review[];
  related: Product[];
}

export function ProductClient({ product, reviews, related }: ProductClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedSize, setSelectedSize] = useState(product.variants[0].sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } =
    useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedVariant.color,
      colorHex: selectedVariant.colorHex,
    });
    toast.success("Added to cart");
  };

  const toggleWishlist = () => {
    if (inWishlist) {
      removeWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addWishlist({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        price: product.price,
        addedAt: new Date().toISOString(),
      });
      toast.success("Added to wishlist");
    }
  };

  return (
    <div className="pt-16 lg:pt-20">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Gallery */}
          <FadeIn direction="left">
            <div className="space-y-4">
              <div
                className="relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-border/20"
                onClick={() => setZoomed(!zoomed)}
              >
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform duration-500 ${
                    zoomed ? "scale-150" : "scale-100"
                  }`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`relative h-20 w-16 overflow-hidden border-2 transition-colors ${
                        selectedImage === i
                          ? "border-foreground"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`View ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Info */}
          <FadeIn direction="right" delay={0.1}>
            <div className="lg:pt-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {product.categorySlug}
              </p>
              <h1 className="font-display mt-2 text-4xl font-light tracking-tight lg:text-5xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(product.rating)
                          ? "fill-accent text-accent"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-2xl">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="mt-6 leading-relaxed text-muted">
                {product.description}
              </p>

              {/* Color */}
              <div className="mt-8">
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  Color — {selectedVariant.color}
                </p>
                <div className="flex gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.color}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        setSelectedSize(v.sizes[0]);
                      }}
                      className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        selectedVariant.color === v.color
                          ? "border-foreground"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: v.colorHex }}
                      aria-label={v.color}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mt-6">
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] border px-4 py-2.5 text-xs transition-colors ${
                        selectedSize === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  Quantity
                </p>
                <div className="flex items-center border border-border w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-11 w-11 items-center justify-center hover:bg-foreground/5"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-11 w-12 items-center justify-center text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-11 w-11 items-center justify-center hover:bg-foreground/5"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleAddToCart} size="lg" className="flex-1">
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleWishlist}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`h-4 w-4 ${inWishlist ? "fill-foreground" : ""}`}
                  />
                </Button>
              </div>

              {/* Shipping info */}
              <div className="mt-10 space-y-3 border-t border-border pt-8">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Truck className="h-4 w-4 shrink-0" />
                  <span>Complimentary shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>Free returns within 30 days</span>
                </div>
                {product.material && (
                  <p className="text-sm text-muted-foreground">
                    Material: {product.material}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-24 border-t border-border pt-16">
            <h2 className="font-display mb-10 text-3xl font-light">
              Customer Reviews
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <div key={review.id} className="border border-border p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-accent text-accent"
                      />
                    ))}
                  </div>
                  <h4 className="text-sm font-medium">{review.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {review.comment}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {review.userName}
                    {review.isVerified && " · Verified Purchase"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-border pt-16">
            <h2 className="font-display mb-10 text-3xl font-light">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
