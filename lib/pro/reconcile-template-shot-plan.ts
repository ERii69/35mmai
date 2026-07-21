import { buildLocalShotCoverageNotes } from "@/lib/pro/local-prep-enrichment";
import { buildScriptToPromptShotNotes } from "@/lib/pro/build-script-to-prompt-shots";
import { generateShotPlanFromPrep } from "@/lib/pro/generate-shot-plan-from-prep";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import { syncShotPromptsInState } from "@/lib/pro/sync-shot-prompts";
import type { ProjectStatePayload } from "@/lib/pro/types";

function visualHintsFromState(state: ProjectStatePayload) {
  return {
    mood: state.directorPrep.agentMeta.visualMood.trim() || undefined,
    palette: state.visualBible.palette.filter(Boolean).slice(0, 5),
    lens: state.visualBible.lensAndFraming.trim() || undefined,
    lighting: state.visualBible.grainAndTexture.trim() || undefined,
  };
}

function refreshSceneShotNotes(state: ProjectStatePayload): ProjectStatePayload {
  const promptPack = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const rules = state.directorPrep.directorRules;
  const visual = visualHintsFromState(state);

  const scenes = state.directorPrep.scenes.map((scene) => ({
    ...scene,
    shotNotes: promptPack
      ? buildScriptToPromptShotNotes(scene, rules, visual)
      : buildLocalShotCoverageNotes(scene, rules),
  }));

  let agentStaging = state.directorPrep.agentStaging;
  if (agentStaging && scenes.length > 0) {
    const shotSequences = scenes.map((scene, i) => {
      const existing = agentStaging!.shotSequences.find((s) => s.sceneNumber === scene.number);
      return {
        suggestionId: existing?.suggestionId ?? `reconcile-shot-${scene.number}-${i}`,
        status: existing?.status ?? ("pending" as const),
        confidence: existing?.confidence ?? 70,
        sceneNumber: scene.number,
        title: scene.heading || `Scene ${scene.number}`,
        notes: scene.shotNotes,
      };
    });
    agentStaging = { ...agentStaging, shotSequences };
  }

  return {
    ...state,
    directorPrep: {
      ...state.directorPrep,
      scenes,
      agentStaging,
    },
  };
}

function clearShotAiPrompts(state: ProjectStatePayload): ProjectStatePayload {
  const sequences = state.shotPlan.sequences.map((seq) => ({
    ...seq,
    shots: seq.shots.map((shot) => ({
      ...shot,
      aiGenerationPrompt: "",
      aiNegativePrompt: "",
      recommendedToolRank: undefined,
    })),
  }));
  return { ...state, shotPlan: { sequences } };
}

/** Rebuild shot notes + shot plan when switching script-to-prompt ↔ classical templates. */
export function reconcileShotPlanForTemplate(state: ProjectStatePayload): ProjectStatePayload {
  const promptPack = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const withNotes = refreshSceneShotNotes(state);
  const withPlan = generateShotPlanFromPrep(withNotes);

  if (promptPack) {
    return syncShotPromptsInState(withPlan, { onlyEmpty: false });
  }
  return clearShotAiPrompts(withPlan);
}

export function templatePromptPackModeChanged(
  beforeId: string | null | undefined,
  afterId: string | null | undefined
): boolean {
  return isScriptToPromptTemplate(beforeId) !== isScriptToPromptTemplate(afterId);
}
