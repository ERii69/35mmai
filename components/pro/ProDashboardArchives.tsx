"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive } from "lucide-react";
import { deleteProject, unarchiveProject } from "@/app/actions/pro/projects";
import { ProDashboardArchiveCardDesktop } from "@/components/pro/ProDashboardArchiveCardDesktop";
import { ProDashboardArchiveRowMobile } from "@/components/pro/ProDashboardArchiveRowMobile";
import { ProDashboardNavShortcuts } from "@/components/pro/ProDashboardNavShortcuts";
import { ProDashboardPullRefresh } from "@/components/pro/ProDashboardPullRefresh";
import { ProPrivateStudioBadge } from "@/components/pro/ProPrivateStudioBadge";
import { ProConfirmDialog } from "@/components/pro/ux/ProConfirmDialog";
import { ProCountBadge } from "@/components/pro/ux/ProCountBadge";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { proBtn, proDashboardGrid, proEmptyState, proWebShell } from "@/components/pro/ux/pro-surfaces";

export type ArchivedProject = {
  id: string;
  name: string;
  archived_at: string | null;
  updated_at: string;
  stats?: {
    approvedScenes: number;
    totalShots: number;
    percentComplete: number;
  };
};

type Props = {
  projects: ArchivedProject[];
};

function formatArchived(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProDashboardArchives({ projects }: Props) {
  const router = useRouter();
  const { showToast } = useProToast();
  const [displayProjects, setDisplayProjects] = useState(projects);
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleRestore(id: string) {
    if (pending) return;
    startTransition(async () => {
      const res = await unarchiveProject(id);
      if (!res.ok) {
        showToast({ variant: "error", message: res.error });
        return;
      }
      setDisplayProjects((prev) => prev.filter((p) => p.id !== id));
      showToast({ variant: "success", message: "Project restored to dashboard." });
      router.push(`/pro/app/workspace/${id}`);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget || pending) return;
    startTransition(async () => {
      const res = await deleteProject(deleteTarget.id);
      if (!res.ok) {
        showToast({ variant: "error", message: res.error });
        return;
      }
      setDeleteTarget(null);
      setDisplayProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast({ variant: "success", message: "Project deleted." });
      router.refresh();
    });
  }

  return (
    <ProDashboardPullRefresh>
      <section aria-labelledby="archives-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 id="archives-heading" className={proWebShell.pageTitle}>
              Archives
            </h1>
            <p className="mt-0.5 text-sm text-pro-text-secondary md:hidden">
              {displayProjects.length}{" "}
              {displayProjects.length === 1 ? "archived project" : "archived projects"}
            </p>
          </div>
          <Link
            href="/pro/app"
            className={`${proBtn.outline} shrink-0 px-4 py-2 text-sm`}
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-3 hidden max-w-xl sm:block">
          <ProPrivateStudioBadge />
        </div>

        <p className="mt-3 max-w-2xl text-sm text-pro-text-secondary">
          Restore a project to the dashboard, or delete it permanently.
        </p>

        <ProConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete archived project?"
          description={
            deleteTarget
              ? `"${deleteTarget.name}" and all its workspace data will be permanently removed.`
              : ""
          }
          confirmLabel="Delete"
          danger
          pending={pending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />

        {displayProjects.length === 0 ? (
          <section className={`${proEmptyState.card} mt-8 md:mt-10`}>
            <div className={proEmptyState.iconWrap}>
              <Archive className="size-6" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-pro-text">No archived projects</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-pro-text-secondary">
              Archive a project from the dashboard to keep it here without deleting its data.
            </p>
            <Link href="/pro/app" className={`${proBtn.outline} mt-5 inline-flex px-4 py-2 text-sm`}>
              Go to dashboard
            </Link>
          </section>
        ) : (
          <>
            <div className="mt-6 hidden items-center gap-2 md:flex">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
                Archived projects
              </h2>
              <ProCountBadge
                count={displayProjects.length}
                label={`${displayProjects.length} ${
                  displayProjects.length === 1 ? "archived project" : "archived projects"
                }`}
              />
            </div>

            <ul className="mt-3 flex flex-col gap-2 md:hidden">
              {displayProjects.map((p) => (
                <li key={p.id}>
                  <ProDashboardArchiveRowMobile
                    project={p}
                    pending={pending}
                    formatArchived={formatArchived}
                    onRestore={() => handleRestore(p.id)}
                    onDelete={() => setDeleteTarget({ id: p.id, name: p.name })}
                  />
                </li>
              ))}
            </ul>

            <ul className={`mt-3 hidden md:grid ${proDashboardGrid}`}>
              {displayProjects.map((p) => (
                <li key={p.id} className="min-w-0">
                  <ProDashboardArchiveCardDesktop
                    project={p}
                    pending={pending}
                    formatArchived={formatArchived}
                    onRestore={() => handleRestore(p.id)}
                    onDelete={() => setDeleteTarget({ id: p.id, name: p.name })}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        <ProDashboardNavShortcuts className="mt-4 hidden md:block" />
      </section>
    </ProDashboardPullRefresh>
  );
}
