import { isValidIndianPincode, type PincodeLocation } from "@/lib/pincode";

const POSTAL_API = "https://api.postalpincode.in/pincode";

type PostalApiOffice = {
  District?: string;
  State?: string;
  Country?: string;
  Name?: string;
};

type PostalApiResponse = {
  Status?: string;
  Message?: string;
  PostOffice?: PostalApiOffice[] | null;
};

export async function lookupPincodeLocation(pincode: string): Promise<PincodeLocation> {
  if (!isValidIndianPincode(pincode)) {
    throw new Error("Enter a valid 6-digit pincode");
  }

  const res = await fetch(`${POSTAL_API}/${pincode}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    throw new Error("Could not look up pincode right now");
  }

  const payload = (await res.json()) as PostalApiResponse[];
  const entry = payload[0];

  if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
    throw new Error("Pincode not found — check and try again");
  }

  const office = entry.PostOffice[0];
  const city = office.District?.trim() || office.Name?.trim();
  const state = office.State?.trim();

  if (!city || !state) {
    throw new Error("Could not resolve city for this pincode");
  }

  return {
    pincode,
    city,
    state,
    district: office.District?.trim() || city,
    country: office.Country?.trim() || "India",
  };
}
