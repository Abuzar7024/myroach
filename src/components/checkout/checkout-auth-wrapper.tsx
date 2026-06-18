"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { CheckoutSignInPrompt } from "@/components/checkout/checkout-sign-in-prompt";
import { PageLoader } from "@/components/ui/page-loader";
import { storeReturnUrl } from "@/lib/auth-utils";

export function CheckoutAuthWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, needsEmailVerification } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      storeReturnUrl(pathname);
    }
  }, [loading, user, pathname]);

  useEffect(() => {
    if (!loading && user && needsEmailVerification) {
      router.replace(`/account/verify?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, needsEmailVerification, router, pathname]);

  if (loading) {
    return <PageLoader label="Loading checkout" fullPage className="pt-20" />;
  }

  if (!user) {
    return <CheckoutSignInPrompt returnPath={pathname} />;
  }

  if (needsEmailVerification) {
    return <PageLoader label="Redirecting to email verification" fullPage className="pt-20" />;
  }

  return <CheckoutContent />;
}
