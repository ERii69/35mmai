import type { SceneRow } from "@/lib/pro/types";
import { SCENE_MAX_VISUAL_REFS } from "@/lib/pro/types";
import { newSceneRow } from "@/lib/pro/director-prep-prompt";

export type ImportScenesResult =
  | { ok: true; scenes: SceneRow[] }
  | { ok: false; error: string };

/** Pull a JSON object out of messy Claude/ChatGPT replies (fences, prose, etc.). */
export function extractJsonForSceneImport(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

export type ImportScenesPreview =
  | { ok: true; count: number }
  | { ok: false; error: string };

/** Non-destructive check — how many scenes would import from pasted text. */
export function previewSceneImport(rawText: string): ImportScenesPreview {
  const result = importScenesFromJson(rawText, 0);
  if (!result.ok) return result;
  return { ok: true, count: result.scenes.length };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function normalizeImportedRow(raw: unknown, index: number, startNumber: number): SceneRow {
  const base = newSceneRow(startNumber + index);
  if (!isPlainObject(raw)) return base;

  const visualRefs = asStringArray(raw.visualRefs).slice(0, SCENE_MAX_VISUAL_REFS);

  return {
    ...base,
    heading: typeof raw.heading === "string" ? raw.heading : base.heading,
    oneLine: typeof raw.oneLine === "string" ? raw.oneLine : base.oneLine,
    intExt:
      raw.intExt === "INT" || raw.intExt === "EXT" || raw.intExt === "INT/EXT"
        ? raw.intExt
        : base.intExt,
    dayNight:
      raw.dayNight === "DAY" ||
      raw.dayNight === "NIGHT" ||
      raw.dayNight === "DAWN" ||
      raw.dayNight === "DUSK"
        ? raw.dayNight
        : base.dayNight,
    visualRefs,
    shotNotes: typeof raw.shotNotes === "string" ? raw.shotNotes : base.shotNotes,
    status: "draft",
  };
}

/** Parse pasted JSON from external AI; rows are always imported as drafts. */
export function importScenesFromJson(
  rawText: string,
  existingSceneCount: number
): ImportScenesResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a response from Claude or ChatGPT first." };
  }

  const jsonText = extractJsonForSceneImport(trimmed);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      error:
        "Could not read scene JSON. Paste the full reply — markdown fences are OK — or check the scenes array.",
    };
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, error: "Expected a JSON object with a scenes array." };
  }

  const rows = parsed.scenes;
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: 'JSON must include a non-empty "scenes" array.' };
  }

  const startNumber = existingSceneCount + 1;
  const scenes = rows.map((row, i) => normalizeImportedRow(row, i, startNumber));

  return { ok: true, scenes };
}
