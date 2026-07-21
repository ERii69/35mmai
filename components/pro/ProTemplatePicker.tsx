"use client";

import { useEffect, useState, useTransition } from "react";
import { applyTemplate } from "@/app/actions/pro/templates";
import { PlaybookSteps } from "@/components/pro/PlaybookSteps";
import { Button } from "@/components/ui/button";
import { ProConfirmDialog } from "@/components/pro/ux/ProConfirmDialog";
import { ProTemplateSelect, type ProTemplateSelectOption } from "@/components/pro/ux/ProTemplateSelect";
import {
  directorPrepHasContent,
  projectStateHasContent,
} from "@/lib/pro/project-state-has-content";
import {
  structuredPlaybookForTemplate,
  type WorkspaceTabId,
} from "@/lib/pro/playbook-steps";
import { playbookForTemplate } from "@/lib/pro/playbooks";
import { resourcesForTemplate } from "@/lib/pro/template-resources";
import {
  DEFAULT_DIRECTOR_PREP_TEMPLATE_ID,
  listProTemplateGroups,
  proTemplateDisplayName,
  type ProTemplateGroupId,
  type ProTemplateId,
} from "@/lib/pro/templates";
import { isScriptToPromptTemplate, SCRIPT_TO_PROMPT_TEMPLATE_ID } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  projectId: string;
  state: ProjectStatePayload;
  onApplied: (state: ProjectStatePayload, updatedAt: string) => void;
  onGoToTab?: (tab: WorkspaceTabId, stepId?: string) => void;
  /** Fires when dropdown selection changes (may differ from applied template until Apply). */
  onSelectedIdChange?: (templateId: string) => void;
  compact?: boolean;
  /** Limit dropdown to one template group (e.g. Director's Prep in the Prep tab). */
  groupFilter?: ProTemplateGroupId;
  /** Hide specific templates (e.g. primary workflows in advanced drawer). */
  excludeTemplateIds?: ProTemplateId[];
};

export function ProTemplatePicker({
  projectId,
  state,
  onApplied,
  onGoToTab,
  onSelectedIdChange,
  compact = false,
  groupFilter,
  excludeTemplateIds = [],
}: Props) {
  const exclude = new Set<string>(excludeTemplateIds);
  const groups = listProTemplateGroups()
    .filter((group) => !groupFilter || group.id === groupFilter)
    .map((group) => ({
      ...group,
      templates: group.templates.filter((t) => !exclude.has(t.id)),
    }))
    .filter((group) => group.templates.length > 0);
  const defaultId =
    groupFilter === "director-prep"
      ? DEFAULT_DIRECTOR_PREP_TEMPLATE_ID
      : (groups.find((g) => g.id === (groupFilter ?? "director-prep"))?.templates[0]?.id ??
        groups[0]?.templates[0]?.id ??
        "");
  const appliedId = state.directorPrep.appliedTemplateId;
  const [selectedId, setSelectedId] = useState<string>(appliedId || defaultId);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (appliedId) setSelectedId(appliedId);
  }, [appliedId]);

  useEffect(() => {
    onSelectedIdChange?.(selectedId);
  }, [selectedId, onSelectedIdChange]);

  const selected = groups.flatMap((g) => g.templates).find((t) => t.id === selectedId);
  const structuredPlaybook = structuredPlaybookForTemplate(selectedId);
  const legacyPlaybook = structuredPlaybook ? null : playbookForTemplate(selectedId);
  const resourceGroups = resourcesForTemplate(selectedId);

  const templateInSync = !!(appliedId && appliedId === selectedId);
  const isReapply = templateInSync;

  const templateOptions: ProTemplateSelectOption[] = groups.flatMap((group) =>
    group.templates.map((t) => ({
      value: t.id,
      label: t.name,
      group: group.label,
    }))
  );

  const needsConfirm =
    !isReapply &&
    (groupFilter === "director-prep"
      ? directorPrepHasContent(state)
      : projectStateHasContent(state));

  function runApply() {
    if (!selectedId) return;

    setMessage(null);
    startTransition(async () => {
      const res = await applyTemplate(projectId, selectedId);
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      const appliedState = res.data.state;
      onApplied(appliedState, res.data.updated_at);
      setSelectedId(appliedState.directorPrep.appliedTemplateId ?? selectedId);
      const name = proTemplateDisplayName(selectedId) ?? "template";
      if (isScriptToPromptTemplate(selectedId)) {
        setMessage(
          isReapply
            ? `Updated · ${name}. Vision rules and kit refreshed (script and prep kept). Open Finish → Prompts when ready.`
            : `Applied · ${name}. Script → Look → Finish workflow ready.`
        );
      } else {
        setMessage(
          isReapply || groupFilter === "director-prep"
            ? `Updated · ${name}. Classical coverage shot list — open Finish → Beats.`
            : `Applied · ${name}. Script → Look → Finish workflow ready.`
        );
      }
      if (selectedId.startsWith("director-prep-") && !isReapply) {
        onGoToTab?.("director");
      }
    });
  }

  function handleApplyClick() {
    if (!selectedId) return;
    if (needsConfirm) {
      setConfirmOpen(true);
      return;
    }
    runApply();
  }

  function handleConfirmApply() {
    setConfirmOpen(false);
    runApply();
  }

  const confirmDialog = (
    <ProConfirmDialog
      open={confirmOpen}
      title={groupFilter === "director-prep" ? "Switch prep template?" : "Apply this template?"}
      description={
        groupFilter === "director-prep" && selected
          ? `“${selected.name}” updates your style rules and recommended kit. Your script, scenes, and prep results stay as they are.`
          : selected
            ? `Applying “${selected.name}” replaces kit, workflow, and workspace defaults for this project.`
            : "This replaces your current project with the selected template."
      }
      confirmLabel={groupFilter === "director-prep" ? "Update template" : "Apply template"}
      pending={pending}
      onClose={() => setConfirmOpen(false)}
      onConfirm={handleConfirmApply}
    >
      {groupFilter === "director-prep" ? (
        <ul className="list-inside list-disc space-y-1 text-xs text-pro-text-secondary">
          <li>Style rules and recommended kit refresh from the template</li>
          <li>Script, scenes, staging, and agent memory are kept</li>
          <li>
            Switching Script to prompt ↔ Indie feature rebuilds shot lists and prompts for the new
            workflow
          </li>
        </ul>
      ) : null}
    </ProConfirmDialog>
  );

  if (compact) {
    return (
      <>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium text-pro-text-secondary">Template</span>
            <ProTemplateSelect
              aria-label="Project template"
              className="min-w-[11rem] flex-1"
              value={selectedId}
              options={templateOptions}
              disabled={pending}
              onChange={setSelectedId}
            />
            <button
              type="button"
              disabled={pending || !selectedId}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-pro-muted/60 px-3 text-xs font-medium text-pro-text transition hover:border-white/20 hover:bg-pro-elevated disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleApplyClick}
            >
              {pending ? "…" : templateInSync ? "Re-apply" : "Apply"}
            </button>
          </div>
          {message && !templateInSync ? (
            <p className="text-xs leading-relaxed text-pro-text-secondary" role="status">
              {message}
            </p>
          ) : null}
          {!templateInSync && selected ? (
            <p className="text-xs text-pro-warning" role="status">
              “{selected.name}” selected — tap Apply to switch workflow (nav, shots, and prompts update).
            </p>
          ) : null}
          {selectedId === SCRIPT_TO_PROMPT_TEMPLATE_ID && !templateInSync ? (
            <p className="text-xs text-pro-text-secondary" role="status">
              Tap Apply to activate this template.
            </p>
          ) : null}
        </div>
        {confirmDialog}
      </>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-white/[0.08] bg-pro-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-pro-text">More templates</h2>
        <p className="mt-1 text-sm text-pro-text-secondary">
          Narrative, documentary, commercial, and other legacy script workflows.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm text-pro-text-secondary">
            Template
            <div className="mt-1">
              <ProTemplateSelect
                aria-label="Project template"
                value={selectedId}
                options={templateOptions}
                disabled={pending}
                onChange={setSelectedId}
              />
            </div>
          </label>
          <Button
            type="button"
            size="sm"
            disabled={pending || !selectedId}
            className="shrink-0 bg-pro-primary hover:brightness-110"
            onClick={handleApplyClick}
          >
            {pending ? "Applying…" : "Apply template"}
          </Button>
        </div>
        {selected && !compact ? (
          <p className="mt-2 text-xs text-pro-text-secondary">
            {selected.description} Starts in{" "}
            <strong className="text-pro-text-secondary">{selected.workflowStageTitle}</strong>.
          </p>
        ) : null}
        {!compact && structuredPlaybook ? (
          <PlaybookSteps playbook={structuredPlaybook} onGoToTab={onGoToTab} />
        ) : !compact && legacyPlaybook ? (
          <div className="mt-3 rounded-lg border border-white/[0.06] bg-pro-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-pro-text-secondary">Playbook</p>
            <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-pro-text-secondary">
              {legacyPlaybook}
            </p>
          </div>
        ) : null}
        {!compact && resourceGroups.length > 0 ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-pro-text-secondary">
              Recommended reading (external)
            </p>
            {resourceGroups.map((group) => (
              <div key={group.heading}>
                <p className="text-[10px] uppercase text-[#525252]">{group.heading}</p>
                <ul className="mt-1 space-y-1">
                  {group.resources.map((r) => (
                    <li key={r.id}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-pro-primary underline-offset-2 hover:underline"
                      >
                        {r.title}
                      </a>
                      <span className="text-xs text-[#525252]"> — {r.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        {message ? (
          <p className="mt-2 text-xs text-pro-warning" role="status">
            {message}
          </p>
        ) : null}
      </div>
      {confirmDialog}
    </>
  );
}
