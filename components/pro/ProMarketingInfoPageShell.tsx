import { ProMarketingHeader } from "@/components/pro/ProMarketingHeader";
import type { ReactNode } from "react";

type Props = {
  userEmail: string | null;
  userMetadata?: { full_name?: string; name?: string } | null;
  entitled: boolean;
  canManageBilling?: boolean;
  subscribeRequired?: boolean;
  checkoutEnabled?: boolean;
  children: ReactNode;
};

/** Shared shell for public /pro pages — header + content (background from pro/layout). */
export function ProMarketingInfoPageShell({
  userEmail,
  userMetadata,
  entitled,
  canManageBilling = false,
  subscribeRequired,
  checkoutEnabled = true,
  children,
}: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <ProMarketingHeader
        email={userEmail}
        entitled={entitled}
        userMetadata={userMetadata}
        canManageBilling={canManageBilling}
        subscribeRequired={subscribeRequired}
        checkoutEnabled={checkoutEnabled}
      />
      {children}
    </div>
  );
}
