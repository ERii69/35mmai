"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ExternalLink, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProModal } from "@/components/pro/ux/ProModal";
import { getCatalogToolReferencePath } from "@/lib/pro/catalog-tool-link";
import { filterCatalogTools, getCatalogCategories } from "@/lib/pro/kit-catalog";
import { isToolInKit } from "@/lib/pro/kit-display";
import type { CatalogKind } from "@/app/data";
import type { DirectorRulesState } from "@/lib/pro/types";

type Props = {
  open: boolean;
  onClose: () => void;
  kit: unknown[];
  budgetTier?: DirectorRulesState["budgetTier"];
  onAdd: (rank: number) => void;
  onAddFailed?: (message: string) => void;
};

export function KitCatalogModal({
  open,
  onClose,
  kit,
  budgetTier,
  onAdd,
  onAddFailed,
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [kindFilter, setKindFilter] = useState<CatalogKind | "all">("all");
  const [addingRank, setAddingRank] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(search);

  const categories = useMemo(() => ["All", ...getCatalogCategories()], []);

  const tools = useMemo(
    () =>
      filterCatalogTools({
        search: deferredSearch,
        category,
        budgetTier,
        catalogKind: kindFilter === "all" ? null : kindFilter,
      }),
    [deferredSearch, category, budgetTier, kindFilter]
  );

  function handleAdd(rank: number) {
    if (isToolInKit(kit, rank)) return;
    setAddingRank(rank);
    try {
      onAdd(rank);
    } catch (e) {
      onAddFailed?.(e instanceof Error ? e.message : "Could not add tool.");
    } finally {
      window.setTimeout(() => setAddingRank(null), 200);
    }
  }

  return (
    <ProModal
      open={open}
      onClose={onClose}
      title="Browse tools"
      description="Full 35mmAI catalog — same ranks and links as the free directory."
      wide
      footer={
        <Button type="button" variant="outline" className="border-white/10" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="flex max-h-[min(70vh,640px)] flex-col gap-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pro-text-secondary"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by name, rank, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-pro-muted py-2.5 pl-10 pr-3 text-[15px] text-pro-text ring-1 ring-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50"
            autoFocus
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg bg-pro-muted px-3 py-1.5 text-sm text-pro-text ring-1 ring-white/[0.06]"
            aria-label="Filter by category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All categories" : c}
              </option>
            ))}
          </select>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as CatalogKind | "all")}
            className="rounded-lg bg-pro-muted px-3 py-1.5 text-sm text-pro-text ring-1 ring-white/[0.06]"
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="ai">AI tools</option>
            <option value="software">Software</option>
            <option value="gear">Gear</option>
          </select>
        </div>

        <p className="text-xs text-pro-text-secondary">
          Showing <span className="font-medium text-pro-text">{tools.length}</span> tools
          {budgetTier ? ` · filtered for ${budgetTier} budget` : ""}
        </p>

        <ul className="-mx-1 flex-1 space-y-2 overflow-y-auto px-1 custom-scroll">
          {tools.length === 0 ? (
            <li className="rounded-xl bg-pro-muted/60 px-4 py-8 text-center text-sm text-pro-text-secondary">
              No tools match your filters. Try clearing search or category.
            </li>
          ) : (
            tools.map((tool) => {
              const inKit = isToolInKit(kit, tool.rank);
              const adding = addingRank === tool.rank;

              return (
                <li
                  key={tool.rank}
                  className="rounded-xl bg-pro-elevated/80 p-3 ring-1 ring-white/[0.06]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-pro-primary/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-pro-primary">
                          #{tool.rank}
                        </span>
                        <span className="font-semibold text-pro-text">{tool.name}</span>
                        <span className="text-[10px] uppercase tracking-wide text-pro-text-secondary">
                          {tool.category}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-pro-text-secondary">
                        {tool.shortDescription ?? tool.helps}
                      </p>
                      <p className="mt-1 text-xs font-medium text-pro-text">{tool.price}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-pro-primary hover:brightness-110"
                        disabled={inKit || adding}
                        onClick={() => handleAdd(tool.rank)}
                      >
                        {adding ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Plus className="mr-1 size-3.5" aria-hidden />
                        )}
                        {inKit ? "In kit" : "Add"}
                      </Button>
                      <a
                        href={getCatalogToolReferencePath(tool.rank)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 text-[10px] text-pro-text-secondary hover:text-pro-primary"
                      >
                        <ExternalLink className="size-3" aria-hidden />
                        Catalog
                      </a>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </ProModal>
  );
}
