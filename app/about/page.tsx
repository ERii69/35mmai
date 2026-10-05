import { AboutPageContent } from "@/components/about/AboutPageContent";
import { ProMarketingInfoPageShell } from "@/components/pro/ProMarketingInfoPageShell";
import { ProWebShell } from "@/components/pro/ProWebShell";
import { getProMarketingSession } from "@/lib/pro/marketing-session";

export default async function AboutPage() {
  const { userEmail, userMetadata, entitled, canManageBilling, checkoutEnabled } =
    await getProMarketingSession();

  return (
    <ProWebShell compact>
      <ProMarketingInfoPageShell
        userEmail={userEmail}
        userMetadata={userMetadata}
        entitled={entitled}
        canManageBilling={canManageBilling}
        checkoutEnabled={checkoutEnabled}
      >
        <AboutPageContent variant="standalone" />
      </ProMarketingInfoPageShell>
    </ProWebShell>
  );
}
