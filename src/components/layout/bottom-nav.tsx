"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Store, User } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/shop", label: "Shop", icon: Store, match: (p: string) => p.startsWith("/shop") || p.startsWith("/product") },
  { href: "/cart", label: "Cart", icon: ShoppingBag, match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout") },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getItemCount());
  const { user, loading } = useAuth();
  const accountHref = user ? "/account" : "/login";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-accent-cyan/30 bg-noire-charcoal/98 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          const isCart = href === "/cart";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                active ? "text-accent-cyan" : "text-noire-muted"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
              {isCart && cartCount > 0 && (
                <span className="absolute right-[calc(50%-22px)] top-1 flex h-4 min-w-4 items-center justify-center bg-accent-cyan px-0.5 text-[10px] font-bold text-noire-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          );
        })}
        <Link
          href={accountHref}
          className={cn(
            "flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
            pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register")
              ? "text-accent-cyan"
              : "text-noire-muted"
          )}
          aria-label={loading ? "Account" : user ? "Account" : "Login"}
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span>{user ? "Account" : "Login"}</span>
        </Link>
      </div>
    </nav>
  );
}
