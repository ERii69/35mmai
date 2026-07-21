"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Short hover/focus tooltip for dashboard hints (stats, default badge, nav). */
export function ProHintTooltip({ label, children, className }: Props) {
  return (
    <span className={cn("group/hint relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[14rem] -translate-x-1/2 rounded-lg bg-pro-elevated px-2.5 py-1.5 text-center text-[10px] leading-snug text-pro-text opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover/hint:opacity-100 group-focus-within/hint:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
