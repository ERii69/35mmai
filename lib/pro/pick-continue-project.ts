import type { ProjectRow } from "@/lib/pro/types";

function pickContinueProject(projects: ProjectRow[]): string | null {
  if (projects.length === 0) return null;
  const defaultProject = projects.find((p) => p.is_default);
  if (defaultProject) return defaultProject.id;
  return projects[0]!.id;
}

/**
 * Default project id for Workspace nav and bare `/pro/app/workspace` redirect.
 * Always the pinned default; falls back to most recently opened if unset.
 */
export function pickDefaultProjectId(projects: ProjectRow[]): string | null {
  return pickContinueProject(projects);
}

/** Alias for pickDefaultProjectId. */
export function pickWorkspaceRedirectProject(projects: ProjectRow[]): string | null {
  return pickDefaultProjectId(projects);
}
