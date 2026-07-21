import { parseLocationFromHeading } from "@/lib/pro/locations-from-scenes";
import type {
  AgentStagingBundle,
  AgentSuggestionStatus,
  StagedLocationSuggestion,
  StagedShotSequenceSuggestion,
} from "@/lib/pro/types";

function locationKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Approved location keys; empty set if research/locations not used. */
export function approvedLocationKeys(staging: AgentStagingBundle): Set<string> {
  const keys = new Set<string>();
  for (const loc of staging.locations) {
    if (loc.status === "approved") keys.add(locationKey(loc.name));
  }
  return keys;
}

export function isLocationRejectedForScene(
  staging: AgentStagingBundle,
  scene: { heading: string; number: number }
): boolean {
  if (staging.locations.length === 0) return false;

  const locName = parseLocationFromHeading(scene.heading);
  if (!locName) return false;

  const key = locationKey(locName);
  const match = staging.locations.find((l) => locationKey(l.name) === key);
  if (!match) return false;
  if (match.sceneNumbers?.length && !match.sceneNumbers.includes(scene.number)) {
    return false;
  }
  return match.status === "rejected";
}

/** Shots hidden when their scene or location was rejected. */
export function filterShotsForReview(
  staging: AgentStagingBundle
): StagedShotSequenceSuggestion[] {
  return staging.shotSequences.filter((shot) => {
    if (shot.status === "rejected") return false;
    if (shot.sceneNumber == null) return true;

    const scene = staging.scenes.find((s) => s.scene.number === shot.sceneNumber);
    if (!scene) return true;
    if (scene.status === "rejected") return false;
    if (isLocationRejectedForScene(staging, scene.scene)) return false;

    return true;
  });
}

/** When a location is rejected, reject linked scenes' shot suggestions. */
export function cascadeRejectLocation(
  staging: AgentStagingBundle,
  location: StagedLocationSuggestion,
  status: AgentSuggestionStatus
): AgentStagingBundle {
  if (status !== "rejected") {
    return {
      ...staging,
      locations: staging.locations.map((l) =>
        l.suggestionId === location.suggestionId ? { ...l, status } : l
      ),
    };
  }

  const sceneNums = new Set(location.sceneNumbers ?? []);
  const locKey = locationKey(location.name);

  return {
    ...staging,
    locations: staging.locations.map((l) =>
      l.suggestionId === location.suggestionId ? { ...l, status: "rejected" as const } : l
    ),
    shotSequences: staging.shotSequences.map((shot) => {
      if (shot.sceneNumber != null && sceneNums.has(shot.sceneNumber)) {
        return { ...shot, status: "rejected" as const };
      }
      const scene = staging.scenes.find((s) => s.scene.number === shot.sceneNumber);
      if (scene) {
        const sceneLoc = parseLocationFromHeading(scene.scene.heading);
        if (sceneLoc && locationKey(sceneLoc) === locKey) {
          return { ...shot, status: "rejected" as const };
        }
      }
      return shot;
    }),
  };
}

/** Mark every review card as kept (Script to prompt fast path). */
export function approveAllStagingItems(staging: AgentStagingBundle): AgentStagingBundle {
  return {
    ...staging,
    scenes: staging.scenes.map((s) => ({ ...s, status: "approved" as const })),
    locations: staging.locations.map((l) => ({
      ...l,
      status: "approved" as const,
      shootSuggestions: (l.shootSuggestions ?? []).map((s) => ({
        ...s,
        status: "approved" as const,
      })),
    })),
    characters: (staging.characters ?? []).map((c) => ({ ...c, status: "approved" as const })),
    shotSequences: staging.shotSequences.map((s) => ({ ...s, status: "approved" as const })),
    budget: staging.budget ? { ...staging.budget, status: "approved" as const } : null,
    visual: staging.visual ? { ...staging.visual, status: "approved" as const } : null,
  };
}

/** Only commit shots that pass scene + location approval. */
export function filterShotsForCommit(
  staging: AgentStagingBundle
): StagedShotSequenceSuggestion[] {
  return staging.shotSequences.filter((shot) => {
    if (shot.status !== "approved") return false;
    if (shot.sceneNumber == null) return true;
    const scene = staging.scenes.find((s) => s.scene.number === shot.sceneNumber);
    if (!scene || scene.status !== "approved") return false;
    if (isLocationRejectedForScene(staging, scene.scene)) return false;
    return true;
  });
}
