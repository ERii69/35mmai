import { ProMarketingHeader } from "@/components/pro/ProMarketingHeader";
import { ProWebShell } from "@/components/pro/ProWebShell";
import { getProMarketingSession } from "@/lib/pro/marketing-session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { userEmail, userMetadata, entitled, canManageBilling } = await getProMarketingSession();

  return (
    <ProWebShell>
      <ProMarketingHeader
        email={userEmail}
        entitled={entitled}
        userMetadata={userMetadata}
        canManageBilling={canManageBilling}
      />
      {children}
    </ProWebShell>
  );
}
