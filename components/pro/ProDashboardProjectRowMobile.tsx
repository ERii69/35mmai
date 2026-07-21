"use client";

import Link from "next/link";
import { useState } from "react";
import { Clapperboard, MoreVertical } from "lucide-react";
import { ProProjectProgressChips } from "@/components/pro/ProProjectProgressChips";
import { ProProjectWorkflowChip } from "@/components/pro/ProProjectWorkflowChip";
import { ProProjectActionsSheet } from "@/components/pro/ProProjectActionsSheet";
import { proFocus, proProjectRowMobile } from "@/components/pro/ux/pro-surfaces";
import type { DashboardProject } from "@/components/pro/ProDashboardProjects";

type Props = {
  project: DashboardProject;
  pending: boolean;
  formatLastOpened: (iso: string) => string;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMakeDefault?: () => void;
};

export function ProDashboardProjectRowMobile({
  project,
  pending,
  formatLastOpened,
  onRename,
  onArchive,
  onDelete,
  onMakeDefault,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <article
        className={`${proProjectRowMobile.base} ${
          project.is_default ? proProjectRowMobile.default : proProjectRowMobile.standard
        }`}
      >
        <Link
          href={`/pro/app/workspace/${project.id}`}
          className={`absolute inset-0 z-0 rounded-xl ${proFocus}`}
          aria-label={`Open ${project.name} workspace`}
        />
        <span
          className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg ${
            project.is_default
              ? "bg-pro-primary/15 text-pro-primary ring-1 ring-pro-primary/30"
              : "bg-pro-elevated text-pro-text-secondary ring-1 ring-white/[0.06]"
          }`}
        >
          <Clapperboard className="size-4" aria-hidden />
        </span>
        <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
          <h2 className="truncate text-[15px] font-semibold leading-snug text-pro-text">
            {project.name}
          </h2>
          {project.stats?.workflowLabel ? (
            <ProProjectWorkflowChip label={project.stats.workflowLabel} className="mt-1" />
          ) : null}
          <p className="mt-0.5 truncate text-xs text-pro-text-secondary">
            {project.is_default ? "Default · " : ""}
            Last opened {formatLastOpened(project.last_opened_at)}
          </p>
          {project.stats ? (
            <ProProjectProgressChips
              className="mt-1.5"
              scriptDone={project.stats.hasScript ?? false}
              lookDone={project.stats.hasLook ?? false}
              promptsReady={project.stats.promptsReady ?? 0}
              totalPrompts={project.stats.totalPromptSlots ?? 0}
              approvedScenes={project.stats.approvedScenes ?? 0}
              totalShots={project.stats.totalShots ?? 0}
              percentComplete={project.stats.percentComplete ?? 0}
              scriptToPrompt={project.stats.scriptToPrompt ?? false}
            />
          ) : null}
        </div>
        <button
          type="button"
          className={`relative z-10 -mr-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-2 text-pro-text-secondary transition hover:bg-pro-muted/80 hover:text-pro-text touch-manipulation ${proFocus}`}
          aria-label={`Actions for ${project.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(true);
          }}
        >
          <MoreVertical className="size-4" aria-hidden />
        </button>
      </article>

      <ProProjectActionsSheet
        open={menuOpen}
        projectName={project.name}
        isDefault={project.is_default}
        pending={pending}
        onClose={() => setMenuOpen(false)}
        onRename={onRename}
        onArchive={onArchive}
        onDelete={onDelete}
        onMakeDefault={onMakeDefault}
      />
    </>
  );
}
