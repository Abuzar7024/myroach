import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div aria-busy="true" aria-label="Loading home">
      <Skeleton className="h-[70vh] w-full" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <Skeleton className="mx-auto h-10 w-64" />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </div>
    </div>
  );
}
