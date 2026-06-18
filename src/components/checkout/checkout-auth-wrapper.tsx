"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { CheckoutSignInPrompt } from "@/components/checkout/checkout-sign-in-prompt";
import { PageLoader } from "@/components/ui/page-loader";
import { storeReturnUrl, verificationWaitingRoomPath } from "@/lib/auth-utils";

export function CheckoutAuthWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseUser, loading, needsEmailVerification } = useAuth();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      storeReturnUrl(pathname);
    }
  }, [loading, firebaseUser, pathname]);

  useEffect(() => {
    if (!loading && firebaseUser && needsEmailVerification) {
      router.replace(verificationWaitingRoomPath(pathname));
    }
  }, [loading, firebaseUser, needsEmailVerification, router, pathname]);

  if (loading) {
    return <PageLoader label="Loading checkout" fullPage className="pt-20" />;
  }

  if (!firebaseUser) {
    return <CheckoutSignInPrompt returnPath={pathname} />;
  }

  if (needsEmailVerification) {
    return <PageLoader label="Redirecting to email verification" fullPage className="pt-20" />;
  }

  return <CheckoutContent />;
}
