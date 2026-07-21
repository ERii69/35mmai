/** Finish → Export tab deep link in workspace. */
export const WORKSPACE_EXPORTS_HASH = "production-export";

/** Legacy hash — still honored in ProWorkspace hash sync. */
export const WORKSPACE_TEMPLATES_EXPORTS_HASH = "templates-exports";

export function workspaceHref(projectId: string): string {
  return `/pro/app/workspace/${projectId}`;
}

export function workspaceExportsHref(projectId: string): string {
  return `${workspaceHref(projectId)}#${WORKSPACE_EXPORTS_HASH}`;
}

/** Nav / dashboard deep link to download & export panel. */
export function workspaceTemplatesExportsHref(projectId: string): string {
  return workspaceExportsHref(projectId);
}
