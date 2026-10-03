/** Canonical names shown in the free catalog. One label per concept. */

export const BUDGET_PATH_MICRO = "Micro Budget";
export const BUDGET_PATH_FEATURE = "Indie Feature";

export const WORKFLOWS_LABEL = "Workflows";
export const BUDGET_TEMPLATES_LABEL = "Budget Templates";

export function budgetFitLabel(budgetFit: string): string {
  if (budgetFit === "indie") return BUDGET_PATH_MICRO;
  if (budgetFit === "hollywood") return BUDGET_PATH_FEATURE;
  return "Works for most budgets";
}
