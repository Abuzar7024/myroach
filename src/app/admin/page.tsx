import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminHeader, StatCard, AdminTable } from "@/components/admin/admin-layout";
import { products } from "@/data/mock-data";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminHeader title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatPrice(48290)} change="+12.5% vs last month" />
        <StatCard label="Orders" value="156" change="+8.2% vs last month" />
        <StatCard label="Customers" value="1,024" change="+15.3% vs last month" />
        <StatCard label="Products" value={String(products.length)} />
      </div>
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest">Recent Orders</h2>
        <AdminTable
          headers={["Order", "Customer", "Total", "Status"]}
          rows={[
            ["NR-ABC123", "Elena M.", formatPrice(1340), "Delivered"],
            ["NR-DEF456", "James W.", formatPrice(520), "Shipped"],
            ["NR-GHI789", "Sophie L.", formatPrice(890), "Processing"],
          ]}
        />
      </div>
    </AdminGuard>
  );
}
