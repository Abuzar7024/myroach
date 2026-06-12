import { Skeleton } from "@/components/ui/skeleton";

export default function LegalLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-32" aria-busy="true">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-8 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
    </div>
  );
}
