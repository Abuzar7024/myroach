import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopContent } from "@/components/shop/shop-content";
import { Skeleton } from "@/components/ui/skeleton";

import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shop",
  description: `Shop ${SITE_NAME} streetwear — hoodies, tees, and certified heat.`,
};

function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-32">
      <Skeleton className="mx-auto h-10 w-64" />
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}
