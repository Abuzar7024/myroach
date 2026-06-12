"use client";

import { useState } from "react";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";

export function FooterSizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-noire-white/60 transition-colors hover:text-accent-cyan"
      >
        Size Guide
      </button>
      <SizeGuideDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
