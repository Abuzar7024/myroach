import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32" aria-busy="true" aria-label="Loading contact">
      <Skeleton className="mx-auto h-10 w-48" />
      <Skeleton className="mx-auto mt-4 h-4 w-64" />
      <div className="mt-12 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
