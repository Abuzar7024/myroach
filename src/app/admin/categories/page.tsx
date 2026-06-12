"use client";

import { categories } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light">Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Organize your product catalog
          </p>
        </div>
        <Button><Plus className="h-4 w-4" /> Add Category</Button>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="border border-border p-6">
            <h3 className="font-medium">{cat.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
            <p className="mt-4 text-xs text-muted-foreground">/{cat.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
