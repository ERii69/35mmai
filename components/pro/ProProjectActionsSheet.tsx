"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Archive, Pencil, Star, Trash2 } from "lucide-react";
import { proTapHaptic } from "@/lib/pro/haptic";

type Props = {
  open: boolean;
  projectName: string;
  isDefault: boolean;
  pending: boolean;
  onClose: () => void;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMakeDefault?: () => void;
};

const actionBtn =
  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] text-pro-text transition hover:bg-white/[0.06] active:bg-white/[0.08] disabled:opacity-50";

export function ProProjectActionsSheet({
  open,
  projectName,
  isDefault,
  pending,
  onClose,
  onRename,
  onArchive,
  onDelete,
  onMakeDefault,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  function runAction(action: () => void) {
    proTapHaptic();
    onClose();
    action();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-actions-title"
      aria-describedby="project-actions-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-pro-elevated shadow-2xl">
          <div className="border-b border-white/[0.06] px-4 py-3 text-center">
            <p id="project-actions-title" className="truncate text-sm font-semibold text-pro-text">
              {projectName}
            </p>
            <p id="project-actions-desc" className="mt-0.5 text-xs text-pro-text-secondary">
              Project actions
            </p>
          </div>
          <ul className="p-1.5">
            <li>
              <button
                type="button"
                disabled={pending}
                className={actionBtn}
                onClick={() => runAction(onRename)}
              >
                <Pencil className="size-4 shrink-0 text-pro-text-secondary" aria-hidden />
                Rename
              </button>
            </li>
            {!isDefault && onMakeDefault ? (
              <li>
                <button
                  type="button"
                  disabled={pending}
                  className={actionBtn}
                  onClick={() => runAction(onMakeDefault)}
                >
                  <Star className="size-4 shrink-0 text-pro-text-secondary" aria-hidden />
                  Make default
                </button>
              </li>
            ) : null}
            <li>
              <button
                type="button"
                disabled={pending}
                className={actionBtn}
                onClick={() => runAction(onArchive)}
              >
                <Archive className="size-4 shrink-0 text-pro-text-secondary" aria-hidden />
                Archive
              </button>
            </li>
          </ul>
          <div className="border-t border-white/[0.06] p-1.5">
            <button
              type="button"
              disabled={pending}
              className={`${actionBtn} text-pro-warning hover:bg-pro-warning/10`}
              onClick={() => runAction(onDelete)}
            >
              <Trash2 className="size-4 shrink-0" aria-hidden />
              Delete project
            </button>
          </div>
        </div>
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center rounded-2xl border border-white/[0.08] bg-pro-elevated px-4 py-3.5 text-[15px] font-semibold text-pro-text shadow-lg transition active:scale-[0.99] hover:bg-pro-muted/40"
          onClick={() => {
            proTapHaptic();
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}
