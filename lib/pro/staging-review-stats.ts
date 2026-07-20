import { filterShotsForReview } from "@/lib/pro/staging-review-sync";
import type { AgentStagingBundle, StagedLocationSuggestion } from "@/lib/pro/types";

export type PrepReviewTab = "scenes" | "locations" | "shots" | "budget" | "look";

export type StagingReviewStats = {
  scenes: { total: number; pending: number; kept: number; removed: number };
  locations: { total: number; pending: number; kept: number; removed: number };
  characters: { total: number; pending: number; kept: number; removed: number };
  shots: { total: number; pending: number; kept: number; removed: number };
  budget: { total: number; pending: number; kept: number; removed: number };
  look: { total: number; pending: number; kept: number; removed: number };
  pendingTotal: number;
  tabs: PrepReviewTab[];
};

function itemCounts(items: { status: string }[]) {
  const pending = items.filter((i) => i.status === "pending").length;
  const kept = items.filter((i) => i.status === "approved").length;
  const removed = items.filter((i) => i.status === "rejected").length;
  return { total: items.length, pending, kept, removed };
}

function shootSuggestionPending(locations: StagedLocationSuggestion[]): number {
  let pending = 0;
  for (const loc of locations) {
    if (loc.status === "rejected") continue;
    for (const row of loc.shootSuggestions ?? []) {
      if (row.status === "pending") pending += 1;
    }
  }
  return pending;
}

function singletonCount(item: { status: string } | null | undefined) {
  if (!item) return { total: 0, pending: 0, kept: 0, removed: 0 };
  return {
    total: 1,
    pending: item.status === "pending" ? 1 : 0,
    kept: item.status === "approved" ? 1 : 0,
    removed: item.status === "rejected" ? 1 : 0,
  };
}

/** True when prep produced anything to review (not only scenes). */
export function stagingHasReviewContent(staging: AgentStagingBundle | null): boolean {
  if (!staging) return false;
  return (
    staging.scenes.length > 0 ||
    staging.locations.length > 0 ||
    (staging.characters?.length ?? 0) > 0 ||
    staging.shotSequences.length > 0 ||
    staging.budget != null ||
    staging.visual != null
  );
}

export function stagingReviewStats(staging: AgentStagingBundle | null): StagingReviewStats | null {
  if (!staging) return null;

  const visibleShots = filterShotsForReview(staging);
  const scenes = itemCounts(staging.scenes);
  const locations = itemCounts(staging.locations);
  const characters = itemCounts(staging.characters ?? []);
  const shots = itemCounts(visibleShots);
  const budget = singletonCount(staging.budget);
  const look = singletonCount(staging.visual);

  const tabs: PrepReviewTab[] = [];
  if (scenes.total > 0) tabs.push("scenes");
  if (locations.total > 0 || characters.total > 0 || staging.researchNotes.trim()) {
    tabs.push("locations");
  }
  if (staging.shotSequences.length > 0) tabs.push("shots");
  if (staging.budget) tabs.push("budget");
  if (staging.visual) tabs.push("look");

  const pendingTotal =
    scenes.pending +
    locations.pending +
    characters.pending +
    shots.pending +
    budget.pending +
    look.pending +
    shootSuggestionPending(staging.locations);

  return { scenes, locations, characters, shots, budget, look, pendingTotal, tabs };
}

export function pendingCountForTab(
  tab: PrepReviewTab,
  staging: AgentStagingBundle | null
): number {
  const stats = stagingReviewStats(staging);
  if (!stats) return 0;
  switch (tab) {
    case "scenes":
      return stats.scenes.pending;
    case "locations":
      return stats.locations.pending + stats.characters.pending;
    case "shots":
      return stats.shots.pending;
    case "budget":
      return stats.budget.pending;
    case "look":
      return stats.look.pending;
    default:
      return 0;
  }
}

/** Footer line: "8 scenes · 7 locations · 6 shot lists — 2 need your decision" */
export function stagingReviewFooterLine(staging: AgentStagingBundle | null): string {
  const stats = stagingReviewStats(staging);
  if (!stats) return "";

  const parts: string[] = [];
  if (stats.scenes.total > 0) {
    parts.push(`${stats.scenes.total} scene${stats.scenes.total === 1 ? "" : "s"}`);
  }
  if (stats.characters.total > 0) {
    parts.push(`${stats.characters.total} character${stats.characters.total === 1 ? "" : "s"}`);
  }
  if (stats.locations.total > 0) {
    parts.push(`${stats.locations.total} location${stats.locations.total === 1 ? "" : "s"}`);
  }
  if (stats.shots.total > 0) {
    parts.push(`${stats.shots.total} shot list${stats.shots.total === 1 ? "" : "s"}`);
  }
  if (stats.budget.total > 0) parts.push("budget");
  if (stats.look.total > 0) parts.push("look");

  const base = parts.join(" · ");
  if (stats.pendingTotal > 0) {
    return `${base}. ${stats.pendingTotal} need${stats.pendingTotal === 1 ? "s" : ""} your decision.`;
  }
  return base;
}

export function canCommitStaging(
  staging: AgentStagingBundle | null,
  opts: { reviewConfirmed: boolean }
): { ok: boolean; reason?: string } {
  const stats = stagingReviewStats(staging);
  if (!stats || stats.tabs.length === 0) {
    return { ok: false, reason: "Nothing to add yet. Run prep first." };
  }
  if (stats.pendingTotal > 0) {
    return {
      ok: false,
      reason: `${stats.pendingTotal} still need Keep or Remove.`,
    };
  }
  if (!opts.reviewConfirmed) {
    return { ok: false, reason: "Check “Ready to add” when finished." };
  }
  const anyKept =
    stats.scenes.kept > 0 ||
    stats.locations.kept > 0 ||
    stats.characters.kept > 0 ||
    stats.shots.kept > 0 ||
    stats.budget.kept > 0 ||
    stats.look.kept > 0;
  if (!anyKept) {
    return { ok: false, reason: "Keep at least one scene, character, location, or section to add to your project." };
  }
  return { ok: true };
}

export function removeLocationConsequence(
  staging: AgentStagingBundle,
  location: StagedLocationSuggestion
): string | null {
  const sceneNums = new Set(location.sceneNumbers ?? []);
  const shotCount = staging.shotSequences.filter(
    (s) => s.sceneNumber != null && sceneNums.has(s.sceneNumber) && s.status !== "rejected"
  ).length;
  if (shotCount > 0) {
    return `Also removes ${shotCount} shot list${shotCount === 1 ? "" : "s"} for this location.`;
  }
  return null;
}

export function removeSceneConsequence(
  staging: AgentStagingBundle,
  sceneNumber: number
): string | null {
  const shotCount = staging.shotSequences.filter(
    (s) => s.sceneNumber === sceneNumber && s.status !== "rejected"
  ).length;
  if (shotCount > 0) {
    return `Also removes ${shotCount} shot list${shotCount === 1 ? "" : "s"} for this scene.`;
  }
  return null;
}
