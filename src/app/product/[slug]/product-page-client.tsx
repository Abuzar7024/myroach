"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useProductReviews } from "@/hooks/use-coupons";
import { ProductDetails } from "@/components/product/product-details";
import { Button } from "@/components/ui/button";
import ProductLoading from "./loading";

interface ProductPageClientProps {
  slug: string;
}

export function ProductPageClient({ slug }: ProductPageClientProps) {
  const decodedSlug = decodeURIComponent(slug);
  const { product, loading } = useProduct(decodedSlug);
  const { products, loading: catalogLoading } = useProducts();
  const { reviews } = useProductReviews(product?.id ?? "");

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.categoryId === product.categoryId && p.isActive)
      .slice(0, 4);
  }, [product, products]);

  if (loading || catalogLoading) {
    return <ProductLoading />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="font-display text-2xl font-light">Product not found</h1>
        <p className="mt-3 text-sm text-noire-muted">
          This item may have been removed or the link is outdated.
        </p>
        <Button asChild className="mt-8">
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <ProductDetails
      product={product}
      relatedProducts={relatedProducts}
      reviews={reviews}
    />
  );
}
