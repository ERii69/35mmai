import { allTools, getCatalogKind, getToolByRank, type Tool } from "@/app/data";
import { buildShotToolPrompt } from "@/lib/pro/build-shot-tool-prompt";
import { beatSpecificVisual } from "@/lib/pro/build-script-to-prompt-shots";
import { formatDisplayHeading } from "@/lib/pro/format-display-heading";
import {
  charactersInScene,
  lockClauseForShot,
  placeForScene,
} from "@/lib/pro/prompt-locks";
import type {
  PlannedShot,
  ProjectStatePayload,
  PromptJob,
  SceneRow,
  ShotSequence,
  ShotType,
} from "@/lib/pro/types";

const JOB_FORMAT_RANK: Record<PromptJob, number> = {
  still: 6,
  edit: 18,
  move: 5,
  scene: 4,
  grade: 21,
};

const SUGGESTED_RANKS = [1, 6, 18, 5, 4, 21];

const SKIP_NAME =
  /\b(premiere|davinci|resolve|capcut|final cut|avid|pro tools|frame\.io|elevenlabs|suno|udio|mubert|aiva|soundraw)\b/i;

export function draftFrameSentence(scene: SceneRow | undefined, shotType: ShotType): string {
  if (!scene) return shotType.replace(/_/g, " ");
  return beatSpecificVisual(scene, shotType).replace(/, motivated practical lighting/gi, "");
}

export function inferPromptJob(tool: Tool): PromptJob | null {
  const name = tool.name.toLowerCase();
  if (name.includes("higgsfield")) return "grade";
  if (name.includes("ltx")) return "scene";
  if (name.includes("nano banana") || name.includes("topaz")) return "edit";
  if (name.includes("midjourney") || /^flux\b/.test(name)) return "still";
  if (/grok|kling|runway|veo|luma|seedance|\bwan\b|hailuo|pika|sora|marey|pixverse|omni|google flow/.test(name)) return "move";
  const blob = `${tool.helps} ${tool.shortDescription ?? ""}`.toLowerCase();
  if (/\bimage-to-video\b|\btext-to-video\b/.test(blob)) return "move";
  if (/\btext-to-image\b|\bstills?\b/.test(blob)) return "still";
  return null;
}

export function isVisualPromptTool(tool: Tool): boolean {
  if (tool.category === "Legal" || tool.category === "Gear") return false;
  const kind = getCatalogKind(tool);
  if (kind === "gear" || kind === "hardware") return false;
  if (SKIP_NAME.test(tool.name)) return false;
  return inferPromptJob(tool) != null;
}

export function promptJobForRank(state: ProjectStatePayload, rank: number): PromptJob {
  const saved = state.directorPrep.promptLocks?.toolShapes?.[String(rank)];
  if (saved) return saved;
  const tool = getToolByRank(rank);
  if (!tool) return "still";
  return inferPromptJob(tool) ?? "still";
}

export function promptJobIsKnown(state: ProjectStatePayload, rank: number): boolean {
  if (state.directorPrep.promptLocks?.toolShapes?.[String(rank)]) return true;
  const tool = getToolByRank(rank);
  return tool ? inferPromptJob(tool) != null : false;
}

export function visualPromptToolOptions(): { rank: number; name: string; suggested: boolean }[] {
  const tools = allTools.filter(isVisualPromptTool);
  const suggested = new Set(SUGGESTED_RANKS);
  return tools
    .map((tool) => ({
      rank: tool.rank,
      name: tool.name,
      suggested: suggested.has(tool.rank),
    }))
    .sort((a, b) => {
      if (a.suggested !== b.suggested) return a.suggested ? -1 : 1;
      if (a.suggested && b.suggested) {
        return SUGGESTED_RANKS.indexOf(a.rank) - SUGGESTED_RANKS.indexOf(b.rank);
      }
      return a.name.localeCompare(b.name);
    });
}

function keptStillLine(
  state: ProjectStatePayload,
  scene: SceneRow | undefined,
  shotType: ShotType
): string {
  const moving =
    shotType === "dolly" ||
    shotType === "pan" ||
    shotType === "tilt" ||
    shotType === "handheld" ||
    shotType === "aerial";
  if (!moving) return "";
  const person = charactersInScene(state, scene)[0];
  if (!person) return "Start from the still you kept.";
  const kept = person.keptStillPrompt?.trim();
  return kept
    ? `Start from the still you kept of ${person.name}. ${kept}`
    : `Start from the still you kept of ${person.name}.`;
}

/** The text they paste. Their sentence, the lock, and only what that tool needs. */
export function composeDirectedPrompt(input: {
  state: ProjectStatePayload;
  shot: PlannedShot;
  sequence: ShotSequence;
  toolRank: number;
  sentence: string;
}): { prompt: string; negativePrompt: string } {
  const { state, shot, sequence, toolRank, sentence } = input;
  const scene =
    state.directorPrep.scenes.find((row) => row.number === sequence.sceneNumber) ??
    state.directorPrep.scenes.find((row) => row.id === shot.sceneId);
  const job = promptJobForRank(state, toolRank);
  const lock = lockClauseForShot(state, scene, shot.shotType)
    .replace(/Start from the Midjourney reference still of [^.]+\.?/gi, "")
    .trim();
  const place = placeForScene(state, scene)?.look.trim() ?? "";
  const kept = keptStillLine(state, scene, shot.shotType);
  const heading = formatDisplayHeading(scene?.heading?.trim() || sequence.title.trim() || "Scene");
  const line = sentence.trim();

  let prompt = line;
  if (job === "still") {
    prompt = [line, lock, "--ar 21:9 --style raw --no text, watermark, logo, vertical crop"]
      .filter(Boolean)
      .join(" ");
  } else if (job === "edit") {
    prompt = ["photorealistic composite insert.", line, lock].filter(Boolean).join(" ");
  } else if (job === "move") {
    prompt = [kept, line, lock, "10 second clip, cinematic motion."].filter(Boolean).join(" ");
  } else if (job === "scene") {
    prompt = [
      `Scene: ${heading}`,
      `Shot: ${shot.shotType.replace(/_/g, " ")}`,
      `Action: ${[line, lock].filter(Boolean).join(". ")}`,
      "Duration: 5s",
      "Aspect: 2.39:1 cinematic",
    ].join("\n");
  } else {
    prompt = [
      "Shot on ARRI Alexa 35 with spherical cinema primes.",
      line,
      place || lock,
    ]
      .filter(Boolean)
      .join(" ");
  }

  const negatives = buildShotToolPrompt({
    state,
    shot,
    sequence,
    toolRank: JOB_FORMAT_RANK[job],
  });

  return {
    prompt: prompt.replace(/\s+\n/g, "\n").replace(/[ ]{2,}/g, " ").trim(),
    negativePrompt: negatives.negativePrompt,
  };
}
