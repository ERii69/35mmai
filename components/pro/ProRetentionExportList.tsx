"use client";

import { ProExportDownloadButton } from "@/components/pro/ProExportDownloadButton";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";

type Project = {
  id: string;
  name: string;
};

const EXPORTS = [
  { kind: "prompt-pack-md" as const, label: "Prompt pack (Markdown)" },
  { kind: "prompt-pack-csv" as const, label: "Prompt pack (CSV)" },
  { kind: "directors-prep-md" as const, label: "Prep summary" },
];

export function ProRetentionExportList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-pro-text-secondary">
        No projects to export. Resubscribe to start a new workspace.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {projects.map((p) => (
        <li key={p.id} className={proSurface.card}>
          <h2 className="text-base font-semibold text-pro-text">{p.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXPORTS.map((item) => (
              <ProExportDownloadButton
                key={item.kind}
                projectId={p.id}
                projectName={p.name}
                kind={item.kind}
                label={item.label}
                className={`${proBtn.outline} inline-flex h-10 px-3 text-sm`}
              />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
