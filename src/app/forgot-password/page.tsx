"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { getAuth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mapFirebaseAuthError } from "@/lib/firebase-auth-errors";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Enter your email address");
      return;
    }
    const auth = getAuth();
    if (!auth) {
      toast.error("Something went wrong. Please try again later.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setSent(true);
    } catch (error) {
      toast.error(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="cyber-card p-8 sm:p-10">
        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto h-12 w-12 text-accent-cyan" />
            <h1 className="font-display mt-6 text-2xl text-accent-cyan">Check your email</h1>
            <p className="mt-3 text-sm leading-relaxed text-noire-muted">
              If an account exists for <span className="text-noire-white">{email.trim()}</span>, we&apos;ve
              sent a link to create a new password. Check your inbox (and spam).
            </p>
            <Button asChild className="mt-8 w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-3 text-xs text-noire-muted hover:text-accent-cyan"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl">Forgot password?</h1>
            <p className="mt-2 text-sm text-noire-muted">
              Enter your email and we&apos;ll send you a link to create a new password.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" loading={loading}>
                Send reset link
              </Button>
              <p className="text-center text-sm">
                <Link href="/login" className="text-noire-muted hover:text-accent-cyan">
                  Back to sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
