import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <div className="flex gap-2 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10" />
            ))}
          </div>
          <Skeleton className="mt-6 h-12 w-full max-w-xs" />
        </div>
      </div>
    </div>
  );
}
