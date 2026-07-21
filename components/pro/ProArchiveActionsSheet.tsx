"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArchiveRestore, Trash2 } from "lucide-react";
import { proTapHaptic } from "@/lib/pro/haptic";

type Props = {
  open: boolean;
  projectName: string;
  pending: boolean;
  onClose: () => void;
  onRestore: () => void;
  onDelete: () => void;
};

const actionBtn =
  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] text-pro-text transition hover:bg-white/[0.06] active:bg-white/[0.08] disabled:opacity-50";

export function ProArchiveActionsSheet({
  open,
  projectName,
  pending,
  onClose,
  onRestore,
  onDelete,
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
      aria-labelledby="archive-actions-title"
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
            <p id="archive-actions-title" className="truncate text-sm font-semibold text-pro-text">
              {projectName}
            </p>
            <p className="mt-0.5 text-xs text-pro-text-secondary">Archived project</p>
          </div>
          <ul className="p-1.5">
            <li>
              <button
                type="button"
                disabled={pending}
                className={actionBtn}
                onClick={() => runAction(onRestore)}
              >
                <ArchiveRestore className="size-5 text-pro-text-secondary" aria-hidden />
                Restore to dashboard
              </button>
            </li>
            <li>
              <button
                type="button"
                disabled={pending}
                className={`${actionBtn} text-pro-warning`}
                onClick={() => runAction(onDelete)}
              >
                <Trash2 className="size-5" aria-hidden />
                Delete permanently
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    document.body
  );
}
