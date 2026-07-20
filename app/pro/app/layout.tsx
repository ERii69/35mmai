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
import { getProBillingSnapshot, isProEntitled } from "@/lib/entitlements";

export const metadata: Metadata = {
  title: "35mmAiPro — Workspace",
  description: "Pro workspace: projects, cloud state, and exports (rolling out).",
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

  const entitled = await isProEntitled();
  if (!entitled) {
    redirect("/pro?subscribe=required");
  }

  await bootstrapDefaultProject(supabase, user.id);
  const { projects } = await listProjectsForUser(supabase, user.id);
  const archivedCount = await countArchivedProjectsForUser(supabase, user.id);
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
        />
        <main className={proWebShell.main}>
          <ProAppMainShell projects={projects}>{children}</ProAppMainShell>
        </main>
      </div>
    </ProAppNavProvider>
  );
}
