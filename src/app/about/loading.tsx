import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading about page">
      <Skeleton className="h-[60vh] w-full" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
    </div>
  );
}
