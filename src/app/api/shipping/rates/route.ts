import { NextResponse } from "next/server";
import { getShippingRatesForPincode } from "@/lib/shipping/shiprocket";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { pincode?: string; weightKg?: number };
    const pincode = String(body.pincode ?? "").trim();
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: "Valid 6-digit pincode required" }, { status: 400 });
    }
    const result = await getShippingRatesForPincode(pincode, body.weightKg ?? 0.5);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not fetch shipping rates" }, { status: 500 });
  }
}
