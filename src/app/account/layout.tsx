"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { FadeIn } from "@/components/ui/motion";
import { PageLoader } from "@/components/ui/page-loader";
import { loginRedirectPath, storeReturnUrl } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";

const accountLinks = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      storeReturnUrl(pathname);
      router.replace(loginRedirectPath(pathname));
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return <PageLoader label="Loading account" fullPage className="pt-20" />;
  }

  if (!user) {
    return <PageLoader label="Redirecting to login" fullPage className="pt-20" />;
  }

  return (
    <div className="pt-0">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <FadeIn>
          <h1 className="font-display text-4xl font-light">
            Hello, {user.displayName || "Guest"}
          </h1>
        </FadeIn>

        <div className="mt-12 grid gap-8 lg:grid-cols-4 lg:gap-12">
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-sm px-4 py-3 text-sm transition-colors hover:bg-accent-cyan/10 hover:text-accent-cyan lg:block",
                  pathname === link.href && "bg-accent-cyan/10 font-medium text-accent-cyan"
                )}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => logout()}
              className="shrink-0 px-4 py-3 text-left text-sm text-noire-muted transition-colors hover:text-accent-pink lg:block lg:w-full"
            >
              Sign Out
            </button>
          </nav>
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
