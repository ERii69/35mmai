import { formatDisplayHeading } from "@/lib/pro/format-display-heading";
import {
  beatSpecificVisual,
  parseScriptToPromptShotLine,
} from "@/lib/pro/build-script-to-prompt-shots";
import type {
  PlannedShot,
  ProjectStatePayload,
  SceneRow,
  ShotSequence,
} from "@/lib/pro/types";
import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";

const GENERATION_BOILERPLATE =
  /,?\s*(2\.39:1[^,]*|shallow depth of field|film grain|no text|no watermark|high detail|dramatic motivated lighting|cinematic film still|photorealistic film still|natural lighting|cinematic lighting|naturalistic film still)/gi;

/** Look-bible / prep notes that must never appear inside generation prompts. */
const LOOK_INSTRUCTION_POLLUTION =
  /modular ai|look bible|prompt pack|one shot,? one|no vertical|copy-ready|external tools|midjourney,\s*kling|\*\*scene rhythm|\*\*genre:|\*\*shot preference|\*\*coverage mix|\*\*texture:|palette and mood feed|_palette and mood|genre:\s*ai-native|establishing first,? then medium/i;

const SHOT_TYPE_PHRASE: Record<string, string> = {
  establishing: "establishing wide shot",
  wide: "wide master shot",
  medium: "medium shot",
  close_up: "close-up",
  extreme_close_up: "extreme close-up",
  dolly: "dolly tracking shot",
  pan: "slow pan",
  tilt: "tilt shot",
  handheld: "handheld shot",
  aerial: "aerial shot",
  other: "cinematic shot",
};

const SHARED_STILL_NEGATIVE =
  "vertical framing, watermark, text overlay, logo, social media crop, stock photo look, waxy skin, oversaturated";

/** Shot-specific avoid list — leads the negative so beats don't look identical. */
const SHOT_TYPE_NEGATIVE: Record<string, string> = {
  establishing:
    "no tight portrait, no faces filling frame, no missing geography, no cropped horizon",
  wide: "no tight portrait crop, no missing geography, no closed-in framing",
  medium: "no extreme wide empty frame, no lost character presence, no epic landscape only",
  close_up: "no busy wide background, no soft unfocused subject, no establishing vista",
  extreme_close_up: "no wide establishing frame, no busy environment, no full-body framing",
  dolly: "no static locked-off frame, no jump cuts, no whip-pan chaos",
  pan: "no static locked-off frame, no vertical tilt only",
  tilt: "no static locked-off frame, no horizontal pan only",
  handheld: "no tripod-locked sterile framing, no steadicam gloss",
  aerial: "no ground-level eyeline only, no handheld shake",
  other: "no off-beat framing",
};

export function stripGenerationBoilerplate(text: string): string {
  return text
    .replace(GENERATION_BOILERPLATE, "")
    .replace(/color palette\s*(?:#[0-9A-Fa-f]{3,8}\s*,\s*)+/gi, "")
    .replace(/(?:#[0-9A-Fa-f]{3,8}\s*,\s*){2,}#[0-9A-Fa-f]{3,8}/g, "")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .replace(/^,\s*|,\s*$/g, "")
    .trim();
}

/** Hex dumps make every beat look identical — keep named colors only, or drop. */
export function compactPaletteClause(palette: string): string {
  const trimmed = palette.trim();
  if (!trimmed) return "";
  const hexes = trimmed.match(/#[0-9A-Fa-f]{3,8}/g) ?? [];
  const named = trimmed
    .replace(/#[0-9A-Fa-f]{3,8}/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (named.length >= 4) return named.slice(0, 80);
  if (hexes.length >= 3) return "";
  return hexes.slice(0, 2).join(" ");
}

export function isLookInstructionPollution(text: string): boolean {
  return LOOK_INSTRUCTION_POLLUTION.test(text);
}

/** Remove look-bible / process sentences so a polluted shot label can still be used. */
export function stripLookInstructions(text: string): string {
  return text
    .replace(/\*\*[^*]+\*\*:?/g, " ")
    .replace(
      /Modular AI generation[^.]*\.?/gi,
      " "
    )
    .replace(/One shot,? one self-contained prompt[^.]*\.?/gi, " ")
    .replace(/Match the look bible[^.]*\.?/gi, " ")
    .replace(/Midjourney,\s*Kling,\s*LTX[^.]*(?:crops?\.)?/gi, " ")
    .replace(/2\.39:1 film still discipline[^.]*(?:crops?\.)?/gi, " ")
    .replace(/Genre:\s*ai-native(?:,\s*prompt pack)?/gi, " ")
    .replace(/Scene rhythm:[^.·\n]*/gi, " ")
    .replace(/Shot preference:[^.·\n]*/gi, " ")
    .replace(/No vertical(?:\/social)? crops?;?/gi, " ")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .replace(/^,\s*|,\s*$/g, "")
    .trim();
}

function isFullGenerationPrompt(text: string): boolean {
  const t = stripLookInstructions(text.trim());
  if (!t || isLookInstructionPollution(t)) return false;
  return (
    t.length >= 80 &&
    /cinematic|film still|2\.39|lighting|depth of field|no watermark|establishing|medium shot|close-up|wide (?:master|shot)/i.test(
      t
    )
  );
}

function cleanMoodLine(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t || isLookInstructionPollution(t)) return "";
  // Keep short cinematic mood; drop long prep essays.
  if (t.length > 140) return t.slice(0, 137).trimEnd() + "…";
  return t;
}

function cleanLookField(text: string, fallback = ""): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t || isLookInstructionPollution(t)) return fallback;
  return t.slice(0, 160);
}

export function sceneForShot(
  state: ProjectStatePayload,
  sequence: ShotSequence,
  shot: PlannedShot
): SceneRow | undefined {
  if (shot.sceneId) {
    const byId = state.directorPrep.scenes.find((s) => s.id === shot.sceneId);
    if (byId) return byId;
  }
  if (sequence.sceneNumber != null) {
    return state.directorPrep.scenes.find((s) => s.number === sequence.sceneNumber);
  }
  return undefined;
}

function actionLine(
  scene: SceneRow | undefined,
  shot: PlannedShot,
  sequence: ShotSequence
): string {
  if (scene) {
    const derived = beatSpecificVisual(scene, shot.shotType).replace(/\s+/g, " ").trim();
    if (derived.length >= 16) return derived.slice(0, 220);
  }

  const matchingLine = sequence.notes
    .split("\n")
    .map((line) => parseScriptToPromptShotLine(line.replace(/^[-*]\s*/, "").trim()))
    .find((line) => {
      if (line.skip || !line.label.trim()) return false;
      if (line.shotType && line.shotType === shot.shotType) return true;
      return false;
    });
  if (matchingLine?.label) {
    const cleaned = stripLookInstructions(matchingLine.label);
    if (cleaned) {
      const core = stripGenerationBoilerplate(cleaned);
      if (core.length >= 24) return core.slice(0, 220);
    }
  }

  const label = stripLookInstructions(shot.label.trim());
  if (label) return stripGenerationBoilerplate(label).slice(0, 220);
  return "";
}

export function buildPromptBeatContext(
  state: ProjectStatePayload,
  shot: PlannedShot,
  sequence: ShotSequence
): PromptBeatContext {
  const scene = sceneForShot(state, sequence, shot);
  const heading = formatDisplayHeading(
    scene?.heading?.trim() || sequence.title.trim() || "Scene"
  );
  const action = actionLine(scene, shot, sequence);
  const typePhrase = SHOT_TYPE_PHRASE[shot.shotType] ?? "cinematic shot";
  // Always short subject so tool formatters (MJ params, ARRI, LTX Scene:) stay visible.
  const subject =
    action && heading
      ? `${typePhrase}, ${heading}: ${action}`
      : action
        ? `${typePhrase}, ${action}`
        : typePhrase;

  const mood =
    cleanMoodLine(state.directorPrep.agentMeta.visualMood) ||
    cleanMoodLine(state.directorPrep.directorRules.toneAndRefs) ||
    cleanMoodLine(state.directorPrep.directorRules.styleNotes) ||
    "Cinematic, naturalistic film still";

  const palette = compactPaletteClause(
    state.visualBible.palette.filter(Boolean).slice(0, 5).join(", ")
  );
  const lens = cleanLookField(state.visualBible.lensAndFraming);
  const grain = cleanLookField(state.visualBible.grainAndTexture);
  const films =
    state.visualBible.moodBoardReferences
      .map((r) => r.title?.trim())
      .filter((t): t is string => Boolean(t) && !isLookInstructionPollution(t))
      .slice(0, 2)
      .join(", ") ||
    state.directorPrep.scenes
      .flatMap((s) => s.visualRefs)
      .filter((r) => r && !r.startsWith("data:") && !r.startsWith("http"))
      .slice(0, 2)
      .join(", ");

  return {
    subject,
    heading,
    action,
    shotType: shot.shotType,
    shotLabel: isLookInstructionPollution(shot.label) ? typePhrase : shot.label.trim(),
    mood,
    palette,
    lens,
    grain,
    films,
    camera: cleanLookField(shot.cameraNotes, lens),
    light: cleanLookField(shot.lightingNotes, grain),
    hasVisualRef: Boolean(shot.visualRefUrl?.trim()),
    customNegative: state.visualBible.negativePromptNotes.trim(),
  };
}

export function imageNegativePrompt(ctx: PromptBeatContext): string {
  const shotLead = SHOT_TYPE_NEGATIVE[ctx.shotType] ?? SHOT_TYPE_NEGATIVE.other!;
  const custom =
    ctx.customNegative && !isLookInstructionPollution(ctx.customNegative)
      ? ctx.customNegative
      : "";
  // Shot-specific terms first — shared boilerplate last — so beats read differently.
  return [shotLead, custom, SHARED_STILL_NEGATIVE].filter(Boolean).join(", ");
}

/** Motion tools — temporal artifacts first, then beat-specific, then shared stills. */
export function motionNegativePrompt(ctx: PromptBeatContext): string {
  const motionLead =
    "morphing faces, jitter, warp, flicker, stutter, rubber limbs, sliding feet";
  const shotLead = SHOT_TYPE_NEGATIVE[ctx.shotType] ?? "";
  const custom =
    ctx.customNegative && !isLookInstructionPollution(ctx.customNegative)
      ? ctx.customNegative
      : "";
  return [motionLead, shotLead, custom, SHARED_STILL_NEGATIVE].filter(Boolean).join(", ");
}
