import type { Metadata } from "next";
import { ProMarketingLegalPageContent } from "@/components/pro/ProMarketingLegalPageContent";
import { ProMarketingInfoPageShell } from "@/components/pro/ProMarketingInfoPageShell";
import { ProPrivacyContent } from "@/components/pro/ProPrivacyContent";
import { getProMarketingSession } from "@/lib/pro/marketing-session";
import { PRO_PRIVACY_PATH } from "@/lib/pro/membership-policy";

export const metadata: Metadata = {
  title: "Privacy & data — 35mmAiPro",
  description:
    "How 35mmAiPro handles your private projects: account-only access, no sale of data, no AI training on your scripts.",
};

export default async function ProPrivacyPage() {
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
        title="Privacy & data"
        stackReady={stackReady}
        signedIn={signedIn}
        entitled={entitled}
        returnPath={PRO_PRIVACY_PATH}
        page="privacy"
      >
        <ProPrivacyContent />
      </ProMarketingLegalPageContent>
    </ProMarketingInfoPageShell>
  );
}
