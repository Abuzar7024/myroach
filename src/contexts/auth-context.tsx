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
  sendEmailVerification,
  applyActionCode,
  setPersistence,
  browserLocalPersistence,
  type User as FirebaseUser,
  type Auth,
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
import { getEmailVerificationContinueUrl } from "@/lib/auth-email-action";
import { mapFirebaseAuthError } from "@/lib/firebase-auth-errors";
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
  needsEmailVerification: boolean;
  pendingDisplayName: string | null;
  showWelcomeSplash: boolean;
  logout: () => Promise<void>;
  signInWithTestCredentials: (
    phone: string,
    otp: string,
    options?: { forRegistration?: boolean }
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ needsVerification: boolean }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ needsVerification: boolean }>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  completeEmailVerificationLink: (oobCode: string) => Promise<void>;
  dismissWelcomeSplash: () => void;
  completeTestRegistration: (name: string, address: RegistrationAddress) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TEST_USER_ID = "test-user-8770206120";
const TEST_AUTH_KEY = "myroach-test-auth";
/** Customer storefront only — Firebase persistence is ignored until user signs in here. */
const STOREFRONT_AUTH_KEY = "myroach-storefront-auth";

function markStorefrontSession(uid: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STOREFRONT_AUTH_KEY, uid);
  }
}

function clearStorefrontSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STOREFRONT_AUTH_KEY);
  }
}

function getStorefrontSessionUid(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STOREFRONT_AUTH_KEY);
}

async function ensureStorefrontPersistence(auth: Auth) {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    /* already set */
  }
}

async function signOutIfNotStorefrontSession(auth: Auth, fbUser: FirebaseUser | null): Promise<boolean> {
  if (!fbUser) return false;
  const stored = getStorefrontSessionUid();
  if (!stored) {
    markStorefrontSession(fbUser.uid);
    return false;
  }
  if (stored !== fbUser.uid) {
    await signOut(auth);
    return true;
  }
  return false;
}

function saveTestSession(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TEST_AUTH_KEY, JSON.stringify(user));
  }
}

function loadTestSession(): User | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(TEST_AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(TEST_AUTH_KEY);
    return null;
  }
}

function clearTestSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TEST_AUTH_KEY);
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
  const [pendingDisplayName, setPendingDisplayName] = useState<string | null>(null);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);

  const needsEmailVerification = Boolean(
    !isMockDataMode() && firebaseUser && !firebaseUser.emailVerified
  );

  const dismissWelcomeSplash = () => setShowWelcomeSplash(false);

  const triggerWelcomeIfNeeded = (fbUser: FirebaseUser, displayName: string) => {
    const key = `myroach-welcome-${fbUser.uid}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(key) === "pending") {
      sessionStorage.removeItem(key);
      setPendingDisplayName(displayName);
      setShowWelcomeSplash(true);
    }
  };

  useEffect(() => {
    if (!isMockDataMode()) return;
    const saved = loadTestSession();
    if (saved && getStorefrontSessionUid() === TEST_USER_ID) {
      setUser(saved);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    if (!isFirebaseConfigured || !auth || !db) {
      setLoading(false);
      return;
    }

    void ensureStorefrontPersistence(auth);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (pendingRegistration) {
        setLoading(false);
        return;
      }

      if (hasTestSession() && isMockDataMode()) {
        setLoading(false);
        return;
      }

      if (await signOutIfNotStorefrontSession(auth, fbUser)) {
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(fbUser);
      if (fbUser) {
        if (!isMockDataMode() && !fbUser.emailVerified) {
          setLoading(false);
          return;
        }

        try {
          if (shouldAttemptFirestore()) {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
              const mapped = mapUser(fbUser.uid, userDoc.data() as Record<string, unknown>);
              if (mapped.role === "admin") {
                await signOut(auth);
                clearStorefrontSession();
                setFirebaseUser(null);
                setUser(null);
                setLoading(false);
                return;
              }
              setUser(mapped);
              setPendingDisplayName(mapped.displayName);
              if (fbUser.emailVerified) {
                triggerWelcomeIfNeeded(fbUser, mapped.displayName);
              }
              setLoading(false);
              return;
            }
          }
          const newUser = await upsertUserDoc(db, fbUser);
          setUser(newUser);
          setPendingDisplayName(newUser.displayName);
          if (fbUser.emailVerified) {
            triggerWelcomeIfNeeded(fbUser, newUser.displayName);
          }
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
    setPendingDisplayName(null);
    setShowWelcomeSplash(false);
    clearTestSession();
    clearStorefrontSession();
  };

  const sendVerificationEmail = async () => {
    const auth = getAuth();
    if (!auth?.currentUser) throw new Error("Not signed in");
    try {
      await sendEmailVerification(auth.currentUser, {
        url: getEmailVerificationContinueUrl(),
        handleCodeInApp: true,
      });
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error));
    }
  };

  const completeEmailVerificationLink = async (oobCode: string) => {
    const auth = getAuth();
    const db = getFirestore();
    if (!auth) throw new Error("Firebase Auth is not configured");

    await applyActionCode(auth, oobCode);

    if (auth.currentUser) {
      markStorefrontSession(auth.currentUser.uid);
      await auth.currentUser.reload();
      setFirebaseUser(auth.currentUser);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(`myroach-welcome-${auth.currentUser.uid}`, "pending");
      }

      if (db && shouldAttemptFirestore()) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const mapped = mapUser(auth.currentUser.uid, userDoc.data() as Record<string, unknown>);
            setUser(mapped);
            setPendingDisplayName(mapped.displayName);
            triggerWelcomeIfNeeded(auth.currentUser, mapped.displayName);
            return;
          }
        } catch (error) {
          if (isRecoverableFirestoreError(error)) markFirestoreUnavailable();
        }
      }

      const local = buildLocalUser(auth.currentUser, { displayName: pendingDisplayName ?? undefined });
      setUser(local);
      triggerWelcomeIfNeeded(auth.currentUser, local.displayName);
    }
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    const auth = getAuth();
    const db = getFirestore();
    if (!auth?.currentUser) return false;
    await auth.currentUser.reload();
    setFirebaseUser(auth.currentUser);
    if (!auth.currentUser.emailVerified) return false;

    markStorefrontSession(auth.currentUser.uid);

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`myroach-welcome-${auth.currentUser.uid}`, "pending");
    }

    if (db && shouldAttemptFirestore()) {
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const mapped = mapUser(auth.currentUser.uid, userDoc.data() as Record<string, unknown>);
          setUser(mapped);
          setPendingDisplayName(mapped.displayName);
          triggerWelcomeIfNeeded(auth.currentUser, mapped.displayName);
          return true;
        }
      } catch (error) {
        if (isRecoverableFirestoreError(error)) markFirestoreUnavailable();
      }
    }

    const local = buildLocalUser(auth.currentUser, { displayName: pendingDisplayName ?? undefined });
    setUser(local);
    triggerWelcomeIfNeeded(auth.currentUser, local.displayName);
    return true;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const auth = getAuth();
    const db = getFirestore();
    if (!auth) throw new Error("Firebase Auth is not configured");

    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error));
    }

    markStorefrontSession(cred.user.uid);
    setFirebaseUser(cred.user);

    if (db && shouldAttemptFirestore()) {
      try {
        const userDoc = await getDoc(doc(db, "users", cred.user.uid));
        if (userDoc.exists()) {
          const mapped = mapUser(cred.user.uid, userDoc.data() as Record<string, unknown>);
          if (mapped.role === "admin") {
            await signOut(auth);
            clearStorefrontSession();
            throw new Error("ADMIN_USE_PANEL");
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === "ADMIN_USE_PANEL") throw error;
        if (!isRecoverableFirestoreError(error)) throw error;
      }
    }

    if (!cred.user.emailVerified) {
      setPendingDisplayName(cred.user.displayName || email.split("@")[0]);
      return { needsVerification: true };
    }
    return { needsVerification: false };
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const auth = getAuth();
    const db = getFirestore();
    if (!auth || !db) throw new Error("Firebase is not configured");

    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error));
    }

    markStorefrontSession(cred.user.uid);
    setFirebaseUser(cred.user);
    setPendingDisplayName(name.trim());

    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        name: name.trim(),
        email: email.trim(),
        role: "customer",
        active: true,
        addresses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      await signOut(auth);
      clearStorefrontSession();
      setFirebaseUser(null);
      setPendingDisplayName(null);
      throw new Error(mapFirebaseAuthError(error));
    }

    try {
      await sendEmailVerification(cred.user, {
        url: getEmailVerificationContinueUrl(),
        handleCodeInApp: true,
      });
    } catch (error) {
      console.error("[auth] sendEmailVerification failed:", error);
      // Account + profile saved — waiting room can resend.
    }

    return { needsVerification: true };
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
      markStorefrontSession(TEST_USER_ID);
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
    markStorefrontSession(TEST_USER_ID);
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
        needsEmailVerification,
        pendingDisplayName,
        showWelcomeSplash,
        logout,
        signInWithTestCredentials,
        signInWithEmail,
        signUpWithEmail,
        sendVerificationEmail,
        checkEmailVerified,
        completeEmailVerificationLink,
        dismissWelcomeSplash,
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
