import { defaultDurationForShotType } from "@/lib/pro/shot-plan-enrichment";
import type {
  PlannedShot,
  ShotProductionStatus,
  ShotSequence,
  ShotType,
} from "@/lib/pro/types";

export const SHOT_TYPE_OPTIONS: { value: ShotType; label: string }[] = [
  { value: "establishing", label: "Establishing" },
  { value: "wide", label: "Wide" },
  { value: "medium", label: "Medium" },
  { value: "close_up", label: "Close-up" },
  { value: "extreme_close_up", label: "Extreme CU" },
  { value: "dolly", label: "Dolly" },
  { value: "pan", label: "Pan" },
  { value: "tilt", label: "Tilt" },
  { value: "handheld", label: "Handheld" },
  { value: "aerial", label: "Aerial" },
  { value: "other", label: "Other" },
];

export const SHOT_STATUS_OPTIONS: { value: ShotProductionStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "storyboarded", label: "Storyboarded" },
  { value: "shot", label: "Shot" },
  { value: "approved", label: "Approved" },
];

export function formatShotNumber(seqIndex: number, shotIndex: number): string {
  return `${seqIndex + 1}.${shotIndex + 1}`;
}

export function newPlannedShot(shotType: ShotType = "wide", label = ""): PlannedShot {
  return {
    id: `shot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    shotType,
    label,
    visualBibleNote: "",
    durationSeconds: defaultDurationForShotType(shotType),
    visualRefUrl: "",
    cameraNotes: "",
    lightingNotes: "",
    status: "planned",
    sceneId: null,
  };
}

export function defaultCoverageShots(visualBibleNote: string): PlannedShot[] {
  return [
    { ...newPlannedShot("establishing", "Establishing"), visualBibleNote },
    { ...newPlannedShot("wide", "Wide master"), visualBibleNote },
    { ...newPlannedShot("medium", "Medium"), visualBibleNote },
    { ...newPlannedShot("close_up", "Close-up"), visualBibleNote },
  ];
}

export function normalizeShotSequence(raw: unknown, index: number): ShotSequence {
  const base = {
    id: `seq-${index}`,
    title: "",
    notes: "",
    sceneNumber: null as number | null,
    shots: [] as PlannedShot[],
  };
  if (typeof raw !== "object" || raw === null) return base;
  const o = raw as Record<string, unknown>;
  const shots = Array.isArray(o.shots)
    ? o.shots
        .filter((x) => typeof x === "object" && x !== null)
        .map((x, i) => normalizePlannedShot(x, i))
    : [];
  return {
    id: typeof o.id === "string" ? o.id : base.id,
    title: typeof o.title === "string" ? o.title : "",
    notes: typeof o.notes === "string" ? o.notes : "",
    sceneNumber: typeof o.sceneNumber === "number" ? o.sceneNumber : null,
    shots,
  };
}

export function normalizePlannedShot(raw: unknown, index: number): PlannedShot {
  const base = newPlannedShot("other", "");
  if (typeof raw !== "object" || raw === null) {
    return { ...base, id: `shot-${index}` };
  }
  const o = raw as Record<string, unknown>;
  const shotType = isShotType(o.shotType) ? o.shotType : "other";
  const duration =
    typeof o.durationSeconds === "number" && o.durationSeconds > 0
      ? Math.min(600, Math.round(o.durationSeconds))
      : defaultDurationForShotType(shotType);

  return {
    id: typeof o.id === "string" ? o.id : `shot-${index}`,
    shotType,
    label: typeof o.label === "string" ? o.label : "",
    visualBibleNote: typeof o.visualBibleNote === "string" ? o.visualBibleNote : "",
    durationSeconds: duration,
    visualRefUrl: typeof o.visualRefUrl === "string" ? o.visualRefUrl : "",
    cameraNotes: typeof o.cameraNotes === "string" ? o.cameraNotes : "",
    lightingNotes: typeof o.lightingNotes === "string" ? o.lightingNotes : "",
    status: isShotStatus(o.status) ? o.status : "planned",
    sceneId: typeof o.sceneId === "string" ? o.sceneId : null,
    aiGenerationPrompt:
      typeof o.aiGenerationPrompt === "string" ? o.aiGenerationPrompt : undefined,
    aiNegativePrompt:
      typeof o.aiNegativePrompt === "string" ? o.aiNegativePrompt : undefined,
    recommendedToolRank:
      typeof o.recommendedToolRank === "number" && Number.isFinite(o.recommendedToolRank)
        ? o.recommendedToolRank
        : undefined,
  };
}

function isShotType(v: unknown): v is ShotType {
  return (
    v === "wide" ||
    v === "medium" ||
    v === "close_up" ||
    v === "extreme_close_up" ||
    v === "dolly" ||
    v === "pan" ||
    v === "tilt" ||
    v === "handheld" ||
    v === "aerial" ||
    v === "establishing" ||
    v === "other"
  );
}

function isShotStatus(v: unknown): v is ShotProductionStatus {
  return v === "planned" || v === "storyboarded" || v === "shot" || v === "approved";
}

export function moveShotInSequence(
  shots: PlannedShot[],
  fromIndex: number,
  toIndex: number
): PlannedShot[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return shots;
  const next = [...shots];
  const [item] = next.splice(fromIndex, 1);
  if (!item) return shots;
  next.splice(toIndex, 0, item);
  return next;
}

export function moveShotBetweenSequences(
  sequences: ShotSequence[],
  from: { seqIndex: number; shotIndex: number },
  to: { seqIndex: number; shotIndex: number }
): ShotSequence[] {
  if (from.seqIndex === to.seqIndex) {
    const next = [...sequences];
    const seq = next[from.seqIndex];
    if (!seq) return sequences;
    next[from.seqIndex] = {
      ...seq,
      shots: moveShotInSequence(seq.shots, from.shotIndex, to.shotIndex),
    };
    return next;
  }

  const next = sequences.map((s) => ({ ...s, shots: [...s.shots] }));
  const fromSeq = next[from.seqIndex];
  const toSeq = next[to.seqIndex];
  if (!fromSeq || !toSeq) return sequences;

  const [shot] = fromSeq.shots.splice(from.shotIndex, 1);
  if (!shot) return sequences;

  const insertAt = Math.min(Math.max(0, to.shotIndex), toSeq.shots.length);
  toSeq.shots.splice(insertAt, 0, shot);
  return next;
}

export function newShotSequence(title: string, sceneNumber: number | null = null): ShotSequence {
  return {
    id: `seq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    notes: "",
    sceneNumber,
    shots: [],
  };
}
