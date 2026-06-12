export default function AdminCustomersPage() {
  const customers = [
    { name: "Elena M.", email: "elena@example.com", orders: 5 },
    { name: "James R.", email: "james@example.com", orders: 3 },
    { name: "Sophie L.", email: "sophie@example.com", orders: 8 },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-light">Customers</h1>
      <p className="mt-2 text-sm text-muted-foreground">View registered customers</p>
      <div className="mt-10 space-y-4">
        {customers.map((c) => (
          <div key={c.email} className="flex items-center justify-between border border-border p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.email}</p>
            </div>
            <span className="text-sm text-muted-foreground">{c.orders} orders</span>
          </div>
        ))}
      </div>
    </div>
  );
}
