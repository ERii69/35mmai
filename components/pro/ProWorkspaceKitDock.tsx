"use client";

import { useState } from "react";
import { ChevronDown, Package, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KitCatalogModal } from "@/components/pro/KitCatalogModal";
import { getToolByRank } from "@/app/data";
import { getToolOutboundUrl } from "@/lib/pro/catalog-tool-link";
import { addToolToKit, kitEntriesFromState, kitMonthlyTotal, removeKitAtIndex, type KitDisplayEntry } from "@/lib/pro/kit-display";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onOpenFullKit?: () => void;
  /** Script-to-prompt path — kit lives under Finish → Kit tab. */
  hideDesktop?: boolean;
  /** Hide mobile FAB when a fixed bottom bar is showing. */
  hideMobileFab?: boolean;
};

/** Floating My Kit — same idea as free 35mmAI sidebar; persists per project. */
export function ProWorkspaceKitDock({
  state,
  updateState,
  onOpenFullKit,
  hideDesktop = false,
  hideMobileFab = false,
}: Props) {
  const { showToast } = useProToast();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const kitList = kitEntriesFromState(state.kit);
  const kitNavLabel = "Finish → Kit";
  const monthlyTotal = kitMonthlyTotal(state.kit);
  const tier = state.directorPrep.directorRules.budgetTier;

  function addRank(rank: number) {
    const tool = getToolByRank(rank);
    if (!tool) {
      showToast({ message: `Tool #${rank} not in catalog.`, variant: "error" });
      return;
    }
    if (kitList.some((k) => k.catalogRank === rank)) {
      showToast({ message: `${tool.name} is already in your kit.`, variant: "info" });
      return;
    }
    updateState((p) => ({ ...p, kit: addToolToKit(p.kit, rank) }));
    showToast({ message: `Added ${tool.name} to kit.`, variant: "success" });
  }

  function clearKit() {
    if (kitList.length === 0) return;
    if (!confirm(`Remove all ${kitList.length} tools from this project kit?`)) return;
    updateState((p) => ({ ...p, kit: [] }));
    showToast({ message: "Kit cleared.", variant: "success" });
  }

  const listBody = (
    <>
      {kitList.length === 0 ? (
        <p className="py-4 text-center text-xs text-pro-text-secondary">
          Add tools from the Look strip, {kitNavLabel}, or browse the catalog.
        </p>
      ) : (
        <ul className="space-y-2">
          {kitList.map((tool, index) => (
            <KitDockRow
              key={`${tool.catalogRank}-${index}`}
              tool={tool}
              onRemove={() =>
                updateState((p) => ({ ...p, kit: removeKitAtIndex(p.kit, index) }))
              }
            />
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1 border-white/10 text-pro-text"
          onClick={() => setCatalogOpen(true)}
        >
          <Plus className="mr-1 size-3.5" aria-hidden />
          Browse tools
        </Button>
        {onOpenFullKit ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/10 text-pro-text-secondary"
            onClick={onOpenFullKit}
          >
            Full kit
          </Button>
        ) : null}
      </div>
    </>
  );

  if (hideDesktop && hideMobileFab) return null;

  return (
    <>
      {/* Desktop — fixed sidebar (free app pattern) */}
      {!hideDesktop ? (
      <aside
        className="pointer-events-none fixed right-4 top-[calc(var(--pro-app-header-height,3.25rem)+0.75rem)] z-40 hidden w-72 md:block lg:w-80"
        aria-label="My Kit"
      >
        <div className="pointer-events-auto max-h-[min(70vh,calc(100dvh-7rem))] overflow-hidden rounded-2xl border border-white/10 bg-pro-elevated shadow-2xl ring-1 ring-white/[0.06]">
          <KitDockHeader
            count={kitList.length}
            monthlyTotal={monthlyTotal}
            onClear={clearKit}
            clearDisabled={kitList.length === 0}
          />
          <div className="max-h-[calc(min(70vh,100dvh-7rem)-4.5rem)] overflow-y-auto px-4 pb-4">
            {listBody}
          </div>
        </div>
      </aside>
      ) : null}

      {/* Mobile — chip + expandable panel */}
      {!hideMobileFab ? (
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-pro-elevated px-4 py-2.5 text-sm font-medium text-pro-text shadow-xl ring-1 ring-white/10"
          aria-expanded={mobileOpen}
        >
          <Package className="size-4 text-pro-primary" aria-hidden />
          My Kit ({kitList.length})
          <ChevronDown
            className={`size-4 transition ${mobileOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {mobileOpen ? (
          <div className="absolute bottom-full right-0 mb-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-pro-elevated shadow-2xl">
            <KitDockHeader
              count={kitList.length}
              monthlyTotal={monthlyTotal}
              onClear={clearKit}
              clearDisabled={kitList.length === 0}
            />
            <div className="max-h-[50vh] overflow-y-auto px-4 pb-4">{listBody}</div>
          </div>
        ) : null}
      </div>
      ) : null}

      <KitCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        kit={state.kit}
        budgetTier={tier}
        onAdd={addRank}
      />
    </>
  );
}

function KitDockHeader({
  count,
  monthlyTotal,
  onClear,
  clearDisabled,
}: {
  count: number;
  monthlyTotal: number;
  onClear: () => void;
  clearDisabled: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
      <div>
        <p className="text-base font-semibold text-pro-text">My Kit ({count})</p>
        {count > 0 ? (
          <p className="text-[11px] text-pro-text-secondary">~${monthlyTotal.toFixed(0)}/mo est.</p>
        ) : (
          <p className="text-[11px] text-pro-text-secondary">Tools for this project</p>
        )}
      </div>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-xs font-medium text-red-400 touch-manipulation disabled:opacity-30"
        disabled={clearDisabled}
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  );
}

function KitDockRow({ tool, onRemove }: { tool: KitDisplayEntry; onRemove: () => void }) {
  const outbound = getToolOutboundUrl(tool);

  return (
    <li className="flex gap-2 rounded-xl bg-pro-muted p-3 ring-1 ring-white/[0.04]">
      <div className="min-w-0 flex-1">
        <a
          href={outbound}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-pro-text hover:text-pro-primary"
        >
          {tool.name}
        </a>
        <p className="mt-0.5 line-clamp-2 text-[10px] text-pro-text-secondary">{tool.helps}</p>
        <p className="mt-1 text-[10px] tabular-nums text-pro-text-secondary">
          #{tool.catalogRank} · ~${tool.monthly}/mo
        </p>
      </div>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-pro-text-secondary touch-manipulation hover:text-red-400"
        aria-label={`Remove ${tool.name}`}
        onClick={onRemove}
      >
        <X className="size-4" aria-hidden />
      </button>
    </li>
  );
}
