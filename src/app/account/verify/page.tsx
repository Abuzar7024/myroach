import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { EmailVerificationWaitingRoomScreen } from "@/components/auth/email-verification-waiting-room-screen";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoader label="Opening waiting room" fullPage className="pt-20" />}>
      <EmailVerificationWaitingRoomScreen />
    </Suspense>
  );
}
