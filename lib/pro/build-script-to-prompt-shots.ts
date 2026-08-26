import { formatDisplayHeading } from "@/lib/pro/format-display-heading";
import { parseLocationFromHeading } from "@/lib/pro/locations-from-scenes";
import type { DirectorRulesState, SceneRow, ShotType, AgentStagingBundle } from "@/lib/pro/types";

type VisualHints = {
  mood?: string;
  palette?: string[];
  lens?: string;
  lighting?: string;
};

function sceneHeading(scene: SceneRow): string {
  return formatDisplayHeading(scene.heading.trim() || `Scene ${scene.number}`);
}

function locationLabel(scene: SceneRow): string {
  return parseLocationFromHeading(scene.heading) ?? sceneHeading(scene);
}

function timePhrase(scene: SceneRow): string {
  const dn = scene.dayNight?.trim();
  if (dn === "NIGHT") return "at night, motivated practical lighting";
  if (dn === "DAY") return "in daylight, natural motivated light";
  if (dn === "DAWN" || dn === "DUSK") return "at golden hour, warm low sun";
  return "with cinematic motivated lighting";
}

function actionVisual(scene: SceneRow): string {
  const raw = [scene.oneLine, scene.shotNotes].filter(Boolean).join(" ").trim();
  if (!raw) return `${locationLabel(scene)} environment`;
  return raw.replace(/\s+/g, " ").slice(0, 220);
}

function isInstructionalLookText(text: string): boolean {
  return /modular ai|look bible|prompt pack|one shot,? one|no vertical|copy-ready|external tools|midjourney,\s*kling/i.test(
    text
  );
}

function styleTail(rules: DirectorRulesState, visual?: VisualHints): string {
  const fromRules = [rules.styleNotes, rules.toneAndRefs]
    .map((s) => s.trim())
    .find((s) => s && !isInstructionalLookText(s));
  const moodRaw = visual?.mood?.trim() || fromRules || "Cinematic, naturalistic film still";
  const mood = isInstructionalLookText(moodRaw)
    ? "Cinematic, naturalistic film still"
    : moodRaw.slice(0, 120);
  const palette = visual?.palette?.filter(Boolean).slice(0, 4).join(", ") || "";
  const lensRaw = visual?.lens?.trim() || "35mm cinematic lens feel";
  const lens = isInstructionalLookText(lensRaw) ? "35mm cinematic lens feel" : lensRaw.slice(0, 80);
  const parts = [
    mood,
    palette ? `color palette ${palette}` : "",
    lens,
    "2.39:1 film still",
    "shallow depth of field",
    "film grain",
    "no text",
    "no watermark",
  ].filter(Boolean);
  return parts.join(", ");
}

/** Old quick-prep coverage labels — not copy-ready generation prompts. */
export function isLegacyCoverageShotNotes(notes: string): boolean {
  if (!notes.trim()) return false;
  if (/\[(establishing|wide|medium|close_up|dolly)\]/i.test(notes) && /cinematic/i.test(notes)) {
    return false;
  }
  return /Establishing wide —|character beat|Director note:|Medium two-shot or singles/i.test(notes);
}

/** Rebuild shot-list notes from scene rows (Script to prompt template). */
export function refreshScriptToPromptStagingShots(
  staging: AgentStagingBundle,
  rules: DirectorRulesState,
  visual?: VisualHints
): AgentStagingBundle {
  const sceneByNumber = new Map(staging.scenes.map((s) => [s.scene.number, s.scene]));
  let changed = false;
  const shotSequences = staging.shotSequences.map((seq) => {
    const scene =
      seq.sceneNumber != null
        ? sceneByNumber.get(seq.sceneNumber)
        : staging.scenes[0]?.scene;
    if (!scene || !isLegacyCoverageShotNotes(seq.notes)) return seq;
    changed = true;
    return { ...seq, notes: buildScriptToPromptShotNotes(scene, rules, visual) };
  });
  return changed ? { ...staging, shotSequences } : staging;
}

function formatPromptLine(shotType: ShotType, prompt: string): string {
  return `- [${shotType}] ${prompt}`;
}

function exteriorEstablishing(scene: SceneRow, rules: DirectorRulesState, visual?: VisualHints): string {
  const loc = locationLabel(scene);
  const action = actionVisual(scene);
  return formatPromptLine(
    "establishing",
    `Cinematic establishing wide shot, exterior ${loc} ${timePhrase(scene)}, ${action}, geography and scale, ${styleTail(rules, visual)}`
  );
}

function interiorMaster(scene: SceneRow, rules: DirectorRulesState, visual?: VisualHints): string {
  const loc = locationLabel(scene);
  const action = actionVisual(scene);
  return formatPromptLine(
    "wide",
    `Cinematic wide master shot, interior ${loc} ${timePhrase(scene)}, ${action}, full room geography and blocking, ${styleTail(rules, visual)}`
  );
}

function mediumBeat(scene: SceneRow, rules: DirectorRulesState, visual?: VisualHints): string {
  const loc = locationLabel(scene);
  const action = actionVisual(scene);
  return formatPromptLine(
    "medium",
    `Cinematic medium shot, ${loc} ${timePhrase(scene)}, ${action}, character and environment in frame, 35mm lens feel, ${styleTail(rules, visual)}`
  );
}

function closeDetail(scene: SceneRow, rules: DirectorRulesState, visual?: VisualHints): string {
  const action = actionVisual(scene);
  const detail = inferDetailSubject(action, scene);
  return formatPromptLine(
    "close_up",
    `Cinematic close-up, ${detail}, ${timePhrase(scene)}, tactile texture and story detail, ${styleTail(rules, visual)}`
  );
}

/** Unique visual sentence per beat — used by shot notes and the prompt engine. */
export function beatSpecificVisual(scene: SceneRow, shotType: ShotType): string {
  const loc = locationLabel(scene);
  const action = actionVisual(scene);
  const time = timePhrase(scene);
  switch (shotType) {
    case "establishing":
      return `exterior ${loc} ${time}, ${action}, geography and scale of the space`;
    case "wide":
      return scene.intExt === "EXT" || scene.intExt === "INT/EXT"
        ? `wide view of ${loc} ${time}, ${action}, full environment readable`
        : `interior ${loc} ${time}, ${action}, full room geography and blocking`;
    case "medium":
      return `${loc} ${time}, ${action}, waist-up character presence in the environment`;
    case "close_up":
      return `${inferDetailSubject(action, scene)}, ${time}, tactile texture and story detail`;
    case "extreme_close_up":
      return `extreme close-up of ${inferDetailSubject(action, scene)}, ${time}`;
    case "dolly":
      return `slow dolly through ${loc} ${time}, ${action}`;
    case "handheld":
      return `handheld in ${loc} ${time}, ${action}`;
    case "pan":
      return `slow pan across ${loc} ${time}, ${action}`;
    case "tilt":
      return `tilt reveal in ${loc} ${time}, ${action}`;
    case "aerial":
      return `aerial of ${loc} ${time}, ${action}`;
    default:
      return `${loc} ${time}, ${action}`;
  }
}

function inferDetailSubject(action: string, scene: SceneRow): string {
  const lower = action.toLowerCase();
  if (/\b(door|opens|opening)\b/.test(lower)) {
    return `weathered door slowly opening into ${locationLabel(scene)}, hands on handle, hinge detail`;
  }
  if (/\b(table|desk)\b/.test(lower)) {
    return `big wooden table surface and edge detail in ${locationLabel(scene)}, production design texture`;
  }
  if (/\b(house|stone|vines|green)\b/.test(lower)) {
    return `stone wall with climbing green vines, organic texture, ${locationLabel(scene)}`;
  }
  if (/\b(hands|phone|letter|object|key)\b/.test(lower)) {
    return `story-critical object or hands mid-action, ${action.slice(0, 100)}`;
  }
  if (scene.intExt === "EXT" || scene.intExt === "INT/EXT") {
    return `environmental story detail in ${locationLabel(scene)}, ${action.slice(0, 100)}`;
  }
  return `expressive story detail in ${locationLabel(scene)}, ${action.slice(0, 100)}`;
}

function optionalMovement(scene: SceneRow, rules: DirectorRulesState, visual?: VisualHints): string | null {
  const action = actionVisual(scene).toLowerCase();
  if (!/\b(run|chase|approach|walk|move|camera|tracking|dolly)\b/.test(action)) return null;
  return formatPromptLine(
    "dolly",
    `Slow dolly or tracking shot, ${locationLabel(scene)} ${timePhrase(scene)}, ${actionVisual(scene)}, motivated camera movement, ${styleTail(rules, visual)}`
  );
}

/** Copy-ready generation prompts — one bullet per planned shot (Script to prompt template). */
export function buildScriptToPromptShotNotes(
  scene: SceneRow,
  rules: DirectorRulesState,
  visual?: VisualHints
): string {
  const lines: string[] = [];
  const isExterior = scene.intExt === "EXT" || scene.intExt === "INT/EXT";

  lines.push(isExterior ? exteriorEstablishing(scene, rules, visual) : interiorMaster(scene, rules, visual));
  lines.push(mediumBeat(scene, rules, visual));
  lines.push(closeDetail(scene, rules, visual));

  const move = optionalMovement(scene, rules, visual);
  if (move) lines.push(move);

  return lines.join("\n");
}

/** Parse a staged shot-list line into shot type + generation prompt text. */
export function parseScriptToPromptShotLine(raw: string): {
  shotType?: string;
  label: string;
  skip: boolean;
} {
  const cleaned = raw.replace(/^[-*]\s*/, "").trim();
  if (!cleaned) return { label: "", skip: true };
  if (/^director note:/i.test(cleaned)) return { label: cleaned, skip: true };

  const bracket = cleaned.match(/^\[([a-z_]+)\]\s*(.+)$/i);
  if (bracket) {
    return { shotType: bracket[1], label: bracket[2].trim(), skip: false };
  }

  return { label: cleaned, skip: false };
}
