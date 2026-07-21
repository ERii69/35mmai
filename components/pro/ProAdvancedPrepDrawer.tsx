"use client";

import { X } from "lucide-react";
import { PlaybookSteps } from "@/components/pro/PlaybookSteps";
import { DirectorPrepAdvancedPanel } from "@/components/pro/DirectorPrepAdvancedPanel";
import { PRO_OPEN_WORKFLOW_SWITCHER_EVENT } from "@/lib/pro/pro-nav-events";
import { structuredPlaybookForTemplate } from "@/lib/pro/playbook-steps";
import { usesClassicalLocationPass } from "@/lib/pro/workflow-choices";
import type { WorkspaceTabId } from "@/lib/pro/playbook-steps";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onTemplateApplied: (state: ProjectStatePayload, updatedAt: string) => void;
  onGoToTab?: (tab: WorkspaceTabId, stepId?: string) => void;
  onGoToPost?: () => void;
  usesPipeline: boolean;
};

export function ProAdvancedPrepDrawer({
  open,
  onClose,
  projectId,
  state,
  updateState,
  onTemplateApplied,
  onGoToTab,
  onGoToPost,
  usesPipeline,
}: Props) {
  if (!open) return null;

  const appliedId = state.directorPrep.appliedTemplateId;
  const classicalPlaybook = appliedId ? structuredPlaybookForTemplate(appliedId) : null;
  const showClassicalPlaybook = usesClassicalLocationPass(appliedId) && classicalPlaybook;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Advanced"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col bg-[#0f0f0f] shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Advanced</h2>
            <p className="text-xs text-[#737373]">
              Scene editor, legacy templates, and classical playbook
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-[#737373] hover:bg-white/5 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section>
            <h3 className="text-sm font-semibold text-pro-text">Scene editor</h3>
            <p className="mt-1 text-xs text-pro-text-secondary">
              Edit scenes, snapshots, and extra vision fields.
            </p>
            <div className="mt-3">
              <DirectorPrepAdvancedPanel
                projectId={projectId}
                state={state}
                updateState={updateState}
              />
            </div>
          </section>

          {showClassicalPlaybook ? (
            <section>
              <h3 className="text-sm font-semibold text-pro-text">Location-pass playbook</h3>
              <p className="mt-1 text-xs text-pro-text-secondary">
                14-step classical AI film method — one pass per place.
              </p>
              <div className="mt-3">
                <PlaybookSteps playbook={classicalPlaybook} onGoToTab={onGoToTab} />
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="text-sm font-semibold text-pro-text">Templates</h3>
            <p className="mt-1 text-xs text-pro-text-secondary">
              Switch templates or browse more script templates from the unified hub.
            </p>
            <button
              type="button"
              className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-pro-text ring-1 ring-white/10 transition hover:bg-white/10"
              onClick={() => {
                onClose();
                window.dispatchEvent(new Event(PRO_OPEN_WORKFLOW_SWITCHER_EVENT));
              }}
            >
              Browse templates
            </button>
          </section>

          {usesPipeline && onGoToPost ? (
            <section className="rounded-xl border border-white/10 bg-pro-muted/30 p-4">
              <h3 className="text-sm font-semibold text-pro-text">Legacy workspace</h3>
              <p className="mt-1 text-xs text-pro-text-secondary">
                Full Finish tabs — budget, phases, world, and edit pipeline.
              </p>
              <button
                type="button"
                className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-pro-text ring-1 ring-white/10 transition hover:bg-white/10"
                onClick={() => {
                  onGoToPost();
                  onClose();
                }}
              >
                Open Post &amp; legacy Finish tabs
              </button>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
