"use client";

import type { ReactNode } from "react";
import {
  formatShortcutDisplay,
  getShortcut,
  type ProShortcutId,
} from "@/lib/pro/keyboard-shortcuts";

type Props = {
  shortcutId: ProShortcutId;
  children: ReactNode;
  /** Extra detail after the shortcut keys. */
  side?: "top" | "bottom";
};

/** Wraps controls with a hover/focus tooltip showing the keyboard shortcut. */
export function KeyboardShortcutTooltip({ shortcutId, children, side = "top" }: Props) {
  const meta = getShortcut(shortcutId);
  const keys = formatShortcutDisplay(shortcutId);

  return (
    <span className="group relative inline-flex max-w-full">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 w-max max-w-[14rem] -translate-x-1/2 rounded-lg bg-pro-elevated px-2.5 py-1.5 text-center text-[10px] leading-snug text-pro-text shadow-lg ring-1 ring-white/10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${
          side === "top" ? "bottom-full mb-2" : "top-full mt-2"
        }`}
      >
        <span className="font-mono font-semibold text-pro-primary">{keys}</span>
        <span className="mt-0.5 block text-pro-text-secondary">{meta.description}</span>
      </span>
    </span>
  );
}

/** Inline kbd chips for shortcut reference bars. */
export function ShortcutKbd({ shortcutId }: { shortcutId: ProShortcutId }) {
  const keys = formatShortcutDisplay(shortcutId);
  return (
    <kbd className="rounded-md bg-pro-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-pro-primary ring-1 ring-white/[0.08]">
      {keys}
    </kbd>
  );
}
