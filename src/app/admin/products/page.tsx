"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminHeader, AdminTable } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { products as initialProducts } from "@/data/mock-data";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (id: string) => {
    setProducts((p) => p.filter((prod) => prod.id !== id));
    toast.success("Product deleted");
  };

  return (
    <AdminGuard>
      <div className="flex items-center justify-between">
        <AdminHeader title="Products" />
        <Button onClick={() => { setEditing(null); setIsOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <AdminTable
        headers={["Name", "SKU", "Price", "Category", "Status", "Actions"]}
        rows={products.map((p) => [
          p.name,
          p.sku,
          formatPrice(p.price),
          p.categorySlug,
          p.isActive ? "Active" : "Inactive",
          <div key={p.id} className="flex gap-2">
            <button onClick={() => { setEditing(p); setIsOpen(true); }} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => handleDelete(p.id)} aria-label="Delete">
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>,
        ])}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(editing ? "Product updated" : "Product created");
              setIsOpen(false);
            }}
          >
            <div>
              <Label>Name</Label>
              <Input defaultValue={editing?.name} className="mt-2" />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" defaultValue={editing?.price} className="mt-2" />
            </div>
            <div>
              <Label>SKU</Label>
              <Input defaultValue={editing?.sku} className="mt-2" />
            </div>
            <Button type="submit" className="w-full">
              {editing ? "Update" : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}
