"use client";

import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeIndianPincode } from "@/lib/pincode";
import { usePincodeAutoLookup } from "@/hooks/use-pincode-lookup";
import { cn } from "@/lib/utils";

interface PincodeAddressFieldsProps {
  pincode: string;
  city: string;
  state: string;
  onPincodeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCountryChange?: (value: string) => void;
  country?: string;
  showCountry?: boolean;
  pincodeError?: string;
  cityError?: string;
  stateError?: string;
  pincodeId?: string;
  cityId?: string;
  stateId?: string;
  countryId?: string;
  className?: string;
}

export function PincodeAddressFields({
  pincode,
  city,
  state,
  onPincodeChange,
  onCityChange,
  onStateChange,
  onCountryChange,
  country = "India",
  showCountry = true,
  pincodeError,
  cityError,
  stateError,
  pincodeId = "postalCode",
  cityId = "city",
  stateId = "state",
  countryId = "country",
  className,
}: PincodeAddressFieldsProps) {
  const { loading, error, resolvedPincode, reset } = usePincodeAutoLookup(pincode, (result) => {
    onCityChange(result.city);
    onStateChange(result.state);
    onCountryChange?.(result.country || "India");
  });

  const handlePincodeChange = (value: string) => {
    onPincodeChange(value);
    if (value.length < 6) {
      reset();
      onCityChange("");
      onStateChange("");
    }
  };

  const cityLocked = Boolean(resolvedPincode && city.trim());
  const stateLocked = Boolean(resolvedPincode && state.trim());

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label htmlFor={pincodeId}>Pincode</Label>
        <div className="relative mt-2">
          <Input
            id={pincodeId}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={pincode}
            onChange={(e) => handlePincodeChange(normalizeIndianPincode(e.target.value))}
            placeholder="400001"
            className="pr-10"
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-accent-cyan" />
          ) : null}
        </div>
        {pincodeError ? <p className="mt-1 text-xs text-red-500">{pincodeError}</p> : null}
        {!pincodeError && error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
        {!pincodeError && !error && normalizeIndianPincode(pincode).length < 6 ? (
          <p className="mt-1 text-xs text-noire-muted">Enter your 6-digit pincode first — we&apos;ll fetch your city.</p>
        ) : null}
        {!pincodeError && !error && resolvedPincode ? (
          <p className="mt-1 text-xs text-accent-cyan">City and state loaded for {resolvedPincode}.</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={cityId}>City</Label>
          <Input
            id={cityId}
            autoComplete="address-level2"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            readOnly={cityLocked}
            placeholder={loading ? "Fetching city..." : "City"}
            className={cn("mt-2", cityLocked && "opacity-80")}
          />
          {cityError ? <p className="mt-1 text-xs text-red-500">{cityError}</p> : null}
        </div>
        <div>
          <Label htmlFor={stateId}>State</Label>
          <Input
            id={stateId}
            autoComplete="address-level1"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            readOnly={stateLocked}
            placeholder={loading ? "Fetching state..." : "State"}
            className={cn("mt-2", stateLocked && "opacity-80")}
          />
          {stateError ? <p className="mt-1 text-xs text-red-500">{stateError}</p> : null}
        </div>
      </div>

      {showCountry ? (
        <div>
          <Label htmlFor={countryId}>Country</Label>
          <Input
            id={countryId}
            autoComplete="country-name"
            value={country}
            onChange={(e) => onCountryChange?.(e.target.value)}
            readOnly
            className="mt-2 opacity-80"
          />
        </div>
      ) : null}
    </div>
  );
}
