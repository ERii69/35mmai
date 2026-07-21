"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { createProject } from "@/app/actions/pro/projects";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { DEFAULT_DIRECTOR_PREP_TEMPLATE_ID, type ProTemplateId } from "@/lib/pro/templates";
import {
  moreScriptWorkflowChoices,
  PRIMARY_WORKFLOW_CHOICES,
} from "@/lib/pro/workflow-choices";
import { useOutsideClick } from "@/lib/pro/use-outside-click";
import {
  dispatchOpenNewProject,
  PRO_OPEN_NEW_PROJECT_EVENT,
  type ProOpenNewProjectDetail,
} from "@/lib/pro/pro-nav-events";

type Props = {
  /** host = app-wide modal listener; header/fab = triggers only */
  variant?: "host" | "header" | "fab";
};

export function ProDashboardNewProjectFab({ variant = "header" }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<ProTemplateId>(
    DEFAULT_DIRECTOR_PREP_TEMPLATE_ID
  );
  const [showMoreWorkflows, setShowMoreWorkflows] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = useCallback(() => {
    setOpen(false);
    setName("");
    setShowMoreWorkflows(false);
    setError(null);
  }, []);

  const openModal = useCallback((detail?: ProOpenNewProjectDetail) => {
    setSelectedTemplateId(detail?.templateId ?? DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
    setShowMoreWorkflows(false);
    setOpen(true);
    setError(null);
  }, []);

  useEffect(() => setMounted(true), []);

  useOutsideClick(open, [panelRef], close);

  useEffect(() => {
    if (variant !== "host") return;
    function onEvent(e: Event) {
      const detail = (e as CustomEvent<ProOpenNewProjectDetail>).detail;
      openModal(detail);
    }
    window.addEventListener(PRO_OPEN_NEW_PROJECT_EVENT, onEvent);
    return () => window.removeEventListener(PRO_OPEN_NEW_PROJECT_EVENT, onEvent);
  }, [variant, openModal]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const res = await createProject(trimmed, selectedTemplateId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      close();
      router.push(`/pro/app/workspace/${res.data.id}`);
      router.refresh();
    });
  }

  const moreWorkflows = moreScriptWorkflowChoices();
  const selectedWorkflow =
    PRIMARY_WORKFLOW_CHOICES.find((c) => c.id === selectedTemplateId) ??
    moreWorkflows.find((c) => c.id === selectedTemplateId);

  const modal =
    open && mounted && variant === "host"
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-dialog-title"
            onClick={() => !pending && close()}
          >
            <form
              ref={panelRef}
              onSubmit={handleSubmit}
              className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-pro-elevated p-4 shadow-2xl ring-1 ring-white/[0.08]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h2 id="new-project-dialog-title" className="text-sm font-semibold text-pro-text">
                    New project
                  </h2>
                  <p className="mt-0.5 text-xs text-pro-text-secondary">
                    Pick a template, name your project, then open it.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-1 text-pro-text-secondary hover:bg-pro-elevated hover:text-pro-text"
                  onClick={close}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="mb-2 text-xs font-medium text-pro-text-secondary">1. Template</p>
              <ul className="mb-3 grid grid-cols-3 gap-1.5">
                {PRIMARY_WORKFLOW_CHOICES.map((choice) => {
                  const active = selectedTemplateId === choice.id;
                  return (
                    <li key={choice.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId(choice.id)}
                        className={`w-full rounded-lg border px-2 py-2 text-center text-xs transition ${
                          active
                            ? "border-pro-primary/40 bg-pro-primary/10 text-pro-text"
                            : "border-white/[0.08] bg-pro-muted/40 text-pro-text-secondary hover:border-white/15"
                        }`}
                      >
                        {choice.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {showMoreWorkflows && moreWorkflows.length > 0 ? (
                <ul className="mb-3 max-h-28 space-y-1 overflow-y-auto">
                  {moreWorkflows.map((choice) => (
                    <li key={choice.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId(choice.id)}
                        className={`w-full rounded-lg border px-3 py-1.5 text-left text-xs ${
                          selectedTemplateId === choice.id
                            ? "border-pro-primary/40 bg-pro-primary/10 text-pro-text"
                            : "border-white/[0.08] text-pro-text-secondary"
                        }`}
                      >
                        {choice.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {moreWorkflows.length > 0 ? (
                <button
                  type="button"
                  className="mb-3 text-xs text-pro-text-secondary underline-offset-2 hover:text-pro-text hover:underline"
                  onClick={() => setShowMoreWorkflows((v) => !v)}
                >
                  {showMoreWorkflows ? "Hide" : "More templates"}
                </button>
              ) : null}
              {selectedWorkflow?.description ? (
                <p className="mb-3 text-[11px] leading-relaxed text-pro-text-secondary">
                  {selectedWorkflow.description}
                </p>
              ) : null}

              <label
                htmlFor="new-project-name"
                className="mb-2 block text-xs font-medium text-pro-text-secondary"
              >
                2. Project name
              </label>
              <input
                id="new-project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name…"
                autoFocus
                maxLength={120}
                className="w-full rounded-xl bg-pro-muted px-3.5 py-2.5 text-sm text-pro-text ring-1 ring-white/[0.08] outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50"
              />
              {error ? (
                <p className="mt-2 text-xs text-pro-warning" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending || !name.trim()}
                className={`${proBtn.dashboardOpenOutline} mt-3 w-full`}
              >
                {pending ? "Creating project…" : "Create project & open"}
              </button>
            </form>
          </div>,
          document.body
        )
      : null;

  if (variant === "host") {
    return modal;
  }

  if (variant === "fab") {
    return (
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 md:hidden">
        <button
          type="button"
          onClick={() => dispatchOpenNewProject()}
          className="flex size-14 items-center justify-center rounded-xl bg-pro-primary text-white shadow-xl shadow-pro-primary/30"
          aria-label="New project"
        >
          <Plus className="size-6" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => dispatchOpenNewProject()}
      className={`${proBtn.dashboardOpenOutline} hidden shrink-0 md:inline-flex`}
    >
      <Plus className="size-5" aria-hidden />
      New project
    </button>
  );
}
