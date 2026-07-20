import { applyCrossTabIntelligence } from "@/lib/pro/cross-tab-sync";
import { shotsFromNotes } from "@/lib/pro/apply-agent-shot-list";
import { ensureShotPlanFromScript } from "@/lib/pro/ensure-shot-plan-from-script";
import { recordStagingDecisions } from "@/lib/pro/record-agent-memory";
import { suggestBudgetFromScenes } from "@/lib/pro/budget-from-scenes";
import { mergeLocationLists } from "@/lib/pro/locations-from-scenes";
import {
  commitLocationFromStaging,
  locationResearchDisplayName,
  mergeLocationResearch,
} from "@/lib/pro/location-research";
import { filterShotsForCommit } from "@/lib/pro/staging-review-sync";
import type { AgentStagingBundle, ProjectStatePayload } from "@/lib/pro/types";

function mergeCharacterLines(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((c) => c.toLowerCase()));
  const merged = [...existing];
  for (const line of incoming) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(line);
  }
  return merged;
}

/** Apply only approved staging suggestions to workspace state. */
export function commitAgentStaging(
  state: ProjectStatePayload,
  staging: AgentStagingBundle
): ProjectStatePayload {
  const approvedScenes = staging.scenes
    .filter((s) => s.status === "approved")
    .map((s) => ({ ...s.scene, status: "approved" as const }));

  const approvedShots = filterShotsForCommit(staging);
  const approvedLocationRows = staging.locations.filter((l) => l.status === "approved");
  const approvedLocs = approvedLocationRows.map((l) => locationResearchDisplayName(commitLocationFromStaging(l)));
  const approvedLocationResearch =
    approvedLocationRows.length > 0
      ? mergeLocationResearch(
          state.directorPrep.locationResearch ?? [],
          approvedLocationRows.map(commitLocationFromStaging)
        )
      : state.directorPrep.locationResearch ?? [];
  const approvedCharacterLines = (staging.characters ?? [])
    .filter((c) => c.status === "approved")
    .map((c) => (c.notes.trim() ? `${c.name} — ${c.notes.trim()}` : c.name));
  const budgetOk = staging.budget?.status === "approved" ? staging.budget : null;
  const visualOk = staging.visual?.status === "approved" ? staging.visual : null;

  const sequences = approvedShots.map((s) => {
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

  const bySceneNumber = new Map<number, string>();
  approvedShots.forEach((s, i) => {
    const id = sequences[i]?.id;
    if (id && s.sceneNumber != null) bySceneNumber.set(s.sceneNumber, id);
  });

  const scenesWithLinks = approvedScenes.map((scene, index) => {
    const linked =
      bySceneNumber.get(scene.number) ?? (sequences[index] ? sequences[index].id : null);
    return linked ? { ...scene, linkedSequenceId: linked } : scene;
  });

  const now = new Date().toISOString();
  const memoryAfterCommit = recordStagingDecisions(
    state.directorPrep.agentMemory,
    staging,
    state.directorPrep.directorRules
  );

  let nextBudget = state.budget;
  if (budgetOk) {
    const count = scenesWithLinks.length || 1;
    const suggestion = suggestBudgetFromScenes(count, budgetOk.tier);
    nextBudget = {
      ...state.budget,
      microTools: suggestion.microTools,
      lowTools: suggestion.lowTools,
    };
  }

  const nextLocations =
    approvedLocs.length > 0
      ? mergeLocationLists(state.worldBible.locations, approvedLocs)
      : state.worldBible.locations;

  const nextCharacters =
    approvedCharacterLines.length > 0
      ? mergeCharacterLines(state.worldBible.characters, approvedCharacterLines)
      : state.worldBible.characters;

  const refUrls = [...state.visualBible.referenceUrls];
  if (visualOk) {
    for (const r of visualOk.referenceUrls) {
      if (!refUrls.includes(r)) refUrls.push(r);
    }
  }

  let next: ProjectStatePayload = {
    ...state,
    budget: nextBudget,
    worldBible: {
      ...state.worldBible,
      locations: nextLocations,
      characters: nextCharacters,
    },
    visualBible: visualOk
      ? {
          ...state.visualBible,
          designSheetNotes: [state.visualBible.designSheetNotes, visualOk.designNotes, visualOk.mood]
            .filter(Boolean)
            .join("\n\n"),
          palette: visualOk.palette.length ? visualOk.palette : state.visualBible.palette,
          referenceUrls: refUrls.slice(0, 24),
        }
      : state.visualBible,
    shotPlan: {
      sequences: sequences.length ? sequences : state.shotPlan.sequences,
    },
    directorPrep: {
      ...state.directorPrep,
      directorRules: budgetOk
        ? { ...state.directorPrep.directorRules, budgetTier: budgetOk.tier }
        : state.directorPrep.directorRules,
      scenes: scenesWithLinks.length ? scenesWithLinks : state.directorPrep.scenes,
      locationResearch: approvedLocationResearch,
      agentStaging: null,
      agentMeta: {
        lastRunAt: now,
        executiveSummary: staging.executiveSummary,
        budgetSummaryText: budgetOk?.summary ?? state.directorPrep.agentMeta.budgetSummaryText,
        visualMood: visualOk?.mood ?? state.directorPrep.agentMeta.visualMood,
      },
      agentMemory: memoryAfterCommit,
    },
  };

  if (scenesWithLinks.length > 0) {
    next = ensureShotPlanFromScript(next).state;
  }
  return applyCrossTabIntelligence(next, "full");
}
