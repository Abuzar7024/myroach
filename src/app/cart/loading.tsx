import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
      aria-busy="true"
      aria-label="Loading cart"
    >
      <Skeleton className="h-10 w-48" />
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4 pb-6">
              <Skeleton className="h-32 w-24 shrink-0 sm:h-40 sm:w-32" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
