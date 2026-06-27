"use client";

import { Loader2 } from "lucide-react";

export function PaymentProcessingOverlay({ label = "Processing your payment…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-noire-black/90 px-4 backdrop-blur-sm">
      <div className="cyber-card w-full max-w-md p-10 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent-cyan" />
        <h2 className="font-display mt-6 text-2xl text-accent-cyan">Processing payment</h2>
        <p className="mt-3 text-sm text-noire-muted">{label}</p>
        <p className="mt-4 text-xs text-noire-muted">Do not close this window.</p>
      </div>
    </div>
  );
}
