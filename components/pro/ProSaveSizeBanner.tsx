"use client";

import { Button } from "@/components/ui/button";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import {
  analyzeProjectStateSize,
  projectStateSaveSizeAction,
  projectStateSizeBreakdownLines,
  slimProjectStateForPersistence,
} from "@/lib/pro/slim-project-state";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  message: string;
  state: ProjectStatePayload;
  onDismiss: () => void;
  onAddToProject: () => void;
  onSaveNow: () => void;
};

export function ProSaveSizeBanner({
  message,
  state,
  onDismiss,
  onAddToProject,
  onSaveNow,
}: Props) {
  const slimmed = slimProjectStateForPersistence(state);
  const breakdown = analyzeProjectStateSize(slimmed);
  const lines = projectStateSizeBreakdownLines(breakdown);
  const action = projectStateSaveSizeAction(breakdown);

  return (
    <div className="space-y-2">
      <ProStatusBanner variant="error" message={message} onDismiss={onDismiss} />
      <div className="rounded-lg border border-pro-warning/25 bg-pro-warning/10 px-3 py-2.5 text-sm text-pro-warning">
        <p className="font-medium text-pro-warning">Save size breakdown</p>
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs leading-relaxed text-pro-warning/80">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {action.kind === "add-to-project" ? (
            <Button
              type="button"
              size="sm"
              className="bg-pro-primary hover:brightness-110"
              onClick={onAddToProject}
            >
              Add to project to shrink
            </Button>
          ) : null}
          {action.kind === "compress-photos" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-pro-warning/30 text-pro-warning hover:bg-pro-warning/15"
              onClick={onSaveNow}
            >
              Save now (auto-compress photos)
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
