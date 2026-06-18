"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Mail, RefreshCw } from "lucide-react";

export function EmailVerificationGate() {
  const {
    firebaseUser,
    pendingDisplayName,
    needsEmailVerification,
    sendVerificationEmail,
    checkEmailVerified,
    logout,
  } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!needsEmailVerification || !firebaseUser) return null;

  const displayName = pendingDisplayName || firebaseUser.email?.split("@")[0] || "there";

  async function handleResend() {
    setSending(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification link sent — check your inbox (and spam)");
    } catch {
      toast.error("Could not send email — try again in a minute");
    } finally {
      setSending(false);
    }
  }

  async function handleCheckVerified() {
    setChecking(true);
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        toast.success("Email verified — welcome to the rotation");
      } else {
        toast.error("Not verified yet — click the link in your email first");
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-noire-black/90 p-4 backdrop-blur-sm">
      <div
        className="cyber-card w-full max-w-md p-8 text-center"
        aria-modal="true"
        role="dialog"
        aria-labelledby="verify-title"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10">
          <Mail className="h-7 w-7 text-accent-cyan" />
        </div>
        <h2 id="verify-title" className="font-display mt-6 text-2xl text-accent-cyan">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-noire-muted">
          Hey <span className="text-noire-white">{displayName}</span> — we sent a link to
        </p>
        <p className="mt-1 font-medium text-accent-cyan">{firebaseUser.email}</p>
        <p className="mt-4 text-sm leading-relaxed text-noire-muted">
          Tap the link in your inbox to unlock your account. The site stays locked until you verify.
        </p>
        <p className="mt-3 rounded-sm border border-accent-pink/30 bg-accent-pink/5 px-3 py-2 text-xs text-accent-pink">
          Can&apos;t find it? Check your <strong>spam / junk</strong> folder — verification emails love hiding there.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            className="w-full gap-2"
            onClick={handleCheckVerified}
            loading={checking}
          >
            <RefreshCw className="h-4 w-4" />
            I&apos;ve verified my email
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            loading={sending}
          >
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
