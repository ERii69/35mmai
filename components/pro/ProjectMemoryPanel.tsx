"use client";

import { Brain, Sparkles } from "lucide-react";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import { proTemplateDisplayName } from "@/lib/pro/templates";
import type { AgentProjectMemory } from "@/lib/pro/types";
import { agentLabel, type PrepPipelineAgentId } from "@/lib/pro/agent-roster";

type Props = {
  memory: AgentProjectMemory;
  appliedTemplateId?: string | null;
  compact?: boolean;
};

export function ProjectMemoryPanel({ memory, appliedTemplateId, compact }: Props) {
  const decisions = memory.decisions.slice(-12).reverse();
  const summary = memory.compressedScriptSummary.trim();
  const prefs = dedupePreferences(memory.learnedPreferences ?? []);
  const scriptToPrompt = isScriptToPromptTemplate(appliedTemplateId);
  const templateName = proTemplateDisplayName(appliedTemplateId);

  if (!summary && decisions.length === 0 && prefs.length === 0) {
    return compact ? null : (
      <p className="text-xs text-pro-text-secondary">
        Style preferences appear here after you keep or remove prep suggestions.
      </p>
    );
  }

  if (compact) {
    if (prefs.length === 0) return null;
    return (
      <div className="rounded-2xl bg-pro-elevated/90 p-4 ring-1 ring-white/[0.08]">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-pro-primary" aria-hidden />
          <h3 className="text-sm font-medium text-pro-text">
            {scriptToPrompt ? "Prompt pack rules" : "Your style"}
          </h3>
        </div>
        <p className="mt-1 text-[11px] text-pro-text-secondary">
          {scriptToPrompt && templateName
            ? `Template · ${templateName}`
            : scriptToPrompt
              ? "Template rules for your prompt pack."
              : "Agents use these on every run."}
        </p>
        <ul className="mt-3 space-y-2">
          {prefs.slice(0, 5).map((p) => (
            <li
              key={p}
              className="rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs leading-snug text-pro-text-secondary"
            >
              {formatPreference(p)}
            </li>
          ))}
        </ul>
        {prefs.length > 5 ? (
          <p className="mt-2 text-[11px] text-pro-text-secondary">+{prefs.length - 5} more</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl bg-[#0d0d0d]/60 p-4 ring-1 ring-white/5">
      <div className="flex items-center gap-2">
        <Brain className="size-4 text-pro-primary" aria-hidden />
        <h3 className="text-sm font-medium text-white">Project memory</h3>
      </div>

      {prefs.length > 0 ? (
        <ul className="space-y-1.5 text-xs text-pro-text-secondary">
          {prefs.map((p) => (
            <li key={p} className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
              {formatPreference(p)}
            </li>
          ))}
        </ul>
      ) : null}

      {summary ? (
        <p className="text-xs leading-relaxed text-pro-text-secondary">
          <span className="text-pro-text-secondary">Script: </span>
          {summary.length > 160 ? `${summary.slice(0, 160)}…` : summary}
        </p>
      ) : null}

      {decisions.length > 0 ? (
        <ul className="space-y-1.5 text-xs">
          {decisions.map((d) => (
            <li key={d.id} className="flex gap-2 text-pro-text-secondary">
              <span
                className={
                  d.approved ? "shrink-0 text-emerald-400" : "shrink-0 text-pro-warning/90"
                }
                aria-hidden
              >
                {d.approved ? "✓" : "✕"}
              </span>
              <span>
                <span className="text-pro-text-secondary">
                  {isPipelineAgent(d.agent) ? agentLabel(d.agent) : "Project"}:{" "}
                </span>
                {d.summary}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function dedupePreferences(prefs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of prefs) {
    const p = formatPreference(raw);
    if (!p) continue;
    const key = p.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/** Strip redundant prefixes like "Prefers:" / "Camera:" for cleaner sidebar cards. */
function formatPreference(p: string): string {
  return (
    p
      .replace(/^(Prefers|Camera|Look|Pack|Behavioral notes):\s*/i, "")
      .replace(/\s*[—–]\s*/g, ". ")
      .replace(/\s+/g, " ")
      .trim() || p
  );
}

function isPipelineAgent(a: string): a is PrepPipelineAgentId {
  return (
    a === "script_analyzer" ||
    a === "research" ||
    a === "shot_list" ||
    a === "budget" ||
    a === "visual_bible"
  );
}
