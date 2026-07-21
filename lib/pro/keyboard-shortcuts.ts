/** Human-readable shortcut labels (Mac-style; Ctrl shown on Windows in tooltips). */

export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return true;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform ?? navigator.userAgent);
}

export function modKeyLabel(): string {
  return isMacPlatform() ? "⌘" : "Ctrl";
}

export type ProShortcutId =
  | "run_prep"
  | "cancel_prep"
  | "generate_shot_plan"
  | "save_project";

const SHORTCUTS: Record<
  ProShortcutId,
  { keys: string[]; label: string; description: string }
> = {
  run_prep: {
    keys: ["mod", "Enter"],
    label: "Run prep",
    description: "Start prep from the Generate tab",
  },
  cancel_prep: {
    keys: ["Escape"],
    label: "Cancel prep",
    description: "Stop an in-progress agent run",
  },
  generate_shot_plan: {
    keys: ["mod", "shift", "G"],
    label: "Generate shot plan",
    description: "AI shot planner on Production → Shots",
  },
  save_project: {
    keys: ["mod", "S"],
    label: "Save",
    description: "Autosave runs after edits; manual save coming soon",
  },
};

export function getShortcut(id: ProShortcutId) {
  return SHORTCUTS[id];
}

export function formatShortcutKeys(keys: string[]): string {
  const mod = modKeyLabel();
  return keys
    .map((k) => {
      if (k === "mod") return mod;
      if (k === "shift") return "⇧";
      if (k === "Enter") return "↵";
      if (k === "Escape") return "Esc";
      return k.length === 1 ? k.toUpperCase() : k;
    })
    .join(isMacPlatform() ? "" : "+");
}

export function formatShortcutDisplay(id: ProShortcutId): string {
  return formatShortcutKeys(SHORTCUTS[id].keys);
}
