import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProAppNavProvider } from "@/components/pro/ProAppNavContext";
import { ProAppHeader } from "@/components/pro/ProAppHeader";
import { ProAppMainShell } from "@/components/pro/ProAppMainShell";
import { ProStackUnavailable } from "@/components/pro/ProStackUnavailable";
import { proWebShell } from "@/components/pro/ux/pro-surfaces";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import { createClient } from "@/lib/supabase/server";
import { bootstrapDefaultProject, countArchivedProjectsForUser, listProjectsForUser } from "@/lib/pro/bootstrap-default-project";
import { getProAccess, getProBillingSnapshot } from "@/lib/entitlements";
import { ensureInviteTrialEntitlement } from "@/lib/pro/entitle-invite-user";
import { ProRetentionBanner } from "@/components/pro/ProRetentionBanner";
import { createAdminClient } from "@/lib/supabase/admin";
import { purgeExpiredProjectsForUser } from "@/lib/pro/purge-expired-projects";

export const metadata: Metadata = {
  title: "35mmAiPro — Workspace",
  description: "Pro workspace: cloud projects, save, and prompt pack export.",
};

export default async function ProAppLayout({ children }: { children: React.ReactNode }) {
  if (!isProStackConfigured()) {
    return <ProStackUnavailable context="workspace" />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/pro/app");
  }

  // Soft launch allowlist: invite cookie → studio access before the gate.
  await ensureInviteTrialEntitlement(user.id);

  const access = await getProAccess();
  if (!access.canOpenStudio) {
    const billing = await getProBillingSnapshot();
    try {
      const admin = createAdminClient();
      await purgeExpiredProjectsForUser(admin, {
        id: user.id,
        subscription_status: billing?.subscription_status ?? null,
        subscription_current_period_end: billing?.subscription_current_period_end ?? null,
      });
    } catch {
      /* service role optional locally — cron still sweeps production */
    }
    redirect("/pro?subscribe=required");
  }

  if (access.canWrite) {
    await bootstrapDefaultProject(supabase, user.id);
  }
  const { projects } = await listProjectsForUser(supabase, user.id);
  const archivedCount = access.canWrite ? await countArchivedProjectsForUser(supabase, user.id) : 0;
  const billing = await getProBillingSnapshot();

  return (
    <ProAppNavProvider>
      {/* Single-row mobile header (~3.25rem) + safe area; ResizeObserver overwrites live. */}
      <div
        data-pro-app-shell
        className="flex min-h-0 flex-1 flex-col"
        style={
          {
            ["--pro-app-header-height" as string]:
              "calc(3.25rem + env(safe-area-inset-top))",
          } as CSSProperties
        }
      >
        <ProAppHeader
          email={user.email}
          userMetadata={user.user_metadata as { full_name?: string; name?: string } | undefined}
          billing={billing}
          projects={projects}
          archivedCount={archivedCount}
          retention={access.retention}
        />
        <main className={proWebShell.main}>
          {access.retention && access.deleteAtIso ? (
            <ProRetentionBanner deleteAtIso={access.deleteAtIso} />
          ) : null}
          <ProAppMainShell projects={projects} retention={access.retention}>
            {children}
          </ProAppMainShell>
        </main>
      </div>
    </ProAppNavProvider>
  );
}
