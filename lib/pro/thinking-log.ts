import { agentLabel, type PrepPipelineAgentId } from "@/lib/pro/agent-roster";

export type ThinkingLogPhase = "working" | "done" | "info";

export type ThinkingLogEntry = {
  id: string;
  agentId: PrepPipelineAgentId | null;
  agentLabel: string;
  message: string;
  phase: ThinkingLogPhase;
  at: number;
  /** Optional tooltip for “Why?” in the thinking log UI. */
  why?: string;
};

export function newThinkingLogEntry(
  partial: Omit<ThinkingLogEntry, "id" | "at"> & { at?: number }
): ThinkingLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: partial.at ?? Date.now(),
    ...partial,
  };
}

export function logEntryForAgent(
  agentId: PrepPipelineAgentId,
  message: string,
  phase: ThinkingLogPhase
): ThinkingLogEntry {
  return newThinkingLogEntry({
    agentId,
    agentLabel: agentLabel(agentId),
    message,
    phase,
  });
}

/** Mark in-flight log lines for an agent as finished (avoids stuck spinners). */
export function resolveAgentThinking(
  entries: ThinkingLogEntry[],
  agentId: PrepPipelineAgentId,
  message: string
): ThinkingLogEntry[] {
  let updated = false;
  return entries.map((entry) => {
    if (entry.agentId === agentId && entry.phase === "working") {
      updated = true;
      return { ...entry, phase: "done" as const, message };
    }
    return entry;
  }).concat(
    updated
      ? []
      : [logEntryForAgent(agentId, message, "done")]
  );
}

/** Clear any leftover working rows when a run ends. */
export function finalizeThinkingLog(entries: ThinkingLogEntry[]): ThinkingLogEntry[] {
  return entries.map((entry) =>
    entry.phase === "working" ? { ...entry, phase: "done" as const, message: "Complete." } : entry
  );
}
