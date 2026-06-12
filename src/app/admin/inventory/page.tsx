import { products } from "@/data/mock-data";

export default function AdminInventoryPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-light">Inventory</h1>
      <p className="mt-2 text-sm text-muted-foreground">Track stock levels across variants</p>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-4 pr-4">Product</th>
              <th className="pb-4 pr-4">SKU</th>
              <th className="pb-4 pr-4">Variant</th>
              <th className="pb-4">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.flatMap((p) =>
              p.variants.flatMap((v) =>
                Object.entries(v.stock).map(([size, qty]) => (
                  <tr key={`${p.id}-${v.color}-${size}`} className="border-b border-border">
                    <td className="py-3 pr-4">{p.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{p.sku}</td>
                    <td className="py-3 pr-4">{v.color} / {size}</td>
                    <td className={`py-3 ${qty <= 5 ? "text-red-500" : ""}`}>{qty}</td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
