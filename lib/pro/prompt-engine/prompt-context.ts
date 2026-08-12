import { formatDisplayHeading } from "@/lib/pro/format-display-heading";
import { parseScriptToPromptShotLine } from "@/lib/pro/build-script-to-prompt-shots";
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

const SHOT_TYPE_NEGATIVE: Record<string, string> = {
  establishing: "tight portrait crop, missing geography, faces filling frame",
  wide: "tight portrait crop, missing geography",
  medium: "extreme wide empty frame, lost character presence",
  close_up: "busy wide background, soft unfocused subject",
  extreme_close_up: "wide establishing frame, busy environment",
  dolly: "static locked-off frame, jump cuts",
  pan: "static locked-off frame",
  tilt: "static locked-off frame",
  handheld: "tripod-locked sterile framing",
  aerial: "ground-level eyeline only",
  other: "",
};

export function stripGenerationBoilerplate(text: string): string {
  return text
    .replace(GENERATION_BOILERPLATE, "")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .replace(/^,\s*|,\s*$/g, "")
    .trim();
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
  // Prefer the beat's own notes line (unique per establishing/medium/close-up).
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
      // Pull a short visual core — drop trailing style boilerplate if present.
      const core = stripGenerationBoilerplate(cleaned);
      if (core.length >= 24) return core.slice(0, 220);
    }
  }

  if (scene?.oneLine?.trim()) return scene.oneLine.trim().slice(0, 220);

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

  const palette = state.visualBible.palette.filter(Boolean).slice(0, 5).join(", ");
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
  const defaults =
    "vertical framing, watermark, text overlay, logo, social media crop, stock photo look, waxy skin, oversaturated";
  const shotExtra = SHOT_TYPE_NEGATIVE[ctx.shotType] ?? "";
  const custom = ctx.customNegative && !isLookInstructionPollution(ctx.customNegative)
    ? ctx.customNegative
    : "";
  return [custom, defaults, shotExtra].filter(Boolean).join(", ");
}

/** Motion tools — lead with temporal artifacts so the negative visibly differs from stills. */
export function motionNegativePrompt(ctx: PromptBeatContext): string {
  const motionLead =
    "morphing faces, jitter, warp, flicker, stutter, rubber limbs, sliding feet";
  const base = imageNegativePrompt(ctx);
  return `${motionLead}, ${base}`;
}
