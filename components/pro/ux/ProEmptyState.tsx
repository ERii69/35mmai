"use client";

import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function ProEmptyState({ icon, title, description, action, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-pro-surface to-pro-muted px-6 py-12 text-center shadow-inner shadow-black/30 ring-1 ring-white/5 ${className}`}
    >
      {icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-pro-muted text-pro-primary/80 ring-1 ring-white/5">
          {icon}
        </div>
      ) : null}
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-pro-text-secondary">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
