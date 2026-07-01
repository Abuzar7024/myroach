"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import {
  peekVerificationReturnUrl,
  RETURN_URL_KEY,
  verificationWaitingRoomPath,
} from "@/lib/auth-utils";
import { mapFirebaseAuthError } from "@/lib/firebase-auth-errors";
import { toast } from "sonner";

interface EmailAuthFlowProps {
  mode?: "login" | "register";
  onSuccess?: () => void;
}

export function EmailAuthFlow({ mode = "login", onSuccess }: EmailAuthFlowProps) {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Enter a valid email and password (min 6 characters)");
      return;
    }

    const pendingReturn =
      typeof window !== "undefined"
        ? peekVerificationReturnUrl(sessionStorage.getItem(RETURN_URL_KEY) || "/shop")
        : "/shop";

    setLoading(true);
    try {
      if (mode === "register") {
        if (!name.trim()) {
          toast.error("Username is required");
          setLoading(false);
          return;
        }
        const result = await signUpWithEmail(email.trim(), password, name.trim());
        if (result.needsVerification) {
          if (result.verificationEmailSent) {
            toast.success("Account created — check your email for the verification link (spam too)");
          } else {
            toast.message("Account created — sending verification email…", {
              description: "If nothing arrives in a minute, use Resend on the next screen.",
            });
          }
          router.push(verificationWaitingRoomPath(pendingReturn));
          return;
        }
        toast.success("Account created");
      } else {
        const result = await signInWithEmail(email.trim(), password);
        if (result.needsVerification) {
          toast.info("Verify your email first — check inbox and spam");
          router.push(verificationWaitingRoomPath(pendingReturn));
          return;
        }
        toast.success("Signed in successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <div>
          <Label htmlFor="name">Username</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            required
            className="mt-1"
          />
        </div>
      )}
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
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {mode === "login" && (
            <Link
              href="/forgot-password"
              className="text-xs text-noire-muted transition-colors hover:text-accent-cyan"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        {mode === "register" ? "Create Account" : "Sign In"}
      </Button>
      {mode === "register" && (
        <p className="text-center text-xs text-noire-muted">
          We&apos;ll email a verification link. Check spam if you don&apos;t see it.
        </p>
      )}
    </form>
  );
}
