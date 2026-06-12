import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  className?: string;
  fullPage?: boolean;
}

export function PageLoader({
  label = "Loading",
  className,
  fullPage = true,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-noire-muted",
        fullPage ? "min-h-[50vh] py-24" : "py-12",
        className
      )}
    >
      <Spinner size="lg" />
      <p className="text-xs uppercase tracking-widest">{label}</p>
    </div>
  );
}
