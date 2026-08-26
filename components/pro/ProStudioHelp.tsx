"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import {
  STUDIO_HELP_INTRO,
  STUDIO_HELP_SECTIONS,
  type StudioHelpSectionId,
} from "@/lib/pro/studio-help";
import { useOutsideClick } from "@/lib/pro/use-outside-click";

export function ProStudioHelp() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [section, setSection] = useState<StudioHelpSectionId>("start");
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setMounted(true), []);
  useOutsideClick(open, [rootRef, panelRef], close);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = STUDIO_HELP_SECTIONS.find((s) => s.id === section) ?? STUDIO_HELP_SECTIONS[0]!;

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="flex max-h-[min(85vh,36rem)] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-pro-elevated shadow-xl shadow-black/50 ring-1 ring-white/[0.06]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="min-w-0">
          <p id={titleId} className="text-sm font-semibold text-pro-text">
            How to use {BRAND_NAME_PRO}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">{STUDIO_HELP_INTRO}</p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-pro-text-secondary transition hover:bg-white/5 hover:text-pro-text"
          onClick={close}
          aria-label="Close help"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-3 py-2">
        {STUDIO_HELP_SECTIONS.map((s) => {
          const active = s.id === section;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium touch-manipulation ${
                active
                  ? "bg-pro-primary/20 text-pro-text ring-1 ring-pro-primary/40"
                  : "text-pro-text-secondary hover:bg-white/5 hover:text-pro-text"
              }`}
              aria-current={active ? "true" : undefined}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p className="text-sm leading-relaxed text-pro-text">{current.why}</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-pro-text">
          {current.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );

  const overlay =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100]" data-pro-overlay="">
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close help"
              onClick={close}
            />
            <div className="pointer-events-none absolute inset-x-3 top-[calc(var(--pro-app-header-height,3.25rem)+0.5rem)] flex justify-end sm:inset-x-4 md:inset-x-6">
              <div className="pointer-events-auto w-full max-w-lg">{panel}</div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl p-2 text-pro-text transition hover:bg-white/5 hover:text-pro-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={open ? "Close how to use Pro" : `How to use ${BRAND_NAME_PRO}`}
        title={`How to use ${BRAND_NAME_PRO}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {open ? <X className="size-5" aria-hidden /> : <FileText className="size-5" aria-hidden />}
      </button>
      {overlay}
    </div>
  );
}
