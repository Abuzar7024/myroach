import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-32" aria-busy="true" aria-label="Loading">
      <Skeleton className="mx-auto h-10 w-40" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
