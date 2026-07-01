"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { parseEmailActionSearchParams } from "@/lib/auth-email-action";
import {
  describeReturnPath,
  getAndClearVerificationReturnUrl,
  loginRedirectPath,
  peekVerificationReturnUrl,
} from "@/lib/auth-utils";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type VerifyState = "loading" | "success" | "error" | "invalid";

export default function EmailVerificationActionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeEmailVerificationLink, firebaseUser } = useAuth();
  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [returnPath, setReturnPath] = useState("/shop");

  const { mode, oobCode } = useMemo(
    () => parseEmailActionSearchParams(searchParams),
    [searchParams]
  );

  useEffect(() => {
    setReturnPath(peekVerificationReturnUrl("/shop"));
  }, []);

  useEffect(() => {
    if (mode !== "verifyEmail" || !oobCode) {
      setState("invalid");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await completeEmailVerificationLink(oobCode);
        if (!cancelled) setState("success");
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Verification failed";
        setErrorMessage(message);
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, oobCode, completeEmailVerificationLink]);

  useEffect(() => {
    // Auto-return only when this device is already signed in (same-device
    // verify). Cross-device verify has no session here, so we keep the success
    // screen and let the user continue to sign in (audit H7).
    if (state !== "success" || !firebaseUser) return;
    const target = getAndClearVerificationReturnUrl("/shop");
    const timer = window.setTimeout(() => router.replace(target), 1800);
    return () => window.clearTimeout(timer);
  }, [state, firebaseUser, router]);

  const returnLabel = describeReturnPath(returnPath);

  if (state === "loading") {
    return (
      <FadeIn className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="cyber-card w-full p-10">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent-cyan" />
          <h1 className="font-display mt-6 text-2xl text-accent-cyan">Verifying your email</h1>
          <p className="mt-3 text-sm text-noire-muted">Hang tight — confirming your link…</p>
        </div>
      </FadeIn>
    );
  }

  if (state === "invalid") {
    return (
      <FadeIn className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="cyber-card w-full p-10">
          <XCircle className="mx-auto h-12 w-12 text-accent-pink" />
          <h1 className="font-display mt-6 text-2xl text-accent-pink">Invalid link</h1>
          <p className="mt-3 text-sm leading-relaxed text-noire-muted">
            This verification link is missing details or has already been used. Request a new one
            from your account.
          </p>
          <Button asChild className="mt-8 w-full">
            <Link href="/account/verify">Back to waiting room</Link>
          </Button>
        </div>
      </FadeIn>
    );
  }

  if (state === "error") {
    return (
      <FadeIn className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="cyber-card w-full p-10">
          <XCircle className="mx-auto h-12 w-12 text-accent-pink" />
          <h1 className="font-display mt-6 text-2xl text-accent-pink">Verification failed</h1>
          <p className="mt-3 text-sm leading-relaxed text-noire-muted">
            {errorMessage?.includes("expired")
              ? "This link has expired. Send yourself a fresh verification email."
              : errorMessage || "We could not verify this link. It may be expired or already used."}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/account/verify">Back to waiting room</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="cyber-card w-full p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent-cyan" />
        <h1 className="font-display mt-6 text-3xl text-accent-cyan">Email verified</h1>
        <p className="mt-3 text-sm leading-relaxed text-noire-muted">
          {firebaseUser
            ? `You're in — taking you back to ${returnLabel}…`
            : "Your email is confirmed. Sign in on this device to continue shopping."}
        </p>
        {firebaseUser?.email ? (
          <p className="mt-2 text-sm text-accent-cyan">{firebaseUser.email}</p>
        ) : (
          <p className="mt-2 text-sm text-noire-muted">Use the same email and password you signed up with.</p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          {firebaseUser ? (
            <Button
              className="w-full"
              onClick={() => router.replace(getAndClearVerificationReturnUrl("/shop"))}
            >
              Continue now
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href={loginRedirectPath(returnPath)}>Continue to sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
