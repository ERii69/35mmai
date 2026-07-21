"use client";

import { Plus, Sparkles } from "lucide-react";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { dispatchOpenNewProject } from "@/lib/pro/pro-nav-events";
import { PRIMARY_WORKFLOW_CHOICES, type PrimaryWorkflowId } from "@/lib/pro/workflow-choices";

type Props = {
  /** Tighter panel when the project list is visible below. */
  bordered?: boolean;
  /**
   * Compact CTA only (desktop with existing projects).
   * Full template grid stays for empty studio / first project.
   */
  compact?: boolean;
  /** Empty studio — one composition: headline + templates (no second card). */
  emptyHero?: boolean;
};

export function ProDashboardNewProjectSection({
  bordered = true,
  compact = false,
  emptyHero = false,
}: Props) {
  function openWithTemplate(templateId?: PrimaryWorkflowId) {
    dispatchOpenNewProject(templateId ? { templateId } : undefined);
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-pro-text-secondary">Start another project from a template.</p>
        <button
          type="button"
          onClick={() => openWithTemplate()}
          className={`${proBtn.primary} inline-flex h-11 min-h-11 items-center gap-2 px-4 text-sm`}
        >
          <Plus className="size-4" aria-hidden />
          New project
        </button>
      </div>
    );
  }

  const content = (
    <>
      <header className={emptyHero ? "max-w-xl space-y-2" : undefined}>
        <h2
          id="dashboard-new-project-heading"
          className={
            emptyHero
              ? "text-xl font-bold tracking-tight text-pro-text md:text-2xl"
              : "text-sm font-semibold text-pro-text md:text-base"
          }
        >
          {emptyHero ? "Your studio is ready" : "New project"}
        </h2>
        {emptyHero ? (
          <p className="text-sm leading-relaxed text-pro-text-secondary">
            Pick a template to create your first project.
          </p>
        ) : null}
      </header>

      <ul
        className={`grid gap-2 sm:grid-cols-3 ${emptyHero ? "mt-5" : "mt-3"}`}
        aria-label="Templates for new project"
      >
        {PRIMARY_WORKFLOW_CHOICES.map((choice) => {
          const featured = choice.id === "director-prep-script-to-prompt";
          return (
            <li key={choice.id}>
              <button
                type="button"
                onClick={() => openWithTemplate(choice.id)}
                className={`h-full min-h-11 w-full rounded-xl border p-3 text-left transition hover:border-white/20 ${
                  featured
                    ? "border-pro-primary/35 bg-pro-primary/[0.07] ring-1 ring-pro-primary/20"
                    : "border-white/[0.08] bg-pro-muted/30 hover:bg-pro-muted/50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {featured ? (
                    <Sparkles className="size-3.5 shrink-0 text-pro-primary" aria-hidden />
                  ) : null}
                  <span className="text-sm font-medium text-pro-text">{choice.label}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-pro-text-secondary">
                  {choice.description}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );

  if (!bordered) {
    return (
      <section aria-labelledby="dashboard-new-project-heading">{content}</section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-white/[0.08] bg-pro-elevated/40 p-4 ring-1 ring-white/[0.04]"
      aria-labelledby="dashboard-new-project-heading"
    >
      {content}
    </section>
  );
}
