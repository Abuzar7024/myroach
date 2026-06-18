import { NextResponse } from "next/server";
import { isValidIndianPincode, normalizeIndianPincode } from "@/lib/pincode";
import { lookupPincodeLocation } from "@/lib/pincode-lookup";

export async function GET(
  _request: Request,
  context: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode: raw } = await context.params;
    const pincode = normalizeIndianPincode(raw);

    if (!isValidIndianPincode(pincode)) {
      return NextResponse.json({ error: "Valid 6-digit pincode required" }, { status: 400 });
    }

    const location = await lookupPincodeLocation(pincode);
    return NextResponse.json(location);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pincode lookup failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
