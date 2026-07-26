import { getToolByRank } from "@/app/data";
import { formatHiggsfieldPrompt } from "@/lib/pro/prompt-engine/format-higgsfield";
import { formatKlingPrompt } from "@/lib/pro/prompt-engine/format-kling";
import { formatLtxPrompt } from "@/lib/pro/prompt-engine/format-ltx";
import { formatMidjourneyPrompt } from "@/lib/pro/prompt-engine/format-midjourney";
import { formatNanoPrompt } from "@/lib/pro/prompt-engine/format-nano";
import { buildPromptBeatContext } from "@/lib/pro/prompt-engine/prompt-context";
import {
  isPhase4PromptToolRank,
  type FormattedToolPrompt,
  type PromptSyntaxKind,
} from "@/lib/pro/prompt-engine/types";
import type {
  PlannedShot,
  ProjectStatePayload,
  ShotSequence,
} from "@/lib/pro/types";

export type ShotPromptBuildInput = {
  state: ProjectStatePayload;
  shot: PlannedShot;
  sequence: ShotSequence;
  toolRank: number;
};

export type BuiltShotPrompt = FormattedToolPrompt;

const SYNTAX_BY_RANK: Record<number, PromptSyntaxKind> = {
  6: "mj-params",
  18: "nano-composite",
  5: "kling-motion",
  4: "ltx-scene",
  21: "higgsfield-grade",
};

function formatForRank(
  rank: number,
  ctx: ReturnType<typeof buildPromptBeatContext>
): { prompt: string; negativePrompt: string } {
  switch (rank) {
    case 6:
      return formatMidjourneyPrompt(ctx);
    case 18:
      return formatNanoPrompt(ctx);
    case 5:
      return formatKlingPrompt(ctx);
    case 4:
      return formatLtxPrompt(ctx);
    case 21:
      return formatHiggsfieldPrompt(ctx);
    default:
      return formatMidjourneyPrompt(ctx);
  }
}

/** Voice tools — kept for legacy picker entries outside phase 4 kit. */
export function isAudioPromptTool(toolRank: number): boolean {
  if (toolRank === 3) return true;
  const tool = getToolByRank(toolRank);
  if (!tool) return false;
  return (
    tool.name.toLowerCase().includes("elevenlabs") ||
    (tool.roles.includes("Sound Designer") &&
      !/video|image|midjourney|runway|kling|pika|higgsfield|ltx|nano/i.test(tool.name))
  );
}

/** Assemble a copy-ready generation prompt for one planned shot. */
export function buildShotToolPrompt(input: ShotPromptBuildInput): BuiltShotPrompt {
  const { state, shot, sequence, toolRank } = input;
  const tool = getToolByRank(toolRank);
  const toolName = tool?.name ?? "External tool";
  const rank = isPhase4PromptToolRank(toolRank) ? toolRank : 6;

  if (isAudioPromptTool(toolRank)) {
    const ctx = buildPromptBeatContext(state, shot, sequence);
    const tone =
      ctx.mood ||
      "Warm, cinematic narrator voice with natural pacing, subtle emotion, and clear diction";
    const prompt = ctx.action
      ? `${tone}. Read aloud for ${ctx.heading}: "${ctx.action}"`
      : `${tone}. Narrate the atmosphere of ${ctx.heading}.`;
    return {
      prompt: prompt.trim().slice(0, 2000),
      negativePrompt: "robotic delivery, distortion, background music, heavy reverb, clipping",
      toolRank,
      toolName,
      syntax: "mj-params",
    };
  }

  const ctx = buildPromptBeatContext(state, shot, sequence);
  const formatted = formatForRank(rank, ctx);
  const syntax = SYNTAX_BY_RANK[rank] ?? "mj-params";

  if (formatted.prompt.length < 24 && tool?.examplePrompt) {
    formatted.prompt = `${tool.examplePrompt} ${ctx.subject}`.slice(0, 1200);
  }

  return {
    prompt: formatted.prompt.trim().slice(0, 2000),
    negativePrompt: formatted.negativePrompt,
    toolRank: rank,
    toolName: getToolByRank(rank)?.name ?? toolName,
    syntax,
  };
}

// Re-export for tests and legacy imports
export { stripGenerationBoilerplate } from "@/lib/pro/prompt-engine/prompt-context";
