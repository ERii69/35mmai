import { agentLabel, PREP_PIPELINE_ORDER, type PrepPipelineAgentId } from "@/lib/pro/agent-roster";

export type PrepAgentCostLine = {
  id: PrepPipelineAgentId;
  label: string;
  minutesLabel: string;
  costLabel: string;
};

/** Rough filmmaker-facing estimate (not billing-accurate). */
export function estimatePrepRun(
  scriptCharCount: number,
  agentCount = PREP_PIPELINE_ORDER.length,
  longScriptMode = false
): { minutesLabel: string; costLabel: string } {
  const pages = Math.max(1, Math.ceil(scriptCharCount / 3000));
  const longMul = longScriptMode ? 1.35 : 1;
  const baseMinutes = (1.5 + pages * 0.35 + agentCount * 0.4) * longMul;
  const minutes = Math.min(12, Math.max(2, Math.round(baseMinutes)));
  const usdLow = Math.round(minutes * 0.08 * 10) / 10;
  const usdHigh = Math.round(minutes * 0.15 * 10) / 10;
  return {
    minutesLabel: `About ${minutes}–${minutes + 2} minutes`,
    costLabel: `Est. API cost ~$${usdLow}–$${usdHigh} (varies by provider)`,
  };
}

/** Per-agent breakdown for prep cost UI (PRO-104). */
export function estimatePrepRunBreakdown(
  scriptCharCount: number,
  agents: PrepPipelineAgentId[] = [...PREP_PIPELINE_ORDER],
  longScriptMode = false
): PrepAgentCostLine[] {
  const pages = Math.max(1, Math.ceil(scriptCharCount / 3000));
  const longMul = longScriptMode ? 1.35 : 1;
  const scriptHeavy = new Set<PrepPipelineAgentId>(["script_analyzer", "research"]);

  return agents.map((id) => {
    const baseMin = scriptHeavy.has(id) ? 1.2 + pages * 0.2 : 0.6 + pages * 0.08;
    const minutes = Math.max(1, Math.round(baseMin * longMul));
    const usdLow = Math.round(minutes * 0.06 * 10) / 10;
    const usdHigh = Math.round(minutes * 0.12 * 10) / 10;
    return {
      id,
      label: agentLabel(id),
      minutesLabel: `~${minutes} min`,
      costLabel: `~$${usdLow}–$${usdHigh}`,
    };
  });
}

/** Quick on-device prep — no API. */
export function estimateLocalPrepRun(
  agentCount = PREP_PIPELINE_ORDER.length
): { minutesLabel: string; costLabel: string } {
  const count = Math.max(1, Math.min(agentCount, PREP_PIPELINE_ORDER.length));
  const seconds = Math.max(15, Math.round(12 + count * 4));
  return {
    minutesLabel: count >= 5 ? "About 30 seconds" : `About ${seconds} seconds`,
    costLabel: `No cloud cost · ${count} section${count === 1 ? "" : "s"} selected`,
  };
}
