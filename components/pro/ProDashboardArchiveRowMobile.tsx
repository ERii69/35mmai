"use client";

import { useState } from "react";
import { Clapperboard, MoreVertical } from "lucide-react";
import { ProArchiveActionsSheet } from "@/components/pro/ProArchiveActionsSheet";
import { proFocus, proProjectRowMobile } from "@/components/pro/ux/pro-surfaces";
import type { ArchivedProject } from "@/components/pro/ProDashboardArchives";

type Props = {
  project: ArchivedProject;
  pending: boolean;
  formatArchived: (iso: string | null) => string;
  onRestore: () => void;
  onDelete: () => void;
};

export function ProDashboardArchiveRowMobile({
  project,
  pending,
  formatArchived,
  onRestore,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <article className={`${proProjectRowMobile.base} ${proProjectRowMobile.standard}`}>
        <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg bg-pro-elevated text-pro-text-secondary ring-1 ring-white/[0.06]">
          <Clapperboard className="size-4" aria-hidden />
        </span>
        <div className="relative z-10 min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold leading-snug text-pro-text">
            {project.name}
          </h2>
          <p className="mt-0.5 truncate text-xs text-pro-text-secondary">
            Archived · {project.stats?.approvedScenes ?? 0} scenes ·{" "}
            {project.stats?.percentComplete ?? 0}% · {formatArchived(project.archived_at)}
          </p>
        </div>
        <button
          type="button"
          className={`relative z-10 -mr-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-2 text-pro-text-secondary transition hover:bg-pro-muted/80 hover:text-pro-text touch-manipulation ${proFocus}`}
          aria-label={`Actions for ${project.name}`}
          onClick={() => setMenuOpen(true)}
        >
          <MoreVertical className="size-4" aria-hidden />
        </button>
      </article>

      <ProArchiveActionsSheet
        open={menuOpen}
        projectName={project.name}
        pending={pending}
        onClose={() => setMenuOpen(false)}
        onRestore={onRestore}
        onDelete={onDelete}
      />
    </>
  );
}
