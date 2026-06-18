"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeIndianPincode } from "@/lib/pincode";

export interface PincodeLookupResult {
  pincode: string;
  city: string;
  state: string;
  district: string;
  country: string;
}

export function usePincodeLookup(
  onResolved?: (result: PincodeLookupResult) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedPincode, setResolvedPincode] = useState<string | null>(null);
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;

  const reset = useCallback(() => {
    setError(null);
    setResolvedPincode(null);
  }, []);

  const lookup = useCallback(async (rawPincode: string) => {
    const pincode = normalizeIndianPincode(rawPincode);
    if (pincode.length !== 6) {
      reset();
      return null;
    }

    if (resolvedPincode === pincode) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pincode/${pincode}`);
      const data = (await res.json()) as PincodeLookupResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Pincode not found");
      }

      setResolvedPincode(pincode);
      onResolvedRef.current?.(data);
      return data;
    } catch (err) {
      setResolvedPincode(null);
      const message = err instanceof Error ? err.message : "Pincode lookup failed";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [reset, resolvedPincode]);

  return { lookup, loading, error, resolvedPincode, reset };
}

export function usePincodeAutoLookup(
  pincode: string,
  onResolved?: (result: PincodeLookupResult) => void
) {
  const { lookup, loading, error, resolvedPincode, reset } = usePincodeLookup(onResolved);

  useEffect(() => {
    const normalized = normalizeIndianPincode(pincode);
    if (normalized.length !== 6) {
      reset();
      return;
    }
    void lookup(normalized);
  }, [pincode, lookup, reset]);

  return { loading, error, resolvedPincode, reset };
}
