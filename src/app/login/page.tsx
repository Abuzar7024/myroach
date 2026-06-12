"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FadeIn } from "@/components/ui/motion";
import { getAndClearReturnUrl } from "@/lib/auth-utils";

const PhoneAuthFlow = dynamic(
  () => import("@/components/auth/PhoneAuthFlow").then((m) => m.PhoneAuthFlow),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 py-2">
        <div className="h-11 animate-pulse rounded-sm bg-noire-border/40" />
        <div className="h-11 animate-pulse rounded-sm bg-noire-border/40" />
      </div>
    ),
  }
);

export default function LoginPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push(getAndClearReturnUrl("/account"));
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pt-4 sm:px-6">
      <FadeIn className="w-full max-w-md cyber-card p-8">
        <div className="text-center">
          <h1 className="font-display text-4xl text-accent-cyan [text-shadow:0_0_12px_rgba(0,240,255,0.3)]">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-noire-muted">
            Enter your phone to continue — browse free, buy when ready
          </p>
        </div>

        <div className="mt-8">
          <PhoneAuthFlow mode="login" onSuccess={handleAuthSuccess} />
        </div>

        <p className="mt-8 text-center text-sm text-noire-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent-cyan hover:text-accent-pink">
            Create one
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}
