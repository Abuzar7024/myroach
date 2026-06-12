"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PaymentContent } from "@/components/checkout/payment-content";
import { PageLoader } from "@/components/ui/page-loader";
import { loginRedirectPath, storeReturnUrl } from "@/lib/auth-utils";

export function PaymentAuthWrapper() {
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
    return <PageLoader label="Loading payment" fullPage className="pt-20" />;
  }

  if (!user) {
    return <PageLoader label="Redirecting to login" fullPage className="pt-20" />;
  }

  return <PaymentContent />;
}
