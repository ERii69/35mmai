import type { DirectorBudgetTier, SceneRow } from "@/lib/pro/types";
import { SCENE_MAX_VISUAL_REFS } from "@/lib/pro/types";
import { newSceneRow } from "@/lib/pro/director-prep-prompt";
import { extractJsonForSceneImport } from "@/lib/pro/import-scenes-json";

export type ImportedShotSequence = {
  id: string;
  title: string;
  notes: string;
  sceneNumber: number | null;
};

export type ScriptToPrepImport = {
  executiveSummary: string;
  visualMood: string;
  budgetSummaryText: string;
  budgetTier: DirectorBudgetTier | null;
  locations: string[];
  scenes: SceneRow[];
  shotSequences: ImportedShotSequence[];
};

export type ScriptToPrepPreview =
  | {
      ok: true;
      sceneCount: number;
      locationCount: number;
      shotSequenceCount: number;
      budgetSummary: string;
      executiveSummary: string;
    }
  | { ok: false; error: string };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((s) => s.trim());
}

function normalizeBudgetTier(raw: unknown): DirectorBudgetTier | null {
  if (raw === "indie" || raw === "mid" || raw === "high") return raw;
  return null;
}

function normalizeScene(raw: unknown, index: number, startNumber: number): SceneRow {
  const base = newSceneRow(startNumber + index);
  if (!isPlainObject(raw)) return base;

  return {
    ...base,
    number:
      typeof raw.number === "number" && Number.isFinite(raw.number)
        ? Math.max(1, Math.floor(raw.number))
        : startNumber + index,
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
    visualRefs: asStringArray(raw.visualRefs).slice(0, SCENE_MAX_VISUAL_REFS),
    shotNotes: typeof raw.shotNotes === "string" ? raw.shotNotes : base.shotNotes,
    status: "draft",
  };
}

function normalizeShotSequence(raw: unknown, index: number): ImportedShotSequence | null {
  if (!isPlainObject(raw)) return null;
  const shots = asStringArray(raw.shots);
  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim()
      : `Sequence ${index + 1}`;
  const sceneNumber =
    typeof raw.sceneNumber === "number" && Number.isFinite(raw.sceneNumber)
      ? Math.max(1, Math.floor(raw.sceneNumber))
      : null;
  const notes =
    shots.length > 0
      ? shots.map((s) => `- ${s}`).join("\n")
      : typeof raw.notes === "string"
        ? raw.notes
        : "";

  return {
    id: `seq-agent-${Date.now()}-${index}`,
    title,
    notes,
    sceneNumber,
  };
}

function formatBudgetSummary(raw: unknown): { text: string; tier: DirectorBudgetTier | null } {
  if (!isPlainObject(raw)) return { text: "", tier: null };
  const tier = normalizeBudgetTier(raw.tier);
  const summary = typeof raw.summary === "string" ? raw.summary.trim() : "";
  const low =
    typeof raw.monthlyToolingUsdLow === "number" && Number.isFinite(raw.monthlyToolingUsdLow)
      ? raw.monthlyToolingUsdLow
      : null;
  const high =
    typeof raw.monthlyToolingUsdHigh === "number" && Number.isFinite(raw.monthlyToolingUsdHigh)
      ? raw.monthlyToolingUsdHigh
      : null;

  const parts: string[] = [];
  if (summary) parts.push(summary);
  if (tier) parts.push(`Tier: ${tier}`);
  if (low != null && high != null) parts.push(`Est. monthly tooling: $${low}–$${high} USD`);
  else if (low != null) parts.push(`Est. monthly tooling from: $${low} USD`);

  return { text: parts.join(" · "), tier };
}

/** Parse pasted JSON from the Script-to-Pre-Production Agent. */
export function importScriptToPrepJson(
  rawText: string,
  existingSceneCount: number
): { ok: true; data: ScriptToPrepImport } | { ok: false; error: string } {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste the agent response from Claude or ChatGPT first." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonForSceneImport(trimmed));
  } catch {
    return {
      ok: false,
      error: "Could not read JSON. Paste the full reply — markdown fences are OK.",
    };
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, error: "Expected a JSON object." };
  }

  const sceneRows = parsed.scenes;
  if (!Array.isArray(sceneRows) || sceneRows.length === 0) {
    return { ok: false, error: 'JSON must include a non-empty "scenes" array.' };
  }

  const startNumber = existingSceneCount + 1;
  const scenes = sceneRows.map((row, i) => normalizeScene(row, i, startNumber));

  const shotSequences = Array.isArray(parsed.shotSequences)
    ? parsed.shotSequences
        .map((row, i) => normalizeShotSequence(row, i))
        .filter((s): s is ImportedShotSequence => s != null)
    : [];

  const locations = asStringArray(parsed.locations);
  const budget = formatBudgetSummary(parsed.budgetEstimate);

  return {
    ok: true,
    data: {
      executiveSummary:
        typeof parsed.executiveSummary === "string" ? parsed.executiveSummary.trim() : "",
      visualMood: typeof parsed.visualMood === "string" ? parsed.visualMood.trim() : "",
      budgetSummaryText: budget.text,
      budgetTier: budget.tier,
      locations,
      scenes,
      shotSequences,
    },
  };
}

export function previewScriptToPrepImport(rawText: string): ScriptToPrepPreview {
  const result = importScriptToPrepJson(rawText, 0);
  if (!result.ok) return result;
  const { data } = result;
  return {
    ok: true,
    sceneCount: data.scenes.length,
    locationCount: data.locations.length,
    shotSequenceCount: data.shotSequences.length,
    budgetSummary: data.budgetSummaryText || "No budget summary in response.",
    executiveSummary: data.executiveSummary || "No executive summary in response.",
  };
}
