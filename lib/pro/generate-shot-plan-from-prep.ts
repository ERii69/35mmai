import { shotsFromNotes } from "@/lib/pro/apply-agent-shot-list";
import {
  buildScriptToPromptShotNotes,
  isLegacyCoverageShotNotes,
} from "@/lib/pro/build-script-to-prompt-shots";
import { isPromptStyleSequenceNotes } from "@/lib/pro/format-sequence-notes";
import { buildLocalShotCoverageNotes } from "@/lib/pro/local-prep-enrichment";
import { enrichPlannedShot, visualBibleContextLine } from "@/lib/pro/shot-plan-enrichment";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import { defaultCoverageShots, newPlannedShot } from "@/lib/pro/shot-plan";
import type { ProjectStatePayload, ShotSequence } from "@/lib/pro/types";

export function inferShotsFromNotes(notes: string, visualNote: string): ReturnType<typeof defaultCoverageShots> {
  const lower = notes.toLowerCase();
  const shots = [];
  if (/dolly|track|slider/i.test(lower)) {
    shots.push({ ...newPlannedShot("dolly", "Dolly / track"), visualBibleNote: visualNote });
  }
  if (/wide|master|establish/i.test(lower)) {
    shots.push({ ...newPlannedShot("wide", "Wide"), visualBibleNote: visualNote });
  }
  if (/close|cu\b/i.test(lower)) {
    shots.push({ ...newPlannedShot("close_up", "Close-up"), visualBibleNote: visualNote });
  }
  if (/handheld/i.test(lower)) {
    shots.push({ ...newPlannedShot("handheld", "Handheld"), visualBibleNote: visualNote });
  }
  if (/aerial|drone/i.test(lower)) {
    shots.push({ ...newPlannedShot("aerial", "Aerial"), visualBibleNote: visualNote });
  }
  return shots.length ? shots : defaultCoverageShots(visualNote);
}

/** One-click shot plan from approved prep scenes + staging shot lists. */
export function generateShotPlanFromPrep(
  state: ProjectStatePayload,
  opts?: { forceFreshNotes?: boolean }
): ProjectStatePayload {
  const visualNote = visualBibleContextLine(state);
  const approved = state.directorPrep.scenes.filter((s) => s.status === "approved");
  const draftOrApproved =
    approved.length > 0
      ? approved
      : state.directorPrep.scenes.filter((s) => s.heading.trim() || s.oneLine.trim());
  const stagingShots =
    state.directorPrep.agentStaging?.shotSequences.filter((s) => s.status === "approved") ?? [];

  const sequences: ShotSequence[] = [];

  const promptPack = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const rules = state.directorPrep.directorRules;
  const forceFresh = opts?.forceFreshNotes === true;

  for (const scene of draftOrApproved) {
    const staged = stagingShots.find((s) => s.sceneNumber === scene.number);
    let notes = forceFresh ? "" : staged?.notes || scene.shotNotes || "";
    if (!promptPack) {
      if (!notes.trim() || isPromptStyleSequenceNotes(notes)) {
        notes = buildLocalShotCoverageNotes(scene, rules);
      }
    } else {
      const visual = {
        mood: state.directorPrep.agentMeta.visualMood.trim() || undefined,
        palette: state.visualBible.palette.filter(Boolean).slice(0, 5),
        lens: state.visualBible.lensAndFraming.trim() || undefined,
        lighting: state.visualBible.grainAndTexture.trim() || undefined,
      };
      const hasBeatNotes =
        notes.trim().length > 0 &&
        !isLegacyCoverageShotNotes(notes) &&
        /\[(establishing|wide|medium|close_up|dolly)\]/i.test(notes);
      const notesPolluted =
        /modular ai|look bible|scene rhythm|genre:\s*ai-native|shot preference/i.test(notes);
      if (!hasBeatNotes || notesPolluted || forceFresh) {
        notes = buildScriptToPromptShotNotes(scene, rules, visual);
      }
    }
    const shots =
      notes.trim().length > 0
        ? shotsFromNotes(notes, state, scene.id)
        : inferShotsFromNotes(notes, visualNote).map((shot) => enrichPlannedShot(shot, state, scene.id));
    const id = scene.linkedSequenceId ?? `seq-scene-${scene.number}-${Date.now()}`;
    sequences.push({
      id,
      title: scene.heading || `Scene ${scene.number}`,
      notes: notes.trim(),
      sceneNumber: scene.number,
      shots,
    });
  }

  if (sequences.length === 0 && stagingShots.length > 0) {
    for (const s of stagingShots) {
      sequences.push({
        id: `seq-${s.suggestionId}`,
        title: s.title,
        notes: s.notes,
        sceneNumber: s.sceneNumber,
        shots:
          s.notes.trim().length > 0
            ? shotsFromNotes(s.notes, state, null)
            : inferShotsFromNotes(s.notes, visualNote),
      });
    }
  }

  const scenesWithLinks = state.directorPrep.scenes.map((scene) => {
    const seq = sequences.find((q) => q.sceneNumber === scene.number);
    return seq ? { ...scene, linkedSequenceId: seq.id } : scene;
  });

  return {
    ...state,
    directorPrep: { ...state.directorPrep, scenes: scenesWithLinks },
    shotPlan: { sequences },
  };
}
