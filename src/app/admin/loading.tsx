import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="ml-64 p-8" aria-busy="true" aria-label="Loading admin">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-8 h-64 w-full" />
    </div>
  );
}
