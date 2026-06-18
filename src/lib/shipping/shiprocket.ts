import { SHIPPING_RATES } from "@/lib/constants";
import type { ShippingOption } from "@/store/cart-store";

const SHIPROCKET_API = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { token: string; expiresAt: number } | null = null;

function isConfigured() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

async function getShiprocketToken(): Promise<string | null> {
  if (!isConfigured()) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const res = await fetch(`${SHIPROCKET_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { token?: string };
  if (!data.token) return null;

  cachedToken = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return data.token;
}

/** Fetch courier rates from Shiprocket when credentials are set; otherwise static rates. */
export async function getShippingRatesForPincode(
  pincode: string,
  weightKg = 0.5
): Promise<{ options: ShippingOption[]; provider: "shiprocket" | "static" }> {
  const token = await getShiprocketToken();
  if (!token || !/^\d{6}$/.test(pincode)) {
    return {
      provider: "static",
      options: SHIPPING_RATES.map((r) => ({
        id: r.id,
        label: r.label,
        price: r.price,
        days: r.days,
        provider: "static",
      })),
    };
  }

  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE || "110001";
  const url = new URL(`${SHIPROCKET_API}/courier/serviceability/`);
  url.searchParams.set("pickup_postcode", pickup);
  url.searchParams.set("delivery_postcode", pincode);
  url.searchParams.set("weight", String(weightKg));
  url.searchParams.set("cod", "0");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      provider: "static",
      options: SHIPPING_RATES.map((r) => ({
        id: r.id,
        label: r.label,
        price: r.price,
        days: r.days,
        provider: "static",
      })),
    };
  }

  const payload = (await res.json()) as {
    data?: {
      available_courier_companies?: Array<{
        courier_company_id: number;
        courier_name: string;
        rate: number;
        estimated_delivery_days?: string;
      }>;
    };
  };

  const couriers = payload.data?.available_courier_companies ?? [];
  if (!couriers.length) {
    return {
      provider: "static",
      options: SHIPPING_RATES.map((r) => ({
        id: r.id,
        label: r.label,
        price: r.price,
        days: r.days,
        provider: "static",
      })),
    };
  }

  const sorted = [...couriers].sort((a, b) => a.rate - b.rate).slice(0, 4);
  return {
    provider: "shiprocket",
    options: sorted.map((c) => ({
      id: `sr-${c.courier_company_id}`,
      label: c.courier_name,
      price: Math.round(c.rate),
      days: c.estimated_delivery_days
        ? `${c.estimated_delivery_days} days`
        : "3–7 business days",
      provider: "shiprocket",
    })),
  };
}

export function shiprocketEnabled() {
  return isConfigured();
}
