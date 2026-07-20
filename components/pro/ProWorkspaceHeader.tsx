"use client";

import { proFocus } from "@/components/pro/ux/pro-surfaces";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  saveStatus: SaveStatus;
  saveLabel: string;
  saveError: string | null;
  lastSavedAt: string;
  onSaveNow: () => void;
  /** Icon-only — mobile stepper row. */
  iconOnly?: boolean;
};

/** Compact save indicator — auto-save first; manual save on click. */
export function ProWorkspaceSaveBar({
  saveStatus,
  saveLabel,
  saveError,
  lastSavedAt,
  onSaveNow,
  iconOnly = false,
}: Props) {
  const dotClass =
    saveStatus === "error"
      ? "bg-pro-warning"
      : saveStatus === "saving"
        ? "animate-pulse bg-pro-text-secondary"
        : saveStatus === "saved"
          ? "bg-pro-success"
          : "bg-pro-warning/80";

  const timestamp = new Date(lastSavedAt).toLocaleString();

  if (iconOnly) {
    return (
      <button
        type="button"
        className={`flex size-11 items-center justify-center rounded-lg ring-1 ring-white/[0.08] transition hover:bg-white/[0.04] ${proFocus}`}
        title={`${saveLabel}${saveError ? " — tap to retry" : ""}`}
        aria-label={saveError ? "Save failed — tap to retry" : saveLabel}
        onClick={onSaveNow}
      >
        <span className={`size-2 rounded-full ${dotClass}`} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`group flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition hover:bg-white/[0.04] ${proFocus}`}
      title={saveError ? "Save failed — click to retry" : timestamp}
      aria-label={saveError ? "Save failed — click to retry" : `${saveLabel}, last saved ${timestamp}`}
      onClick={onSaveNow}
    >
      <span className={`size-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
      <span
        className={`hidden font-medium tabular-nums sm:inline ${
          saveStatus === "error"
            ? "text-pro-warning"
            : saveStatus === "saved"
              ? "text-pro-success"
              : "text-pro-text-secondary"
        }`}
      >
        {saveLabel}
      </span>
      <span className="hidden text-[10px] text-pro-text-secondary/60 group-hover:inline lg:inline">
        {timestamp}
      </span>
    </button>
  );
}
