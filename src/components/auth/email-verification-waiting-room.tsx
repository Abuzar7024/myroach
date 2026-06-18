"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { isMockDataMode } from "@/lib/config";
import {
  isVerificationExemptPath,
  normalizeReturnPath,
  storeVerificationReturnUrl,
  verificationWaitingRoomPath,
} from "@/lib/auth-utils";

/** Sends unverified users to the waiting room and remembers where they came from. */
export function EmailVerificationWaitingRoom() {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseUser, needsEmailVerification, loading } = useAuth();

  useEffect(() => {
    if (isMockDataMode() || loading) return;
    if (!firebaseUser || !needsEmailVerification) return;

    if (isVerificationExemptPath(pathname)) {
      if (typeof window !== "undefined") {
        const redirect = new URLSearchParams(window.location.search).get("redirect");
        if (redirect) storeVerificationReturnUrl(redirect);
      }
      return;
    }

    const search = typeof window !== "undefined" ? window.location.search : "";
    const fullPath = `${pathname}${search}`;
    storeVerificationReturnUrl(fullPath);
    router.replace(verificationWaitingRoomPath(normalizeReturnPath(fullPath)));
  }, [loading, firebaseUser, needsEmailVerification, pathname, router]);

  return null;
}
