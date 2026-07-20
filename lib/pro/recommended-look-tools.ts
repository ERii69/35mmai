import { getToolByRank, type Tool } from "@/app/data";
import type { DirectorRulesState } from "@/lib/pro/types";
import {
  getFilledLookSections,
  type LookToolSection,
  LOOK_TOOL_SECTION_HINTS,
  LOOK_TOOL_SECTION_LABELS,
} from "@/lib/pro/look-tool-sections";
import type { ProjectStatePayload } from "@/lib/pro/types";
import { buildLookToolPrompt } from "@/lib/pro/build-look-tool-prompt";

/** Primary catalog picks per look section (first match wins after budget filter). */
const SECTION_TOOL_RANKS: Record<LookToolSection, number[]> = {
  mood: [75, 6, 40],
  lens: [1, 2, 4],
  grain: [1, 9],
  palette: [1, 19],
};

function matchesBudget(tool: Tool, tier: DirectorRulesState["budgetTier"]): boolean {
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

function pickToolForSection(
  section: LookToolSection,
  tier: DirectorRulesState["budgetTier"]
): Tool | null {
  const candidates = SECTION_TOOL_RANKS[section];
  for (const rank of candidates) {
    const tool = getToolByRank(rank);
    if (tool && matchesBudget(tool, tier)) return tool;
  }
  for (const rank of candidates) {
    const tool = getToolByRank(rank);
    if (tool) return tool;
  }
  return null;
}

export type LookToolSuggestion = {
  section: LookToolSection;
  sectionLabel: string;
  hint: string;
  tool: Tool;
  prompt: string;
};

/** One catalog tool per filled mood-board section, with a copy-ready prompt. */
export function getLookToolSuggestions(state: ProjectStatePayload): LookToolSuggestion[] {
  const tier = state.directorPrep.directorRules.budgetTier;
  const sections = getFilledLookSections(state);
  const out: LookToolSuggestion[] = [];

  for (const section of sections) {
    const tool = pickToolForSection(section, tier);
    if (!tool) continue;
    out.push({
      section,
      sectionLabel: LOOK_TOOL_SECTION_LABELS[section],
      hint: LOOK_TOOL_SECTION_HINTS[section],
      tool,
      prompt: buildLookToolPrompt(state, section, tool.rank),
    });
  }

  return out;
}
