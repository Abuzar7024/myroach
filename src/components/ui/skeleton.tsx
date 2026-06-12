import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("shimmer relative overflow-hidden rounded-none bg-noire-cream", className)}
      {...props}
    />
  );
}

export { Skeleton };
