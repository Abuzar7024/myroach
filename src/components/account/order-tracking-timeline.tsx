"use client";

import { Check, Circle, Package, Truck } from "lucide-react";
import { buildOrderTrackingSteps } from "@/lib/order-tracking";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";

interface OrderTrackingTimelineProps {
  order: Order;
  compact?: boolean;
}

function stepIcon(id: string, active: boolean, completed: boolean) {
  if (id === "shipped" || id === "delivered") return Truck;
  if (completed) return Check;
  if (active) return Package;
  return Circle;
}

export function OrderTrackingTimeline({ order, compact = false }: OrderTrackingTimelineProps) {
  const steps = buildOrderTrackingSteps(order);

  return (
    <div className={cn("rounded-lg border border-noire-border bg-noire-charcoal/40 p-4", compact && "p-3")}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent-cyan">Live tracking</p>
          <p className="mt-1 text-sm text-noire-muted">
            Updates from MY ROACH appear here in real time.
          </p>
        </div>
        <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs capitalize text-accent-cyan">
          {order.status}
        </span>
      </div>

      <ol className="space-y-0">
        {steps.map((step, index) => {
          const Icon = stepIcon(step.id, step.active, step.completed);
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-12px)] w-px",
                    step.completed ? "bg-accent-cyan/60" : "bg-noire-border"
                  )}
                />
              ) : null}
              <div
                className={cn(
                  "relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                  step.active
                    ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                    : step.completed
                      ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan"
                      : "border-noire-border bg-noire-black text-noire-muted"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.active ? "text-accent-cyan" : step.completed ? "text-noire-white" : "text-noire-muted"
                  )}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="mt-1 text-xs leading-relaxed text-noire-muted">{step.description}</p>
                ) : null}
                {step.at ? (
                  <p className="mt-1 text-[11px] text-noire-muted/80">
                    {new Date(step.at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
