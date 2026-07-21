import { stripDuplicatePhotosFromScenes } from "@/lib/pro/apply-visual-refs-to-shots";
import { fitReferencePhotosForCloudSave } from "@/lib/pro/compress-reference-image";
import type { AgentStagingBundle, ProjectStatePayload } from "@/lib/pro/types";
import {
  DIRECTOR_PREP_MAX_SNAPSHOTS,
  PROJECT_STATE_MAX_BYTES,
  PROJECT_STATE_PHOTO_BUDGET_BYTES,
} from "@/lib/pro/types";

/** Max design notes kept in cloud state (legacy analyze runs could append MB). */
export const DESIGN_SHEET_NOTES_MAX_CHARS = 12_000;

export type ProjectStateSizeBreakdown = {
  totalBytes: number;
  referencePhotosBytes: number;
  referencePhotoCount: number;
  scriptBytes: number;
  agentStagingBytes: number;
  snapshotsBytes: number;
  designNotesBytes: number;
  shotPromptsBytes: number;
};

export type ProjectStateSaveSizeAction =
  | { kind: "add-to-project" }
  | { kind: "compress-photos" }
  | { kind: "trim-snapshots" }
  | { kind: "generic" };

function jsonBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

/** Where save size comes from — used for accurate error copy. */
export function analyzeProjectStateSize(state: ProjectStatePayload): ProjectStateSizeBreakdown {
  let referencePhotosBytes = 0;
  let referencePhotoCount = 0;
  for (const url of state.visualBible.referenceUrls) {
    if (!url.startsWith("data:image")) continue;
    referencePhotoCount += 1;
    referencePhotosBytes += url.length;
  }

  let shotPromptsBytes = 0;
  for (const seq of state.shotPlan.sequences) {
    for (const shot of seq.shots) {
      shotPromptsBytes += (shot.aiGenerationPrompt?.length ?? 0) + (shot.aiNegativePrompt?.length ?? 0);
    }
  }

  return {
    totalBytes: jsonBytes(state),
    referencePhotosBytes,
    referencePhotoCount,
    scriptBytes: state.directorPrep.screenplay.rawText.length,
    agentStagingBytes: state.directorPrep.agentStaging ? jsonBytes(state.directorPrep.agentStaging) : 0,
    snapshotsBytes: jsonBytes(state.directorPrep.snapshots),
    designNotesBytes: state.visualBible.designSheetNotes.length,
    shotPromptsBytes,
  };
}

function kb(n: number): number {
  return Math.round(n / 1024);
}

/** Short breakdown lines for the save-size banner (largest contributors first). */
export function projectStateSizeBreakdownLines(
  breakdown: ProjectStateSizeBreakdown,
  maxBytes = PROJECT_STATE_MAX_BYTES
): string[] {
  const parts: { label: string; bytes: number }[] = [
    { label: "Prep review data", bytes: breakdown.agentStagingBytes },
    { label: "Reference photos", bytes: breakdown.referencePhotosBytes },
    { label: "Stored shot prompts", bytes: breakdown.shotPromptsBytes },
    { label: "Prep snapshots", bytes: breakdown.snapshotsBytes },
    { label: "Look design notes", bytes: breakdown.designNotesBytes },
    { label: "Script text", bytes: breakdown.scriptBytes },
  ];
  const lines = parts
    .filter((p) => p.bytes >= 8_000)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 4)
    .map((p) => `${p.label} ~${kb(p.bytes)} KB`);

  const totalKb = kb(breakdown.totalBytes);
  const maxKb = kb(maxBytes);
  return [`Project total ~${totalKb} KB (max ${maxKb} KB)`, ...lines];
}

/** Primary fix when save fails — drives CTA in the workspace banner. */
export function projectStateSaveSizeAction(
  breakdown: ProjectStateSizeBreakdown
): ProjectStateSaveSizeAction {
  if (breakdown.agentStagingBytes >= 120_000) return { kind: "add-to-project" };
  if (breakdown.referencePhotosBytes >= 120_000) return { kind: "compress-photos" };
  if (breakdown.snapshotsBytes >= 120_000) return { kind: "trim-snapshots" };
  return { kind: "generic" };
}

/** User-facing save error — blame the actual bottleneck, not the script when it is small. */
export function projectStateTooLargeMessage(
  breakdown: ProjectStateSizeBreakdown,
  maxBytes = PROJECT_STATE_MAX_BYTES
): string {
  const maxKb = Math.round(maxBytes / 1024);
  const photoKb = Math.round(breakdown.referencePhotosBytes / 1024);
  const totalKb = Math.round(breakdown.totalBytes / 1024);

  if (breakdown.referencePhotoCount > 0 && breakdown.referencePhotosBytes >= 120_000) {
    return `Project save is too large (${totalKb} KB total, max ${maxKb} KB). Reference photos use about ${photoKb} KB — tap Save to auto-compress, or remove 1–2 in Look → Photos. Your script is fine.`;
  }

  if (breakdown.agentStagingBytes >= 180_000) {
    return `Project save is too large (max ${maxKb} KB). Prep review data is still stored — tap Add to project on Script → Run prep to commit and shrink, or run prep again.`;
  }

  if (breakdown.shotPromptsBytes >= 200_000 && breakdown.agentStagingBytes < 80_000) {
    return `Project save is too large (max ${maxKb} KB). Stored shot prompts use about ${Math.round(breakdown.shotPromptsBytes / 1024)} KB — they rebuild on export; save again after Add to project.`;
  }

  if (breakdown.snapshotsBytes >= 120_000) {
    return `Project save is too large (max ${maxKb} KB). Remove old prep snapshots in Advanced prep settings.`;
  }

  if (breakdown.designNotesBytes >= 80_000) {
    return `Project save is too large (max ${maxKb} KB). Shorten Look design notes or remove extra reference photos.`;
  }

  if (breakdown.referencePhotoCount > 0) {
    return `Project save is too large (max ${maxKb} KB). Remove one or more reference photos in Look → Photos.`;
  }

  if (breakdown.scriptBytes > 80_000) {
    return `Project save is too large (max ${maxKb} KB). Shorten the script or remove reference photos in Look.`;
  }

  return `Project save is too large (max ${maxKb} KB). Remove reference photos in Look → Photos, or finish prep review on Script → Run prep.`;
}

/** Committed prep review is already in scenes + shot plan — drop duplicate bulk before save. */
function slimCommittedAgentStaging(_staging: AgentStagingBundle): null {
  return null;
}

/** Trim review staging text fields on save — keep structure for Generate review UI. */
function slimReviewAgentStagingForPersistence(staging: AgentStagingBundle): AgentStagingBundle {
  if (staging.status !== "review") return staging;
  return {
    ...staging,
    executiveSummary: staging.executiveSummary.slice(0, 800),
    researchNotes: staging.researchNotes.slice(0, 2000),
    shotSequences: staging.shotSequences.map((s) => ({
      ...s,
      notes: s.notes.slice(0, 2500),
    })),
  };
}

/** Drop legacy bloat before size validation / cloud save. */
export function slimProjectStateForPersistence(state: ProjectStatePayload): ProjectStatePayload {
  let next = stripDuplicatePhotosFromScenes(state);

  const notes = next.visualBible.designSheetNotes;
  if (notes.length > DESIGN_SHEET_NOTES_MAX_CHARS) {
    next = {
      ...next,
      visualBible: {
        ...next.visualBible,
        designSheetNotes: `${notes.slice(0, DESIGN_SHEET_NOTES_MAX_CHARS)}…`,
      },
    };
  }

  if (next.directorPrep.agentStaging?.status === "committed") {
    next = {
      ...next,
      directorPrep: {
        ...next.directorPrep,
        agentStaging: slimCommittedAgentStaging(next.directorPrep.agentStaging),
      },
    };
  } else if (next.directorPrep.agentStaging?.status === "review") {
    next = {
      ...next,
      directorPrep: {
        ...next.directorPrep,
        agentStaging: slimReviewAgentStagingForPersistence(next.directorPrep.agentStaging),
      },
    };
  }

  const sequences = next.shotPlan.sequences.map((seq) => ({
    ...seq,
    shots: seq.shots.map((shot) => ({
      ...shot,
      aiGenerationPrompt: "",
      aiNegativePrompt: "",
    })),
  }));
  next = { ...next, shotPlan: { sequences } };

  if (next.directorPrep.snapshots.length > DIRECTOR_PREP_MAX_SNAPSHOTS) {
    next = {
      ...next,
      directorPrep: {
        ...next.directorPrep,
        snapshots: next.directorPrep.snapshots.slice(-DIRECTOR_PREP_MAX_SNAPSHOTS),
      },
    };
  }

  const memory = next.directorPrep.agentMemory;
  if (memory.decisions.length > 48) {
    next = {
      ...next,
      directorPrep: {
        ...next.directorPrep,
        agentMemory: {
          ...memory,
          decisions: memory.decisions.slice(-48),
        },
      },
    };
  }

  return next;
}

/** Slim + re-compress photos until the project fits the cloud cap. */
export async function prepareProjectStateForCloudSave(
  state: ProjectStatePayload,
  maxBytes = PROJECT_STATE_MAX_BYTES
): Promise<ProjectStatePayload> {
  let next = slimProjectStateForPersistence(state);
  let photoBudget = PROJECT_STATE_PHOTO_BUDGET_BYTES;

  for (let attempt = 0; attempt < 5; attempt++) {
    const referenceUrls = await fitReferencePhotosForCloudSave(
      next.visualBible.referenceUrls,
      photoBudget
    );
    next = { ...next, visualBible: { ...next.visualBible, referenceUrls } };
    if (jsonBytes(next) <= maxBytes) return next;
    photoBudget = Math.floor(photoBudget * 0.65);
  }

  return next;
}

/** @deprecated Use prepareProjectStateForCloudSave */
export async function compressProjectStatePhotos(
  state: ProjectStatePayload
): Promise<ProjectStatePayload> {
  return prepareProjectStateForCloudSave(state);
}

export function estimateProjectStateBytes(state: ProjectStatePayload): number {
  return new TextEncoder().encode(JSON.stringify(state)).length;
}
