"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BottomIslandProps {
  /** Small caption above the main value, e.g. "Total" */
  label?: string;
  /** Primary text — price, product name, etc. */
  primary: string;
  /** Optional second line under primary */
  secondary?: string;
  action: ReactNode;
  className?: string;
}

/**
 * Compact floating action bar inspired by Dynamic Island — sits above bottom nav
 * without covering the full screen width.
 */
export function BottomIsland({
  label,
  primary,
  secondary,
  action,
  className,
}: BottomIslandProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 w-[min(94%,24rem)] -translate-x-1/2 lg:hidden",
        className
      )}
      role="region"
      aria-label={label ? `${label}: ${primary}` : primary}
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-accent-cyan/20 bg-noire-charcoal/88 px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_24px_rgba(0,240,255,0.08)] backdrop-blur-2xl ring-1 ring-white/5">
        <div className="min-w-0 flex-1 pl-3">
          {label && (
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-noire-muted">
              {label}
            </p>
          )}
          <p className="truncate text-sm font-semibold leading-tight text-noire-white">
            {primary}
          </p>
          {secondary && (
            <p className="truncate text-[11px] text-accent-cyan">{secondary}</p>
          )}
        </div>
        <div className="shrink-0 pr-0.5">{action}</div>
      </div>
    </div>
  );
}
