import { memoryWithLearnedPreferences } from "@/lib/pro/synthesize-project-memory";
import type { AgentMemoryDecision, AgentProjectMemory, DirectorRulesState } from "@/lib/pro/types";

/** Record a single approve/reject without waiting for full commit. */
export function appendMemoryDecision(
  memory: AgentProjectMemory,
  decision: Omit<AgentMemoryDecision, "id" | "at"> & { id?: string },
  rules?: DirectorRulesState
): AgentProjectMemory {
  const entry: AgentMemoryDecision = {
    id: decision.id ?? `dec-${Date.now()}`,
    at: new Date().toISOString(),
    agent: decision.agent,
    summary: decision.summary,
    approved: decision.approved,
  };
  const next = {
    ...memory,
    decisions: [...memory.decisions, entry].slice(-50),
  };
  return rules ? memoryWithLearnedPreferences(next, rules) : next;
}
