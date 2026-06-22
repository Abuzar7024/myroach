"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  describeReturnPath,
  getAndClearVerificationReturnUrl,
  peekVerificationReturnUrl,
  storeVerificationReturnUrl,
} from "@/lib/auth-utils";
import {
  getEmailVerificationContinueUrl,
  wasVerificationEmailSent,
} from "@/lib/auth-email-action";
import { mapFirebaseAuthError } from "@/lib/firebase-auth-errors";
import { toast } from "sonner";
import { Clock, Mail, RefreshCw } from "lucide-react";

export function EmailVerificationWaitingRoomScreen() {
  const router = useRouter();
  const {
    firebaseUser,
    pendingDisplayName,
    needsEmailVerification,
    sendVerificationEmail,
    checkEmailVerified,
    logout,
    loading,
  } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [returnPath, setReturnPath] = useState("/shop");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect) storeVerificationReturnUrl(redirect);
    setReturnPath(peekVerificationReturnUrl("/shop"));
  }, []);

  useEffect(() => {
    if (loading || !firebaseUser || needsEmailVerification) return;
    router.replace(getAndClearVerificationReturnUrl("/shop"));
  }, [loading, firebaseUser, needsEmailVerification, router]);

  useEffect(() => {
    if (loading || !needsEmailVerification || !firebaseUser) return;

    if (!wasVerificationEmailSent(firebaseUser.uid)) {
      void (async () => {
        try {
          await sendVerificationEmail();
          toast.success("Verification link sent — check your inbox (and spam)");
        } catch (error) {
          toast.error(mapFirebaseAuthError(error));
        }
      })();
    }

    const poll = window.setInterval(async () => {
      try {
        const verified = await checkEmailVerified();
        if (verified) {
          router.replace(getAndClearVerificationReturnUrl("/shop"));
        }
      } catch {
        /* keep waiting */
      }
    }, 4000);

    return () => window.clearInterval(poll);
  }, [loading, needsEmailVerification, firebaseUser, checkEmailVerified, router, sendVerificationEmail]);

  const displayName = pendingDisplayName || firebaseUser?.email?.split("@")[0] || "there";
  const returnLabel = describeReturnPath(returnPath);

  async function handleResend() {
    setSending(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification link sent — check your inbox (and spam)");
    } catch (error) {
      toast.error(mapFirebaseAuthError(error));
    } finally {
      setSending(false);
    }
  }

  async function handleCheckVerified() {
    setChecking(true);
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        router.replace(getAndClearVerificationReturnUrl("/shop"));
      } else {
        toast.error("Not verified yet — click the link in your email first");
      }
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-noire-muted">Opening waiting room…</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="cyber-card w-full p-10">
          <h1 className="font-display text-3xl text-accent-cyan">Sign in first</h1>
          <p className="mt-4 text-sm text-noire-muted">You need an account before email verification.</p>
          <Button className="mt-8 w-full" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  if (!needsEmailVerification) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-noire-muted">Taking you back…</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.08),transparent_55%)]" />
      <div className="cyber-card relative w-full max-w-lg p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10">
          <Clock className="h-8 w-8 animate-pulse text-accent-cyan" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.35em] text-accent-pink">Waiting room</p>
        <h1 className="font-display mt-3 text-3xl text-accent-cyan">Verify to continue</h1>
        <p className="mt-3 text-sm text-noire-muted">
          Hey <span className="text-noire-white">{displayName}</span> — we sent a link to
        </p>
        <p className="mt-1 font-medium text-accent-cyan">{firebaseUser.email}</p>
        <p className="mt-5 text-sm leading-relaxed text-noire-muted">
          You can&apos;t browse the site until your email is verified. Once confirmed, we&apos;ll
          send you back to <span className="text-noire-white">{returnLabel}</span>.
        </p>
        <p className="mt-4 rounded-sm border border-accent-pink/30 bg-accent-pink/5 px-4 py-3 text-xs text-accent-pink">
          <strong>Check spam / junk</strong> if the email isn&apos;t in your inbox yet.
        </p>
        <p className="mt-3 text-xs text-noire-muted">
          Verification links open{" "}
          <span className="font-mono text-noire-white">{getEmailVerificationContinueUrl()}</span>
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button className="w-full gap-2" onClick={handleCheckVerified} loading={checking}>
            <RefreshCw className="h-4 w-4" />
            I&apos;ve verified — take me back
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={handleResend} loading={sending}>
            <Mail className="h-4 w-4" />
            Resend verification link
          </Button>
          <Button variant="ghost" className="w-full text-noire-muted" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
