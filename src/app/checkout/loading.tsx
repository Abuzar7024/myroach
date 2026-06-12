import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
      aria-busy="true"
      aria-label="Loading checkout"
    >
      <Skeleton className="h-10 w-40" />
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
