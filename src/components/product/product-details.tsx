"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Package,
  Share2,
  ChevronRight,
} from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/shop/product-card";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";
import { AddToCartDialog } from "@/components/shop/add-to-cart-dialog";
import { BottomIsland } from "@/components/ui/bottom-island";
import { formatPrice } from "@/lib/format";
import { DEFAULT_MIN_ORDER_QTY, DEFAULT_MAX_ORDER_QTY } from "@/lib/constants";
import { getFreeShippingThreshold } from "@/lib/pricing-settings";
import { getStorePolicy } from "@/lib/policies";
import { useSettings } from "@/hooks/use-settings";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
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
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const defaultVariant = product.variants[0] ?? {
    color: "Default",
    colorHex: "#27272a",
    sizes: ["M"],
    stock: {},
  };

  const { settings } = useSettings();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(defaultVariant.color);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const touchStartX = useRef(0);

  const variant =
    product.variants.find((v) => v.color === selectedColor) ?? defaultVariant;
  const outOfStock = product.stock === 0;
  const minQty = product.minOrderQty ?? DEFAULT_MIN_ORDER_QTY;
  const maxQty = Math.min(product.maxOrderQty ?? DEFAULT_MAX_ORDER_QTY, product.stock || DEFAULT_MAX_ORDER_QTY);
  const returnLabel = product.returnPolicy || getStorePolicy(settings, "returnPolicy");
  const freeShippingThreshold = getFreeShippingThreshold();
  const hasFreeShippingOffer = Number.isFinite(freeShippingThreshold);
  const storeReturnPolicy = getStorePolicy(settings, "returnPolicy");
  const showShippingTab = Boolean(
    storeReturnPolicy ||
      hasFreeShippingOffer ||
      settings.shippingCharge != null
  );
  const hasMultipleSizes = variant.sizes.length > 1;
  const showColorPicker = product.variants.length > 1 || (product.variants[0]?.color !== "Default");
  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  const goToImage = useCallback(
    (index: number) => {
      if (index >= 0 && index < product.images.length) setSelectedImage(index);
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

  const handleAddToCart = async () => {
    if (outOfStock) {
      toast.error("This item is out of stock");
      return;
    }
    const size = selectedSize || variant.sizes[0];
    if (hasMultipleSizes && !selectedSize) {
      toast.error("Pick a size first, bhai");
      return;
    }
    setAdding(true);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[selectedImage] ?? product.images[0],
      price: product.price,
      quantity: Math.min(Math.max(quantity, minQty), maxQty),
      size,
      color: selectedColor,
      colorHex: variant.colorHex,
      minOrderQty: minQty,
      maxOrderQty: maxQty,
    });
    await new Promise((r) => setTimeout(r, 350));
    setAdding(false);
    setCartDialogOpen(true);
  };

  const handleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      addedAt: new Date().toISOString(),
    });
    toast.success(isInWishlist ? "Removed from wishlist" : "Saved to wishlist");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:py-12 lg:px-8 lg:py-16 lg:pb-20">
        <nav className="mb-8 flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-300">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-zinc-300">
            Shop
          </Link>
          {product.categorySlug && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/collections/${product.categorySlug}`}
                className="hover:text-zinc-300 capitalize"
              >
                {product.categorySlug.replace(/-/g, " ")}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-400">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800"
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <Image
                src={product.images[selectedImage] ?? product.images[0]}
                alt={product.name}
                fill
                unoptimized={product.images[selectedImage]?.startsWith("data:")}
                className={`cursor-zoom-in object-cover transition-transform duration-500 ${
                  isZoomed ? "scale-150" : "scale-100"
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 lg:hidden">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToImage(i);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        selectedImage === i ? "w-6 bg-white" : "w-1.5 bg-white/40"
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition-all ${
                      selectedImage === i ? "ring-zinc-300" : "ring-transparent hover:ring-zinc-600"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized={img.startsWith("data:")}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              {product.isFeatured && (
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-300">
                  Featured
                </span>
              )}
              {product.isNewArrival && (
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-300">
                  New
                </span>
              )}
              {outOfStock ? (
                <span className="rounded-full bg-rose-950 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-rose-300">
                  Sold out
                </span>
              ) : (
                <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                  In stock
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-3xl font-light tracking-tight text-zinc-50 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500">
                {product.rating > 0 ? product.rating : "—"} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-medium text-zinc-50">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-zinc-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  {discountPct != null && (
                    <span className="rounded-md bg-rose-950 px-2 py-0.5 text-xs font-medium text-rose-300">
                      {discountPct}% off
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-zinc-400">
              {product.shortDescription || product.description}
            </p>

            <div className="mt-8 space-y-6 border-t border-zinc-800 pt-8">
              {showColorPicker && (
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Color — {selectedColor}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(v.color);
                          setSelectedSize("");
                        }}
                        className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-zinc-950 transition-all ${
                          selectedColor === v.color ? "ring-zinc-300" : "ring-transparent hover:ring-zinc-600"
                        }`}
                        style={{ backgroundColor: v.colorHex }}
                        aria-label={v.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Size</p>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    <Ruler className="h-3 w-3" />
                    Size guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variant.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        selectedSize === size
                          ? "border-zinc-200 bg-zinc-100 text-zinc-900"
                          : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Quantity
                </p>
                <div className="inline-flex items-center rounded-lg border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                    className="flex h-11 w-11 items-center justify-center text-zinc-400 hover:text-zinc-200"
                    aria-label="Decrease quantity"
                    disabled={quantity <= minQty}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-11 w-12 items-center justify-center text-sm text-zinc-200">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    className="flex h-11 w-11 items-center justify-center text-zinc-400 hover:text-zinc-200"
                    aria-label="Increase quantity"
                    disabled={quantity >= maxQty}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Order {minQty}–{maxQty} per checkout
                </p>
              </div>
            </div>

            <div className="mt-8 hidden gap-3 lg:flex">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="min-h-12 flex-1 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100"
                loading={adding}
                disabled={outOfStock}
              >
                {outOfStock ? "Sold out" : "Add to cart"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-h-12 min-w-12 rounded-xl border-zinc-700"
                onClick={handleWishlist}
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`h-4 w-4 ${isInWishlist ? "fill-rose-400 text-rose-400" : ""}`}
                />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-h-12 min-w-12 rounded-xl border-zinc-700"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {(hasFreeShippingOffer || returnLabel) && (
            <div className="mt-8 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-3">
              {hasFreeShippingOffer && (
                <div className="flex items-start gap-3 text-sm text-zinc-400">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
                  <span>Free shipping over {formatPrice(freeShippingThreshold)}</span>
                </div>
              )}
              {returnLabel && (
                <div className="flex items-start gap-3 text-sm text-zinc-400">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
                  <span>{returnLabel}</span>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm text-zinc-400">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
                <span>Secure checkout</span>
              </div>
            </div>
            )}

            {product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/shop?search=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="description" className="mt-16 lg:mt-24">
          <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b border-zinc-800 bg-transparent p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-zinc-200 data-[state=active]:bg-transparent"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-zinc-200 data-[state=active]:bg-transparent"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-zinc-200 data-[state=active]:bg-transparent"
            >
              Reviews ({reviews.length})
            </TabsTrigger>
            {showShippingTab && (
            <TabsTrigger
              value="shipping"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-zinc-200 data-[state=active]:bg-transparent"
            >
              Shipping
            </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="description" className="mt-8 max-w-3xl">
            <p className="text-sm leading-relaxed text-zinc-400">{product.description}</p>
          </TabsContent>

          <TabsContent value="details" className="mt-8 max-w-3xl">
            <dl className="grid gap-4 sm:grid-cols-2">
              {product.material && (
                <div className="rounded-lg border border-zinc-800 p-4">
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">Material</dt>
                  <dd className="mt-1 text-sm text-zinc-300">{product.material}</dd>
                </div>
              )}
              {product.careInstructions && (
                <div className="rounded-lg border border-zinc-800 p-4">
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">Care</dt>
                  <dd className="mt-1 text-sm text-zinc-300">{product.careInstructions}</dd>
                </div>
              )}
              {product.categorySlug && (
                <div className="rounded-lg border border-zinc-800 p-4">
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">Category</dt>
                  <dd className="mt-1 text-sm capitalize text-zinc-300">
                    {product.categorySlug.replace(/-/g, " ")}
                  </dd>
                </div>
              )}
            </dl>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-zinc-500">No reviews yet — be the first to share your experience.</p>
              ) : (
                reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">{review.userName}</span>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <p className="mt-2 text-sm font-medium text-zinc-300">{review.title}</p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{review.comment}</p>
                  </article>
                ))
              )}
            </div>
          </TabsContent>

          {showShippingTab && (
          <TabsContent value="shipping" className="mt-8 max-w-2xl">
            <div className="space-y-4 text-sm text-zinc-400">
              {hasFreeShippingOffer && settings.shippingCharge != null && settings.shippingCharge >= 0 && (
                <div className="flex gap-3 rounded-lg border border-zinc-800 p-4">
                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
                  <div>
                    <p className="font-medium text-zinc-300">Standard delivery</p>
                    <p className="mt-1">
                      {formatPrice(settings.shippingCharge)} — free on orders over{" "}
                      {formatPrice(freeShippingThreshold)}
                    </p>
                  </div>
                </div>
              )}
              {storeReturnPolicy && (
                <div className="whitespace-pre-wrap rounded-lg border border-zinc-800 p-4 leading-relaxed">
                  {storeReturnPolicy}
                </div>
              )}
            </div>
          </TabsContent>
          )}
        </Tabs>

        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-zinc-800 pt-16">
            <h2 className="font-display text-2xl font-light tracking-tight text-zinc-100">
              You may also like
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomIsland
        primary={product.name}
        secondary={formatPrice(product.price)}
        action={
          <Button
            onClick={handleAddToCart}
            className="h-10 min-h-10 rounded-full px-5 text-[11px] tracking-wider"
            loading={adding}
            disabled={outOfStock}
          >
            {outOfStock ? "Sold out" : "Add"}
          </Button>
        }
      />

      <AddToCartDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        productName={product.name}
        productImage={product.images[selectedImage] ?? product.images[0]}
        price={product.price}
        quantity={quantity}
      />
      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
    </>
  );
}
