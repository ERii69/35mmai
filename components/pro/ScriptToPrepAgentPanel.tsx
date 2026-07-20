"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProExportDownloadButton } from "@/components/pro/ProExportDownloadButton";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import { applyScriptToPrep } from "@/lib/pro/apply-script-to-prep";
import {
  importScriptToPrepJson,
  previewScriptToPrepImport,
} from "@/lib/pro/import-script-to-prep";
import { PRO_SCRIPT_PASTE_PRIVACY_CALLOUT } from "@/lib/pro/membership-policy";
import { buildScriptToPrepAgentPrompt } from "@/lib/pro/script-to-prep-prompt";
import type { ProjectStatePayload } from "@/lib/pro/types";

const FIELD_CLASS =
  "w-full rounded-lg border border-white/[0.08] bg-pro-muted px-3 py-2 text-sm text-white outline-none focus:border-pro-primary/60";

type Props = {
  projectId: string;
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
};

export function ScriptToPrepAgentPanel({ projectId, state, updateState }: Props) {
  const dp = state.directorPrep;
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [includeDraftsInReport, setIncludeDraftsInReport] = useState(true);
  const [applyBudget, setApplyBudget] = useState(true);

  const hasScript = dp.screenplay.rawText.trim().length > 0;
  const preview = useMemo(
    () => (importText.trim() ? previewScriptToPrepImport(importText) : null),
    [importText]
  );

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4500);
  }

  async function copyAgentPrompt() {
    if (!hasScript) {
      setImportError("Paste your screenplay in the Script section below first.");
      return;
    }
    const text = buildScriptToPrepAgentPrompt(
      dp.directorRules,
      dp.screenplay.rawText,
      dp.screenplay.title
    );
    try {
      await navigator.clipboard.writeText(text);
      showToast("Agent prompt copied — paste into Claude or ChatGPT.");
    } catch {
      showToast("Could not copy to clipboard.");
    }
  }

  function handleApply(mode: "replace" | "append") {
    setImportError(null);
    const result = importScriptToPrepJson(importText, mode === "append" ? dp.scenes.length : 0);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    const label =
      mode === "replace"
        ? "Replace scenes, shot lists, and agent summary?"
        : "Append agent scenes and shot lists to your project?";
  const budgetNote = applyBudget ? " Budget preset lines will be applied." : "";
    if (!confirm(`${label}${budgetNote}`)) return;

    updateState((prev) =>
      applyScriptToPrep(prev, result.data, {
        mode,
        applyBudgetLines: applyBudget,
      })
    );
    setImportText("");
    showToast(
      `Applied ${result.data.scenes.length} scene(s), ${result.data.shotSequences.length} shot list(s), ${result.data.locations.length} location(s). Review drafts, then download the report.`
    );
  }

  return (
    <section className="rounded-2xl border border-pro-primary/35 bg-gradient-to-b from-pro-primary/10 to-pro-muted p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pro-primary/20 text-pro-primary">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Script-to-Pre-Production Agent</h2>
            <p className="mt-1 max-w-2xl text-sm text-pro-text-secondary">
              Reads your full script (via external AI), breaks scenes, shot lists, locations,
              references, and a budget band — then fills your workspace and exports a Markdown
              report. {PRO_SCRIPT_PASTE_PRIVACY_CALLOUT}
            </p>
          </div>
        </div>
      </div>

      {toast ? (
        <ProStatusBanner className="mt-3" variant="success" message={toast} onDismiss={() => setToast(null)} />
      ) : null}
      {importError ? (
        <ProStatusBanner
          className="mt-3"
          variant="error"
          message={importError}
          onDismiss={() => setImportError(null)}
        />
      ) : null}

      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-pro-text-secondary">
        <li>Paste script + set Director&apos;s Bible rules below.</li>
        <li>Copy the agent prompt → run in Claude or ChatGPT.</li>
        <li>Paste the JSON reply → Apply to workspace.</li>
        <li>Download the pre-production Markdown report.</li>
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="bg-pro-primary hover:brightness-110"
          disabled={!hasScript}
          onClick={() => void copyAgentPrompt()}
        >
          1. Copy agent prompt
        </Button>
        <Button type="button" size="sm" variant="outline" className="border-white/[0.1] text-pro-text" asChild>
          <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">
            2. Open Claude
          </a>
        </Button>
      </div>

      {!hasScript ? (
        <p className="mt-3 text-sm text-pro-warning" role="status">
          Paste your screenplay in the Script section below to enable the agent prompt.
        </p>
      ) : null}

      <label className="mt-4 block text-xs text-pro-text-secondary" htmlFor="agent-response-paste">
        3. Paste agent JSON response
        <textarea
          id="agent-response-paste"
          rows={6}
          className={`mt-1 font-mono text-xs ${FIELD_CLASS}`}
          placeholder='{"executiveSummary": "...", "scenes": [...], "shotSequences": [...], ...}'
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value);
            setImportError(null);
          }}
        />
      </label>

      {preview?.ok ? (
        <div className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-950/20 p-3 text-sm text-emerald-100/90">
          <p>
            Ready: {preview.sceneCount} scene{preview.sceneCount === 1 ? "" : "s"} ·{" "}
            {preview.locationCount} location{preview.locationCount === 1 ? "" : "s"} ·{" "}
            {preview.shotSequenceCount} shot list{preview.shotSequenceCount === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-xs text-emerald-200/70">{preview.executiveSummary}</p>
          <p className="mt-1 text-xs text-emerald-200/70">{preview.budgetSummary}</p>
        </div>
      ) : preview && !preview.ok ? (
        <p className="mt-2 text-sm text-pro-warning" role="alert">
          {preview.error}
        </p>
      ) : null}

      <label className="mt-3 flex items-center gap-2 text-xs text-pro-text-secondary">
        <input
          type="checkbox"
          checked={applyBudget}
          onChange={(e) => setApplyBudget(e.target.checked)}
          className="size-4 rounded border-white/[0.1]"
        />
        Apply scaled budget preset lines when importing
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="bg-pro-primary hover:brightness-110"
          disabled={!preview?.ok}
          onClick={() => handleApply("append")}
        >
          Apply (append)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/[0.1] text-pro-text"
          disabled={!preview?.ok}
          onClick={() => handleApply("replace")}
        >
          Replace workspace prep
        </Button>
      </div>

      <details className="group mt-4 rounded-lg border border-white/[0.08] bg-pro-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm text-pro-text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <FileText className="size-4" aria-hidden />
            4. Pre-production Markdown report
          </span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="space-y-3 border-t border-white/[0.08] px-3 py-3">
          <p className="text-xs text-pro-text-secondary">
            Scenes, shot lists, locations, visual refs, budget estimate, and next steps — from your
            current workspace (including agent summary if applied).
          </p>
          <label className="flex items-center gap-2 text-xs text-pro-text-secondary">
            <input
              type="checkbox"
              checked={includeDraftsInReport}
              onChange={(e) => setIncludeDraftsInReport(e.target.checked)}
              className="size-4 rounded border-white/[0.1]"
            />
            Include draft scenes in report
          </label>
          <ProExportDownloadButton
            projectId={projectId}
            projectName={state.directorPrep.screenplay.title || "project"}
            kind="preproduction-report"
            label="Download pre-production report (.md)"
            includeDrafts={includeDraftsInReport}
            className="inline-flex rounded-lg border border-white/[0.08] bg-pro-elevated px-3 py-2 text-sm font-medium text-white hover:border-pro-primary/50 disabled:opacity-50"
            successMessage="Pre-production report downloaded."
          />
        </div>
      </details>
    </section>
  );
}
