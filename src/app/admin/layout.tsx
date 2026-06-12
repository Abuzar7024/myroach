import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Image as ImageIcon,
  BarChart3,
  Layers,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/inventory", label: "Inventory", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen pt-0">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-foreground text-background lg:block">
        <div className="p-6">
          <Link
            href="/admin"
            className="font-display text-xl tracking-[0.2em]"
          >
            NOIRÉ Admin
          </Link>
        </div>
        <nav className="space-y-1 px-3">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-background/70 transition-colors hover:bg-background/10 hover:text-background"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-6">
          <Link
            href="/"
            className="text-xs text-background/40 hover:text-background/70"
          >
            ← Back to store
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-background p-6 lg:p-10">{children}</main>
    </div>
  );
}
