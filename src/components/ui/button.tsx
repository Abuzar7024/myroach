import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-noire-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-accent-cyan text-noire-black border border-accent-cyan hover:bg-transparent hover:text-accent-cyan neon-glow",
        outline:
          "border border-accent-cyan bg-transparent text-accent-cyan hover:bg-accent-cyan hover:text-noire-black hover:neon-glow",
        ghost: "text-noire-white hover:bg-noire-charcoal hover:text-accent-cyan",
        link: "text-accent-cyan underline-offset-4 hover:underline",
        luxury:
          "bg-accent-purple text-noire-white border border-accent-purple hover:bg-transparent hover:text-accent-purple",
        drip:
          "bg-accent-pink text-noire-white border border-accent-pink hover:bg-transparent hover:text-accent-pink neon-glow-pink",
        sticker:
          "bg-noire-charcoal text-accent-cyan border border-accent-cyan hover:bg-noire-black hover:neon-glow",
        neon:
          "bg-noire-black text-accent-lime border border-accent-lime shadow-[0_0_12px_rgba(57,255,20,0.3)] hover:bg-accent-lime hover:text-noire-black",
        cyber:
          "bg-noire-charcoal text-accent-cyan border border-accent-cyan/60 hover:border-accent-cyan hover:shadow-[0_0_12px_rgba(0,240,255,0.35)]",
      },
      size: {
        default: "h-11 px-8 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={isDisabled}
          aria-busy={loading || undefined}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
