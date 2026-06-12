import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/product-details";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from "@/lib/firebase/services/products";
import { fetchReviewsByProductId } from "@/lib/firebase/services/reviews";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await fetchProductBySlug(slug);
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
  const { product } = await fetchProductBySlug(slug);

  if (!product) notFound();

  const [relatedProducts, { data: reviews }] = await Promise.all([
    fetchRelatedProducts(product.id, product.categorySlug),
    fetchReviewsByProductId(product.id),
  ]);

  return (
    <ProductDetails
      product={product}
      relatedProducts={relatedProducts}
      reviews={reviews}
    />
  );
}
