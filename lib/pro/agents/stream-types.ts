import type { AgentStagingBundle } from "@/lib/pro/types";
import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";

export type AgentPartialPatch = {
  executiveSummary?: string;
  researchNotes?: string;
  scenes?: AgentStagingBundle["scenes"];
  shotSequences?: AgentStagingBundle["shotSequences"];
  locations?: AgentStagingBundle["locations"];
  characters?: AgentStagingBundle["characters"];
  budget?: AgentStagingBundle["budget"];
  visual?: AgentStagingBundle["visual"];
};

export type AgentStreamEventType = {
  type: string;
  step?: string;
  message?: string;
  patch?: AgentPartialPatch;
  staging?: AgentStagingBundle;
};

export type { PrepPipelineAgentId };
