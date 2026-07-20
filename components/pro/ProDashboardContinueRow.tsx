"use client";

import Link from "next/link";
import { useState } from "react";
import { Clapperboard, MoreVertical } from "lucide-react";
import { ProProjectActionsSheet } from "@/components/pro/ProProjectActionsSheet";
import { proTapHaptic } from "@/lib/pro/haptic";
import { proFocus } from "@/components/pro/ux/pro-surfaces";

type Props = {
  projectId: string;
  projectName: string;
  isDefault?: boolean;
  pending?: boolean;
  stats?: {
    approvedScenes: number;
    percentComplete: number;
    summaryLine?: string;
    workflowLabel?: string;
  };
  onRename?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

export function ProDashboardContinueRow({
  projectId,
  projectName,
  isDefault = true,
  pending = false,
  stats,
  onRename,
  onArchive,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const showMenu = onRename || onArchive || onDelete;

  return (
    <>
      <article className="relative mb-3 flex min-h-[52px] items-center gap-3 rounded-xl bg-pro-primary/[0.12] px-3 py-2.5 ring-2 ring-pro-primary/40 md:hidden">
        <Link
          href={`/pro/app/workspace/${projectId}`}
          className={`absolute inset-0 z-0 rounded-xl ${proFocus}`}
          aria-label={`Continue ${projectName}`}
          onClick={() => proTapHaptic()}
        />
        <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg bg-pro-primary/20 text-pro-primary ring-1 ring-pro-primary/30">
          <Clapperboard className="size-4" aria-hidden />
        </span>
        <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-pro-primary">
            Continue
          </p>
          <h2 className="truncate text-[15px] font-semibold leading-snug text-pro-text">
            {projectName}
            {stats?.workflowLabel ? (
              <span className="font-normal text-pro-text-secondary"> · {stats.workflowLabel}</span>
            ) : null}
          </h2>
          {stats ? (
            <p className="mt-0.5 truncate text-xs text-pro-text-secondary">
              {stats.summaryLine ?? `${stats.approvedScenes} scenes · ${stats.percentComplete}% complete`}
            </p>
          ) : null}
        </div>
        {showMenu ? (
          <button
            type="button"
            className={`relative z-10 -mr-0.5 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-2 text-pro-text-secondary transition hover:bg-pro-primary/10 hover:text-pro-text touch-manipulation ${proFocus}`}
            aria-label={`Actions for ${projectName}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              proTapHaptic();
              setMenuOpen(true);
            }}
          >
            <MoreVertical className="size-4" aria-hidden />
          </button>
        ) : null}
      </article>

      {showMenu ? (
        <ProProjectActionsSheet
          open={menuOpen}
          projectName={projectName}
          isDefault={isDefault}
          pending={pending}
          onClose={() => setMenuOpen(false)}
          onRename={() => onRename?.()}
          onArchive={() => onArchive?.()}
          onDelete={() => onDelete?.()}
        />
      ) : null}
    </>
  );
}
