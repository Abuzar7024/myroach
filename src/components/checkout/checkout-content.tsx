"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileOrderSummary } from "@/components/layout/mobile-order-summary";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { toast } from "sonner";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutShipping
      ? {
          ...checkoutShipping,
          country: checkoutShipping.country || "India",
        }
      : { country: "India" },
  });

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

  const onSubmit = (data: CheckoutForm) => {
    setCheckoutShipping(data);
    toast.success("Shipping details saved");
    router.push("/checkout/payment");
  };

  const summaryProps = { items, subtotal, discount, couponCode, shipping, total };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-16 lg:px-8 lg:py-32 lg:pb-32">
        <h1 className="font-display mb-8 text-2xl font-light tracking-wide sm:mb-12 sm:text-3xl">
          Checkout
        </h1>

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
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    autoComplete="address-level2"
                    {...register("city")}
                    className="mt-2"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    autoComplete="address-level1"
                    {...register("state")}
                    className="mt-2"
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postalCode">Pincode</Label>
                  <Input
                    id="postalCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    {...register("postalCode")}
                    className="mt-2"
                    placeholder="400050"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    autoComplete="country-name"
                    defaultValue="India"
                    {...register("country")}
                    className="mt-2"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="h-fit cyber-card p-4 sm:p-6 lg:p-8">
            <MobileOrderSummary total={total}>
              <SummaryLines {...summaryProps} />
            </MobileOrderSummary>

            <div className="hidden lg:block">
              <h2 className="text-sm font-medium uppercase tracking-widest">Order Summary</h2>
              <div className="mt-4">
                <SummaryLines {...summaryProps} />
              </div>
              <Button type="submit" size="lg" className="mt-8 w-full min-h-[44px]">
                Continue to Payment
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed mobile payment bar */}
      <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-accent-cyan/30 bg-noire-charcoal/98 px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-noire-muted">Total</p>
            <p className="text-lg font-semibold text-accent-cyan">{formatPrice(total)}</p>
          </div>
          <Button type="submit" form="checkout-form" size="lg" className="min-h-[44px] flex-1">
            Continue to Payment
          </Button>
        </div>
      </div>
    </>
  );
}
