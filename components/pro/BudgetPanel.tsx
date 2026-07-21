"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { rehydrateKitEntry, rolesList } from "@/app/data";
import { Button } from "@/components/ui/button";
import { BudgetCostChart } from "@/components/pro/BudgetCostChart";
import { ProModal } from "@/components/pro/ux/ProModal";
import { ProSelect } from "@/components/pro/ux/ProSelect";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  applyPanelBudgetSuggestion,
  resolveBudgetTier,
  suggestBudgetForPanel,
} from "@/lib/pro/budget-from-panel";
import {
  getBudgetTierPressureWarning,
  hasShotPlanForBudget,
} from "@/lib/pro/budget-from-shot-plan";
import { PRO_CURRENCY_OPTIONS, currencySymbol } from "@/lib/pro/currency-options";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { DirectorBudgetTier, ProjectStatePayload } from "@/lib/pro/types";

const BUDGET_BAND_OPTIONS: { value: DirectorBudgetTier; label: string }[] = [
  { value: "indie", label: "Indie / micro" },
  { value: "mid", label: "Mid-tier" },
  { value: "high", label: "High / studio" },
];

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
};

function estimateMonthlyTotal(rows: unknown[]): number {
  let total = 0;
  for (const row of rows) {
    const h = rehydrateKitEntry(row) as Record<string, unknown> | null;
    if (!h) continue;
    const monthly = typeof h.monthly === "number" ? h.monthly : 15;
    const qty = typeof h.qty === "number" && h.qty > 0 ? h.qty : 1;
    total += monthly * qty;
  }
  return total;
}

export function BudgetPanel({ state, updateState }: Props) {
  const { showToast } = useProToast();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const scriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const prepTier = state.directorPrep.directorRules.budgetTier;
  const approvedSceneCount = state.directorPrep.scenes.filter(
    (s) => s.status === "approved"
  ).length;
  const fromShotPlan = hasShotPlanForBudget(state);
  const tierWarning = getBudgetTierPressureWarning(state);
  const effectiveTier = resolveBudgetTier(state);
  const suggestion = useMemo(() => suggestBudgetForPanel(state), [state]);
  const selectedRole = state.budget.selectedRole;
  const bandLabel =
    BUDGET_BAND_OPTIONS.find((o) => o.value === effectiveTier)?.label ?? effectiveTier;

  const currency = state.budget.currency || "USD";
  const sym = currencySymbol(currency);

  const suggestedMonthly = useMemo(
    () =>
      estimateMonthlyTotal(suggestion.microTools) + estimateMonthlyTotal(suggestion.lowTools),
    [suggestion.microTools, suggestion.lowTools]
  );

  function applySuggestion() {
    updateState((p) => applyPanelBudgetSuggestion(p, suggestion));
    setSuggestOpen(false);
    showToast({
      message: `Applied ${suggestion.microTools.length + suggestion.lowTools.length} budget lines.`,
    });
  }

  function refreshBudgetLines(
    patch: Partial<Pick<ProjectStatePayload["budget"], "selectedRole" | "selectedBudget">>,
    toastMessage: string
  ) {
    updateState((p) => {
      let next: ProjectStatePayload = {
        ...p,
        budget: { ...p.budget, ...patch },
      };
      if (patch.selectedBudget) {
        const tier = patch.selectedBudget as DirectorBudgetTier;
        next = {
          ...next,
          directorPrep: {
            ...next.directorPrep,
            directorRules: { ...next.directorPrep.directorRules, budgetTier: tier },
          },
        };
      }
      return applyPanelBudgetSuggestion(next, suggestBudgetForPanel(next));
    });
    showToast({ message: toastMessage });
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-pro-text">Budget</h2>
          <p className="mt-2 max-w-xl text-[15px] leading-normal text-pro-text-secondary">
            {scriptToPrompt
              ? "Optional monthly tool estimate from your scenes and kit — not required for the prompt pack."
              : "Role, currency, and line-item presets synced with the 35mmAI catalog."}
          </p>
        </div>
        <div className="shrink-0">
          <p className="text-xs font-medium uppercase tracking-wide text-pro-text-secondary">
            Currency
          </p>
          <ProSelect
            aria-label="Currency"
            className="mt-2 min-w-[11rem]"
            value={currency}
            options={PRO_CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
            onChange={(next) =>
              updateState((p) => ({
                ...p,
                budget: { ...p.budget, currency: next },
              }))
            }
          />
        </div>
      </header>

      {tierWarning ? <ProStatusBanner variant="error" message={tierWarning} /> : null}

      {state.directorPrep.agentMeta.budgetSummaryText.trim() ? (
        <div className={proSurface.card}>
          <p className="text-xs font-medium text-pro-text-secondary">From last prep run</p>
          <p className="mt-1 text-sm text-pro-text">
            {state.directorPrep.agentMeta.budgetSummaryText}
          </p>
        </div>
      ) : null}

      <div className={proSurface.sectionMuted}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <h3 className="text-sm font-semibold text-pro-text">Cost distribution</h3>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="border-white/12 bg-pro-elevated font-semibold text-pro-text hover:bg-white/[0.04]"
            onClick={() => setSuggestOpen(true)}
          >
            <Sparkles className="mr-2 size-4" aria-hidden />
            {fromShotPlan ? "Suggest from shot plan" : "Suggest from scenes"}
          </Button>
        </div>
        <div className="mt-4">
          <BudgetCostChart
            microTools={state.budget.microTools}
            lowTools={state.budget.lowTools}
            currency={currency}
          />
        </div>
      </div>

      {!scriptToPrompt ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={`${proSurface.card} space-y-2`}>
            <p className="text-xs font-medium uppercase tracking-wide text-pro-text-secondary">
              Role
            </p>
            <ProSelect
              aria-label="Role"
              placeholder="Choose role…"
              value={state.budget.selectedRole ?? ""}
              options={rolesList.map((role) => ({ value: role, label: role }))}
              onChange={(next) => {
                const role = next || null;
                refreshBudgetLines(
                  { selectedRole: role },
                  role
                    ? `Budget lines updated for ${role}.`
                    : "Budget lines reset to tier defaults."
                );
              }}
            />
          </div>
          <div className={`${proSurface.card} space-y-2`}>
            <p className="text-xs font-medium uppercase tracking-wide text-pro-text-secondary">
              Budget band
            </p>
            <ProSelect
              aria-label="Budget band"
              value={
                BUDGET_BAND_OPTIONS.some((o) => o.value === state.budget.selectedBudget)
                  ? (state.budget.selectedBudget as string)
                  : prepTier
              }
              options={BUDGET_BAND_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              onChange={(band) => {
                const tier = band as DirectorBudgetTier;
                const label =
                  BUDGET_BAND_OPTIONS.find((o) => o.value === tier)?.label ?? tier;
                refreshBudgetLines(
                  { selectedBudget: tier },
                  `Budget lines updated for ${label}.`
                );
              }}
            />
          </div>
        </div>
      ) : null}

      {!scriptToPrompt ? (
        <p className="text-xs text-pro-text-secondary">
          {selectedRole
            ? `${suggestion.microTools.length + suggestion.lowTools.length} lines for ${selectedRole} · ${bandLabel}.`
            : `${suggestion.microTools.length + suggestion.lowTools.length} lines for ${bandLabel}.`}
          {" "}
          Change role or band to refresh catalog picks.
        </p>
      ) : (
        <p className="text-xs text-pro-text-secondary">
          {suggestion.microTools.length} micro / {suggestion.lowTools.length} low line items.
        </p>
      )}

      <ProModal
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        title={fromShotPlan ? "Apply budget from shot plan" : "Apply budget from scenes"}
        description={suggestion.summary}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="border-white/10"
              onClick={() => setSuggestOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-pro-elevated text-pro-text ring-1 ring-white/10 hover:bg-white/[0.06]"
              onClick={applySuggestion}
            >
              Apply to budget
            </Button>
          </>
        }
      >
        <div className="rounded-xl bg-pro-elevated px-4 py-4 ring-1 ring-white/[0.06]">
          <p className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
            Estimated monthly total
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-pro-text">
            {sym}
            {suggestedMonthly.toFixed(0)}
            <span className="ml-2 text-sm font-normal text-pro-text-secondary">{currency}</span>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-pro-muted px-3 py-3 ring-1 ring-white/[0.06]">
            <p className="text-[10px] uppercase tracking-wide text-pro-text-secondary">Micro lines</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-pro-text">
              {suggestion.microTools.length}
            </p>
            <p className="mt-1 text-xs text-pro-text-secondary">
              {sym}
              {estimateMonthlyTotal(suggestion.microTools).toFixed(0)}/mo
            </p>
          </div>
          <div className="rounded-xl bg-pro-muted px-3 py-3 ring-1 ring-white/[0.06]">
            <p className="text-[10px] uppercase tracking-wide text-pro-text-secondary">Low lines</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-pro-text">
              {suggestion.lowTools.length}
            </p>
            <p className="mt-1 text-xs text-pro-warning/80">
              {sym}
              {estimateMonthlyTotal(suggestion.lowTools).toFixed(0)}/mo
            </p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 rounded-xl bg-pro-muted/50 px-3 py-3 text-xs ring-1 ring-white/[0.06]">
          {!scriptToPrompt ? (
            <div className="flex justify-between gap-2">
              <dt className="text-pro-text-secondary">Budget tier</dt>
              <dd className="font-medium capitalize text-pro-text">{suggestion.budgetTier}</dd>
            </div>
          ) : null}
          {fromShotPlan ? (
            <div className="flex justify-between gap-2">
              <dt className="text-pro-text-secondary">Source</dt>
              <dd className="font-medium text-pro-text">Shot plan + kit hints</dd>
            </div>
          ) : (
            <div className="flex justify-between gap-2">
              <dt className="text-pro-text-secondary">Approved scenes</dt>
              <dd className="font-medium text-pro-text">{suggestion.approvedSceneCount}</dd>
            </div>
          )}
        </dl>

        <p className="mt-3 text-xs text-pro-text-secondary">
          Confirm to replace micro/low line items. Kit tab is not changed.
        </p>
      </ProModal>
    </div>
  );
}
