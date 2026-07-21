"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { downloadProExport } from "@/lib/pro/download-pro-export";
import type { ProExportKind } from "@/lib/pro/export-csv";
import { useProToast } from "@/components/pro/ux/ProToastProvider";

type Props = {
  projectId: string;
  projectName: string;
  kind: ProExportKind;
  label: string;
  className?: string;
  successMessage?: string;
  includeDrafts?: boolean;
};

/** In-app export download with loading + error toast (avoids raw /api/pro/export links). */
export function ProExportDownloadButton({
  projectId,
  projectName,
  kind,
  label,
  className = "inline-flex items-center rounded-lg bg-pro-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50",
  successMessage,
  includeDrafts = false,
}: Props) {
  const { showToast } = useProToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await downloadProExport(projectId, kind, projectName, { includeDrafts });
      showToast({
        message: successMessage ?? `${label} downloaded.`,
        variant: "success",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Download failed.";
      setError(message);
      showToast({ message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button type="button" className={className} disabled={loading} onClick={() => void handleClick()}>
        {loading ? <Loader2 className="mr-2 inline size-4 animate-spin" aria-hidden /> : null}
        {loading ? "Downloading…" : label}
      </button>
      {error ? (
        <span className="text-xs font-medium text-red-300/90" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
