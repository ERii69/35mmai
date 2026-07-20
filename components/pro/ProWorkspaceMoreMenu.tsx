"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { proNavPill, proNavPillCompact } from "@/components/pro/ux/pro-surfaces";
import { proTapHaptic } from "@/lib/pro/haptic";
import { useOutsideClick } from "@/lib/pro/use-outside-click";

export type WorkspaceMoreMenuItem = {
  id: string;
  label: string;
};

type Props = {
  items: WorkspaceMoreMenuItem[];
  activeId: string;
  activeInMore: boolean;
  onSelect: (id: string) => void;
  /** Extra rows below items (e.g. secondary Finish links). Receives close(). */
  footer?: (close: () => void) => ReactNode;
  compact?: boolean;
  className?: string;
};

/**
 * Portal-based More menu for workspace sub-nav — avoids clipping inside overflow-x scroll rows.
 */
export function ProWorkspaceMoreMenu({
  items,
  activeId,
  activeInMore,
  onSelect,
  footer,
  compact = true,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; minWidth: number } | null>(
    null
  );

  const close = useCallback(() => setOpen(false), []);
  const pill = compact ? proNavPillCompact : proNavPill;

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
        right: Math.max(8, window.innerWidth - rect.right),
        minWidth: 168,
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
              right: menuPos.right,
              minWidth: menuPos.minWidth,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-pro-muted/80 ${
                  activeId === item.id ? "font-medium text-pro-text" : "text-pro-text-secondary"
                }`}
                onClick={() => {
                  proTapHaptic();
                  onSelect(item.id);
                  close();
                }}
              >
                {item.label}
              </button>
            ))}
            {footer ? (
              <>
                <div className="my-1 border-t border-white/[0.06]" role="separator" />
                {footer(close)}
              </>
            ) : null}
          </div>,
          document.body
        )
      : null;

  if (items.length === 0 && !footer) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${pill(activeInMore || open)} relative shrink-0 touch-manipulation gap-1 ${className}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={(e) => {
          e.stopPropagation();
          proTapHaptic();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical className="size-3.5" aria-hidden />
        More
      </button>
      {menu}
    </>
  );
}
