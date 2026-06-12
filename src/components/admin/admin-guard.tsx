"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AdminSidebar } from "@/components/admin/admin-layout";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-noire-muted">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-noire-cream/30">
      <AdminSidebar />
      <main className="ml-64 p-8">
        {!isAdmin && (
          <div className="mb-6 border border-noire-gold bg-noire-gold/10 p-4 text-sm">
            Demo mode: Admin access granted for development. Set user role to &quot;admin&quot; in Firestore for production.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
