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

export function stripGenerationBoilerplate(text: string): string {
  return text
    .replace(GENERATION_BOILERPLATE, "")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .replace(/^,\s*|,\s*$/g, "")
    .trim();
}

function isFullGenerationPrompt(text: string): boolean {
  const t = text.trim();
  return (
    t.length >= 80 &&
    /cinematic|film still|2\.39|lighting|depth of field|no watermark/i.test(t)
  );
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
  if (scene?.oneLine?.trim()) return scene.oneLine.trim();
  const label = shot.label.trim();
  if (label && isFullGenerationPrompt(label)) return stripGenerationBoilerplate(label);
  if (label) return label;
  const firstLine = sequence.notes
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .find(Boolean);
  if (!firstLine) return "";
  return stripGenerationBoilerplate(parseScriptToPromptShotLine(firstLine).label);
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
  const subject =
    action && heading
      ? `${typePhrase}, ${heading}: ${action}`
      : action
        ? `${typePhrase}, ${action}`
        : typePhrase;

  const moodParts = [
    state.directorPrep.agentMeta.visualMood.trim(),
    state.directorPrep.directorRules.toneAndRefs.trim(),
    state.directorPrep.directorRules.styleNotes.trim(),
  ].filter(Boolean);
  const mood = moodParts[0] ?? "Cinematic, naturalistic film still";

  const palette = state.visualBible.palette.filter(Boolean).slice(0, 5).join(", ");
  const lens = state.visualBible.lensAndFraming.trim();
  const grain = state.visualBible.grainAndTexture.trim();
  const films =
    state.visualBible.moodBoardReferences
      .map((r) => r.title?.trim())
      .filter(Boolean)
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
    shotLabel: shot.label.trim(),
    mood,
    palette,
    lens,
    grain,
    films,
    camera: shot.cameraNotes.trim() || lens,
    light: shot.lightingNotes.trim() || grain,
    hasVisualRef: Boolean(shot.visualRefUrl?.trim()),
    customNegative: state.visualBible.negativePromptNotes.trim(),
  };
}

export function imageNegativePrompt(ctx: PromptBeatContext): string {
  const defaults =
    "vertical framing, watermark, text overlay, logo, social media crop, stock photo look, waxy skin, oversaturated";
  return ctx.customNegative ? `${ctx.customNegative}, ${defaults}` : defaults;
}

export function motionNegativePrompt(ctx: PromptBeatContext): string {
  const base = imageNegativePrompt(ctx);
  return `${base}, morphing faces, jitter, warp, flicker, stutter, rubber limbs, sliding feet`;
}
