import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="pt-16 lg:pt-20" aria-busy="true" aria-label="Loading account">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <Skeleton className="h-10 w-64" />
        <div className="mt-12 grid gap-12 lg:grid-cols-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="space-y-4 lg:col-span-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
