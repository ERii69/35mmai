import type { AgentProgressStep } from "@/lib/pro/types";

export type PrepPipelineAgentId =
  | "script_analyzer"
  | "research"
  | "shot_list"
  | "budget"
  | "visual_bible";

export const PREP_PIPELINE_ORDER: PrepPipelineAgentId[] = [
  "script_analyzer",
  "research",
  "shot_list",
  "budget",
  "visual_bible",
];

export type PrepAgentPipelineGroup = "breakdown" | "world" | "production";

export type PrepAgentMeta = {
  id: PrepPipelineAgentId;
  label: string;
  step: number;
  group: PrepAgentPipelineGroup;
  groupLabel: string;
  handles: string;
  userControl: string;
  thinkingHint: string;
};

export const PREP_AGENT_PIPELINE_GROUPS: {
  id: PrepAgentPipelineGroup;
  label: string;
  description: string;
}[] = [
  {
    id: "breakdown",
    label: "1 · Breakdown",
    description: "Read the script and structure scenes",
  },
  {
    id: "world",
    label: "2 · World",
    description: "Cast, locations, and research notes",
  },
  {
    id: "production",
    label: "3 · Production",
    description: "Shots, budget, and visual look",
  },
];

export const PREP_AGENT_ROSTER: PrepAgentMeta[] = [
  {
    id: "script_analyzer",
    label: "Script Analyzer",
    step: 1,
    group: "breakdown",
    groupLabel: "Breakdown",
    handles: "Scene breakdown with one-line summaries per slugline",
    userControl: "Keep or remove each scene in Review → Scenes",
    thinkingHint: "Reading your script for scene headings, one-liners, and continuity.",
  },
  {
    id: "research",
    label: "Research",
    step: 2,
    group: "world",
    groupLabel: "World",
    handles: "Full cast list, filming locations, and reference notes",
    userControl: "Keep or remove characters and locations in Review → Research",
    thinkingHint: "Extracting every speaking role, location, and world detail from your script.",
  },
  {
    id: "shot_list",
    label: "Shot List",
    step: 3,
    group: "production",
    groupLabel: "Production",
    handles: "Coverage and shot sequences per scene",
    userControl: "Keep or remove shot lists, then refine in Production",
    thinkingHint: "Building coverage and camera notes per scene.",
  },
  {
    id: "budget",
    label: "Budget",
    step: 4,
    group: "production",
    groupLabel: "Production",
    handles: "Budget band estimate from scene count and tier",
    userControl: "Keep or remove budget in Review → Budget",
    thinkingHint: "Estimating indie/mid/high band and tooling costs.",
  },
  {
    id: "visual_bible",
    label: "Visual Bible",
    step: 5,
    group: "production",
    groupLabel: "Production",
    handles: "Look, mood, palette, and reference tone",
    userControl: "Keep or remove look notes, then expand in Look tab",
    thinkingHint: "Synthesizing palette, mood, and visual references from your vision.",
  },
];

export function prepAgentsByGroup(
  agents: PrepPipelineAgentId[] = PREP_PIPELINE_ORDER
): { group: (typeof PREP_AGENT_PIPELINE_GROUPS)[number]; agents: PrepAgentMeta[] }[] {
  return PREP_AGENT_PIPELINE_GROUPS.map((group) => ({
    group,
    agents: PREP_AGENT_ROSTER.filter(
      (agent) => agent.group === group.id && agents.includes(agent.id)
    ),
  })).filter((entry) => entry.agents.length > 0);
}

export function isPrepPipelineStep(step: AgentProgressStep): step is PrepPipelineAgentId {
  return PREP_PIPELINE_ORDER.includes(step as PrepPipelineAgentId);
}

export function agentLabel(id: PrepPipelineAgentId): string {
  return PREP_AGENT_ROSTER.find((a) => a.id === id)?.label ?? id;
}

export function agentMeta(id: PrepPipelineAgentId): PrepAgentMeta | undefined {
  return PREP_AGENT_ROSTER.find((a) => a.id === id);
}
