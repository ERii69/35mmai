"use client";

import { useMemo, useState } from "react";
import { Package, Plus, Sparkles } from "lucide-react";
import { getToolByRank } from "@/app/data";
import { Button } from "@/components/ui/button";
import { KitCatalogModal } from "@/components/pro/KitCatalogModal";
import { ProEmptyState } from "@/components/pro/ux/ProEmptyState";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import { addToolToKit, addToolsToKit, kitEntriesFromState } from "@/lib/pro/kit-display";
import { suggestPostKitRanks } from "@/lib/pro/post-kit";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
};

export function PostKitPanel({ state, updateState }: Props) {
  const { showToast } = useProToast();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const kitList = kitEntriesFromState(state.kit);
  const suggestions = useMemo(() => suggestPostKitRanks(state), [state]);
  const notInKit = suggestions.filter((s) => !kitList.some((k) => k.catalogRank === s.rank));

  function addRank(rank: number) {
    const tool = getToolByRank(rank);
    if (!tool) return;
    if (kitList.some((k) => k.catalogRank === rank)) {
      showToast({ message: `${tool.name} is already in your kit.` });
      return;
    }
    updateState((p) => ({ ...p, kit: addToolToKit(p.kit, rank) }));
    showToast({ message: `Added ${tool.name} to My Kit.` });
  }

  function suggestAll() {
    const ranks = notInKit.map((s) => s.rank);
    if (ranks.length === 0) {
      showToast({ message: "Post kit suggestions are already in My Kit." });
      return;
    }
    const result = addToolsToKit(state.kit, ranks);
    updateState((p) => ({ ...p, kit: result.kit }));
    showToast({ message: `Added ${result.added} post tool${result.added === 1 ? "" : "s"} to My Kit.` });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-pro-text-secondary">
          Editor, color, and sound tools matched to your budget band and role — same catalog as
          production Kit.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/10"
            onClick={suggestAll}
          >
            <Sparkles className="mr-1.5 size-3.5" aria-hidden />
            Suggest post kit
          </Button>
          <Button type="button" size="sm" className={proBtn.primary} onClick={() => setCatalogOpen(true)}>
            <Plus className="mr-1.5 size-3.5" aria-hidden />
            Browse catalog
          </Button>
        </div>
      </div>

      {notInKit.length === 0 && kitList.length === 0 ? (
        <ProEmptyState
          icon={<Package className="size-10" aria-hidden />}
          title="No post tools yet"
          description="Suggest a starter set for edit, grade, and sound — or browse the catalog."
          action={
            <Button type="button" className={proBtn.primary} onClick={suggestAll}>
              Suggest post kit
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {notInKit.map((s) => {
            const tool = getToolByRank(s.rank);
            if (!tool) return null;
            return (
              <li
                key={s.rank}
                className={`${proSurface.card} flex flex-wrap items-center justify-between gap-3 py-3`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-pro-text">{tool.name}</p>
                  <p className="text-xs text-pro-text-secondary">{s.reason}</p>
                </div>
                <Button type="button" size="sm" variant="outline" className="border-white/10" onClick={() => addRank(s.rank)}>
                  Add to kit
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {kitList.length > 0 ? (
        <div className={proSurface.sectionMuted}>
          <p className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
            In My Kit ({kitList.length})
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {kitList.map((k) => (
              <li
                key={k.catalogRank}
                className="rounded-full bg-pro-elevated px-3 py-1 text-xs text-pro-text ring-1 ring-white/[0.08]"
              >
                {k.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <KitCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        kit={state.kit}
        budgetTier={state.directorPrep.directorRules.budgetTier}
        onAdd={(rank) => {
          addRank(rank);
          setCatalogOpen(false);
        }}
      />
    </div>
  );
}
