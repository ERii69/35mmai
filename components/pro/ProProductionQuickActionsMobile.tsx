"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, MoreVertical, Plus, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proBtn, proNavPill } from "@/components/pro/ux/pro-surfaces";

type Props = {
  onSuggestCoverage: () => void;
  onMatchVisualBible: () => void;
  onAddSequence: () => void;
  onGoToExport?: () => void;
  onGenerate?: () => void;
  generating?: boolean;
  canGenerate?: boolean;
  disabled?: boolean;
  hideCoverageActions?: boolean;
};

/** Full-width bottom bar on mobile shots — solid chrome so stats don't bleed through. */
export function ProProductionQuickActionsMobile({
  onSuggestCoverage,
  onMatchVisualBible,
  onAddSequence,
  onGoToExport,
  onGenerate,
  generating,
  canGenerate,
  disabled,
  hideCoverageActions = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  const generateLabel = generating
    ? "Generating…"
    : hideCoverageActions
      ? "Rebuild beats"
      : "Generate plan";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-pro-base/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="flex items-center gap-2 px-4 py-2.5">
        {onGenerate ? (
          <Button
            type="button"
            className={`${proBtn.primary} h-11 min-w-0 flex-1 justify-center`}
            disabled={!canGenerate || generating || disabled}
            onClick={onGenerate}
          >
            <Wand2 className="mr-1.5 size-4 shrink-0" aria-hidden />
            <span className="truncate">{generateLabel}</span>
          </Button>
        ) : null}

        {onGoToExport ? (
          <Button
            type="button"
            className={`${proBtn.apply} h-11 shrink-0 px-3`}
            onClick={onGoToExport}
          >
            Export
            <ArrowRight className="ml-1 size-4" aria-hidden />
          </Button>
        ) : null}

        <div ref={rootRef} className="relative shrink-0">
          <button
            type="button"
            className={`${proNavPill(false)} flex size-11 items-center justify-center px-0`}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-label="More shot actions"
            onClick={() => setOpen((v) => !v)}
          >
            <MoreVertical className="size-5" aria-hidden />
          </button>

          {open ? (
            <div
              id={menuId}
              role="menu"
              className="absolute bottom-full right-0 z-50 mb-2 min-w-[12rem] overflow-hidden rounded-xl border border-white/[0.08] bg-pro-elevated py-1 shadow-xl shadow-black/40 ring-1 ring-white/[0.06]"
            >
              {!hideCoverageActions ? (
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-pro-text transition hover:bg-pro-muted/80 disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => {
                    onSuggestCoverage();
                    setOpen(false);
                  }}
                >
                  <Sparkles className="size-4 text-pro-text-secondary" aria-hidden />
                  Suggest coverage
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="flex min-h-11 w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-pro-text transition hover:bg-pro-muted/80 disabled:opacity-50"
                disabled={disabled}
                onClick={() => {
                  onMatchVisualBible();
                  setOpen(false);
                }}
              >
                Match visual bible
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex min-h-11 w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-pro-text transition hover:bg-pro-muted/80 disabled:opacity-50"
                disabled={disabled}
                onClick={() => {
                  onAddSequence();
                  setOpen(false);
                }}
              >
                <Plus className="size-4 text-pro-text-secondary" aria-hidden />
                Add sequence
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
