"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, getFirestore, isFirebaseConfigured } from "@/lib/firebase/config";
import { mapUser } from "@/lib/firebase/mappers";
import { isMockDataMode } from "@/lib/config";
import {
  isRecoverableFirestoreError,
  markFirestoreUnavailable,
  shouldAttemptFirestore,
} from "@/lib/firebase/firestore-utils";
import {
  formatIndianPhoneE164,
  isTestCredentials,
  normalizePhoneDigits,
  TEST_OTP,
  TEST_PHONE,
} from "@/lib/auth-utils";
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
  signInWithTestCredentials: (
    phone: string,
    otp: string,
    options?: { forRegistration?: boolean }
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  completeTestRegistration: (name: string, address: RegistrationAddress) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TEST_USER_ID = "test-user-8770206120";
const TEST_AUTH_KEY = "myroach-test-auth";

function saveTestSession(user: User) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TEST_AUTH_KEY, JSON.stringify(user));
  }
}

function loadTestSession(): User | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(TEST_AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    sessionStorage.removeItem(TEST_AUTH_KEY);
    return null;
  }
}

function clearTestSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TEST_AUTH_KEY);
  }
}

function hasTestSession(): boolean {
  return loadTestSession() !== null;
}

function buildTestUser(extra?: Partial<User>): User {
  const now = new Date().toISOString();
  return {
    id: TEST_USER_ID,
    email: "",
    displayName: extra?.displayName || "Test User",
    phone: formatIndianPhoneE164(TEST_PHONE),
    role: "customer",
    addresses: extra?.addresses ?? [],
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
}

function assertTestCredentials(phone: string, otp: string) {
  if (!isTestCredentials(phone, otp)) {
    throw new Error(
      `Use test phone ${TEST_PHONE} and OTP ${TEST_OTP}. Firebase SMS is disabled in test mode.`
    );
  }
}

function buildRegistrationAddress(name: string, address: RegistrationAddress): Address {
  const street = address.line2 ? `${address.line1}, ${address.line2}` : address.line1;
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
      const mapped = mapUser(fbUser.uid, userDoc.data() as Record<string, unknown>);
      await setDoc(
        ref,
        { phone: fbUser.phoneNumber || extra?.phone, updatedAt: now },
        { merge: true }
      );
      return { ...mapped, ...extra };
    }

    const newUser = buildLocalUser(fbUser, extra);
    await setDoc(ref, {
      name: newUser.displayName,
      email: newUser.email,
      role: "customer",
      active: true,
      addresses: newUser.addresses,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newUser;
  } catch (error) {
    if (isRecoverableFirestoreError(error)) {
      markFirestoreUnavailable();
      return buildLocalUser(fbUser, extra);
    }
    throw error;
  }
}

async function saveTestUserToFirestore(user: User): Promise<User> {
  const db = getFirestore();
  if (!db || !shouldAttemptFirestore()) return user;

  try {
    await setDoc(doc(db, "users", user.id), user, { merge: true });
    return user;
  } catch (error) {
    if (isRecoverableFirestoreError(error)) {
      markFirestoreUnavailable();
    }
    return user;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRegistration, setPendingRegistration] = useState(false);

  useEffect(() => {
    if (!isMockDataMode()) return;
    const saved = loadTestSession();
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    if (!isFirebaseConfigured || !auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (pendingRegistration) {
        setLoading(false);
        return;
      }

      if (hasTestSession() && isMockDataMode()) {
        setLoading(false);
        return;
      }

      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          if (shouldAttemptFirestore()) {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
              setUser(mapUser(fbUser.uid, userDoc.data() as Record<string, unknown>));
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
      } else if (!hasTestSession()) {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [pendingRegistration]);

  const logout = async () => {
    const auth = getAuth();
    if (auth && firebaseUser) await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setPendingRegistration(false);
    clearTestSession();
  };

  const signInWithEmail = async (email: string, password: string) => {
    const auth = getAuth();
    if (!auth) throw new Error("Firebase Auth is not configured");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const auth = getAuth();
    const db = getFirestore();
    if (!auth || !db) throw new Error("Firebase is not configured");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: "customer",
      active: true,
      addresses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const signInWithTestCredentials = async (
    phone: string,
    otp: string,
    options?: { forRegistration?: boolean }
  ) => {
    if (!isMockDataMode()) {
      throw new Error("Phone test login is disabled. Use email and password.");
    }
    assertTestCredentials(phone, otp);
    normalizePhoneDigits(phone);

    const forRegistration = options?.forRegistration ?? false;
    const testUser = buildTestUser();
    setPendingRegistration(forRegistration);
    setUser(testUser);
    setFirebaseUser(null);
    setLoading(false);

    if (!forRegistration) {
      saveTestSession(testUser);
    }
  };

  const completeTestRegistration = async (name: string, address: RegistrationAddress) => {
    if (!user || user.id !== TEST_USER_ID) {
      throw new Error("Verify test OTP first.");
    }

    const savedAddress = buildRegistrationAddress(name, address);
    const updated = buildTestUser({
      displayName: name,
      addresses: [savedAddress],
    });

    const saved = await saveTestUserToFirestore(updated);
    setUser(saved);
    setPendingRegistration(false);
    saveTestSession(saved);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    const db = getFirestore();
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    if (db && shouldAttemptFirestore()) {
      try {
        await setDoc(
          doc(db, "users", user.id),
          {
            name: updated.displayName,
            email: updated.email,
            phone: updated.phone,
            addresses: updated.addresses,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        if (isRecoverableFirestoreError(error)) {
          markFirestoreUnavailable();
        }
      }
    }
    setUser(updated);
    if (user.id === TEST_USER_ID) {
      saveTestSession(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAdmin: user?.role === "admin",
        logout,
        signInWithTestCredentials,
        signInWithEmail,
        signUpWithEmail,
        completeTestRegistration,
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
