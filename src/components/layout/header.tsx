"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  LogOut,
  ShoppingCart,
  User,
  Zap,
  Store,
  Info,
  Mail,
  Shield,
  FileText,
  Truck,
  Ruler,
  Heart,
  Package,
  Layers
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/hooks/use-settings";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";
import { isPolicyRouteAvailable } from "@/lib/policies";
import { useCartStore } from "@/store/cart-store";
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

const getLinkIcon = (href: string) => {
  if (href.startsWith("/shop?filter=new")) return Zap;
  if (href.startsWith("/shop")) return Store;
  if (href.startsWith("/about")) return Info;
  if (href.startsWith("/contact")) return Mail;
  if (href.startsWith("/cart")) return ShoppingCart;
  if (href.startsWith("/account/wishlist")) return Heart;
  if (href.startsWith("/account/orders")) return Package;
  if (href.startsWith("/privacy")) return Shield;
  if (href.startsWith("/terms")) return FileText;
  if (href.startsWith("/shipping-returns")) return Truck;
  if (href.startsWith("/size-guide")) return Ruler;
  return Layers;
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const { settings } = useSettings();
  const storeName = settings.storeName || SITE_NAME;
  
  const [mounted, setMounted] = useState(false);

  const mobileExtraLinks = MOBILE_EXTRA_LINKS.filter(
    (link) => isPolicyRouteAvailable(link.href, settings)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const displayCartCount = mounted ? cartItemCount : 0;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b border-accent-cyan/40 bg-noire-charcoal shadow-[0_4px_20px_rgba(0,0,0,0.55)] transition-[box-shadow,padding] duration-300",
          "pt-[env(safe-area-inset-top,0px)] backdrop-blur-md",
          isScrolled ? "py-2 shadow-[0_6px_28px_rgba(0,0,0,0.65)] lg:py-2.5" : "py-2.5 lg:py-3"
        )}
        style={{ paddingLeft: "env(safe-area-inset-left, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:px-6 lg:px-8">
          {/* Mobile: hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              className="flex h-11 w-11 items-center justify-center text-noire-white hover:text-accent-cyan transition-colors"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-noire-white transition-colors hover:text-accent-cyan"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logo / Brand Name */}
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

          {/* Search + Cart + Account actions */}
          <div className="flex items-center justify-end gap-2 text-noire-white sm:gap-3 lg:gap-4">
            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-noire-border/80 bg-noire-black/40 transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan sm:h-11 sm:w-11"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-md border border-noire-border/80 bg-noire-black/40 transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan sm:h-11 sm:w-11 md:w-auto md:px-3.5 gap-2"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-noire-white" />
              <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">Cart</span>
              {displayCartCount > 0 && (
                <span className="absolute -top-1 -right-1 md:relative md:top-0 md:right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent-cyan text-[9px] font-black text-noire-black ring-2 ring-noire-black md:ring-0 animate-pulse">
                  {displayCartCount}
                </span>
              )}
            </Link>

            {/* Account / Auth — hidden on mobile to avoid crowding (link exists in hamburger drawer) */}
            <div className="hidden sm:block">
              {user ? (
                <Link
                  href="/account"
                  aria-label="Account"
                  className="flex h-10 items-center gap-2 rounded-md border border-accent-cyan/40 bg-noire-black/40 px-2.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-accent-cyan hover:text-accent-cyan sm:h-11 sm:px-3 lg:gap-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent-cyan/60 bg-noire-charcoal text-[10px] font-bold text-accent-cyan">
                    {(user.displayName || user.phone || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[7rem] truncate lg:inline">
                    {user.displayName?.split(" ")[0] || "Account"}
                  </span>
                </Link>
              ) : (
                <Button asChild size="sm" variant="default" className="h-10 px-4 text-[11px] sm:h-11 sm:px-5 sm:text-xs">
                  <Link href="/login" className="gap-1.5">
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu drawer wrapper */}
        <div
          className={cn(
            "fixed inset-0 z-[60] lg:hidden transition-all duration-300 ease-in-out",
            isMobileOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
          )}
        >
          {/* Backdrop overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-noire-black/90 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
              isMobileOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer content */}
          <nav
            className={cn(
              "relative flex h-full w-[300px] flex-col border-r border-accent-cyan/20 bg-gradient-to-b from-[#0a0a0f] to-[#07070a] p-6 text-noire-white shadow-[10px_0_35px_rgba(0,0,0,0.85)] transition-transform duration-300 ease-in-out sm:p-8",
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative neon accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-pink to-accent-lime" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-noire-border/80 pb-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">🪳</span>
                <span className="font-display text-base font-bold tracking-[0.15em] text-noire-white uppercase">
                  {storeName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-noire-border/80 bg-noire-black/40 text-noire-muted hover:border-accent-pink/50 hover:text-accent-pink hover:bg-accent-pink/5 transition-all duration-200 active:scale-95"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable links */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {/* Category / Nav links */}
              <div className="space-y-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-accent-cyan/85 pl-2 mb-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
                  Navigation
                </p>
                
                {/* Cart link */}
                <Link
                  href="/cart"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-250",
                    pathname === "/cart"
                      ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                      : "border-noire-border/40 bg-noire-black/20 text-noire-white hover:border-accent-cyan/30 hover:bg-accent-cyan/5 hover:text-accent-cyan"
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                  {displayCartCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-cyan px-1.5 text-[10px] font-black text-noire-black shadow-md shadow-accent-cyan/20">
                      {displayCartCount}
                    </span>
                  )}
                </Link>

                {NAV_LINKS.map((link) => {
                  const Icon = getLinkIcon(link.href);
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-250",
                        active
                          ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                          : "border-transparent text-noire-muted hover:border-noire-border/40 hover:bg-noire-black/30 hover:text-noire-white"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 transition-colors", active ? "text-accent-cyan" : "text-noire-muted")} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Policy / Extra links */}
              {mobileExtraLinks.length > 0 && (
                <div className="space-y-2.5 pt-5 border-t border-noire-border/60">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-noire-muted pl-2 mb-2">
                    Information
                  </p>
                  {mobileExtraLinks.map((link) => {
                    const Icon = getLinkIcon(link.href);
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3.5 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-250",
                          active
                            ? "border-accent-cyan/25 bg-accent-cyan/5 text-accent-cyan"
                            : "border-transparent text-noire-muted hover:text-noire-white hover:bg-noire-black/20"
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom User Section */}
            <div className="mt-auto border-t border-noire-border/80 pt-5">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-noire-border/50 bg-noire-black/30 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-cyan/50 bg-noire-black text-sm font-bold text-accent-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                      {(user.displayName || user.phone || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-noire-white">
                        {user.displayName || "User"}
                      </p>
                      <p className="truncate text-[10px] text-noire-muted">
                        {user.email || user.phone || "Signed In"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/account"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-accent-cyan/40 bg-accent-cyan/5 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-accent-cyan hover:bg-accent-cyan/15 transition-all"
                    >
                      <User className="h-4 w-4" />
                      <span>Account</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMobileOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-noire-border bg-noire-black/20 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-noire-muted hover:text-accent-pink hover:border-accent-pink/30 hover:bg-accent-pink/5 transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Button asChild className="w-full h-11 border border-accent-cyan/40 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan font-bold uppercase tracking-wider rounded-xl" variant="outline">
                  <Link href="/login" onClick={() => setIsMobileOpen(false)}>
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
              )}
              <p className="mt-5 text-center text-[9px] text-noire-muted tracking-widest uppercase">
                squad up — full send 🪳
              </p>
            </div>
          </nav>
        </div>
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
