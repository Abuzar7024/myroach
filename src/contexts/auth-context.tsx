"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type User as FirebaseUser,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, getFirestore, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  isRecoverableFirestoreError,
  markFirestoreUnavailable,
  shouldAttemptFirestore,
} from "@/lib/firebase/firestore-utils";
import type { Address, User } from "@/types";

export interface RegistrationAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  sendPhoneOtp: (phone: string, recaptchaTarget: HTMLElement) => Promise<ConfirmationResult>;
  clearPhoneRecaptcha: () => void;
  verifyPhoneOtp: (confirmation: ConfirmationResult, code: string) => Promise<void>;
  completeRegistration: (name: string, address: RegistrationAddress) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  id: "demo-user",
  email: "",
  displayName: "Demo User",
  role: "customer",
  phone: "+919876543210",
  addresses: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let recaptchaVerifier: RecaptchaVerifier | null = null;

function clearRecaptchaVerifier(): void {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Widget may already be cleared or DOM unmounted.
    }
    recaptchaVerifier = null;
  }
}

function formatIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+91${digits}`;
}

function buildLocalUser(fbUser: FirebaseUser, extra?: Partial<User>): User {
  const now = new Date().toISOString();
  return {
    id: fbUser.uid,
    email: extra?.email || fbUser.email || "",
    displayName: fbUser.displayName || extra?.displayName || "",
    phone: fbUser.phoneNumber || extra?.phone,
    role: "customer",
    addresses: extra?.addresses ?? [],
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
}

function buildRegistrationAddress(
  name: string,
  address: RegistrationAddress
): Address {
  const street = address.line2
    ? `${address.line1}, ${address.line2}`
    : address.line1;

  return {
    id: `addr-${Date.now()}`,
    label: "Home",
    fullName: name,
    street,
    city: address.city,
    state: address.state,
    postalCode: address.pincode,
    country: "India",
    isDefault: true,
  };
}

async function upsertUserDoc(
  db: NonNullable<ReturnType<typeof getFirestore>>,
  fbUser: FirebaseUser,
  extra?: Partial<User>
): Promise<User> {
  if (!shouldAttemptFirestore()) {
    return buildLocalUser(fbUser, extra);
  }

  try {
    const ref = doc(db, "users", fbUser.uid);
    const userDoc = await getDoc(ref);
    const now = new Date().toISOString();

    if (userDoc.exists()) {
      await setDoc(
        ref,
        {
          ...extra,
          phone: fbUser.phoneNumber || extra?.phone,
          updatedAt: now,
        },
        { merge: true }
      );
      return { id: fbUser.uid, ...userDoc.data(), ...extra } as User;
    }

    const newUser = buildLocalUser(fbUser, extra);
    await setDoc(ref, newUser);
    return newUser;
  } catch (error) {
    if (isRecoverableFirestoreError(error)) {
      markFirestoreUnavailable();
      return buildLocalUser(fbUser, extra);
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    if (!isFirebaseConfigured || !auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          if (shouldAttemptFirestore()) {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
              setUser({ id: fbUser.uid, ...userDoc.data() } as User);
              setLoading(false);
              return;
            }
          }
          const newUser = await upsertUserDoc(db, fbUser);
          setUser(newUser);
        } catch (error) {
          if (isRecoverableFirestoreError(error)) {
            markFirestoreUnavailable();
            setUser(buildLocalUser(fbUser));
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    const auth = getAuth();
    if (auth) await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    clearRecaptchaVerifier();
  };

  const clearPhoneRecaptcha = useCallback(() => {
    clearRecaptchaVerifier();
  }, []);

  const sendPhoneOtp = async (phone: string, recaptchaTarget: HTMLElement) => {
    const auth = getAuth();
    if (!auth) {
      throw new Error(
        "Firebase is not configured. Add these to .env.local: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID"
      );
    }

    if (!recaptchaTarget.isConnected) {
      throw new Error(
        "reCAPTCHA target not ready. Wait for the page to finish loading and try again."
      );
    }

    clearRecaptchaVerifier();

    recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaTarget, {
      size: "invisible",
      callback: () => {
        // Invisible reCAPTCHA solved — signInWithPhoneNumber proceeds.
      },
      "expired-callback": () => {
        clearRecaptchaVerifier();
      },
    });

    try {
      const formatted = formatIndianPhone(phone);
      return await signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
    } catch (error) {
      clearRecaptchaVerifier();
      const message = error instanceof Error ? error.message : "Phone auth failed";
      if (message.includes("auth/operation-not-allowed")) {
        throw new Error(
          "Phone authentication is not enabled. Enable it in Firebase Console → Authentication → Sign-in method → Phone."
        );
      }
      if (
        message.includes("auth/invalid-app-credential") ||
        message.includes("recaptcha") ||
        message.includes("already been rendered")
      ) {
        throw new Error(
          "reCAPTCHA failed. Add localhost and 127.0.0.1 under Firebase Console → Authentication → Settings → Authorized domains, or use test phone +91 9876543210 / OTP 123456."
        );
      }
      if (message.includes("auth/too-many-requests")) {
        throw new Error("Too many OTP requests. Wait a few minutes and try again.");
      }
      throw new Error(message);
    }
  };

  const verifyPhoneOtp = async (confirmation: ConfirmationResult, code: string) => {
    const db = getFirestore();
    const result = await confirmation.confirm(code);

    if (db) {
      await upsertUserDoc(db, result.user, {
        phone: result.user.phoneNumber || undefined,
      });
    }
  };

  const completeRegistration = async (name: string, address: RegistrationAddress) => {
    const auth = getAuth();
    const db = getFirestore();
    const fbUser = auth?.currentUser;
    if (!fbUser) throw new Error("Not signed in. Verify OTP first.");

    const savedAddress = buildRegistrationAddress(name, address);
    const phone = fbUser.phoneNumber || undefined;

    await updateProfile(fbUser, { displayName: name });

    if (db) {
      const user = await upsertUserDoc(db, fbUser, {
        displayName: name,
        phone,
        addresses: [savedAddress],
        role: "customer",
      });
      setUser(user);
    } else {
      setUser(
        buildLocalUser(fbUser, {
          displayName: name,
          phone,
          addresses: [savedAddress],
        })
      );
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    const db = getFirestore();
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    if (db && shouldAttemptFirestore()) {
      try {
        await setDoc(doc(db, "users", user.id), updated, { merge: true });
      } catch (error) {
        if (isRecoverableFirestoreError(error)) {
          markFirestoreUnavailable();
        }
      }
    }
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAdmin: user?.role === "admin",
        logout,
        sendPhoneOtp,
        clearPhoneRecaptcha,
        verifyPhoneOtp,
        completeRegistration,
        updateUserProfile,
        isConfigured: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
