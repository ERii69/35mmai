"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { applyTemplate } from "@/app/actions/pro/templates";
import { ProConfirmDialog } from "@/components/pro/ux/ProConfirmDialog";
import {
  proTemplateDisplayName,
  type ProTemplateId,
} from "@/lib/pro/templates";
import { directorPrepHasContent } from "@/lib/pro/project-state-has-content";
import {
  moreScriptWorkflowChoices,
  PRIMARY_WORKFLOW_CHOICES,
  workflowDisplayName,
} from "@/lib/pro/workflow-choices";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  projectId: string;
  state: ProjectStatePayload;
  onApplied: (state: ProjectStatePayload, updatedAt: string) => void;
  /** Controlled dialog — hide inline trigger when used from project menu or workspace control. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  /** Expand the "more script templates" section on open. */
  initialExpandMore?: boolean;
};

function workflowChoiceButtonClass(active: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-left transition ${
    active
      ? "border-pro-primary/40 bg-pro-primary/10 ring-1 ring-pro-primary/25"
      : "border-white/10 bg-pro-muted/30 hover:border-white/20 hover:bg-pro-muted/60"
  }`;
}

export function ProWorkflowHub({
  projectId,
  state,
  onApplied,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
  initialExpandMore = false,
}: Props) {
  const appliedId = state.directorPrep.appliedTemplateId;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [expandMore, setExpandMore] = useState(initialExpandMore);
  const [pendingId, setPendingId] = useState<ProTemplateId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const currentLabel = workflowDisplayName(appliedId);
  const moreChoices = moreScriptWorkflowChoices();

  function applyWorkflow(templateId: ProTemplateId) {
    setMessage(null);
    startTransition(async () => {
      const res = await applyTemplate(projectId, templateId);
      if (!res.ok) {
        setMessage(res.error);
        setOpen(true);
        return;
      }
      onApplied(res.data.state, res.data.updated_at);
      setOpen(false);
      setPendingId(null);
      const name = proTemplateDisplayName(templateId) ?? "template";
      setMessage(`Switched to ${name}.`);
    });
  }

  function handleSelect(id: ProTemplateId) {
    if (id === appliedId) {
      setOpen(false);
      return;
    }
    if (directorPrepHasContent(state)) {
      setPendingId(id);
      setOpen(false);
      return;
    }
    applyWorkflow(id);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setExpandMore(initialExpandMore);
      setMessage(null);
    }
    setOpen(next);
  }

  return (
    <>
      {!hideTrigger ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-pro-text-secondary">
            Template:{" "}
            <span className="font-medium text-pro-text">{currentLabel}</span>
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => handleOpenChange(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-pro-muted/40 px-2.5 py-1.5 text-xs font-medium text-pro-text transition hover:border-white/20 hover:bg-pro-elevated disabled:opacity-50"
          >
            Change template
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
          {pending ? (
            <Loader2 className="size-3.5 animate-spin text-pro-text-secondary" aria-hidden />
          ) : null}
        </div>
      ) : null}
      {!hideTrigger && message ? (
        <p className="mt-1 text-xs text-pro-text-secondary" role="status">
          {message}
        </p>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Choose template"
          onClick={() => !pending && handleOpenChange(false)}
        >
          <div
            className="max-h-[min(90vh,36rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-pro-elevated p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-pro-text">Choose template</h2>
            <p className="mt-1 text-sm text-pro-text-secondary">
              Script to prompt is the default. Classical adds coverage and a 14-step playbook.
            </p>
            {message ? (
              <p className="mt-3 text-xs text-pro-warning" role="alert">
                {message}
              </p>
            ) : null}
            <ul className="mt-4 space-y-2">
              {PRIMARY_WORKFLOW_CHOICES.map((choice) => {
                const active = appliedId === choice.id;
                return (
                  <li key={choice.id}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleSelect(choice.id)}
                      className={workflowChoiceButtonClass(active)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-pro-text">{choice.label}</span>
                        {choice.badge ? (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">
                            {choice.badge}
                          </span>
                        ) : null}
                        {active ? (
                          <span className="ml-auto text-[10px] font-medium text-pro-primary">
                            Current
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">
                        {choice.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>

            {moreChoices.length > 0 ? (
              <div className="mt-4 border-t border-white/[0.08] pt-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left text-sm font-medium text-pro-text-secondary transition hover:text-pro-text"
                  onClick={() => setExpandMore((v) => !v)}
                  aria-expanded={expandMore}
                >
                  More script templates
                  <ChevronDown
                    className={`size-4 transition ${expandMore ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {expandMore ? (
                  <ul className="mt-2 space-y-2">
                    {moreChoices.map((choice) => {
                      const active = appliedId === choice.id;
                      return (
                        <li key={choice.id}>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => handleSelect(choice.id)}
                            className={workflowChoiceButtonClass(active)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-pro-text">
                                {choice.label}
                              </span>
                              {active ? (
                                <span className="ml-auto text-[10px] font-medium text-pro-primary">
                                  Current
                                </span>
                              ) : null}
                            </div>
                            {choice.description ? (
                              <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">
                                {choice.description}
                              </p>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              className="mt-4 w-full rounded-lg py-2 text-sm text-pro-text-secondary hover:text-pro-text"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <ProConfirmDialog
        open={pendingId != null}
        title="Switch template?"
        description="Your script and prep results are kept. Nav, shots, and prompts update for the new template."
        confirmLabel="Switch template"
        pending={pending}
        layer="above"
        onClose={() => {
          setPendingId(null);
          setOpen(true);
        }}
        onConfirm={() => {
          if (pendingId) applyWorkflow(pendingId);
        }}
      />
    </>
  );
}
