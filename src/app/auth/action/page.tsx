import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import EmailVerificationActionPage from "./email-verification-action-client";

export default function AuthActionPage() {
  return (
    <Suspense fallback={<PageLoader label="Opening verification link" fullPage className="pt-20" />}>
      <EmailVerificationActionPage />
    </Suspense>
  );
}
