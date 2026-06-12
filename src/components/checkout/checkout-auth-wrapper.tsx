"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { PageLoader } from "@/components/ui/page-loader";
import { loginRedirectPath, storeReturnUrl } from "@/lib/auth-utils";

export function CheckoutAuthWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      storeReturnUrl(pathname);
      router.replace(loginRedirectPath(pathname));
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return <PageLoader label="Loading checkout" fullPage className="pt-20" />;
  }

  if (!user) {
    return <PageLoader label="Redirecting to login" fullPage className="pt-20" />;
  }

  return <CheckoutContent />;
}
