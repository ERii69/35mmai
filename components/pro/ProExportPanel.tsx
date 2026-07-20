"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Download, Loader2 } from "lucide-react";
import { PromptPackDeliverable } from "@/components/pro/PromptPackDeliverable";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { downloadProExport } from "@/lib/pro/download-pro-export";
import type { ProExportKind } from "@/lib/pro/export-csv";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { PromptPackSaveStatus } from "@/components/pro/PromptPackDeliverable";

type Props = {
  projectId: string;
  projectName: string;
  state: ProjectStatePayload;
  saveStatus?: PromptPackSaveStatus;
  onSaveNow?: () => void;
};

type ExportItem = { kind: ProExportKind; label: string; hint: string };

const ALSO_EXPORT_ITEMS: ExportItem[] = [
  {
    kind: "fountain",
    label: "Fountain (.fountain)",
    hint: "Screenplay + shot list for Final Draft / Highland",
  },
  {
    kind: "fdx",
    label: "Final Draft (.fdx)",
    hint: "Native XML with scene headings and shot notes",
  },
  {
    kind: "storyboard-html",
    label: "Storyboard HTML",
    hint: "Open in browser → Print to PDF",
  },
  {
    kind: "storyboard-md",
    label: "Storyboard Markdown",
    hint: "One panel per shot for Notion",
  },
];

const PREP_EXPORT_ITEMS: ExportItem[] = [
  {
    kind: "preproduction-report",
    label: "Pre-production report",
    hint: "Full Markdown — scenes, shots, locations, budget",
  },
  {
    kind: "directors-prep-md",
    label: "Prep summary Markdown",
    hint: "Formatted packet for Notion or email",
  },
  {
    kind: "directors-prep",
    label: "Prep summary CSV",
    hint: "Rules + scene rows (approved scenes)",
  },
];

const PRODUCTION_EXPORT_ITEMS: ExportItem[] = [
  {
    kind: "shot-plan",
    label: "Shot plan CSV",
    hint: "Every shot — camera, lighting, ref URL",
  },
  {
    kind: "kit",
    label: "Kit CSV",
    hint: "Tools, ranks, prices, links",
  },
  {
    kind: "budget",
    label: "Budget CSV",
    hint: "Micro/low lines and subtotals",
  },
  {
    kind: "workflow",
    label: "Workflow CSV",
    hint: "Phases, steps, suggested tools",
  },
];

const LOOK_EXPORT_ITEMS: ExportItem[] = [
  {
    kind: "visual",
    label: "Visual bible CSV",
    hint: "Design sheet, palette, checklist",
  },
  {
    kind: "location-research-md",
    label: "Location pack (Markdown)",
    hint: "Pins, scout notes, rules",
  },
  {
    kind: "location-research-csv",
    label: "Location pack CSV",
    hint: "Map queries, coordinates, rules",
  },
];

function ExportButtonGrid({
  items,
  loadingKind,
  disabled,
  errorKind,
  errorMessage,
  onDownload,
}: {
  items: ExportItem[];
  loadingKind: ProExportKind | null;
  disabled: boolean;
  errorKind: ProExportKind | null;
  errorMessage: string | null;
  onDownload: (kind: ProExportKind, label: string) => void;
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((ex) => {
        const busy = loadingKind === ex.kind;
        return (
          <li key={ex.kind}>
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => onDownload(ex.kind, ex.label)}
              className="flex w-full flex-col rounded-xl border border-white/[0.08] bg-pro-muted px-3 py-2.5 text-left transition hover:border-white/[0.1] hover:bg-pro-elevated disabled:cursor-wait disabled:opacity-60"
            >
              <span className="flex items-center gap-2 font-medium text-pro-text">
                {busy ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-pro-text-secondary" aria-hidden />
                ) : (
                  <Download className="size-3.5 shrink-0 text-pro-text-secondary" aria-hidden />
                )}
                {ex.label}
              </span>
              <span className="mt-1 text-xs leading-snug text-pro-text-secondary">{ex.hint}</span>
              {errorKind === ex.kind && errorMessage ? (
                <span className="mt-1.5 text-xs font-medium text-red-300/90" role="alert">
                  {errorMessage}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center gap-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-pro-text-secondary transition hover:text-pro-text-secondary"
        aria-expanded={open}
      >
        <ChevronDown
          className={`size-4 shrink-0 transition ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        />
        {title}
      </button>
      {open ? <div className="mt-2">{children}</div> : null}
    </section>
  );
}

export function ProExportPanel({ projectId, projectName, state, saveStatus, onSaveNow }: Props) {
  const { showToast } = useProToast();
  const [loadingKind, setLoadingKind] = useState<ProExportKind | null>(null);
  const [exportError, setExportError] = useState<{ kind: ProExportKind; message: string } | null>(
    null
  );
  const scriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);

  async function downloadExport(kind: ProExportKind, label: string) {
    setLoadingKind(kind);
    setExportError(null);
    try {
      await downloadProExport(projectId, kind, projectName);
      showToast({ message: `Downloaded ${label}`, variant: "success" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Download failed.";
      setExportError({ kind, message });
      showToast({ message, variant: "error" });
    } finally {
      setLoadingKind(null);
    }
  }

  const gridProps = {
    loadingKind,
    disabled: loadingKind != null,
    errorKind: exportError?.kind ?? null,
    errorMessage: exportError?.message ?? null,
    onDownload: (kind: ProExportKind, label: string) => {
      void downloadExport(kind, label);
    },
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-pro-text">Export</h2>
        <p className="mt-1 max-w-2xl text-sm text-pro-text-secondary">
          Canonical download hub — get your prompt pack here when you&apos;re done. Prompts and Prep
          link here; secondary formats are below.
        </p>
      </header>

      <PromptPackDeliverable
        projectId={projectId}
        projectName={projectName}
        saveStatus={saveStatus}
        onSaveNow={onSaveNow}
        onSuccess={(message) => showToast({ message, variant: "success" })}
        onError={(message) => {
          setExportError({ kind: "prompt-pack-md", message });
          showToast({ message, variant: "error" });
        }}
      />
      {exportError?.kind === "prompt-pack-md" ? (
        <p className="text-xs font-medium text-red-300/90" role="alert">
          {exportError.message}
        </p>
      ) : null}

      <div className="rounded-2xl border border-white/[0.08] bg-pro-surface p-4 sm:p-5">
        <div className="space-y-5">
          <CollapsibleSection title="Also export…">
            <ExportButtonGrid items={ALSO_EXPORT_ITEMS} {...gridProps} />
          </CollapsibleSection>

          {!scriptToPrompt ? (
            <CollapsibleSection title="Prep & script files">
              <ExportButtonGrid items={PREP_EXPORT_ITEMS} {...gridProps} />
            </CollapsibleSection>
          ) : (
            <CollapsibleSection title="Prep summary">
              <ExportButtonGrid
                items={PREP_EXPORT_ITEMS.filter((i) => i.kind === "preproduction-report")}
                {...gridProps}
              />
            </CollapsibleSection>
          )}

          {!scriptToPrompt ? (
            <CollapsibleSection title="Production & kit">
              <ExportButtonGrid items={PRODUCTION_EXPORT_ITEMS} {...gridProps} />
            </CollapsibleSection>
          ) : (
            <CollapsibleSection title="Kit & planning">
              <ExportButtonGrid
                items={PRODUCTION_EXPORT_ITEMS.filter((i) => i.kind !== "shot-plan")}
                {...gridProps}
              />
            </CollapsibleSection>
          )}

          <CollapsibleSection title="Look & locations">
            <ExportButtonGrid items={LOOK_EXPORT_ITEMS} {...gridProps} />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
