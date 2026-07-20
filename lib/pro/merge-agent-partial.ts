import type { AgentPartialPatch } from "@/lib/pro/agents/stream-types";
import type { AgentStagingBundle } from "@/lib/pro/types";

export function mergeAgentPartial(
  prev: AgentStagingBundle | null,
  patch: AgentPartialPatch,
  runId: string
): AgentStagingBundle {
  const base: AgentStagingBundle = prev ?? {
    runId,
    status: "review",
    createdAt: new Date().toISOString(),
    executiveSummary: "",
    researchNotes: "",
    scenes: [],
    shotSequences: [],
    locations: [],
    characters: [],
    budget: null,
    visual: null,
    refineHint: null,
  };
  return {
    ...base,
    runId,
    status: "review",
    executiveSummary: patch.executiveSummary ?? base.executiveSummary,
    researchNotes: patch.researchNotes ?? base.researchNotes,
    scenes: patch.scenes ?? base.scenes,
    shotSequences: patch.shotSequences ?? base.shotSequences,
    locations: patch.locations ?? base.locations,
    characters: patch.characters ?? base.characters,
    budget: patch.budget !== undefined ? patch.budget : base.budget,
    visual: patch.visual !== undefined ? patch.visual : base.visual,
  };
}
