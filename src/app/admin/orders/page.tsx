import { formatPrice } from "@/lib/format";

export default function AdminOrdersPage() {
  const orders = [
    { id: "NR-001", customer: "Elena M.", total: 890, status: "Delivered" },
    { id: "NR-002", customer: "James R.", total: 1450, status: "Shipped" },
    { id: "NR-003", customer: "Sophie L.", total: 620, status: "Processing" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-light">Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage customer orders</p>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-4 pr-4">Order</th>
              <th className="pb-4 pr-4">Customer</th>
              <th className="pb-4 pr-4">Total</th>
              <th className="pb-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border">
                <td className="py-4 pr-4">{o.id}</td>
                <td className="py-4 pr-4">{o.customer}</td>
                <td className="py-4 pr-4">{formatPrice(o.total)}</td>
                <td className="py-4">
                  <span className="text-xs uppercase tracking-wider text-accent">{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
