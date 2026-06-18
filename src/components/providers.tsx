"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { EmailVerificationWaitingRoom } from "@/components/auth/email-verification-waiting-room";
import { WelcomeSplash } from "@/components/auth/welcome-splash";
import { AppToaster } from "@/components/ui/app-toaster";
import { LiveSyncNotifier } from "@/components/providers/live-sync-notifier";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <EmailVerificationWaitingRoom />
      <WelcomeSplash />
      <LiveSyncNotifier />
      <AppToaster />
    </AuthProvider>
  );
}
