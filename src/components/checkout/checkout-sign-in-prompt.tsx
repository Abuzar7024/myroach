"use client";

import Link from "next/link";
import { LogIn, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginRedirectPath } from "@/lib/auth-utils";

interface CheckoutSignInPromptProps {
  returnPath?: string;
  title?: string;
  description?: string;
}

export function CheckoutSignInPrompt({
  returnPath = "/checkout",
  title = "Sign in to checkout",
  description = "Create an account or sign in so we can save your order, delivery details, and shipping updates.",
}: CheckoutSignInPromptProps) {
  const loginHref = loginRedirectPath(returnPath);

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center lg:py-32">
      <UserCircle className="mx-auto h-14 w-14 text-zinc-500" />
      <h1 className="mt-6 font-display text-2xl font-light tracking-tight text-zinc-100">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500">{description}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="gap-2">
          <Link href={loginHref}>
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={`/register?redirect=${encodeURIComponent(returnPath)}`}>Create account</Link>
        </Button>
      </div>
    </div>
  );
}
