"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProProjectSwitcher } from "@/components/pro/ProProjectSwitcher";
import { ProHintTooltip } from "@/components/pro/ux/ProHintTooltip";
import {
  proNavPill,
  proNavCountBadge,
} from "@/components/pro/ux/pro-surfaces";
import { pickWorkspaceRedirectProject } from "@/lib/pro/pick-continue-project";
import { resolveWorkspaceNavHref } from "@/lib/pro/resolve-workspace-nav-href";
import type { ProjectRow } from "@/lib/pro/types";

const navItem = "shrink-0 whitespace-nowrap touch-manipulation";

type Props = {
  projects: ProjectRow[];
  archivedCount: number;
};

/**
 * Desktop app chrome nav — Projects · Dashboard · Workspace · Archives.
 * Mobile uses a single header row (logo + project switcher + account); Studio/Archives live in the account menu.
 */
export function ProShellNav({ projects, archivedCount }: Props) {
  const pathname = usePathname();
  const onDashboard = pathname === "/pro/app";
  const onArchives = pathname === "/pro/app/archives";
  const workspaceMatch = pathname.match(/^\/pro\/app\/workspace\/([^/]+)/);
  const currentProjectId = workspaceMatch?.[1] ?? null;
  const onWorkspace = Boolean(currentProjectId);
  const defaultProjectId = pickWorkspaceRedirectProject(projects);
  const workspaceHref = resolveWorkspaceNavHref(currentProjectId, defaultProjectId);

  return (
    <nav
      className="hidden border-t border-white/[0.06] pt-3 md:block"
      aria-label="Pro workspace navigation"
    >
      <div className="flex flex-wrap items-center gap-2">
        <ProProjectSwitcher
          initialProjects={projects}
          currentProjectId={currentProjectId}
        />
        <Link
          href="/pro/app"
          className={`${proNavPill(onDashboard)} ${navItem} inline-flex min-h-11 items-center`}
          aria-current={onDashboard ? "page" : undefined}
        >
          Dashboard
        </Link>
        {workspaceHref ? (
          <ProHintTooltip
            label={
              currentProjectId
                ? "Current project workspace"
                : "Opens your default project"
            }
          >
            <Link
              href={workspaceHref}
              className={`${proNavPill(onWorkspace)} ${navItem} inline-flex min-h-11 items-center gap-1.5`}
              aria-current={onWorkspace ? "page" : undefined}
            >
              Workspace
            </Link>
          </ProHintTooltip>
        ) : (
          <span
            className={`${proNavPill(false, true)} ${navItem} inline-flex min-h-11 cursor-not-allowed items-center gap-1.5`}
            title="Create a project first"
          >
            Workspace
          </span>
        )}
        <Link
          href="/pro/app/archives"
          className={`${proNavPill(onArchives, archivedCount === 0)} ${navItem} inline-flex min-h-11 items-center gap-1.5`}
          aria-current={onArchives ? "page" : undefined}
        >
          Archives
          {archivedCount > 0 ? (
            <span className={proNavCountBadge}>{archivedCount}</span>
          ) : null}
        </Link>
      </div>
    </nav>
  );
}
