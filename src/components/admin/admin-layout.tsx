"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  Image as ImageIcon,
  Warehouse,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-noire-border bg-noire-black text-noire-white">
      <div className="border-b border-noire-white/10 p-6">
        <Link href="/admin" className="font-display text-xl tracking-[0.2em]">
          NOIRÉ Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {adminNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
              pathname === href
                ? "bg-noire-white/10 text-noire-gold"
                : "text-noire-white/60 hover:bg-noire-white/5 hover:text-noire-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-noire-white/10 p-4">
        <Link href="/" className="mb-2 block text-xs text-noire-white/40 hover:text-noire-white">
          ← Back to Store
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-noire-white/60 hover:text-noire-white"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

export function AdminHeader({ title }: { title: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-2xl font-light tracking-wide">{title}</h1>
    </header>
  );
}

export function StatCard({ label, value, change }: { label: string; value: string; change?: string }) {
  return (
    <div className="border border-noire-border bg-noire-white p-6">
      <p className="text-xs uppercase tracking-widest text-noire-muted">{label}</p>
      <p className="mt-2 text-2xl font-light">{value}</p>
      {change && <p className="mt-1 text-xs text-noire-gold">{change}</p>}
    </div>
  );
}

export function AdminTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto border border-noire-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-noire-border bg-noire-cream/50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-noire-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-noire-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
