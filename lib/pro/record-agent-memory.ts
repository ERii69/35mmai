import { memoryWithLearnedPreferences } from "@/lib/pro/synthesize-project-memory";
import type {
  AgentMemoryDecision,
  AgentProjectMemory,
  AgentStagingBundle,
  DirectorRulesState,
} from "@/lib/pro/types";

function prefSnippet(rules: DirectorRulesState): string | null {
  const shots = rules.preferredShots.trim();
  if (shots) return `Prefers: ${shots.slice(0, 80)}${shots.length > 80 ? "…" : ""}`;
  const style = rules.styleNotes.trim();
  if (style) return `Style: ${style.slice(0, 80)}${style.length > 80 ? "…" : ""}`;
  return null;
}

/** Append memory entries from a review/commit pass (cap at 50). */
export function recordStagingDecisions(
  memory: AgentProjectMemory,
  staging: AgentStagingBundle,
  rules: DirectorRulesState
): AgentProjectMemory {
  const now = new Date().toISOString();
  const decisions: AgentMemoryDecision[] = [];

  for (const s of staging.scenes) {
    if (s.status === "pending") continue;
    decisions.push({
      id: `dec-${s.suggestionId}`,
      at: now,
      agent: "script_analyzer",
      summary: `${s.status === "approved" ? "Kept" : "Rejected"} scene: ${s.scene.heading || s.scene.oneLine || `#${s.scene.number}`}`,
      approved: s.status === "approved",
    });
  }

  for (const l of staging.locations) {
    if (l.status === "pending") continue;
    decisions.push({
      id: `dec-${l.suggestionId}`,
      at: now,
      agent: "research",
      summary: `${l.status === "approved" ? "Kept" : "Rejected"} location: ${l.name}`,
      approved: l.status === "approved",
    });
  }

  for (const sh of staging.shotSequences) {
    if (sh.status === "pending") continue;
    decisions.push({
      id: `dec-${sh.suggestionId}`,
      at: now,
      agent: "shot_list",
      summary: `${sh.status === "approved" ? "Kept" : "Rejected"} shots: ${sh.title}`,
      approved: sh.status === "approved",
    });
  }

  if (staging.budget && staging.budget.status !== "pending") {
    decisions.push({
      id: `dec-budget-${staging.runId}`,
      at: now,
      agent: "budget",
      summary: `${staging.budget.status === "approved" ? "Accepted" : "Rejected"} budget (${staging.budget.tier})`,
      approved: staging.budget.status === "approved",
    });
  }

  if (staging.visual && staging.visual.status !== "pending") {
    decisions.push({
      id: `dec-visual-${staging.runId}`,
      at: now,
      agent: "visual_bible",
      summary: `${staging.visual.status === "approved" ? "Accepted" : "Rejected"} visual bible pass`,
      approved: staging.visual.status === "approved",
    });
  }

  const pref = prefSnippet(rules);
  const extras: AgentMemoryDecision[] = [];
  if (pref && staging.scenes.some((s) => s.status === "approved")) {
    extras.push({
      id: `dec-pref-${now}`,
      at: now,
      agent: "project",
      summary: pref,
      approved: true,
    });
  }

  const dedupeKey = (d: AgentMemoryDecision) => `${d.agent}:${d.summary}`;
  const freshKeys = new Set([...decisions, ...extras].map(dedupeKey));
  const kept = memory.decisions.filter((d) => !freshKeys.has(dedupeKey(d)));

  return memoryWithLearnedPreferences(
    {
      ...memory,
      decisions: [...kept, ...decisions, ...extras].slice(-50),
    },
    rules
  );
}
