import { callSubAgentJson } from "@/lib/pro/agents/anthropic-client";
import { memoryContextBlock, rulesBlock } from "@/lib/pro/agents/context";
import type {
  AgentProjectMemory,
  DirectorBudgetTier,
  DirectorRulesState,
  SceneRow,
  StagedBudgetSuggestion,
} from "@/lib/pro/types";

type BudgetOutput = {
  tier: DirectorBudgetTier;
  summary: string;
  monthlyToolingUsdLow: number;
  monthlyToolingUsdHigh: number;
  confidence: number;
};

export async function runBudgetAgent(input: {
  rules: DirectorRulesState;
  scenes: SceneRow[];
  memory: AgentProjectMemory;
  refineHint?: string;
}): Promise<StagedBudgetSuggestion> {
  const system = `You are the Budget sub-agent for AI-assisted micro-budget film prep. Estimate monthly tooling (not cast rates). Output ONLY JSON.`;
  const user = [
    memoryContextBlock(input.memory),
    input.refineHint ? `Refine: ${input.refineHint}` : null,
    rulesBlock(input.rules),
    `Scene count: ${input.scenes.length}`,
    "JSON:",
    JSON.stringify({
      tier: "indie",
      summary: "string",
      monthlyToolingUsdLow: 40,
      monthlyToolingUsdHigh: 120,
      confidence: 78,
    }),
  ]
    .filter(Boolean)
    .join("\n\n");

  const out = await callSubAgentJson<BudgetOutput>(system, user, 2048);
  const tier =
    out.tier === "mid" || out.tier === "high" || out.tier === "indie"
      ? out.tier
      : input.rules.budgetTier;

  return {
    suggestionId: `sg-budget-${Date.now()}`,
    status: "pending",
    confidence: Math.min(100, Math.max(0, Math.round(out.confidence ?? 70))),
    tier,
    summary: out.summary ?? "",
    monthlyToolingUsdLow: Number.isFinite(out.monthlyToolingUsdLow) ? out.monthlyToolingUsdLow : null,
    monthlyToolingUsdHigh: Number.isFinite(out.monthlyToolingUsdHigh) ? out.monthlyToolingUsdHigh : null,
  };
}
