"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatPrice } from "@/lib/format";

interface MobileOrderSummaryProps {
  total: number;
  children: ReactNode;
  className?: string;
}

/** Collapsible order summary for mobile cart/checkout */
export function MobileOrderSummary({ total, children, className }: MobileOrderSummaryProps) {
  return (
    <>
      <div className={className ?? "lg:hidden"}>
        <Accordion type="single" collapsible defaultValue="summary">
          <AccordionItem value="summary" className="border-accent-cyan/30">
            <AccordionTrigger className="py-3 text-sm font-medium">
              Order Summary — {formatPrice(total)}
            </AccordionTrigger>
            <AccordionContent>{children}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="hidden lg:block">{children}</div>
    </>
  );
}
