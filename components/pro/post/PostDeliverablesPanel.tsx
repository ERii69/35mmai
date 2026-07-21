"use client";

import { DELIVERABLE_PRESETS, PLATFORM_CHECKLIST } from "@/lib/pro/post-deliverables";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import type { ChecklistItem, ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
};

export function PostDeliverablesPanel({ state, updateState }: Props) {
  const checks =
    state.postChecklist.deliverableChecks ??
    PLATFORM_CHECKLIST.map((c) => ({ ...c }));

  function patchCheck(index: number, patch: Partial<ChecklistItem>) {
    updateState((p) => {
      const base =
        p.postChecklist.deliverableChecks ??
        PLATFORM_CHECKLIST.map((c) => ({ ...c }));
      const next = [...base];
      next[index] = { ...next[index], ...patch };
      return {
        ...p,
        postChecklist: { ...p.postChecklist, deliverableChecks: next },
      };
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-semibold text-pro-text">Export presets</h3>
        <p className="mt-1 text-sm text-pro-text-secondary">
          Common master and delivery formats — adjust per festival or platform spec sheets.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {DELIVERABLE_PRESETS.map((preset) => (
            <li key={preset.id} className={`${proSurface.card} space-y-1.5`}>
              <p className="text-sm font-medium text-pro-text">{preset.label}</p>
              <p className="text-xs font-medium text-pro-primary/90">{preset.format}</p>
              <p className="text-xs leading-relaxed text-pro-text-secondary">{preset.notes}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-pro-text">Platform checklist</h3>
        <p className="mt-1 text-sm text-pro-text-secondary">
          Sign off before you upload — metadata, codecs, and backups.
        </p>
        <ul className="mt-4 space-y-2">
          {checks.map((item, i) => (
            <li
              key={item.id}
              className={`${proSurface.card} flex items-start gap-3 py-3 ${
                item.done ? "ring-pro-success/20" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={(e) => patchCheck(i, { done: e.target.checked })}
                className="mt-0.5 size-4 rounded border-white/20 accent-pro-primary"
                aria-label={item.label}
              />
              <div>
                <p className="text-sm font-medium text-pro-text">{item.label}</p>
                {item.hint ? (
                  <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">{item.hint}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
