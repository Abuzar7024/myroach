import { coupons } from "@/data/mock-data";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminCouponsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light">Coupons</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage discount codes</p>
        </div>
        <Button><Plus className="h-4 w-4" /> Add Coupon</Button>
      </div>
      <div className="mt-10 space-y-4">
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between border border-border p-4">
            <div>
              <p className="font-mono font-medium">{c.code}</p>
              <p className="text-sm text-muted-foreground">
                {c.type === "percentage" ? `${c.value}% off` : `${formatPrice(c.value)} off`}
                {c.minOrderAmount && ` · Min ${formatPrice(c.minOrderAmount)}`}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{c.usedCount} uses</span>
          </div>
        ))}
      </div>
    </div>
  );
}
