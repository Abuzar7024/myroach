"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileOrderSummary } from "@/components/layout/mobile-order-summary";
import { BottomIsland } from "@/components/ui/bottom-island";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/contexts/auth-context";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import {
  buildCheckoutDefaults,
  buildProfileFromCheckout,
  getProfileGaps,
} from "@/lib/checkout-profile";
import { toast } from "sonner";
import { PincodeAddressFields } from "@/components/address/pincode-address-fields";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, "").slice(-10))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number")),
  street: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  postalCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().min(1, "Required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function SummaryLines({
  items,
  subtotal,
  discount,
  couponCode,
  shipping,
  total,
}: {
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shipping: number;
  total: number;
}) {
  return (
    <>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-base sm:text-sm">
            <span className="text-noire-muted">
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-noire-border pt-4 text-base sm:text-sm">
        <div className="flex justify-between">
          <span className="text-noire-muted">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-accent-cyan">
            <span>Discount ({couponCode})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-noire-muted">Shipping</span>
          <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
        </div>
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <p className="text-xs text-noire-muted">
            Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}
        <div className="flex justify-between pt-2 text-base font-medium">
          <span>Total</span>
          <span className="text-accent-cyan">{formatPrice(total)}</span>
        </div>
      </div>
    </>
  );
}

export function CheckoutContent() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const {
    items,
    getSubtotal,
    getTotal,
    getShippingCost,
    discount,
    couponCode,
    setCheckoutShipping,
    checkoutShipping,
  } = useCartStore();

  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo(
    () => (user ? buildCheckoutDefaults(user, checkoutShipping) : { country: "India" }),
    [user, checkoutShipping]
  );

  const profileGaps = useMemo(() => (user ? getProfileGaps(user) : []), [user]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  });

  useEffect(() => {
    if (user) reset(buildCheckoutDefaults(user, checkoutShipping));
  }, [user, checkoutShipping, reset]);

  const shipping = getShippingCost();
  const subtotal = getSubtotal();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="text-base text-noire-muted">Your cart is empty.</p>
        <Button asChild className="mt-4 min-h-[44px]">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setSaving(true);
    try {
      setCheckoutShipping(data);
      if (user) {
        await updateUserProfile(buildProfileFromCheckout(user, data));
      }
      toast.success("Delivery details saved");
      router.push("/checkout/payment");
    } catch {
      toast.error("Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const summaryProps = { items, subtotal, discount, couponCode, shipping, total };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:py-16 lg:px-8 lg:py-32 lg:pb-32">
        <h1 className="font-display mb-4 text-2xl font-light tracking-wide sm:mb-6 sm:text-3xl">
          Checkout
        </h1>
        <p className="mb-8 text-sm text-noire-muted">
          Signed in as <span className="text-zinc-300">{user?.email}</span>. Complete your delivery details below.
        </p>

        {profileGaps.length > 0 && (
          <div className="mb-8 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Please add your{" "}
              {profileGaps
                .map((g) => (g === "name" ? "full name" : g === "phone" ? "mobile number" : "delivery address"))
                .join(", ")}{" "}
              to continue. These details are required for delivery and order updates.
            </p>
          </div>
        )}

        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12"
        >
          <div className="space-y-8">
            <section>
              <h2 className="mb-6 text-sm font-medium uppercase tracking-widest">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    {...register("firstName")}
                    className="mt-2"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    {...register("lastName")}
                    className="mt-2"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    {...register("email")}
                    className="mt-2"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    {...register("phone")}
                    className="mt-2"
                    placeholder="9876543210"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <PincodeAddressFields
                    pincode={watch("postalCode") || ""}
                    city={watch("city") || ""}
                    state={watch("state") || ""}
                    country={watch("country") || "India"}
                    onPincodeChange={(value) =>
                      setValue("postalCode", value, { shouldValidate: true, shouldDirty: true })
                    }
                    onCityChange={(value) =>
                      setValue("city", value, { shouldValidate: true, shouldDirty: true })
                    }
                    onStateChange={(value) =>
                      setValue("state", value, { shouldValidate: true, shouldDirty: true })
                    }
                    onCountryChange={(value) =>
                      setValue("country", value, { shouldValidate: true, shouldDirty: true })
                    }
                    pincodeError={errors.postalCode?.message}
                    cityError={errors.city?.message}
                    stateError={errors.state?.message}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    autoComplete="street-address"
                    {...register("street")}
                    className="mt-2"
                  />
                  {errors.street && (
                    <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="h-fit cyber-card p-4 sm:p-6 lg:p-8">
            <h2 className="mb-4 hidden text-sm font-medium uppercase tracking-widest lg:block">Order Summary</h2>
            <MobileOrderSummary total={total}>
              <SummaryLines {...summaryProps} />
            </MobileOrderSummary>
            <Button type="submit" size="lg" className="mt-6 hidden w-full min-h-[44px] lg:flex" disabled={saving}>
              {saving ? "Saving..." : "Continue to Payment"}
            </Button>
          </div>
        </form>
      </div>

      <BottomIsland
        label="Total"
        primary={formatPrice(total)}
        action={
          <Button
            type="submit"
            form="checkout-form"
            disabled={saving}
            className="h-10 min-h-10 rounded-full px-5 text-[11px] tracking-wider"
          >
            {saving ? "..." : "Pay"}
          </Button>
        }
      />
    </>
  );
}
