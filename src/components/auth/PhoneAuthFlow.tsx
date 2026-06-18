"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import {
  isValidIndianMobile,
  TEST_OTP,
  TEST_PHONE,
  normalizePhoneDigits,
} from "@/lib/auth-utils";
import { toast } from "sonner";
import { PincodeAddressFields } from "@/components/address/pincode-address-fields";

type Step = "phone" | "otp" | "name" | "address";

interface PhoneAuthFlowProps {
  mode?: "login" | "register";
  onSuccess?: () => void;
}

export function PhoneAuthFlow({ mode = "login", onSuccess }: PhoneAuthFlowProps) {
  const { signInWithTestCredentials, completeTestRegistration } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(TEST_PHONE);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const phoneDigits = normalizePhoneDigits(phone);
  const phoneValid = isValidIndianMobile(phoneDigits);
  const formattedPhone = phoneValid ? `+91${phoneDigits}` : "";

  const handleContinueToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (phoneDigits !== TEST_PHONE) {
      toast.error(`Test mode only — use phone ${TEST_PHONE}`);
      return;
    }
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      if (mode === "register") {
        await signInWithTestCredentials(phoneDigits, otp, { forRegistration: true });
        setStep("name");
        toast.success("Phone verified — almost there");
      } else {
        await signInWithTestCredentials(phoneDigits, otp);
        toast.success("Signed in successfully");
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full name is required");
      return;
    }
    setStep("address");
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error("Fill in address line, city, state, and pincode");
      return;
    }
    if (!/^\d{6}$/.test(pincode.replace(/\D/g, ""))) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    try {
      await completeTestRegistration(name.trim(), {
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.replace(/\D/g, "").slice(0, 6),
      });
      toast.success("Account created — welcome to the rotation");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  if (step === "address") {
    return (
      <form onSubmit={handleCompleteRegistration} className="space-y-4">
        <p className="text-sm text-noire-muted">Step 3 of 3 — where should we ship your drip?</p>
        <div>
          <Label htmlFor="addr-phone">Phone</Label>
          <Input id="addr-phone" value={formattedPhone} disabled className="mt-2 opacity-70" />
        </div>
        <PincodeAddressFields
          pincode={pincode}
          city={city}
          state={state}
          onPincodeChange={setPincode}
          onCityChange={setCity}
          onStateChange={setState}
          pincodeId="addr-pincode"
          cityId="addr-city"
          stateId="addr-state"
          showCountry={false}
        />
        <div>
          <Label htmlFor="addr-line1">Address Line 1</Label>
          <Input
            id="addr-line1"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            required
            autoFocus
            className="mt-2"
            placeholder="House / flat, street"
          />
        </div>
        <div>
          <Label htmlFor="addr-line2">
            Address Line 2 <span className="text-noire-muted">(optional)</span>
          </Label>
          <Input
            id="addr-line2"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            className="mt-2"
            placeholder="Landmark, area"
          />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={loading}
          onClick={() => setStep("name")}
        >
          Back
        </Button>
      </form>
    );
  }

  if (step === "name") {
    return (
      <form onSubmit={handleNameSubmit} className="space-y-4">
        <p className="text-sm text-noire-muted">Step 2 of 3 — what should we call you?</p>
        <div>
          <Label htmlFor="reg-name">Full Name</Label>
          <Input
            id="reg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="mt-2"
            placeholder="Your name"
          />
        </div>
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <p className="text-sm text-noire-muted">
          Enter the test OTP for +91 {phoneDigits}
        </p>
        <div>
          <Label htmlFor="otp-code">OTP Code</Label>
          <Input
            id="otp-code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            required
            autoFocus
            className="mt-2 text-center text-lg tracking-[0.5em]"
          />
        </div>
        <Button type="submit" className="w-full" loading={loading} disabled={otp.length !== 6}>
          Verify OTP
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={loading}
          onClick={() => {
            setStep("phone");
            setOtp("");
          }}
        >
          Change phone number
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleContinueToOtp} className="space-y-4">
      <div className="rounded-sm border border-accent-cyan/30 bg-noire-black/40 p-3 text-sm text-noire-muted">
        <p className="font-medium text-accent-cyan">Test mode</p>
        <p className="mt-1">No SMS — use the test phone and OTP below.</p>
      </div>
      <div>
        <Label htmlFor="phone-number">Phone Number</Label>
        <div className="mt-2 flex gap-2">
          <span className="flex h-11 items-center border border-noire-border px-3 text-sm text-noire-muted">
            +91
          </span>
          <Input
            id="phone-number"
            type="tel"
            inputMode="numeric"
            value={phone}
            readOnly
            className="flex-1 opacity-90"
          />
        </div>
        {phone.length > 0 && !phoneValid && (
          <p className="mt-1 text-xs text-red-500">Enter a valid 10-digit mobile number</p>
        )}
      </div>
      <div className="rounded-sm border border-noire-border bg-noire-paper/80 p-3 text-sm text-noire-muted">
        <p className="font-medium">Test credentials</p>
        <p className="mt-2">
          Phone: <span className="font-medium text-foreground">{TEST_PHONE}</span>
        </p>
        <p>
          OTP: <span className="font-medium text-foreground">{TEST_OTP}</span>
        </p>
      </div>
      <Button type="submit" className="w-full">
        Continue with test number
      </Button>
    </form>
  );
}
