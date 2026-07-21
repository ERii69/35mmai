import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";

/** Client-safe partial re-run planner from a refine hint (no server SDK). */
export function planRefineAgents(refineHint: string): PrepPipelineAgentId[] {
  const h = refineHint.toLowerCase();
  if (h.includes("budget") || h.includes("cheaper") || h.includes("lower cost")) {
    return ["budget"];
  }
  if (h.includes("cinematic") || h.includes("slow") || h.includes("visual") || h.includes("mood")) {
    return ["visual_bible", "shot_list"];
  }
  if (h.includes("location") || h.includes("research")) {
    return ["research"];
  }
  if (h.includes("shot") || h.includes("coverage")) {
    return ["shot_list"];
  }
  return ["script_analyzer", "research", "shot_list"];
}
