"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PhoneAuthFlow = dynamic(
  () => import("@/components/auth/PhoneAuthFlow").then((m) => m.PhoneAuthFlow),
  { ssr: false }
);

export function AuthForm() {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="text-sm text-noire-muted">Signed in as</p>
        <p className="mt-2 font-medium">{user.displayName || user.phone}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild variant="outline">
            <Link href="/account/profile">My Profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/orders">Order History</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/wishlist">Wishlist</Link>
          </Button>
          {user.role === "admin" && (
            <Button asChild variant="luxury">
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              toast.success("Signed out");
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <FadeIn>
        <h1 className="font-display text-center text-3xl font-light">Account</h1>
        <p className="mt-2 text-center text-sm text-noire-muted">
          Sign in with your phone number
        </p>
        <div className="mt-8">
          <PhoneAuthFlow mode="login" />
        </div>
        <p className="mt-6 text-center text-sm text-noire-muted">
          New here?{" "}
          <Link href="/register" className="text-accent-cyan hover:text-accent-pink">
            Create account
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}
