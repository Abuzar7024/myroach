"use client";

import { FadeIn } from "@/components/ui/motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { Address } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

function createAddressId() {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function AddressesPage() {
  const { user, updateUserProfile } = useAuth();

  if (!user) {
    return (
      <FadeIn>
        <div className="py-12 text-center">
          <p className="text-noire-muted">Sign in to manage your addresses.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </FadeIn>
    );
  }

  const addresses = user.addresses ?? [];
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const saveAddresses = async (next: Address[]) => {
    await updateUserProfile({ addresses: next });
    toast.success("Addresses updated");
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const newAddress: Address = {
      id: createAddressId(),
      label: String(data.get("label") || "Home"),
      fullName: String(data.get("fullName") || user.displayName),
      street: String(data.get("street") || ""),
      city: String(data.get("city") || ""),
      state: String(data.get("state") || "MH"),
      postalCode: String(data.get("postal") || ""),
      country: String(data.get("country") || "India"),
      isDefault: addresses.length === 0,
    };

    if (!newAddress.street || !newAddress.city || !newAddress.postalCode) {
      toast.error("Fill in street, city, and postal code");
      return;
    }

    await saveAddresses([...addresses, newAddress]);
    form.reset();
  };

  const handleDelete = async (id: string) => {
    const next = addresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    await saveAddresses(next);
  };

  const handleSetDefault = async (id: string) => {
    await saveAddresses(
      addresses.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  return (
    <FadeIn>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-light">Saved Addresses</h2>
          <p className="mt-2 text-sm text-noire-muted">
            Manage your shipping addresses — synced to your account
          </p>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-8 border border-dashed border-noire-border py-12 text-center">
          <span className="text-2xl" aria-hidden="true">📦</span>
          <p className="mt-3 text-sm text-noire-muted">No saved addresses yet, bhai.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-noire-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {address.isDefault && (
                    <p className="text-xs uppercase tracking-widest text-accent-cyan">
                      Default
                    </p>
                  )}
                  <p className="mt-1 text-sm font-medium">{address.label}</p>
                  <p className="mt-1 text-sm text-noire-muted">
                    {address.fullName}
                    <br />
                    {address.street}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.country}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent-pink"
                    onClick={() => handleDelete(address.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {defaultAddress && (
        <p className="mt-4 text-xs text-noire-muted">
          Checkout will use your default address when available.
        </p>
      )}

      <form
        className="mt-8 max-w-lg space-y-4 border-t border-noire-border pt-8"
        onSubmit={handleAdd}
      >
        <h3 className="text-sm font-medium">Add New Address</h3>
        <div>
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" placeholder="Home, Office..." className="mt-2" />
        </div>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={user.displayName}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="street">Street</Label>
          <Input id="street" name="street" required className="mt-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="postal">Postal Code</Label>
            <Input id="postal" name="postal" required className="mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue="MH" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue="India" className="mt-2" />
          </div>
        </div>
        <Button type="submit">Save Address</Button>
      </form>
    </FadeIn>
  );
}
