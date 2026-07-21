import {
  PREP_PIPELINE_ORDER,
  agentLabel,
  type PrepPipelineAgentId,
} from "@/lib/pro/agent-roster";
import { planRefineAgents } from "@/lib/pro/plan-refine-agents";

export type RefinePreview = {
  agents: PrepPipelineAgentId[];
  agentLabels: string[];
  skippedAgentLabels: string[];
  changeSummary: string[];
  trustNote: string;
};

/** Describe what Refine will touch before the user runs it. */
export function buildRefinePreview(refineHint: string): RefinePreview | null {
  const hint = refineHint.trim();
  if (!hint) return null;

  const agents = planRefineAgents(hint);
  const h = hint.toLowerCase();
  const changeSummary: string[] = [];
  const skipped = PREP_PIPELINE_ORDER.filter((id) => !agents.includes(id)).map((id) =>
    agentLabel(id)
  );

  if (agents.includes("script_analyzer")) {
    changeSummary.push("Scene breakdown may refresh — review approve/reject again.");
  }
  if (agents.includes("research")) {
    changeSummary.push("Locations and research notes may change.");
  }
  if (agents.includes("shot_list")) {
    changeSummary.push("Shot sequences linked to scenes may be replaced or expanded.");
  }
  if (agents.includes("budget")) {
    changeSummary.push("Budget band and tooling estimates may shift.");
  }
  if (agents.includes("visual_bible")) {
    changeSummary.push("Mood, palette, lens notes, and references in Look may update.");
  }

  if (h.includes("cinematic")) {
    changeSummary.push("Look and coverage should lean more cinematic (contrast, lens, movement).");
  }
  if (h.includes("cheaper") || h.includes("lower budget")) {
    changeSummary.push("Budget agent should tighten tier and tool suggestions.");
  }
  if (h.includes("location")) {
    changeSummary.push("Research agent will prioritize location passes.");
  }
  if (h.includes("color") || h.includes("palette") || h.includes("look")) {
    changeSummary.push("Visual Bible agent will adjust palette and grade direction.");
  }

  if (changeSummary.length === 0) {
    changeSummary.push(`Targeted refine based on: “${hint.slice(0, 120)}${hint.length > 120 ? "…" : ""}”.`);
  }

  return {
    agents,
    agentLabels: agents.map((id) => agentLabel(id)),
    skippedAgentLabels: skipped,
    changeSummary,
    trustNote:
      "Your past accept/reject decisions in project memory guide these agents. Nothing saves until you accept staging or save to project.",
  };
}
