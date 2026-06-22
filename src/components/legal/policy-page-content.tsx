"use client";

import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { PageLoader } from "@/components/ui/page-loader";
import { useSettings } from "@/hooks/use-settings";
import { SITE_NAME } from "@/lib/constants";
import { getStorePolicy, type StorePolicyKey } from "@/lib/policies";

interface PolicyPageContentProps {
  policyKey: StorePolicyKey;
  title: string;
}

export function PolicyPageContent({ policyKey, title }: PolicyPageContentProps) {
  const { settings, loading } = useSettings();
  const body = getStorePolicy(settings, policyKey);
  const storeName = settings.storeName || SITE_NAME;

  if (loading) {
    return <PageLoader label={`Loading ${title.toLowerCase()}`} fullPage className="pt-20" />;
  }

  return (
    <LegalPageLayout
      title={title}
      subtitle={
        body
          ? `Published policy for ${storeName}.`
          : "This policy has not been published yet."
      }
    >
      {body ? (
        <div className="whitespace-pre-wrap text-base leading-relaxed text-noire-muted">{body}</div>
      ) : (
        <p>
          {storeName} has not published this policy yet. Content added in the admin panel under
          Settings → Policies will appear here automatically.
        </p>
      )}
    </LegalPageLayout>
  );
}
