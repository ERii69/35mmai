"use client";

import Link from "next/link";
import { Clapperboard, Star } from "lucide-react";
import { ProHintTooltip } from "@/components/pro/ux/ProHintTooltip";
import { ProProjectWorkflowChip } from "@/components/pro/ProProjectWorkflowChip";
import { ProProjectActionsDropdown } from "@/components/pro/ProProjectActionsDropdown";
import { ProProjectCardStatsDesktop } from "@/components/pro/ProProjectCardStatsDesktop";
import { proBtn, proProjectCard, proProjectCardDesktop } from "@/components/pro/ux/pro-surfaces";
import type { DashboardProject } from "@/components/pro/ProDashboardProjects";

type Props = {
  project: DashboardProject;
  isSpotlight: boolean;
  isRenaming: boolean;
  renameName: string;
  pending: boolean;
  animPhaseIdle: boolean;
  formatLastOpened: (iso: string) => string;
  onRenameNameChange: (name: string) => void;
  onRenameSubmit: (e: React.FormEvent) => void;
  onRenameCancel: () => void;
  onSetDefault: (e: React.MouseEvent) => void;
  onRenameStart: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMakeDefault?: () => void;
  stopCardNav: (e: React.MouseEvent) => void;
};

export function ProDashboardProjectCardDesktop({
  project: p,
  isSpotlight,
  isRenaming,
  renameName,
  pending,
  animPhaseIdle,
  formatLastOpened,
  onRenameNameChange,
  onRenameSubmit,
  onRenameCancel,
  onSetDefault,
  onRenameStart,
  onArchive,
  onDelete,
  onMakeDefault,
  stopCardNav,
}: Props) {
  return (
    <article
      className={`${proProjectCardDesktop.base} ${proProjectCard.clickable} ${
        p.is_default ? proProjectCard.default : proProjectCard.standard
      } ${isSpotlight ? "pro-default-spotlight-active animate-[pro-default-spotlight_0.9s_ease-in-out_2]" : ""}`}
    >
      {!isRenaming ? (
        <Link
          href={`/pro/app/workspace/${p.id}`}
          className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50"
          aria-label={`Open ${p.name} workspace`}
        />
      ) : null}

      <div className="relative z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              p.is_default
                ? "bg-pro-primary/15 text-pro-primary ring-1 ring-pro-primary/35"
                : "bg-pro-elevated text-pro-text-secondary ring-1 ring-white/[0.06]"
            }`}
          >
            <Clapperboard className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <form
                className="pointer-events-auto"
                onSubmit={onRenameSubmit}
                onClick={stopCardNav}
              >
                <input
                  value={renameName}
                  onChange={(e) => onRenameNameChange(e.target.value)}
                  maxLength={120}
                  autoFocus
                  className="w-full rounded-lg border border-white/[0.12] bg-pro-muted px-2.5 py-1.5 text-sm text-pro-text outline-none focus:ring-2 focus:ring-pro-primary/50"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={pending || !renameName.trim()}
                    className={`${proBtn.cardAction} pointer-events-auto font-medium text-pro-text`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className={`${proBtn.cardAction} pointer-events-auto`}
                    onClick={(e) => {
                      stopCardNav(e);
                      onRenameCancel();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="truncate text-base font-bold tracking-tight text-pro-text transition group-hover:text-pro-primary">
                  {p.name}
                </h2>
                {p.stats?.workflowLabel ? (
                  <ProProjectWorkflowChip label={p.stats.workflowLabel} className="mt-1" />
                ) : null}
                <p className="mt-0.5 text-[10px] text-pro-text-secondary/80">
                  Last opened {formatLastOpened(p.last_opened_at)}
                </p>
                {p.is_default ? (
                  <ProHintTooltip
                    label="Opens when you use Workspace in the nav"
                    className="pointer-events-auto mt-1.5"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-pro-primary">
                      <Star
                        className={`size-3.5 fill-current ${isSpotlight ? "animate-pulse" : ""}`}
                        aria-hidden
                      />
                      Default project
                    </span>
                  </ProHintTooltip>
                ) : (
                  <ProHintTooltip
                    label="Becomes the project Workspace opens"
                    className="pointer-events-auto mt-1.5"
                  >
                    <button
                      type="button"
                      disabled={pending || !animPhaseIdle}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-pro-text-secondary transition hover:text-pro-text disabled:opacity-50"
                      onClick={onSetDefault}
                    >
                      <Star className="size-3.5" aria-hidden />
                      Make default
                    </button>
                  </ProHintTooltip>
                )}
              </>
            )}
          </div>
          </div>
          {!isRenaming ? (
            <div className="pointer-events-auto">
              <ProProjectActionsDropdown
                projectName={p.name}
                isDefault={p.is_default}
                pending={pending}
                onRename={onRenameStart}
                onArchive={onArchive}
                onDelete={onDelete}
                onMakeDefault={p.is_default ? undefined : onMakeDefault}
              />
            </div>
          ) : null}
        </div>

        {!isRenaming ? (
          <ProProjectCardStatsDesktop
            approvedScenes={p.stats?.approvedScenes ?? 0}
            percentComplete={p.stats?.percentComplete ?? 0}
            totalShots={p.stats?.totalShots ?? 0}
            promptsReady={p.stats?.promptsReady ?? 0}
            totalPromptSlots={p.stats?.totalPromptSlots ?? 0}
            hasScript={p.stats?.hasScript ?? false}
            hasLook={p.stats?.hasLook ?? false}
            scriptToPrompt={p.stats?.scriptToPrompt ?? false}
            summaryLine={p.stats?.summaryLine}
          />
        ) : null}
      </div>
    </article>
  );
}
