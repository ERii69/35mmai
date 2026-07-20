import { newSceneRow } from "@/lib/pro/director-prep-prompt";
import { callSubAgentJson } from "@/lib/pro/agents/anthropic-client";
import { memoryContextBlock, rulesBlock } from "@/lib/pro/agents/context";
import type { AgentProjectMemory, DirectorRulesState, SceneRow, StagedSceneSuggestion } from "@/lib/pro/types";
import { SCENE_MAX_VISUAL_REFS } from "@/lib/pro/types";

type ScriptAnalyzerOutput = {
  executiveSummary: string;
  compressedScriptSummary: string;
  scenes: Array<{
    heading: string;
    oneLine: string;
    intExt: string;
    dayNight: string;
    visualRefs: string[];
    shotNotes: string;
    confidence: number;
  }>;
};

export async function runScriptAnalyzerAgent(input: {
  rules: DirectorRulesState;
  screenplayRaw: string;
  title: string;
  memory: AgentProjectMemory;
  refineHint?: string;
}): Promise<{ summary: string; compressedSummary: string; scenes: StagedSceneSuggestion[] }> {
  const system = `You are the Script Analyzer sub-agent for film pre-production. Output ONLY valid JSON.`;
  const user = [
    memoryContextBlock(input.memory),
    input.refineHint ? `Refine instruction: ${input.refineHint}` : null,
    `Director rules:\n${rulesBlock(input.rules)}`,
    input.title ? `Title: ${input.title}` : null,
    "Break the screenplay into scenes. Include confidence 0-100 per scene.",
    "JSON schema:",
    JSON.stringify({
      executiveSummary: "string",
      compressedScriptSummary: "2-4 sentence script logline + structure",
      scenes: [
        {
          heading: "INT. LOCATION - DAY",
          oneLine: "string",
          intExt: "INT",
          dayNight: "DAY",
          visualRefs: ["film ref"],
          shotNotes: "string",
          confidence: 85,
        },
      ],
    }),
    "Screenplay:",
    input.screenplayRaw,
  ]
    .filter(Boolean)
    .join("\n\n");

  const out = await callSubAgentJson<ScriptAnalyzerOutput>(system, user, 8192);

  const scenes: StagedSceneSuggestion[] = (out.scenes ?? []).map((row, i) => {
    const base = newSceneRow(i + 1);
    const scene: SceneRow = {
      ...base,
      heading: row.heading ?? base.heading,
      oneLine: row.oneLine ?? base.oneLine,
      intExt:
        row.intExt === "INT" || row.intExt === "EXT" || row.intExt === "INT/EXT"
          ? row.intExt
          : base.intExt,
      dayNight:
        row.dayNight === "DAY" ||
        row.dayNight === "NIGHT" ||
        row.dayNight === "DAWN" ||
        row.dayNight === "DUSK"
          ? row.dayNight
          : base.dayNight,
      visualRefs: (row.visualRefs ?? []).slice(0, SCENE_MAX_VISUAL_REFS),
      shotNotes: row.shotNotes ?? base.shotNotes,
      status: "draft",
    };
    return {
      suggestionId: `sg-scene-${Date.now()}-${i}`,
      status: "pending" as const,
      confidence: Math.min(100, Math.max(0, Math.round(row.confidence ?? 75))),
      scene,
    };
  });

  return {
    summary: out.executiveSummary ?? "",
    compressedSummary: out.compressedScriptSummary ?? "",
    scenes,
  };
}
