import { PageLoader } from "@/components/ui/page-loader";

export default function EmailVerificationActionLoading() {
  return <PageLoader label="Opening verification link" fullPage className="pt-20" />;
}
