"use client";

import { useCallback, useEffect, useState } from "react";

function storageKey(projectId: string, stepId: string) {
  return `pro-hint:${projectId}:${stepId}`;
}

/** Per-project, per-milestone dismiss — new milestone shows a fresh hint. */
export function useWorkspaceMilestoneHint(projectId: string, stepId: string | null) {
  /** null = not hydrated yet — avoid flashing hidden then visible. */
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!stepId) {
      setDismissed(true);
      return;
    }
    try {
      setDismissed(localStorage.getItem(storageKey(projectId, stepId)) === "1");
    } catch {
      setDismissed(false);
    }
  }, [projectId, stepId]);

  const dismiss = useCallback(() => {
    if (!stepId) return;
    try {
      localStorage.setItem(storageKey(projectId, stepId), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, [projectId, stepId]);

  return {
    dismissed: dismissed === true,
    dismiss,
    visible: Boolean(stepId) && dismissed === false,
  };
}
