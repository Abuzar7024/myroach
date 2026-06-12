"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0d0d12",
            color: "#f0f0f5",
            border: "1px solid rgba(0, 240, 255, 0.35)",
          },
        }}
      />
    </AuthProvider>
  );
}
