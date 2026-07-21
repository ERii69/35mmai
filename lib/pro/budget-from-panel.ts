import {
  allTools,
  budgetLineFromCatalogTool,
  type Tool,
} from "@/app/data";
import type { BudgetFromScenesSuggestion } from "@/lib/pro/budget-from-scenes";
import { suggestBudgetFromScenes } from "@/lib/pro/budget-from-scenes";
import {
  hasShotPlanForBudget,
  suggestBudgetFromShotPlan,
} from "@/lib/pro/budget-from-shot-plan";
import type { DirectorBudgetTier, ProjectStatePayload } from "@/lib/pro/types";

const MICRO_MONTHLY_CAP = 18;

function parseMonthly(price: string): number {
  const m = price.match(/\d+/);
  return m ? parseFloat(m[0]) : 15;
}

function toolMatchesTier(tool: Tool, tier: DirectorBudgetTier): boolean {
  const priceLower = tool.price.toLowerCase();
  const parsed = parseMonthly(tool.price);
  const budgetFriendly = priceLower.includes("free") || priceLower.includes("tier");
  if (tier === "indie") {
    return (
      tool.budgetFit === "indie" ||
      tool.budgetFit === "both" ||
      budgetFriendly ||
      parsed <= 25
    );
  }
  if (tier === "mid") {
    return tool.budgetFit === "both" || tool.budgetFit === "indie" || parsed <= 50;
  }
  return tool.budgetFit === "hollywood" || tool.budgetFit === "both" || parsed > 25;
}

/** Effective tier from budget band select, falling back to prep rules. */
export function resolveBudgetTier(state: ProjectStatePayload): DirectorBudgetTier {
  const selected = state.budget.selectedBudget;
  if (selected === "indie" || selected === "mid" || selected === "high") return selected;
  return state.directorPrep.directorRules.budgetTier;
}

function withBudgetTier(
  state: ProjectStatePayload,
  tier: DirectorBudgetTier
): ProjectStatePayload {
  return {
    ...state,
    directorPrep: {
      ...state.directorPrep,
      directorRules: { ...state.directorPrep.directorRules, budgetTier: tier },
    },
  };
}

type BudgetLine = BudgetFromScenesSuggestion["microTools"][number];

function lineKey(line: BudgetLine): number {
  return (line as { catalogRank?: number; rank?: number }).catalogRank ??
    (line as { rank?: number }).rank ??
    0;
}

function mergeUniqueLines(primary: BudgetLine[], secondary: BudgetLine[], limit: number): BudgetLine[] {
  const seen = new Set<number>();
  const out: BudgetLine[] = [];
  for (const line of [...primary, ...secondary]) {
    const key = lineKey(line);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(line);
    if (out.length >= limit) break;
  }
  return out;
}

function boostRoleMatches(lines: BudgetLine[], role: string): BudgetLine[] {
  return lines.map((line) => {
    const tool = allTools.find((t) => t.rank === lineKey(line));
    if (!tool?.roles.includes(role)) return line;
    const qty = typeof line.qty === "number" && line.qty > 0 ? line.qty : 1;
    return { ...line, qty: Math.min(12, qty + 1) };
  });
}

function roleSpecificLines(
  role: string,
  tier: DirectorBudgetTier,
  qtyHint: number
): { micro: BudgetLine[]; low: BudgetLine[] } {
  const qty = Math.max(1, Math.min(12, qtyHint));
  const micro: BudgetLine[] = [];
  const low: BudgetLine[] = [];

  for (const tool of allTools) {
    if (!tool.roles.includes(role) || !toolMatchesTier(tool, tier)) continue;
    const monthly = parseMonthly(tool.price);
    const line = budgetLineFromCatalogTool(tool, qty);
    if (tier === "indie" || monthly <= MICRO_MONTHLY_CAP) {
      if (micro.length < 6) micro.push(line);
    } else if (low.length < 8) {
      low.push(line);
    }
    if (micro.length >= 6 && (tier === "indie" || low.length >= 8)) break;
  }

  return { micro, low };
}

function blendRoleIntoSuggestion(
  base: BudgetFromScenesSuggestion,
  role: string,
  tier: DirectorBudgetTier
): BudgetFromScenesSuggestion {
  const qtyHint =
    base.microTools[0]?.qty ??
    base.lowTools[0]?.qty ??
    (tier === "high" ? 2 : 1);

  const roleLines = roleSpecificLines(role, tier, qtyHint);
  const microTools = mergeUniqueLines(
    boostRoleMatches(roleLines.micro, role),
    boostRoleMatches(base.microTools, role),
    10
  );
  const lowTools =
    tier === "indie"
      ? []
      : mergeUniqueLines(
          boostRoleMatches(roleLines.low, role),
          boostRoleMatches(base.lowTools, role),
          12
        );

  const bandLabel =
    tier === "indie" ? "Indie / micro" : tier === "mid" ? "Mid-tier" : "High / studio";

  return {
    ...base,
    budgetTier: tier,
    microTools,
    lowTools,
    summary: `${base.summary} Prioritized for ${role} · ${bandLabel}.`,
  };
}

/** Live budget suggestion for the panel — honors budget band + role. */
export function suggestBudgetForPanel(state: ProjectStatePayload): BudgetFromScenesSuggestion {
  const tier = resolveBudgetTier(state);
  const tieredState = withBudgetTier(state, tier);
  const approvedSceneCount = state.directorPrep.scenes.filter(
    (s) => s.status === "approved"
  ).length;

  const base = hasShotPlanForBudget(state)
    ? suggestBudgetFromShotPlan(tieredState)
    : suggestBudgetFromScenes(approvedSceneCount, tier);

  const role = state.budget.selectedRole?.trim();
  if (!role) return { ...base, budgetTier: tier };

  return blendRoleIntoSuggestion(base, role, tier);
}

/** Apply panel suggestion onto project budget line items. */
export function applyPanelBudgetSuggestion(
  state: ProjectStatePayload,
  suggestion: BudgetFromScenesSuggestion
): ProjectStatePayload {
  return {
    ...state,
    budget: {
      ...state.budget,
      microTools: suggestion.microTools,
      lowTools: suggestion.lowTools,
      selectedBudget: suggestion.budgetTier,
    },
  };
}
