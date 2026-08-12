import { generateShotPlanFromPrep } from "@/lib/pro/generate-shot-plan-from-prep";
import { isLookInstructionPollution } from "@/lib/pro/prompt-engine/prompt-context";
import { syncShotPromptsInState } from "@/lib/pro/sync-shot-prompts";
import type { ProjectStatePayload } from "@/lib/pro/types";

/** Build visual beats + copy-ready prompts from approved scenes (no Shots tab required). */
export function buildScriptToPromptPackState(state: ProjectStatePayload): ProjectStatePayload {
  const withBeats = generateShotPlanFromPrep(state);
  return syncShotPromptsInState(withBeats, {
    onlyEmpty: false,
    applyRouting: true,
  });
}

/**
 * Full prompt rebuild for Finish → Build all.
 * Scrubs look-bible pollution from mood/lighting, regenerates unique beat labels,
 * then rebuilds every prompt (ignores saved polluted text).
 */
export function rebuildAllPromptsInState(
  state: ProjectStatePayload,
  opts?: { forceRouting?: boolean }
): ProjectStatePayload {
  const scrubbed = scrubPromptPollutionFromState(state);
  const withBeats = generateShotPlanFromPrep(scrubbed, { forceFreshNotes: true });
  return syncShotPromptsInState(withBeats, {
    onlyEmpty: false,
    applyRouting: true,
    forceRouting: opts?.forceRouting ?? false,
  });
}

/** Drop instructional look text that was incorrectly stored as mood / lighting. */
export function scrubPromptPollutionFromState(
  state: ProjectStatePayload
): ProjectStatePayload {
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const nextMood = isLookInstructionPollution(mood)
    ? "Cinematic, naturalistic film still"
    : mood;

  const sequences = state.shotPlan.sequences.map((seq) => ({
    ...seq,
    shots: seq.shots.map((shot) => ({
      ...shot,
      lightingNotes: isLookInstructionPollution(shot.lightingNotes)
        ? state.visualBible.grainAndTexture.trim()
        : shot.lightingNotes,
      cameraNotes: isLookInstructionPollution(shot.cameraNotes)
        ? state.visualBible.lensAndFraming.trim()
        : shot.cameraNotes,
      // Force rebuild — do not keep polluted saved prompts.
      aiGenerationPrompt: "",
      aiNegativePrompt: "",
    })),
  }));

  const scenes = state.directorPrep.scenes.map((scene) => ({
    ...scene,
    shotNotes: isLookInstructionPollution(scene.shotNotes) ? "" : scene.shotNotes,
  }));

  return {
    ...state,
    shotPlan: { sequences },
    directorPrep: {
      ...state.directorPrep,
      scenes,
      agentMeta: {
        ...state.directorPrep.agentMeta,
        visualMood: nextMood,
      },
    },
  };
}

export function scriptToPromptPackReady(state: ProjectStatePayload): boolean {
  const total = state.shotPlan.sequences.reduce((n, seq) => n + seq.shots.length, 0);
  if (total === 0) return false;
  const approved = state.directorPrep.scenes.some((s) => s.status === "approved");
  const hasLook =
    state.visualBible.palette.length > 0 ||
    Boolean(state.directorPrep.agentMeta.visualMood.trim());
  return approved && hasLook;
}
