import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/product-details";
import {
  fetchProductBySlugOnce,
  fetchRelatedProductsOnce,
  fetchReviewsOnce,
} from "@/lib/firebase/services/product.service";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlugOnce(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlugOnce(slug);

  if (!product) notFound();

  const [relatedProducts, reviews] = await Promise.all([
    fetchRelatedProductsOnce(product.id, product.categoryId),
    fetchReviewsOnce(product.id),
  ]);

  return (
    <ProductDetails
      product={product}
      relatedProducts={relatedProducts}
      reviews={reviews}
    />
  );
}
