import { allTools, getCatalogKind, type CatalogKind, type Tool } from "@/app/data";
import type { DirectorRulesState } from "@/lib/pro/types";

export type KitCatalogFilters = {
  search: string;
  category: string;
  budgetTier?: DirectorRulesState["budgetTier"];
  catalogKind?: CatalogKind | null;
};

/** Sorted unique categories from the main 35mmAI catalog. */
export function getCatalogCategories(): string[] {
  const cats = new Set(allTools.map((t) => t.category));
  return Array.from(cats).sort((a, b) => a.localeCompare(b));
}

function matchesBudget(tool: Tool, tier: DirectorRulesState["budgetTier"] | undefined): boolean {
  if (!tier) return true;
  const priceLower = tool.price.toLowerCase();
  const parsed = parseFloat(tool.price.match(/\d+/)?.[0] || "999");
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

/** Same search/filter semantics as the free catalog directory. */
export function filterCatalogTools(filters: KitCatalogFilters): Tool[] {
  const searchLower = filters.search.trim().toLowerCase();
  const category = filters.category;

  return allTools
    .filter((tool) => {
      if (category && category !== "All" && tool.category !== category) return false;
      if (filters.catalogKind && getCatalogKind(tool) !== filters.catalogKind) return false;
      if (!matchesBudget(tool, filters.budgetTier)) return false;
      if (!searchLower) return true;
      const index = [
        String(tool.rank),
        tool.name,
        tool.helps,
        tool.category,
        tool.roles.join(" "),
        tool.shortDescription ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return index.includes(searchLower);
    })
    .sort((a, b) => a.rank - b.rank);
}
