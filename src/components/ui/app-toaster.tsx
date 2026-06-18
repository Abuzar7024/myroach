"use client";

import { Toaster } from "sonner";

const toastStyle = {
  background: "#0d0d12",
  color: "#f0f0f5",
  border: "1px solid rgba(0, 240, 255, 0.35)",
};

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      richColors
      toastOptions={{
        duration: 5000,
        style: toastStyle,
        classNames: {
          closeButton:
            "!left-auto !right-0 !top-0 !translate-x-[35%] !-translate-y-[35%] !border-noire-border !bg-noire-charcoal !text-noire-muted hover:!text-noire-white",
        },
      }}
    />
  );
}
