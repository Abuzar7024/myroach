import { cn } from "@/lib/utils";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: boolean;
}

export function Shimmer({ className, rounded = false, ...props }: ShimmerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shimmer relative overflow-hidden bg-noire-cream",
        rounded ? "rounded-md" : "rounded-none",
        className
      )}
      {...props}
    />
  );
}
