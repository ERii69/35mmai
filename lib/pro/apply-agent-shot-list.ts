import { parseScriptToPromptShotLine, isLegacyCoverageShotNotes } from "@/lib/pro/build-script-to-prompt-shots";
import { enrichPlannedShot, parseDurationFromLabel, visualBibleContextLine } from "@/lib/pro/shot-plan-enrichment";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import { defaultCoverageShots, newPlannedShot } from "@/lib/pro/shot-plan";
import type {
  PlannedShot,
  ProjectStatePayload,
  ShotSequence,
  ShotType,
  StagedShotSequenceSuggestion,
} from "@/lib/pro/types";

function inferShotType(text: string): ShotType {
  const t = text.toLowerCase();
  if (/dolly|track|slider/i.test(t)) return "dolly";
  if (/aerial|drone/i.test(t)) return "aerial";
  if (/ecu|extreme close/i.test(t)) return "extreme_close_up";
  if (/cu|close/i.test(t)) return "close_up";
  if (/wide|master|establish/i.test(t)) return t.includes("establish") ? "establishing" : "wide";
  if (/medium|ms\b/i.test(t)) return "medium";
  if (/handheld/i.test(t)) return "handheld";
  if (/pan/i.test(t)) return "pan";
  if (/tilt/i.test(t)) return "tilt";
  return "other";
}

type AgentShotLine = {
  label: string;
  shotType?: string;
  durationSeconds?: number;
  cameraNotes?: string;
  lightingNotes?: string;
};

function isFullGenerationPrompt(text: string): boolean {
  const t = text.trim();
  return (
    t.length >= 80 &&
    /cinematic|film still|2\.39|lighting|depth of field|no watermark/i.test(t)
  );
}

function shotsFromAgentLines(
  lines: AgentShotLine[],
  state: ProjectStatePayload,
  sceneId: string | null,
  visualNote: string
): PlannedShot[] {
  if (!lines.length) return defaultCoverageShots(visualNote).map((s) => enrichPlannedShot(s, state, sceneId));
  return lines.map((line) => {
    const shotType = line.shotType && inferShotType(line.shotType) !== "other"
      ? inferShotType(line.shotType)
      : inferShotType(line.label);
    const parsed = parseDurationFromLabel(line.label);
    const base = {
      ...newPlannedShot(shotType, line.label),
      visualBibleNote: visualNote,
      durationSeconds: line.durationSeconds ?? parsed ?? 0,
      cameraNotes: line.cameraNotes ?? "",
      lightingNotes: line.lightingNotes ?? "",
      aiGenerationPrompt: isFullGenerationPrompt(line.label) ? line.label : "",
    };
    return enrichPlannedShot(base, state, sceneId);
  });
}

function classicalLabelFromLine(line: string): string {
  const cleaned = line.replace(/^[-*]\s*/, "").trim();
  if (!cleaned) return "";
  const head = cleaned.split("—")[0]?.trim() ?? cleaned;
  return head.slice(0, 120);
}

function parseClassicalShotLine(raw: string): { label: string; skip: boolean } {
  const cleaned = raw.replace(/^[-*]\s*/, "").trim();
  if (!cleaned) return { label: "", skip: true };
  if (/^director note:/i.test(cleaned)) return { label: cleaned, skip: true };
  return { label: classicalLabelFromLine(cleaned), skip: false };
}

function shotsFromClassicalNotes(
  notes: string,
  state: ProjectStatePayload,
  sceneId: string | null
): PlannedShot[] {
  const visualNote = visualBibleContextLine(state);
  const lines = notes
    .split("\n")
    .map((line) => parseClassicalShotLine(line))
    .filter((line) => !line.skip && line.label.trim());

  if (!lines.length) {
    return defaultCoverageShots(visualNote).map((s) => enrichPlannedShot(s, state, sceneId));
  }

  return lines.map((line) => {
    const shotType = inferShotType(line.label);
    const base = {
      ...newPlannedShot(shotType, line.label),
      visualBibleNote: visualNote,
      aiGenerationPrompt: "",
      aiNegativePrompt: "",
    };
    return enrichPlannedShot(base, state, sceneId);
  });
}

function shouldUsePromptPackShotParser(notes: string, state: ProjectStatePayload): boolean {
  if (isScriptToPromptTemplate(state.directorPrep.appliedTemplateId)) return true;
  if (!notes.trim()) return false;
  if (isLegacyCoverageShotNotes(notes)) return false;
  if (/\[(establishing|wide|medium|close_up|dolly)\]/i.test(notes)) return true;
  return /cinematic (establishing|wide|medium|close-up)|film still|2\.39:1/i.test(notes);
}

/** Parse agent shot-list notes into planned shots (used by commit + local generate). */
export function shotsFromNotes(
  notes: string,
  state: ProjectStatePayload,
  sceneId: string | null
): PlannedShot[] {
  if (!shouldUsePromptPackShotParser(notes, state)) {
    return shotsFromClassicalNotes(notes, state, sceneId);
  }

  const visualNote = visualBibleContextLine(state);
  const parsed = notes
    .split("\n")
    .map((line) => parseScriptToPromptShotLine(line))
    .filter((line) => !line.skip && line.label.trim());

  return shotsFromAgentLines(
    parsed.map(({ label, shotType }) => ({ label, shotType })),
    state,
    sceneId,
    visualNote
  );
}

export function applyAgentShotListToPlan(
  state: ProjectStatePayload,
  suggestions: StagedShotSequenceSuggestion[]
): ProjectStatePayload {
  const sequences: ShotSequence[] = suggestions.map((s) => {
    const scene =
      s.sceneNumber != null
        ? state.directorPrep.scenes.find((sc) => sc.number === s.sceneNumber)
        : undefined;
    return {
      id: `seq-${s.suggestionId}`,
      title: s.title,
      notes: s.notes,
      sceneNumber: s.sceneNumber,
      shots: shotsFromNotes(s.notes, state, scene?.id ?? null),
    };
  });

  const byScene = new Map<number, string>();
  sequences.forEach((seq) => {
    if (seq.sceneNumber != null) byScene.set(seq.sceneNumber, seq.id);
  });

  const scenes = state.directorPrep.scenes.map((scene) => {
    const linked = byScene.get(scene.number);
    return linked ? { ...scene, linkedSequenceId: linked } : scene;
  });

  return {
    ...state,
    shotPlan: { sequences },
    directorPrep: { ...state.directorPrep, scenes },
  };
}
