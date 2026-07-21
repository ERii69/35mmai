"use client";

type Props = {
  label: string;
  className?: string;
};

/** Compact workflow label on dashboard project cards — not a separate product tier. */
export function ProProjectWorkflowChip({ label, className = "" }: Props) {
  return (
    <span
      className={`inline-flex max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-pro-text-secondary ${className}`}
    >
      {label}
    </span>
  );
}
