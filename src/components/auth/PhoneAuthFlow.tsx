"use client";

import { useEffect, useRef, useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { isValidIndianMobile } from "@/lib/auth-utils";
import { toast } from "sonner";

type Step = "phone" | "otp" | "name" | "address";

interface PhoneAuthFlowProps {
  mode?: "login" | "register";
  onSuccess?: () => void;
}

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

export function PhoneAuthFlow({ mode = "login", onSuccess }: PhoneAuthFlowProps) {
  const { sendPhoneOtp, verifyPhoneOtp, completeRegistration, clearPhoneRecaptcha } =
    useAuth();
  const sendOtpButtonRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => () => clearPhoneRecaptcha(), []);

  const phoneDigits = phone.replace(/\D/g, "").slice(-10);
  const phoneValid = isValidIndianMobile(phoneDigits);
  const formattedPhone = phoneValid ? `+91${phoneDigits}` : "";

  if (!isFirebaseConfigured) {
    return (
      <div className="rounded-sm border border-accent-pink/40 bg-noire-black/50 p-4 text-sm text-noire-muted">
        <p className="font-medium text-accent-pink">Firebase not configured</p>
        <p className="mt-2">
          Phone OTP requires Firebase env vars in <code className="text-accent-cyan">.env.local</code>.
          See <code className="text-accent-cyan">FIREBASE_SETUP.md</code> for setup steps.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-xs">
          {REQUIRED_ENV_VARS.map((key) => (
            <li key={key}>
              <code className="text-accent-cyan">{key}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!phoneValid) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    const button = sendOtpButtonRef.current;
    if (!button) {
      toast.error("Send OTP button not ready. Try again.");
      return;
    }
    setLoading(true);
    try {
      const result = await sendPhoneOtp(phoneDigits, button);
      setConfirmation(result);
      setStep("otp");
      toast.success("OTP sent to your phone");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation || otp.length !== 6) return;
    setLoading(true);
    try {
      await verifyPhoneOtp(confirmation, otp);
      if (mode === "register") {
        setStep("name");
        toast.success("Phone verified — almost there");
      } else {
        toast.success("Signed in successfully");
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP. Please try again.");
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
      await completeRegistration(name.trim(), {
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
        <p className="text-sm text-noire-muted">
          Step 3 of 3 — where should we ship your drip?
        </p>
        <div>
          <Label htmlFor="addr-phone">Phone</Label>
          <Input
            id="addr-phone"
            value={formattedPhone}
            disabled
            className="mt-2 opacity-70"
          />
        </div>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="addr-city">City</Label>
            <Input
              id="addr-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="addr-state">State</Label>
            <Input
              id="addr-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="mt-2"
              placeholder="MH"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="addr-pincode">Pincode</Label>
          <Input
            id="addr-pincode"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            className="mt-2"
            placeholder="400001"
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
        <p className="text-sm text-noire-muted">
          Step 2 of 3 — what should we call you?
        </p>
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
          Enter the 6-digit code sent to +91 {phoneDigits}
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
            placeholder="000000"
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
            clearPhoneRecaptcha();
            setStep("phone");
            setOtp("");
            setConfirmation(null);
          }}
        >
          Change phone number
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4">
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
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="9876543210"
            required
            minLength={10}
            maxLength={10}
            autoFocus
            className="flex-1"
          />
        </div>
        {phone.length > 0 && !phoneValid && (
          <p className="mt-1 text-xs text-red-500">Enter a valid 10-digit mobile number</p>
        )}
      </div>
      <Button
        ref={sendOtpButtonRef}
        type="submit"
        className="w-full"
        loading={loading}
        disabled={!phoneValid || loading}
      >
        Send OTP
      </Button>
    </form>
  );
}
