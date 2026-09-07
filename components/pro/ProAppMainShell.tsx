"use client";

import { ProOnboardingModal } from "@/components/pro/ProOnboardingModal";
import { ProAppKeyboardNav } from "@/components/pro/ProAppKeyboardNav";
import { ProDashboardNewProjectFab } from "@/components/pro/ProDashboardNewProjectFab";
import { ProToastProvider } from "@/components/pro/ux/ProToastProvider";
import { pickWorkspaceRedirectProject } from "@/lib/pro/pick-continue-project";
import { resolveWorkspaceNavHref } from "@/lib/pro/resolve-workspace-nav-href";
import { workspaceTemplatesExportsHref } from "@/lib/pro/workspace-deep-links";
import type { ProjectRow } from "@/lib/pro/types";

type Props = {
  children: React.ReactNode;
  projects: ProjectRow[];
  retention?: boolean;
};

export function ProAppMainShell({ children, projects, retention = false }: Props) {
  const defaultId = pickWorkspaceRedirectProject(projects);
  const defaultWorkspaceHref = resolveWorkspaceNavHref(null, defaultId);
  const defaultExportsHref = defaultId ? workspaceTemplatesExportsHref(defaultId) : null;

  return (
    <>
      {retention ? null : <ProDashboardNewProjectFab variant="host" />}
      {retention ? null : (
        <ProAppKeyboardNav
          defaultWorkspaceHref={defaultWorkspaceHref}
          defaultExportsHref={defaultExportsHref}
        />
      )}
      {retention ? null : <ProOnboardingModal />}
      <ProToastProvider>{children}</ProToastProvider>
    </>
  );
}
