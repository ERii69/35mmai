"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { proBtn } from "@/components/pro/ux/pro-surfaces";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  /** Optional bullets or extra body below description. */
  children?: ReactNode;
  confirmLabel: string;
  pending?: boolean;
  /** Destructive actions use warning styling on confirm. */
  danger?: boolean;
  /** Stack above other modals (e.g. template picker). */
  layer?: "default" | "above";
  onClose: () => void;
  onConfirm: () => void;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  pending = false,
  danger = false,
  layer = "default",
  onClose,
  onConfirm,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const backdropZ = layer === "above" ? "z-[110]" : "z-50";

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusFirst = () => {
      const nodes = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
      const target = nodes?.[0] ?? panel;
      target?.focus();
    };
    const id = window.requestAnimationFrame(focusFirst);
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (!pending) {
          e.preventDefault();
          onClose();
        }
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open, pending, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${backdropZ} flex items-end justify-center bg-black/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:items-center`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => !pending && onClose()}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-pro-elevated shadow-2xl ring-1 ring-white/[0.08] focus:outline-none"
        data-pro-overlay=""
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-2">
            <h2 id={titleId} className="text-base font-semibold text-pro-text sm:text-lg">
              {title}
            </h2>
            {description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-pro-text-secondary">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2 text-pro-text-secondary transition hover:bg-white/5 hover:text-pro-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children ? (
          <div className="space-y-2 px-6 py-5 text-sm leading-relaxed text-pro-text-secondary">
            {children}
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-white/[0.06] bg-pro-muted/60 px-5 py-4 sm:px-6">
          <button
            type="button"
            disabled={pending}
            className={`${proBtn.outline} min-h-11 px-4 py-2.5 text-sm`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            className={
              danger
                ? "min-h-11 rounded-xl border border-pro-warning/40 bg-pro-warning/15 px-5 py-2.5 text-sm font-semibold text-pro-warning transition hover:bg-pro-warning/25 disabled:opacity-50"
                : `${proBtn.primary} min-h-11 px-5 py-2.5 text-sm disabled:opacity-50`
            }
            onClick={onConfirm}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
