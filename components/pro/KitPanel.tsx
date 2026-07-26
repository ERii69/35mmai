"use client";

import { useMemo, useState } from "react";
import { Package, Plus, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KitCatalogModal } from "@/components/pro/KitCatalogModal";
import { ProEmptyState } from "@/components/pro/ux/ProEmptyState";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  addToolToKit,
  addToolsToKit,
  kitEntriesFromState,
  kitMonthlyTotal,
  removeKitAtIndex,
  type KitDisplayEntry,
} from "@/lib/pro/kit-display";
import { getRecommendedKitRanks } from "@/lib/pro/recommended-kit";
import { getToolByRank } from "@/app/data";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload } from "@/lib/pro/types";

const KIT_BULK_PRESETS: { id: string; label: string; ranks: number[] }[] = [
  { id: "indie-starter", label: "Indie kit (6 tools)", ranks: [1, 5, 6, 8, 10, 11] },
  { id: "classical-ai", label: "Classical AI kit (6 tools)", ranks: [6, 18, 5, 7, 13, 21] },
  { id: "documentary", label: "Interview kit (5 tools)", ranks: [21, 26, 30, 55, 56] },
  { id: "prep-narrative", label: "Narrative kit (3 tools)", ranks: [4, 6, 52] },
];

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
};

export function KitPanel({ state, updateState }: Props) {
  const scriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const { showToast: pushToast } = useProToast();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [banner, setBanner] = useState<{ variant: "success" | "error"; message: string } | null>(
    null
  );

  const kitList = kitEntriesFromState(state.kit);
  const monthlyTotal = kitMonthlyTotal(state.kit);
  const recommendations = useMemo(() => getRecommendedKitRanks(state), [state]);
  const notInKit = recommendations.filter((r) => !kitList.some((k) => k.catalogRank === r.rank));

  function showSuccess(message: string) {
    setBanner({ variant: "success", message });
    pushToast({ message, variant: "success" });
    window.setTimeout(() => setBanner(null), 4000);
  }

  function showError(message: string) {
    setBanner({ variant: "error", message });
    pushToast({ message, variant: "error" });
  }

  function addRank(rank: number) {
    const tool = getToolByRank(rank);
    if (!tool) {
      showError(`Tool #${rank} is not in the catalog. Try another rank or refresh.`);
      return;
    }
    if (kitList.some((k) => k.catalogRank === rank)) {
      showError(`${tool.name} is already in your kit.`);
      return;
    }
    updateState((p) => ({ ...p, kit: addToolToKit(p.kit, rank) }));
    showSuccess(`Added ${tool.name} (#${rank}).`);
  }

  function bulkAdd(ranks: number[], label: string) {
    const result = addToolsToKit(state.kit, ranks);
    if (result.added === 0) {
      showError("All tools from this preset are already in your kit.");
      return;
    }
    updateState((p) => ({ ...p, kit: result.kit }));
    showSuccess(`Added ${result.added} tool${result.added === 1 ? "" : "s"} from ${label}.`);
  }

  return (
    <div className="space-y-8">
      {banner ? (
        <ProStatusBanner
          variant={banner.variant}
          message={banner.message}
          onDismiss={() => setBanner(null)}
        />
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-pro-text">My kit</h2>
          <p className="mt-2 max-w-xl text-[15px] leading-normal text-pro-text-secondary">
            Build your project toolkit from the same catalog as 35mmAI — search, filter, and add
            without typing ranks.
          </p>
        </div>
        <Button
          type="button"
          className="bg-pro-primary px-5 py-2.5 font-semibold shadow-lg shadow-pro-primary/25 hover:brightness-110"
          onClick={() => setCatalogOpen(true)}
        >
          <Package className="mr-2 size-4" aria-hidden />
          Browse tools
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${proSurface.card} sm:col-span-1`}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-pro-text-secondary">
            Est. monthly
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-pro-text">
            ${monthlyTotal.toFixed(0)}
          </p>
          <p className="mt-1 text-xs text-pro-text-secondary">
            {kitList.length} tool{kitList.length === 1 ? "" : "s"} in kit
          </p>
        </div>
        <div className={`${proSurface.card} sm:col-span-2`}>
          <p className="text-xs font-medium text-pro-text-secondary">Add kit preset</p>
          <p className="mt-0.5 text-[11px] text-pro-text-secondary/80">
            Tool bundles for My Kit — separate from script workflows.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {KIT_BULK_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant="outline"
                className="border-white/10 bg-pro-muted/50 text-pro-text-secondary"
                onClick={() => bulkAdd(preset.ranks, preset.label)}
              >
                <Plus className="mr-1 size-3" aria-hidden />
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {notInKit.length > 0 ? (
        <section className={proSurface.sectionMuted} aria-labelledby="kit-rec-heading">
          <h3 id="kit-rec-heading" className="flex items-center gap-2 text-sm font-semibold text-pro-text">
            <Sparkles className="size-4 text-pro-warning" aria-hidden />
            Recommended for your project
          </h3>
          <p className="mt-1 text-xs text-pro-text-secondary">
            {scriptToPrompt
              ? "Based on your script-to-prompt kit and approved scenes."
              : "Based on genre, budget tier, workflow phase, and shot plan."}
          </p>
          <ul className="mt-4 space-y-2">
            {notInKit.map(({ rank, reason }) => {
              const tool = getToolByRank(rank);
              if (!tool) return null;
              return (
                <li
                  key={rank}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-pro-elevated/80 px-3 py-2.5 ring-1 ring-white/[0.06]"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-pro-text">
                      #{rank} {tool.name}
                    </span>
                    <p className="text-[11px] text-pro-text-secondary">{reason}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-white/10"
                    onClick={() => addRank(rank)}
                  >
                    Add
                  </Button>
                </li>
              );
            })}
          </ul>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 border-white/10 text-pro-text-secondary"
            onClick={() => bulkAdd(notInKit.map((r) => r.rank), "recommendations")}
          >
            Add all {notInKit.length} recommended
          </Button>
        </section>
      ) : null}

      {kitList.length === 0 ? (
        <ProEmptyState
          icon={<Wrench className="size-10" aria-hidden />}
          title="No tools in this project yet"
          description="Browse the full 35mmAI catalog to add AI apps, software, and gear — or use a kit preset above."
          action={
            <button type="button" className={proBtn.ctaHero} onClick={() => setCatalogOpen(true)}>
              <Package className="size-5" aria-hidden />
              Browse tools
            </button>
          }
        />
      ) : (
        <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-pro-elevated ring-1 ring-white/[0.06]">
          {kitList.map((tool, i) => (
            <KitRow
              key={`${tool.catalogRank}-${i}`}
              tool={tool}
              onRemove={() =>
                updateState((p) => ({ ...p, kit: removeKitAtIndex(p.kit, i) }))
              }
            />
          ))}
        </ul>
      )}

      <KitCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        kit={state.kit}
        budgetTier={state.directorPrep.directorRules.budgetTier}
        onAdd={(rank) => {
          const tool = getToolByRank(rank);
          if (!tool) {
            showError(`Tool #${rank} not found in catalog.`);
            return;
          }
          if (kitList.some((k) => k.catalogRank === rank)) {
            showError(`${tool.name} is already in your kit.`);
            return;
          }
          updateState((p) => ({ ...p, kit: addToolToKit(p.kit, rank) }));
          showSuccess(`Added ${tool.name}.`);
        }}
        onAddFailed={(msg) => showError(msg)}
      />
    </div>
  );
}

function KitRow({ tool, onRemove }: { tool: KitDisplayEntry; onRemove: () => void }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-pro-text">
          <span className="mr-2 tabular-nums text-pro-primary">#{tool.catalogRank}</span>
          {tool.name}
        </p>
        <p className="mt-0.5 text-xs text-pro-text-secondary">
          {tool.category} · {tool.price}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tabular-nums text-pro-text">
          ~${(tool.monthly * tool.qty).toFixed(0)}/mo
        </span>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs text-pro-text-secondary touch-manipulation hover:text-pro-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
