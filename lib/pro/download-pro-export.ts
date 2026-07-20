"use client";

import type { ProExportKind } from "@/lib/pro/export-csv";

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) return quoted[1];
  const plain = /filename=([^;\s]+)/i.exec(header);
  return plain?.[1]?.trim() ?? null;
}

export async function fetchProExportText(
  projectId: string,
  kind: ProExportKind
): Promise<{ text: string; filename: string }> {
  const res = await fetch(`/api/pro/export/${projectId}/${kind}`, {
    credentials: "include",
  });
  if (!res.ok) {
    let message = `Could not download (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* binary or empty body */
    }
    throw new Error(message);
  }

  const text = await res.text();
  const filename =
    filenameFromDisposition(res.headers.get("Content-Disposition")) ??
    `${projectId}-${kind}`;

  return { text, filename };
}

export async function downloadProExport(
  projectId: string,
  kind: ProExportKind,
  projectName: string,
  options?: { includeDrafts?: boolean }
): Promise<string> {
  const qs = options?.includeDrafts ? "?includeDrafts=1" : "";
  const res = await fetch(`/api/pro/export/${projectId}/${kind}${qs}`, {
    credentials: "include",
  });
  if (!res.ok) {
    let message = `Could not download (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* binary or empty body */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const filename =
    filenameFromDisposition(res.headers.get("Content-Disposition")) ??
    `${projectName}-${kind}`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return filename;
}

export async function copyProExport(
  projectId: string,
  kind: ProExportKind
): Promise<string> {
  const { text } = await fetchProExportText(projectId, kind);
  await navigator.clipboard.writeText(text);
  return text;
}
