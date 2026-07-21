"use client";

import { useState } from "react";
import { Copy, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyProExport, downloadProExport } from "@/lib/pro/download-pro-export";
import { proBtn } from "@/components/pro/ux/pro-surfaces";

export type PromptPackSaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  projectId: string;
  projectName: string;
  /** hero = Export panel (canonical download hub); compact = removed — use links instead */
  variant?: "hero" | "compact";
  saveStatus?: PromptPackSaveStatus;
  onSaveNow?: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

export function PromptPackDeliverable({
  projectId,
  projectName,
  variant = "hero",
  saveStatus,
  onSaveNow,
  onSuccess,
  onError,
}: Props) {
  const [loading, setLoading] = useState<"md" | "csv" | "copy" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function ensureSaved(): boolean {
    if (saveStatus == null) return true;
    if (saveStatus === "saved") return true;
    if (saveStatus === "saving") {
      const message = "Wait for save to finish, then export again.";
      setErrorMessage(message);
      onError?.(message);
      return false;
    }
    if (saveStatus === "error") {
      const message = "Fix the save error first — see the banner above.";
      setErrorMessage(message);
      onError?.(message);
      return false;
    }
    onSaveNow?.();
    const message = "Saving workspace first — tap Export again in a moment.";
    setErrorMessage(message);
    onError?.(message);
    return false;
  }

  async function run(action: "md" | "csv" | "copy", fn: () => Promise<unknown>, successMessage: string) {
    if (!ensureSaved()) return;
    setLoading(action);
    setErrorMessage(null);
    try {
      await fn();
      onSuccess?.(successMessage);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Export failed.";
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setLoading(null);
    }
  }

  const busy = loading != null;
  const saveBlocked = saveStatus != null && saveStatus !== "saved";

  if (variant === "compact") {
    return null;
  }

  return (
    <section className="rounded-2xl border border-emerald-600/25 bg-gradient-to-br from-emerald-950/30 to-pro-muted p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-pro-text">Download prompt pack</h3>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-pro-text-secondary">
        Scene-ordered prompts with tool names and outbound links — Markdown or CSV. This is the
        primary deliverable for Script to prompt.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className={proBtn.secondary}
          disabled={busy || saveBlocked}
          onClick={() =>
            void run(
              "md",
              () => downloadProExport(projectId, "prompt-pack-md", projectName),
              "Prompt pack (.md) downloaded."
            )
          }
        >
          {loading === "md" ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : (
            <Download className="mr-2 size-4" aria-hidden />
          )}
          Download prompt pack (.md)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/[0.1] text-pro-text"
          disabled={busy || saveBlocked}
          onClick={() =>
            void run(
              "csv",
              () => downloadProExport(projectId, "prompt-pack-csv", projectName),
              "Prompt pack CSV downloaded."
            )
          }
        >
          {loading === "csv" ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
          ) : null}
          CSV (prompt pack)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-pro-text-secondary hover:text-pro-text"
          disabled={busy || saveBlocked}
          onClick={() =>
            void run("copy", () => copyProExport(projectId, "prompt-pack-md"), "Full prompt pack copied.")
          }
        >
          {loading === "copy" ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
          ) : (
            <Copy className="mr-1.5 size-3.5" aria-hidden />
          )}
          Copy all prompts
        </Button>
      </div>
      {errorMessage ? (
        <p className="mt-3 text-xs font-medium text-red-300/90" role="alert">
          {errorMessage}
        </p>
      ) : saveBlocked ? (
        <p className="mt-3 text-xs font-medium text-pro-warning" role="status">
          {saveStatus === "saving"
            ? "Saving… export unlocks when save completes."
            : "Unsaved changes — tap Save in the nav bar, then download."}
        </p>
      ) : (
        <p className="mt-3 text-xs text-pro-text-secondary">
          Nothing generates inside 35mmPRO — paste each prompt into the linked tool.
        </p>
      )}
    </section>
  );
}
