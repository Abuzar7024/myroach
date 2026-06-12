"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Heart, Star, Truck, RotateCcw, Ruler } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/shop/product-card";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";
import { AddToCartDialog } from "@/components/shop/add-to-cart-dialog";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/constants";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { toast } from "sonner";

interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
  }>;
}

export function ProductDetails({ product, relatedProducts, reviews }: ProductDetailsProps) {
  const { requireAuth } = useRequireAuth();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.variants[0].color);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const variant = product.variants.find((v) => v.color === selectedColor)!;

  const goToImage = useCallback(
    (index: number) => {
      if (index >= 0 && index < product.images.length) {
        setSelectedImage(index);
      }
    },
    [product.images.length]
  );

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) goToImage(selectedImage + 1);
    else goToImage(selectedImage - 1);
  };

  const handleAddToCart = () => {
    requireAuth(async () => {
      setAdding(true);
      const size = selectedSize || variant.sizes[0];
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[selectedImage],
        price: product.price,
        quantity,
        size,
        color: selectedColor,
        colorHex: variant.colorHex,
      });
      await new Promise((r) => setTimeout(r, 400));
      setAdding(false);
      setCartDialogOpen(true);
    });
  };

  const handleWishlist = () => {
    requireAuth(() => {
      toggleWishlist({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        price: product.price,
        addedAt: new Date().toISOString(),
      });
      toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist — saved for later, bhai");
    });
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-16 lg:px-8 lg:py-32 lg:pb-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <div
              ref={galleryRef}
              className="relative aspect-[3/4] overflow-hidden border border-noire-border bg-noire-black neon-border-hover touch-pan-y"
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-500 ${
                  isZoomed ? "scale-150" : "scale-100"
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 lg:hidden">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToImage(i);
                      }}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        selectedImage === i ? "bg-accent-cyan" : "bg-noire-white/40"
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 hidden gap-3 sm:flex">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-16 min-h-[44px] min-w-[44px] overflow-hidden border-2 ${
                      selectedImage === i ? "border-accent-cyan shadow-[0_0_8px_rgba(0,240,255,0.3)]" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="animate-fade-in pb-4 lg:pb-0">
            <nav className="mb-4 text-xs text-noire-muted">
              <Link href="/shop" className="hover:text-accent-cyan">Shop</Link>
              <span className="mx-2">/</span>
              <span>{product.name}</span>
            </nav>

            <h1 className="font-display text-2xl font-light tracking-wide sm:text-3xl md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-xl text-accent-cyan">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-noire-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating)
                      ? "fill-accent-cyan text-accent-cyan"
                      : "text-noire-border"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-noire-muted">
                ({product.reviewCount} reviews)
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-noire-muted">
              {product.shortDescription}
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <p className="mb-3 text-xs uppercase tracking-widest text-noire-muted">Color — {selectedColor}</p>
                <div className="flex gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.color}
                      onClick={() => {
                        setSelectedColor(v.color);
                        setSelectedSize("");
                      }}
                      className={`h-9 w-9 rounded-full border-2 transition-all ${
                        selectedColor === v.color ? "border-accent-cyan scale-110" : "border-noire-border"
                      }`}
                      style={{ backgroundColor: v.colorHex }}
                      aria-label={v.color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-noire-muted">Size</p>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="flex items-center gap-1 text-xs text-accent-cyan transition-colors hover:text-accent-lime"
                  >
                    <Ruler className="h-3 w-3" />
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variant.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] border px-4 py-2.5 text-xs transition-all ${
                        selectedSize === size
                          ? "border-accent-cyan bg-accent-cyan text-noire-black"
                          : "border-noire-border hover:border-accent-cyan/60"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase tracking-widest text-noire-muted">Quantity</p>
                <div className="inline-flex items-center border border-noire-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-noire-charcoal"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-4 py-2 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-noire-charcoal"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 hidden gap-3 lg:flex">
              <Button onClick={handleAddToCart} size="lg" className="min-h-[44px] flex-1" loading={adding}>
                Add to Cart — Full Send
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-h-[44px] min-w-[44px]"
                onClick={handleWishlist}
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? "fill-accent-pink text-accent-pink" : ""}`} />
              </Button>
            </div>

            <div className="mt-8 space-y-3 border-t border-noire-border pt-8">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-accent-cyan" />
                <span>Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-4 w-4 text-accent-cyan" />
                <span>30-day complimentary returns</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="description" className="mt-20">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="max-w-2xl">
            <p className="text-sm leading-relaxed text-noire-muted">{product.description}</p>
            {product.material && (
              <p className="mt-4 text-sm"><strong>Material:</strong> {product.material}</p>
            )}
            {product.careInstructions && (
              <p className="mt-2 text-sm"><strong>Care:</strong> {product.careInstructions}</p>
            )}
          </TabsContent>
          <TabsContent value="reviews">
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-sm text-noire-muted">No reviews yet — be the first roach to drop one, bhai.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-noire-border pb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{review.userName}</span>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-accent-cyan text-accent-cyan" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-medium">{review.title}</p>
                    <p className="mt-2 text-sm text-noire-muted">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="max-w-2xl text-sm text-noire-muted">
            <p>
              Standard shipping: {SHIPPING_RATES[0].days} ({formatPrice(SHIPPING_RATES[0].price)}).
              Express: {SHIPPING_RATES[1].days} ({formatPrice(SHIPPING_RATES[1].price)}).
            </p>
            <p className="mt-4">Returns accepted within 30 days in original condition. Complimentary return shipping for exchanges.</p>
          </TabsContent>
        </Tabs>

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display mb-8 text-2xl font-light tracking-wide">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile add-to-cart bar */}
      <div
        className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-accent-cyan/30 bg-noire-charcoal/98 px-4 py-3 lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-base font-semibold text-accent-cyan">{formatPrice(product.price)}</p>
          </div>
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="min-h-[44px] shrink-0 px-6"
            loading={adding}
          >
            Add to Cart
          </Button>
        </div>
      </div>

      <AddToCartDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        productName={product.name}
        productImage={product.images[selectedImage]}
        price={product.price}
        quantity={quantity}
      />
      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
    </>
  );
}
