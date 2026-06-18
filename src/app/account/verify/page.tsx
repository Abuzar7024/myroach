"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/profile";
  const {
    firebaseUser,
    pendingDisplayName,
    needsEmailVerification,
    sendVerificationEmail,
    checkEmailVerified,
    loading,
  } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!loading && firebaseUser && !needsEmailVerification) {
      router.replace(redirectTo.startsWith("/") ? redirectTo : "/account/profile");
    }
  }, [loading, firebaseUser, needsEmailVerification, router, redirectTo]);

  const displayName = pendingDisplayName || firebaseUser?.email?.split("@")[0] || "there";

  async function handleResend() {
    setSending(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification link sent");
    } catch {
      toast.error("Could not send — wait a minute and retry");
    } finally {
      setSending(false);
    }
  }

  async function handleCheck() {
    setChecking(true);
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        router.push("/shop");
      } else {
        toast.error("Not verified yet — check your email (and spam)");
      }
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-noire-muted">Loading...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <FadeIn className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-accent-cyan">Sign in first</h1>
        <p className="mt-4 text-sm text-noire-muted">You need an account before verifying email.</p>
        <Button asChild className="mt-8">
          <Link href="/login">Go to login</Link>
        </Button>
      </FadeIn>
    );
  }

  if (!needsEmailVerification) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-noire-muted">Redirecting...</p>
      </div>
    );
  }

  return (
    <FadeIn className="mx-auto max-w-md px-4 py-16">
      <div className="cyber-card p-8 text-center">
        <Mail className="mx-auto h-10 w-10 text-accent-cyan" />
        <h1 className="font-display mt-6 text-3xl text-accent-cyan">Check your email</h1>
        <p className="mt-2 text-sm text-noire-muted">
          Hey <span className="text-noire-white">{displayName}</span> — verify{" "}
          <span className="text-accent-cyan">{firebaseUser.email}</span>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-noire-muted">
          We sent a verification link. Click it, then come back here and hit the button below.
        </p>
        <p className="mt-4 rounded-sm border border-accent-pink/30 bg-accent-pink/5 px-4 py-3 text-xs text-accent-pink">
          <strong>Check spam / junk</strong> — verification emails often land there. Add us to contacts if needed.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button className="w-full gap-2" onClick={handleCheck} loading={checking}>
            <RefreshCw className="h-4 w-4" />
            I&apos;ve verified — continue
          </Button>
          <Button variant="outline" className="w-full" onClick={handleResend} loading={sending}>
            Resend link
          </Button>
        </div>
      </div>
    </FadeIn>
  );
}
