"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PaymentContent } from "@/components/checkout/payment-content";
import { CheckoutSignInPrompt } from "@/components/checkout/checkout-sign-in-prompt";
import { PageLoader } from "@/components/ui/page-loader";
import { storeReturnUrl, verificationWaitingRoomPath } from "@/lib/auth-utils";

export function PaymentAuthWrapper() {
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
    return <PageLoader label="Loading payment" fullPage className="pt-20" />;
  }

  if (!firebaseUser) {
    return <CheckoutSignInPrompt returnPath={pathname} title="Sign in to pay" />;
  }

  if (needsEmailVerification) {
    return <PageLoader label="Redirecting to email verification" fullPage className="pt-20" />;
  }

  return <PaymentContent />;
}
