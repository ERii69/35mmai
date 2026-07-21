import type { Metadata } from "next";
import { ProMarketingLegalPageContent } from "@/components/pro/ProMarketingLegalPageContent";
import { ProMarketingInfoPageShell } from "@/components/pro/ProMarketingInfoPageShell";
import { ProTermsContent } from "@/components/pro/ProTermsContent";
import { getProMarketingSession } from "@/lib/pro/marketing-session";
import { PRO_TERMS_PATH } from "@/lib/pro/membership-policy";

export const metadata: Metadata = {
  title: "Terms of use — 35mmAiPro",
  description: "35mmAiPro membership terms: private workspace, billing, cancellation, and content.",
};

export default async function ProTermsPage() {
  const { userEmail, userMetadata, entitled, canManageBilling, stackReady, signedIn } =
    await getProMarketingSession();

  return (
    <ProMarketingInfoPageShell
      userEmail={userEmail}
      userMetadata={userMetadata}
      entitled={entitled}
      canManageBilling={canManageBilling}
    >
      <ProMarketingLegalPageContent
        title="Terms of use"
        stackReady={stackReady}
        signedIn={signedIn}
        entitled={entitled}
        returnPath={PRO_TERMS_PATH}
        page="terms"
      >
        <ProTermsContent />
      </ProMarketingLegalPageContent>
    </ProMarketingInfoPageShell>
  );
}
