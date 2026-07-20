/** Workspace nav target: current project in workspace, else default / last opened. */
export function resolveWorkspaceNavHref(
  currentProjectId: string | null,
  defaultProjectId: string | null
): string | null {
  const id = currentProjectId ?? defaultProjectId;
  return id ? `/pro/app/workspace/${id}` : null;
}
