import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border border-noire-border bg-noire-charcoal px-4 py-2 text-base text-noire-white transition-colors placeholder:text-noire-muted focus-visible:outline-none focus-visible:border-accent-cyan focus-visible:ring-1 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
