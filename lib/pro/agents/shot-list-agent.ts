import { callSubAgentJson } from "@/lib/pro/agents/anthropic-client";
import { isolateSceneSummaries, memoryContextBlock, rulesBlock } from "@/lib/pro/agents/context";
import type {
  AgentProjectMemory,
  DirectorRulesState,
  SceneRow,
  StagedShotSequenceSuggestion,
  VisualBibleState,
} from "@/lib/pro/types";

type AgentShotLine = {
  label: string;
  shotType?: string;
  durationSeconds?: number;
  cameraNotes?: string;
  lightingNotes?: string;
};

type ShotListOutput = {
  shotSequences: Array<{
    sceneNumber: number;
    title: string;
    shots: AgentShotLine[] | string[];
    confidence: number;
  }>;
};

function visualBlock(vb: VisualBibleState, mood: string): string {
  const lines = [
    vb.palette.length ? `Palette: ${vb.palette.join(", ")}` : null,
    mood ? `Mood: ${mood}` : null,
    vb.lensAndFraming.trim() ? `Lens/framing: ${vb.lensAndFraming.trim()}` : null,
    vb.grainAndTexture.trim() ? `Grain/texture: ${vb.grainAndTexture.trim()}` : null,
    vb.designSheetNotes.trim() ? `Design: ${vb.designSheetNotes.trim().slice(0, 200)}` : null,
  ].filter(Boolean);
  return lines.length ? `Visual bible:\n${lines.join("\n")}` : "";
}

export async function runShotListAgent(input: {
  rules: DirectorRulesState;
  scenes: SceneRow[];
  memory: AgentProjectMemory;
  visualBible: VisualBibleState;
  visualMood?: string;
  refineHint?: string;
  promptPack?: boolean;
}): Promise<StagedShotSequenceSuggestion[]> {
  const promptPack = input.promptPack === true;
  const system = promptPack
    ? `You are the Prompt Pack agent for AI-assisted film production.
Output ONLY JSON. For each scene, return 3–4 copy-ready image/video generation prompts (not film coverage labels).
Each shot must be a self-contained prompt a director can paste into Midjourney, Higgsfield, or LTX.
Use shotType values: wide, medium, close_up, extreme_close_up, establishing, dolly, other.
Write prompts as rich visual descriptions: location, action from the script, lighting, lens feel, 2.39:1 film still, film grain, no text, no watermark.
Do NOT output generic lines like "Medium two-shot — character beat" or "Director note".`
    : `You are the Shot Planner agent for indie/AI-assisted film production.
Output ONLY JSON. For each scene, return practical coverage with shot objects (not just strings).
Use shotType values: wide, medium, close_up, extreme_close_up, dolly, handheld, aerial, establishing, pan, tilt, other.
Include durationSeconds (typical: wide 12, medium 8, close_up 6).
Pull cameraNotes from lens/framing and lightingNotes from grain/design when relevant.`;

  const exampleShots = promptPack
    ? [
        {
          label:
            "Cinematic establishing wide shot, exterior golden wheat fields at summer harvest, camera approaching stone farmhouse wrapped in green vines, warm daylight, 2.39:1 film still, shallow depth of field, film grain, no text",
          shotType: "establishing",
        },
        {
          label:
            "Cinematic medium shot, same location, character scale against environment, 35mm lens feel, naturalistic motivated light, film still, no watermark",
          shotType: "medium",
        },
      ]
    : [
        {
          label: "1A Wide master",
          shotType: "wide",
          durationSeconds: 12,
          cameraNotes: "24mm, static",
          lightingNotes: "Soft window key",
        },
        {
          label: "1B Medium two-shot",
          shotType: "medium",
          durationSeconds: 8,
        },
      ];

  const user = [
    memoryContextBlock(input.memory),
    input.refineHint ? `Refine: ${input.refineHint}` : null,
    rulesBlock(input.rules),
    visualBlock(input.visualBible, input.visualMood ?? ""),
    "Scenes:",
    isolateSceneSummaries(input.scenes),
    "JSON:",
    JSON.stringify({
      shotSequences: [
        {
          sceneNumber: 1,
          title: "Scene 1 — INT. KITCHEN",
          shots: exampleShots,
          confidence: 82,
        },
      ],
    }),
  ]
    .filter(Boolean)
    .join("\n\n");

  const out = await callSubAgentJson<ShotListOutput>(system, user, 4096);

  return (out.shotSequences ?? []).map((seq, i) => {
    const shotLines = (seq.shots ?? []).map((s) => {
      if (typeof s === "string") return `- ${s}`;
      const type = s.shotType ? `[${s.shotType}] ` : "";
      if (promptPack) {
        return `- ${type}${s.label}`;
      }
      const parts = [s.label];
      if (s.shotType) parts.push(`[${s.shotType}]`);
      if (s.durationSeconds) parts.push(`${s.durationSeconds}s`);
      return `- ${parts.join(" ")}`;
    });
    return {
      suggestionId: `sg-shot-${Date.now()}-${i}`,
      status: "pending" as const,
      confidence: Math.min(100, Math.max(0, Math.round(seq.confidence ?? 75))),
      sceneNumber: seq.sceneNumber ?? null,
      title: seq.title ?? `Sequence ${i + 1}`,
      notes: shotLines.join("\n"),
    };
  });
}
