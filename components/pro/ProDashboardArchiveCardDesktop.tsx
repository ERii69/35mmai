"use client";

import { Archive, Clapperboard } from "lucide-react";
import { ProArchiveActionsDropdown } from "@/components/pro/ProArchiveActionsDropdown";
import { ProProjectCardStatsDesktop } from "@/components/pro/ProProjectCardStatsDesktop";
import { proProjectCard, proProjectCardDesktop } from "@/components/pro/ux/pro-surfaces";
import type { ArchivedProject } from "@/components/pro/ProDashboardArchives";

type Props = {
  project: ArchivedProject;
  pending: boolean;
  formatArchived: (iso: string | null) => string;
  onRestore: () => void;
  onDelete: () => void;
};

export function ProDashboardArchiveCardDesktop({
  project: p,
  pending,
  formatArchived,
  onRestore,
  onDelete,
}: Props) {
  return (
    <article
      className={`${proProjectCardDesktop.base} ${proProjectCard.standard} group opacity-95 hover:opacity-100`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pro-elevated text-pro-text-secondary ring-1 ring-white/[0.06]">
              <Clapperboard className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold tracking-tight text-pro-text">{p.name}</h2>
              <p className="mt-0.5 text-[10px] text-pro-text-secondary/80">
                Archived {formatArchived(p.archived_at)}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-pro-text-secondary">
                <Archive className="size-3.5" aria-hidden />
                In archives
              </span>
            </div>
          </div>
          <div className="pointer-events-auto">
            <ProArchiveActionsDropdown
              projectName={p.name}
              pending={pending}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          </div>
        </div>

        <ProProjectCardStatsDesktop
          approvedScenes={p.stats?.approvedScenes ?? 0}
          percentComplete={p.stats?.percentComplete ?? 0}
          totalShots={p.stats?.totalShots ?? 0}
        />
      </div>
    </article>
  );
}
