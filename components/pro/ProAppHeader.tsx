"use client";

import { usePathname } from "next/navigation";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { ProBadge } from "@/components/brand/ProBadge";
import { ProAppHeaderChrome } from "@/components/pro/ProAppHeaderChrome";
import { ProHeaderAccountMenu } from "@/components/pro/ProHeaderAccountMenu";
import { ProProjectSwitcher } from "@/components/pro/ProProjectSwitcher";
import { ProShellNav } from "@/components/pro/ProShellNav";
import { BRAND_NAME } from "@/lib/brand/brand-identity";
import type { ProBillingSnapshot } from "@/lib/entitlements";
import type { ProjectRow } from "@/lib/pro/types";

type Props = {
  email?: string | null;
  userMetadata?: { full_name?: string; name?: string } | null;
  billing?: ProBillingSnapshot | null;
  projects: ProjectRow[];
  archivedCount: number;
};

/** Tighter on mobile single-row header; matches free catalog scale from md+. */
const FREE_CATALOG_LOGO_CLASS = "h-[24px] text-[24px] md:h-[40px] md:text-[40px]";

export function ProAppHeader({
  email,
  userMetadata,
  billing,
  projects,
  archivedCount,
}: Props) {
  const pathname = usePathname();
  const currentProjectId = pathname.match(/^\/pro\/app\/workspace\/([^/]+)/)?.[1] ?? null;
  const canManageBilling = Boolean(billing?.stripe_customer_id);

  return (
    <ProAppHeaderChrome
      leading={
        <Logo35mmAI
          className={FREE_CATALOG_LOGO_CLASS}
          href="/pro/app"
          aria-label={`${BRAND_NAME} Pro studio`}
        />
      }
      mobileCenter={
        <ProProjectSwitcher
          initialProjects={projects}
          currentProjectId={currentProjectId}
          compact
          className="w-full max-w-full justify-start"
        />
      }
      trailing={
        <>
          <ProBadge
            variant="header"
            title="Pro workspace"
            href="/pro/app"
            className="max-md:h-6 max-md:px-1.5 max-md:text-[11px]"
          />
          {email ? (
            <ProHeaderAccountMenu
              email={email}
              userMetadata={userMetadata}
              canManageBilling={canManageBilling}
              entitled
              archivedCount={archivedCount}
              mobileTrigger="user"
            />
          ) : (
            <span className="inline-flex size-9 shrink-0 sm:size-10" aria-hidden />
          )}
        </>
      }
      nav={<ProShellNav projects={projects} archivedCount={archivedCount} />}
    />
  );
}
