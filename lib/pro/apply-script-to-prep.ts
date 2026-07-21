import { suggestBudgetFromScenes } from "@/lib/pro/budget-from-scenes";
import { mergeLocationLists } from "@/lib/pro/locations-from-scenes";
import type { ScriptToPrepImport } from "@/lib/pro/import-script-to-prep";
import type { ProjectStatePayload } from "@/lib/pro/types";

export type ApplyScriptToPrepOptions = {
  mode: "replace" | "append";
  applyBudgetLines: boolean;
};

function linkScenesToSequences(
  scenes: ProjectStatePayload["directorPrep"]["scenes"],
  sequences: { id: string; sceneNumber: number | null }[]
): ProjectStatePayload["directorPrep"]["scenes"] {
  const bySceneNumber = new Map<number, string>();
  for (const seq of sequences) {
    if (seq.sceneNumber != null) bySceneNumber.set(seq.sceneNumber, seq.id);
  }

  return scenes.map((scene, index) => {
    const linked =
      bySceneNumber.get(scene.number) ?? (sequences[index] ? sequences[index].id : null);
    return linked ? { ...scene, linkedSequenceId: linked } : scene;
  });
}

/** Merge agent import into workspace state (client-side before autosave). */
export function applyScriptToPrep(
  state: ProjectStatePayload,
  data: ScriptToPrepImport,
  options: ApplyScriptToPrepOptions
): ProjectStatePayload {
  const now = new Date().toISOString();
  const mode = options.mode;

  const nextScenes =
    mode === "replace"
      ? data.scenes.map((s, i) => ({ ...s, number: i + 1 }))
      : [...state.directorPrep.scenes, ...data.scenes];

  const nextSequences =
    mode === "replace"
      ? data.shotSequences.map(({ id, title, notes, sceneNumber }) => ({
          id,
          title,
          notes,
          sceneNumber: sceneNumber ?? null,
          shots: [],
        }))
      : [
          ...state.shotPlan.sequences,
          ...data.shotSequences.map(({ id, title, notes, sceneNumber }) => ({
            id,
            title,
            notes,
            sceneNumber: sceneNumber ?? null,
            shots: [],
          })),
        ];

  const scenesWithLinks = linkScenesToSequences(
    nextScenes,
    data.shotSequences.map((s) => ({ id: s.id, sceneNumber: s.sceneNumber }))
  );

  const nextLocations =
    data.locations.length > 0
      ? mergeLocationLists(state.worldBible.locations, data.locations)
      : state.worldBible.locations;

  const uniqueRefs = new Set(state.visualBible.referenceUrls.map((u) => u.toLowerCase()));
  const mergedRefUrls = [...state.visualBible.referenceUrls];
  for (const scene of data.scenes) {
    for (const ref of scene.visualRefs) {
      const key = ref.toLowerCase();
      if (uniqueRefs.has(key)) continue;
      uniqueRefs.add(key);
      mergedRefUrls.push(ref);
    }
  }

  const budgetTier = data.budgetTier ?? state.directorPrep.directorRules.budgetTier;
  const sceneCountForBudget =
    scenesWithLinks.filter((s) => s.status === "approved").length || scenesWithLinks.length;

  let nextBudget = state.budget;
  if (options.applyBudgetLines && sceneCountForBudget > 0) {
    const suggestion = suggestBudgetFromScenes(sceneCountForBudget, budgetTier);
    nextBudget = {
      ...state.budget,
      microTools: suggestion.microTools,
      lowTools: suggestion.lowTools,
    };
  }

  const designNotes = [state.visualBible.designSheetNotes.trim(), data.visualMood.trim()]
    .filter(Boolean)
    .join("\n\n");

  return {
    ...state,
    budget: nextBudget,
    worldBible: {
      ...state.worldBible,
      locations: nextLocations,
    },
    visualBible: {
      ...state.visualBible,
      designSheetNotes: designNotes,
      referenceUrls: mergedRefUrls.slice(0, 24),
    },
    shotPlan: { sequences: nextSequences },
    directorPrep: {
      ...state.directorPrep,
      directorRules: {
        ...state.directorPrep.directorRules,
        budgetTier,
      },
      scenes: scenesWithLinks,
      agentMeta: {
        lastRunAt: now,
        executiveSummary: data.executiveSummary,
        budgetSummaryText: data.budgetSummaryText,
        visualMood: data.visualMood,
      },
    },
  };
}
