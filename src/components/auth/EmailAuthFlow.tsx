"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface EmailAuthFlowProps {
  mode?: "login" | "register";
  onSuccess?: () => void;
}

export function EmailAuthFlow({ mode = "login", onSuccess }: EmailAuthFlowProps) {
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

    setLoading(true);
    try {
      if (mode === "register") {
        if (!name.trim()) {
          toast.error("Full name is required");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email.trim(), password, name.trim());
        toast.success("Account created — welcome to the rotation");
      } else {
        await signInWithEmail(email.trim(), password);
        toast.success("Signed in successfully");
      }
      onSuccess?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Authentication failed";
      toast.error(msg.includes("auth/") ? "Invalid email or password" : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
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
    </form>
  );
}
