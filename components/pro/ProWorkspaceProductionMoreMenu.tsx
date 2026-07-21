"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { proNavPill } from "@/components/pro/ux/pro-surfaces";
import { PRODUCTION_TABS, type ProductionTabId } from "@/lib/pro/workspace-modes";

const MOBILE_PRIMARY: ProductionTabId[] = ["shots", "budget"];
const MOBILE_MORE: ProductionTabId[] = ["world", "kit", "workflow", "budget", "export"];

type Props = {
  activeTab: ProductionTabId;
  onSelect: (tab: ProductionTabId) => void;
};

export function ProWorkspaceProductionMoreMenu({
  activeTab,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const moreTabs = PRODUCTION_TABS.filter((t) => MOBILE_MORE.includes(t.id));
  const moreActive = MOBILE_MORE.includes(activeTab);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0 md:hidden">
      <button
        type="button"
        className={`${proNavPill(moreActive)} gap-1`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical className="size-3.5" aria-hidden />
        More
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-white/[0.08] bg-pro-elevated py-1 shadow-xl shadow-black/40 ring-1 ring-white/[0.06]"
        >
          {moreTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitem"
              className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-pro-muted/80 ${
                activeTab === t.id ? "font-medium text-pro-text" : "text-pro-text-secondary"
              }`}
              onClick={() => {
                onSelect(t.id);
                setOpen(false);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function productionTabsForMobile(): {
  primary: typeof PRODUCTION_TABS;
  useMore: boolean;
} {
  return {
    primary: PRODUCTION_TABS.filter((t) => MOBILE_PRIMARY.includes(t.id)),
    useMore: true,
  };
}
