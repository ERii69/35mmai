import { allTools, getToolByRank, type Tool } from "@/app/data";
import { resolveBudgetTier } from "@/lib/pro/budget-from-panel";
import type { ProjectStatePayload } from "@/lib/pro/types";

const POST_ROLES = ["Editor", "Colorist", "Sound Designer"] as const;

const TIER_POST_STARTER: Record<string, number[]> = {
  indie: [15, 7, 1, 3],
  mid: [15, 7, 8, 1, 3, 9],
  high: [15, 7, 8, 9, 1, 3, 2],
};

function toolMatchesTier(tool: Tool, tier: ReturnType<typeof resolveBudgetTier>): boolean {
  const parsed = parseFloat(tool.price.match(/\d+/)?.[0] || "999");
  if (tier === "indie") {
    return tool.budgetFit === "indie" || tool.budgetFit === "both" || parsed <= 25;
  }
  if (tier === "mid") {
    return tool.budgetFit !== "hollywood" || parsed <= 50;
  }
  return true;
}

export type PostKitSuggestion = {
  rank: number;
  reason: string;
};

/** Post-focused kit ranks from role, tier, and workflow stage 3 tools. */
export function suggestPostKitRanks(state: ProjectStatePayload): PostKitSuggestion[] {
  const tier = resolveBudgetTier(state);
  const role = state.budget.selectedRole?.trim();
  const seen = new Set<number>();
  const out: PostKitSuggestion[] = [];

  function push(rank: number, reason: string) {
    if (seen.has(rank) || !getToolByRank(rank)) return;
    seen.add(rank);
    out.push({ rank, reason });
  }

  if (role && POST_ROLES.some((r) => role.includes(r) || r.includes(role))) {
    for (const tool of allTools) {
      if (!tool.roles.includes(role) || !toolMatchesTier(tool, tier)) continue;
      push(tool.rank, `Matches ${role}`);
      if (out.length >= 8) break;
    }
  } else {
    for (const tool of allTools) {
      if (!POST_ROLES.some((r) => tool.roles.includes(r)) || !toolMatchesTier(tool, tier)) {
        continue;
      }
      push(tool.rank, "Post-production role");
      if (out.length >= 6) break;
    }
  }

  for (const rank of TIER_POST_STARTER[tier] ?? TIER_POST_STARTER.indie) {
    push(rank, `${tier} post starter`);
  }

  return out;
}

export function countPostToolsInKit(state: ProjectStatePayload): number {
  const postRanks = new Set(suggestPostKitRanks(state).map((s) => s.rank));
  const kit = state.kit;
  const entries = Array.isArray(kit) ? kit : [];
  let count = 0;
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const rank =
      typeof (entry as { catalogRank?: number }).catalogRank === "number"
        ? (entry as { catalogRank: number }).catalogRank
        : undefined;
    if (rank != null && postRanks.has(rank)) count += 1;
  }
  return count;
}
