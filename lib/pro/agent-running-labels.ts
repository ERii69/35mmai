import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";

/** Human-readable status while an agent is running. */
export const AGENT_RUNNING_LABEL: Record<PrepPipelineAgentId, string> = {
  script_analyzer: "Analyzing script…",
  research: "Researching locations & references…",
  shot_list: "Generating shots…",
  budget: "Estimating budget…",
  visual_bible: "Building visual bible…",
};

export function agentStatusLine(
  id: PrepPipelineAgentId,
  status: "waiting" | "running" | "done" | "error" | "skipped",
  detail: string | null,
  options?: { queued?: boolean }
): string {
  if (status === "running") return AGENT_RUNNING_LABEL[id];
  if (status === "done") return detail ?? "Complete";
  if (status === "error") return detail ?? "Failed";
  if (status === "skipped") return detail ?? "Not included";
  if (status === "waiting" && options?.queued) return "Up next…";
  return "Waiting";
}
