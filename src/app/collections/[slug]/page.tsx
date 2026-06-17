import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ShopContent } from "@/components/shop/shop-content";
import { fetchCategoryBySlug } from "@/lib/firebase/services/category.service";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { title: "Collection Not Found" };
  return { title: category.name, description: category.description };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-32">
          <Skeleton className="mx-auto h-10 w-64" />
        </div>
      }
    >
      <ShopContent initialCategory={slug} categoryName={category.name} categoryImage={category.image} />
    </Suspense>
  );
}
