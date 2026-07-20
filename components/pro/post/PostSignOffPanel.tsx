"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ListChecks, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProEmptyState } from "@/components/pro/ux/ProEmptyState";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import { getToolOutboundUrl } from "@/lib/pro/catalog-tool-link";
import {
  DEFAULT_POST_CHECKLIST,
  suggestPostChecklistItems,
} from "@/lib/pro/post-checklist-defaults";
import {
  postWorkflowStepLabel,
  toolsForChecklistItem,
  workflowKeyForChecklistItem,
} from "@/lib/pro/post-workflow";
import type { ChecklistItem, ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
};

export function PostSignOffPanel({ state, updateState }: Props) {
  const items = state.postChecklist.items;
  const doneCount = items.filter((i) => i.done).length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;
  const [suggested, setSuggested] = useState(false);

  function seedDefaults() {
    updateState((p) => ({
      ...p,
      postChecklist: { ...p.postChecklist, items: [...DEFAULT_POST_CHECKLIST] },
    }));
  }

  function applySuggestions() {
    const next = suggestPostChecklistItems(state);
    updateState((p) => ({ ...p, postChecklist: { ...p.postChecklist, items: next } }));
    setSuggested(true);
  }

  function patchItem(index: number, patch: Partial<ChecklistItem>) {
    updateState((p) => {
      const next = [...p.postChecklist.items];
      next[index] = { ...next[index], ...patch };
      return { ...p, postChecklist: { ...p.postChecklist, items: next } };
    });
  }

  if (items.length === 0) {
    return (
      <ProEmptyState
        icon={<ListChecks className="size-10" aria-hidden />}
        title="Delivery sign-off not started"
        description="Load the standard pipeline checklist or pull steps from your prep and look."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" className="bg-pro-primary hover:brightness-110" onClick={seedDefaults}>
              Load sign-off checklist
            </Button>
            <Button type="button" variant="outline" className="border-white/10" onClick={applySuggestions}>
              <Sparkles className="mr-1.5 size-3.5" aria-hidden />
              From your project
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-pro-text-secondary">
          Picture lock through delivery — linked to post pipeline tools.
        </p>
        <p className="text-right text-sm tabular-nums text-pro-text">
          <span className="text-2xl font-semibold text-pro-primary">{pct}%</span>
          <span className="ml-2 text-xs text-pro-text-secondary">
            {doneCount}/{items.length} done
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/10 text-pro-text-secondary"
          onClick={applySuggestions}
        >
          <Sparkles className="mr-1.5 size-3.5" aria-hidden />
          {suggested ? "Refresh from project" : "Add from project"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/10 text-pro-text-secondary"
          onClick={() =>
            updateState((p) => ({
              ...p,
              postChecklist: {
                ...p.postChecklist,
                items: [
                  ...p.postChecklist.items,
                  {
                    id: `post-${Date.now()}`,
                    label: "New step",
                    hint: "What needs to happen, and how will you know it is done?",
                    done: false,
                  },
                ],
              },
            }))
          }
        >
          Add step
        </Button>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-pro-muted">
        <div className="h-full rounded-full bg-pro-success transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <SignOffRow
            key={item.id}
            item={item}
            onToggle={(done) => patchItem(i, { done })}
            onLabel={(label) => patchItem(i, { label })}
            onHint={(hint) => patchItem(i, { hint })}
          />
        ))}
      </ul>
    </div>
  );
}

function SignOffRow({
  item,
  onToggle,
  onLabel,
  onHint,
}: {
  item: ChecklistItem;
  onToggle: (done: boolean) => void;
  onLabel: (label: string) => void;
  onHint: (hint: string) => void;
}) {
  const [expanded, setExpanded] = useState(!item.done && Boolean(item.hint?.trim()));
  const workflowKey = workflowKeyForChecklistItem(item);
  const stepLabel = postWorkflowStepLabel(workflowKey);
  const tools = toolsForChecklistItem(item);

  return (
    <li
      className={`rounded-xl ring-1 ${
        item.done ? "bg-pro-success/5 ring-pro-success/20" : "bg-pro-elevated ring-white/[0.06]"
      }`}
    >
      <div className="flex items-start gap-3 px-3 py-3">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-white/20 accent-pro-primary"
          aria-label={`Mark done: ${item.label}`}
        />
        <div className="min-w-0 flex-1">
          <input
            className="w-full rounded-lg bg-transparent text-sm font-medium text-pro-text outline-none focus:ring-1 focus:ring-pro-primary/40"
            value={item.label}
            onChange={(e) => onLabel(e.target.value)}
          />
          {stepLabel ? (
            <p className="mt-1 text-[10px] uppercase tracking-wide text-pro-text-secondary">
              {stepLabel}
            </p>
          ) : null}
          {tools.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tools.map((tool) => (
                <li key={tool.rank}>
                  <a
                    href={getToolOutboundUrl(tool)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-pro-muted px-2 py-0.5 text-[10px] text-pro-primary ring-1 ring-pro-primary/20 hover:bg-pro-primary/10"
                  >
                    {tool.name}
                    <ExternalLink className="size-2.5 opacity-70" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {item.hint?.trim() ? (
            <button
              type="button"
              className="mt-1 flex items-center gap-1 text-xs text-pro-text-secondary hover:text-pro-text"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              <ChevronDown className={`size-3.5 transition ${expanded ? "rotate-180" : ""}`} aria-hidden />
              {expanded ? "Hide notes" : "Show notes"}
            </button>
          ) : null}
        </div>
        {item.done ? <CheckCircle2 className="size-4 shrink-0 text-pro-success" aria-hidden /> : null}
      </div>
      {expanded && item.hint?.trim() ? (
        <div className="border-t border-white/[0.04] px-3 pb-3 pl-10">
          <p className="text-xs leading-relaxed text-pro-text-secondary">{item.hint}</p>
          <textarea
            rows={2}
            className={`${proSurface.field} mt-2 text-xs text-pro-text-secondary`}
            value={item.hint}
            placeholder="Add your own notes for this step…"
            onChange={(e) => onHint(e.target.value)}
          />
        </div>
      ) : null}
    </li>
  );
}
