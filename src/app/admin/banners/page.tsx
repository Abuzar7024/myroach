import { banners } from "@/data/mock-data";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminBannersPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light">Banners</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage promotional banners</p>
        </div>
        <Button><Plus className="h-4 w-4" /> Add Banner</Button>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="border border-border">
            <div className="relative aspect-video">
              <Image src={b.image} alt={b.title} fill className="object-cover" sizes="400px" />
            </div>
            <div className="p-4">
              <p className="font-medium">{b.title}</p>
              <p className="text-sm text-muted-foreground">{b.link}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
