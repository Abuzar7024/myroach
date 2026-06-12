import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
      aria-busy="true"
      aria-label="Loading shop"
    >
      <div className="mb-12 text-center">
        <Skeleton className="mx-auto h-4 w-32" />
        <Skeleton className="mx-auto mt-4 h-10 w-64" />
        <Skeleton className="mx-auto mt-3 h-4 w-40" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
