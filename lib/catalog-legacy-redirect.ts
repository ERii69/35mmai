/** Legacy `?step=` / `?view=` on `/` — keep this file free of catalog data for middleware. */

const STEP_REDIRECT: Record<number, string> = {
  0: "/",
  2: "/tools",
  3: "/about",
  4: "/workflows",
  5: "/budget-templates",
  6: "/pro",
  7: "/kit",
  9: "/tools",
  10: "/about",
};

const VIEW_REDIRECT: Record<string, string> = {
  home: "/",
  tools: "/tools",
  about: "/about",
  workflows: "/workflows",
  templates: "/budget-templates",
  kit: "/kit",
  guide: "/about",
  pro: "/pro",
};

export function catalogRedirectPath(search: {
  get: (key: string) => string | null;
}): string | null {
  const rawStep = search.get("step");
  if (rawStep !== null && rawStep !== "") {
    const n = Number.parseInt(rawStep, 10);
    if (!Number.isInteger(n)) return null;
    if (n === 1 || n === 8) return null;
    return STEP_REDIRECT[n] ?? null;
  }
  const view = search.get("view")?.trim().toLowerCase() ?? "";
  if (!view || view === "role") return null;
  return VIEW_REDIRECT[view] ?? null;
}
