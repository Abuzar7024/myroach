import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-3.5 w-3.5 border",
  md: "h-4 w-4 border-2",
  lg: "h-6 w-6 border-2",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-accent-cyan border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}
