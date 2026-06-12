"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

export function ProfileContent() {
  const { user, updateUserProfile } = useAuth();

  if (!user) {
    return (
      <div className="py-32 text-center">
        <p className="text-noire-muted">Please sign in to view your profile.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const defaultAddress =
    user.addresses?.find((a) => a.isDefault) ?? user.addresses?.[0];

  return (
    <div>
      <h2 className="font-display text-2xl font-light">Profile</h2>
      <p className="mt-2 text-sm text-noire-muted">
        Your account details from phone sign-in
      </p>

      <form
        className="mt-8 max-w-lg space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const displayName = (form.elements.namedItem("name") as HTMLInputElement).value;
          await updateUserProfile({ displayName });
          toast.success("Profile updated");
        }}
      >
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={user.displayName} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={user.phone || "—"}
            disabled
            className="mt-2 opacity-70"
          />
          <p className="mt-1 text-xs text-noire-muted">
            Phone is verified at sign-in and cannot be changed here.
          </p>
        </div>
        <Button type="submit">Save Name</Button>
      </form>

      <div className="mt-10 max-w-lg border-t border-noire-border pt-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Default Address</h3>
          <Button asChild variant="ghost" size="sm">
            <Link href="/account/addresses">Edit addresses</Link>
          </Button>
        </div>
        {defaultAddress ? (
          <p className="mt-3 text-sm text-noire-muted">
            {defaultAddress.fullName}
            <br />
            {defaultAddress.street}
            <br />
            {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
            <br />
            {defaultAddress.country}
          </p>
        ) : (
          <p className="mt-3 text-sm text-noire-muted">
            No address saved yet.{" "}
            <Link href="/account/addresses" className="text-accent-cyan hover:text-accent-pink">
              Add one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
