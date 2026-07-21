import { generateShotPlanFromPrep } from "@/lib/pro/generate-shot-plan-from-prep";
import { parseScenesFromScreenplayText } from "@/lib/pro/local-prep-from-screenplay";
import { migrateShotPlanLegacy } from "@/lib/pro/migrate-shot-plan-legacy";
import type { ProjectStatePayload } from "@/lib/pro/types";

export type EnsureShotPlanResult = {
  state: ProjectStatePayload;
  didParseScenes: boolean;
  didGenerateShots: boolean;
};

/** True when at least one sequence has structured shots. */
export function shotPlanHasCoverage(state: ProjectStatePayload): boolean {
  return state.shotPlan.sequences.some((s) => s.shots.length > 0);
}

/** Parse INT./EXT. headings into scene rows when script exists but prep was skipped. */
export function ensureScenesFromScript(state: ProjectStatePayload): ProjectStatePayload {
  if (state.directorPrep.scenes.length > 0) return state;

  const raw = state.directorPrep.screenplay.rawText.trim();
  if (!raw) return state;

  const parsed = parseScenesFromScreenplayText(raw);
  if (parsed.length === 0) return state;

  return {
    ...state,
    directorPrep: {
      ...state.directorPrep,
      scenes: parsed,
      agentMeta: {
        ...state.directorPrep.agentMeta,
        executiveSummary:
          state.directorPrep.agentMeta.executiveSummary.trim() ||
          `Auto-parsed ${parsed.length} scene heading${parsed.length === 1 ? "" : "s"} from your script.`,
      },
    },
  };
}

/**
 * Tier-1 path: script → scenes → shot plan (local, no API).
 * Safe to call repeatedly — no-op when coverage already exists.
 */
export function ensureShotPlanFromScript(state: ProjectStatePayload): EnsureShotPlanResult {
  let next = state;
  let didParseScenes = false;
  let didGenerateShots = false;

  const sceneCountBefore = next.directorPrep.scenes.length;
  next = ensureScenesFromScript(next);
  didParseScenes = next.directorPrep.scenes.length > sceneCountBefore;

  if (!shotPlanHasCoverage(next) && next.directorPrep.scenes.length > 0) {
    next = generateShotPlanFromPrep(next);
    didGenerateShots = shotPlanHasCoverage(next);
  }

  const migrated = migrateShotPlanLegacy(next);
  if (!didGenerateShots && shotPlanHasCoverage(migrated) && !shotPlanHasCoverage(next)) {
    didGenerateShots = true;
  }

  return { state: migrated, didParseScenes, didGenerateShots };
}
