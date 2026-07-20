/** G-then-X navigation shortcuts — keep display and handler in sync. */

export type ProNavSequenceId = "dashboard" | "workspace" | "exports" | "archives";

export const PRO_NAV_SEQUENCE_SHORTCUTS: {
  id: ProNavSequenceId;
  secondKey: string;
  label: string;
}[] = [
  { id: "dashboard", secondKey: "d", label: "Dashboard" },
  { id: "workspace", secondKey: "w", label: "Workspace" },
  { id: "exports", secondKey: "e", label: "Finish → Export" },
  { id: "archives", secondKey: "a", label: "Archives" },
];

export const PRO_NAV_SEQUENCE_PREFIX = "g";

export function resolveNavSequenceHref(
  id: ProNavSequenceId,
  hrefs: {
    workspace: string | null;
    exports: string | null;
  }
): string | null {
  switch (id) {
    case "dashboard":
      return "/pro/app";
    case "workspace":
      return hrefs.workspace;
    case "exports":
      return hrefs.exports;
    case "archives":
      return "/pro/app/archives";
  }
}
