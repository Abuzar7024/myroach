"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/hooks/use-settings";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";
import { isPolicyRouteAvailable } from "@/lib/policies";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MOBILE_EXTRA_LINKS = [
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/orders", label: "Orders" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
  { href: "/size-guide", label: "Size Guide" },
] as const;

export function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const storeName = settings.storeName || SITE_NAME;
  const mobileExtraLinks = MOBILE_EXTRA_LINKS.filter(
    (link) => isPolicyRouteAvailable(link.href, settings)
  );

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setSearchQuery("");
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,border-color] duration-300",
          "pt-[env(safe-area-inset-top,0px)]",
          isScrolled
            ? "border-b border-accent-cyan/30 bg-noire-charcoal/95 py-2 neon-glow lg:py-3"
            : "bg-noire-black/90 py-2.5 lg:bg-transparent lg:py-5 lg:backdrop-blur-none"
        )}
        style={{ paddingLeft: "env(safe-area-inset-left, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:px-6 lg:px-8">
          {/* Mobile: hamburger for secondary links */}
          <div className="flex items-center lg:hidden">
            <button
              className="flex h-11 w-11 items-center justify-center text-noire-white active:text-accent-cyan"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-noire-white/80 transition-colors hover:text-accent-cyan"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 sm:gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2"
          >
            {settings.logo ? (
              <img src={settings.logo} alt={storeName} className="h-8 w-auto object-contain sm:h-10" />
            ) : (
              <span className="text-base sm:text-lg" aria-hidden="true">
                🪳
              </span>
            )}
            <span className="font-display text-base tracking-[0.12em] text-noire-white sm:text-xl lg:text-3xl">
              {storeName}
            </span>
          </Link>

          {/* Desktop: search + account + cart; Mobile: search only (bottom nav handles rest) */}
          <div className="flex items-center justify-end gap-2 text-noire-white lg:gap-5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="flex h-11 w-11 items-center justify-center active:text-accent-cyan"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Login"}
              className="hidden h-11 items-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors hover:text-accent-cyan lg:flex"
            >
              {user ? (
                <>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-cyan/50 bg-noire-charcoal text-[10px] font-bold text-accent-cyan">
                    {(user.displayName || user.phone || "U").charAt(0).toUpperCase()}
                  </span>
                  <span>{user.displayName?.split(" ")[0] || "Account"}</span>
                </>
              ) : (
                "Login"
              )}
            </Link>
          </div>
        </div>

        {isMobileOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div
              className="absolute inset-0 bg-noire-black/90"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
            <nav
              className="relative flex h-full w-[min(320px,85vw)] flex-col border-r border-accent-cyan/40 bg-noire-charcoal p-6 text-noire-white shadow-[4px_0_24px_rgba(0,0,0,0.5)] neon-glow sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-lg tracking-[0.1em] sm:text-xl">
                  {storeName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex h-11 w-11 items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="border-b border-noire-border py-4 text-base font-semibold uppercase tracking-[0.1em] active:text-accent-cyan"
                >
                  {link.label}
                </Link>
              ))}
              {mobileExtraLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="border-b border-noire-border py-3 text-base text-noire-muted active:text-accent-cyan"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-6 border-t border-noire-border pt-6">
                {user ? (
                  <>
                    <p className="text-xs text-noire-muted">Signed in as</p>
                    <p className="mt-1 text-sm font-medium">{user.displayName || user.email}</p>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMobileOpen(false);
                      }}
                      className="mt-4 flex h-11 items-center gap-2 text-sm text-noire-muted active:text-accent-pink"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="block py-3 text-base font-semibold uppercase tracking-wider text-accent-cyan"
                  >
                    Sign In
                  </Link>
                )}
              </div>
              <p className="mt-auto pt-8 text-xs text-noire-muted">
                squad up — full send 🪳
              </p>
            </nav>
          </div>
        )}
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="border-accent-cyan/40 bg-noire-charcoal sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">Search Drip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hoodies, tees, underground drip..."
              autoFocus
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
