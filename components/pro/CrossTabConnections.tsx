"use client";

import { ArrowRight, Check, Circle } from "lucide-react";
import { getCrossTabStatus } from "@/lib/pro/cross-tab-sync";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { WorkspaceMode } from "@/lib/pro/workspace-modes";

type Props = {
  state: ProjectStatePayload;
  mode: WorkspaceMode;
  onNavigate?: (mode: WorkspaceMode) => void;
};

export function CrossTabConnections({ state, mode, onNavigate }: Props) {
  const status = getCrossTabStatus(state);

  const tabs: { id: WorkspaceMode; label: string; ready: boolean }[] = [
    { id: "prep", label: "Prep", ready: status.prepReady },
    { id: "look", label: "Look", ready: status.lookReady },
    { id: "production", label: "Finish", ready: status.productionReady },
    { id: "post", label: "Post", ready: status.postReady },
  ];

  return (
    <div className="hidden rounded-2xl bg-pro-elevated/80 px-4 py-3.5 ring-1 ring-white/[0.06] md:block">
      <p className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
        Cross-tab flow
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {tabs.map((t, i) => (
          <span key={t.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40 ${
                mode === t.id
                  ? "bg-pro-primary/20 text-pro-text ring-1 ring-pro-primary/40"
                  : "bg-pro-elevated text-pro-text-secondary hover:text-pro-text"
              }`}
            >
              {t.ready ? (
                <Check className="size-3 text-pro-success" aria-hidden />
              ) : (
                <Circle className="size-3 text-pro-text-secondary/50" aria-hidden />
              )}
              {t.label}
            </button>
            {i < tabs.length - 1 ? (
              <ArrowRight className="size-3 text-pro-text-secondary/40" aria-hidden />
            ) : null}
          </span>
        ))}
      </div>
      {status.messages.length > 0 ? (
        <ul className="mt-2 space-y-0.5 text-xs text-pro-text-secondary">
          {status.messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
