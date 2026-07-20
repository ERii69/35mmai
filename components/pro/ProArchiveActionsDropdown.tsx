"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArchiveRestore, MoreVertical, Trash2 } from "lucide-react";
import { useOutsideClick } from "@/lib/pro/use-outside-click";

type Props = {
  projectName: string;
  pending: boolean;
  onRestore: () => void;
  onDelete: () => void;
};

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-pro-text transition hover:bg-pro-muted/80 disabled:opacity-50";

export function ProArchiveActionsDropdown({ projectName, pending, onRestore, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; minWidth: number } | null>(
    null
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setMounted(true), []);

  useOutsideClick(open, [triggerRef, panelRef], close);

  useEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }

    function positionMenu() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - 200),
        minWidth: 200,
      });
    }

    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open]);

  function run(action: () => void) {
    close();
    action();
  }

  const menu =
    open && mounted && menuPos
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            className="fixed z-[100] overflow-hidden rounded-xl border border-white/[0.08] bg-pro-elevated py-1 shadow-xl shadow-black/40 ring-1 ring-white/[0.06]"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              minWidth: menuPos.minWidth,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="truncate px-3 py-2 text-xs font-medium text-pro-text-secondary">
              {projectName}
            </p>
            <div className="border-t border-white/[0.06] p-1">
              <button
                type="button"
                role="menuitem"
                disabled={pending}
                className={itemClass}
                onClick={() => run(onRestore)}
              >
                <ArchiveRestore className="size-4 text-pro-text-secondary" aria-hidden />
                Restore
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={pending}
                className={`${itemClass} text-pro-warning hover:bg-pro-warning/10`}
                onClick={() => run(onDelete)}
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-pro-text-secondary transition hover:bg-pro-muted/80 hover:text-pro-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50 touch-manipulation"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={`Actions for ${projectName}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical className="size-4" aria-hidden />
      </button>
      {menu}
    </>
  );
}
