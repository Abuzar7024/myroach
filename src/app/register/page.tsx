"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FadeIn } from "@/components/ui/motion";
import { getAndClearReturnUrl } from "@/lib/auth-utils";
import { isMockDataMode } from "@/lib/config";
import { SITE_NAME } from "@/lib/constants";

const EmailAuthFlow = dynamic(
  () => import("@/components/auth/EmailAuthFlow").then((m) => m.EmailAuthFlow),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-sm bg-noire-border/40" /> }
);

const PhoneAuthFlow = dynamic(
  () => import("@/components/auth/PhoneAuthFlow").then((m) => m.PhoneAuthFlow),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-sm bg-noire-border/40" /> }
);

export default function RegisterPage() {
  const router = useRouter();
  const mockMode = isMockDataMode();

  const handleAuthSuccess = () => {
    router.push(getAndClearReturnUrl("/shop"));
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pt-4 sm:px-6">
      <FadeIn className="w-full max-w-md cyber-card p-8">
        <div className="text-center">
          <h1 className="font-display text-4xl text-accent-cyan [text-shadow:0_0_12px_rgba(0,240,255,0.3)]">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-noire-muted">
            {mockMode
              ? `Join ${SITE_NAME} — test phone flow`
              : `Join ${SITE_NAME} — email & password (customer accounts only)`}
          </p>
        </div>

        <div className="mt-8">
          {mockMode ? (
            <PhoneAuthFlow mode="register" onSuccess={handleAuthSuccess} />
          ) : (
            <EmailAuthFlow mode="register" onSuccess={handleAuthSuccess} />
          )}
        </div>

        <p className="mt-8 text-center text-sm text-noire-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-cyan hover:text-accent-pink">
            Sign in
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}
