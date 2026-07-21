"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Wider dialog for catalogs and multi-column content. */
  wide?: boolean;
};

export function ProModal({ open, onClose, title, description, children, footer, wide }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-md sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full overflow-hidden rounded-2xl bg-[#141414] shadow-2xl ring-1 ring-white/[0.08] ${
          wide ? "max-w-3xl" : "max-w-md"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-2">
            <h2 id="pro-modal-title" className="text-base font-semibold text-[#e5e5e5] sm:text-lg">
              {title}
            </h2>
            {description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-[#a3a3a3]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-pro-text-secondary transition hover:bg-white/5 hover:text-pro-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children ? <div className="px-6 py-5">{children}</div> : null}
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-white/[0.06] bg-pro-muted/60 px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
