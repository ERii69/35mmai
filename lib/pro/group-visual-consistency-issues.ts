import type { VisualConsistencySeverity } from "@/lib/pro/types";
import type { VisualConsistencyIssue } from "@/lib/pro/visual-consistency-check";

export type GroupedVisualConsistencyIssue = {
  message: string;
  severity: VisualConsistencySeverity;
  recommendedFix: string;
  scenes: { number: number; heading: string }[];
};

/** Collapse repetitive per-scene flags into one row per issue type. */
export function groupVisualConsistencyIssues(
  issues: VisualConsistencyIssue[]
): GroupedVisualConsistencyIssue[] {
  const map = new Map<string, GroupedVisualConsistencyIssue>();

  for (const issue of issues) {
    const key = `${issue.severity}::${issue.message}`;
    const existing = map.get(key);
    if (existing) {
      if (!existing.scenes.some((s) => s.number === issue.sceneNumber)) {
        existing.scenes.push({ number: issue.sceneNumber, heading: issue.heading });
      }
    } else {
      map.set(key, {
        message: issue.message,
        severity: issue.severity,
        recommendedFix: issue.recommendedFix,
        scenes: [{ number: issue.sceneNumber, heading: issue.heading }],
      });
    }
  }

  const severityRank: Record<VisualConsistencySeverity, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return [...map.values()].sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity] || b.scenes.length - a.scenes.length
  );
}
