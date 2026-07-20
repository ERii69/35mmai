"use client";

import { ChevronDown } from "lucide-react";
import { workflowDisplayName } from "@/lib/pro/workflow-choices";

type Props = {
  appliedTemplateId: string | null;
  onOpen: () => void;
  className?: string;
};

/** Single workspace control — opens the template hub. */
export function ProWorkflowControl({ appliedTemplateId, onOpen, className = "" }: Props) {
  const label = workflowDisplayName(appliedTemplateId);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`inline-flex max-w-full min-h-11 items-center gap-1 rounded-lg border border-white/10 bg-pro-muted/40 px-2.5 py-1.5 text-xs font-medium text-pro-text transition hover:border-white/20 hover:bg-pro-elevated touch-manipulation ${className}`}
      aria-label={`Template: ${label}. Change template`}
    >
      <span className="shrink-0 text-pro-text-secondary">Template:</span>
      <span className="min-w-0 truncate">{label}</span>
      <ChevronDown className="size-3.5 shrink-0 text-pro-text-secondary" aria-hidden />
    </button>
  );
}
