"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { loginRedirectPath, storeReturnUrl } from "@/lib/auth-utils";

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = useCallback(
    (action: () => void, returnPath?: string) => {
      if (loading) return;
      if (!user) {
        const path = returnPath || pathname;
        storeReturnUrl(path);
        router.push(loginRedirectPath(path));
        return;
      }
      action();
    },
    [user, loading, router, pathname]
  );

  return { requireAuth, user, loading, isAuthenticated: !!user };
}
