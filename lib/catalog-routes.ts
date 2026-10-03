import { allTools, type CatalogKind, type Tool } from "@/app/data";

export const CATALOG_PATHS = {
  home: "/",
  tools: "/tools",
  workflows: "/workflows",
  budgetTemplates: "/budget-templates",
  kit: "/kit",
  howItWorks: "/how-it-works",
  about: "/about",
} as const;

export const CATALOG_STEP = {
  home: 0,
  role: 1,
  roleTools: 2,
  about: 3,
  workflows: 4,
  budgetTemplates: 5,
  proTeaser: 6,
  kit: 7,
  mobileMenu: 8,
  tools: 9,
  howItWorks: 10,
} as const;

const STEP_TO_PATH: Record<number, string> = {
  [CATALOG_STEP.home]: CATALOG_PATHS.home,
  [CATALOG_STEP.about]: CATALOG_PATHS.about,
  [CATALOG_STEP.workflows]: CATALOG_PATHS.workflows,
  [CATALOG_STEP.budgetTemplates]: CATALOG_PATHS.budgetTemplates,
  [CATALOG_STEP.proTeaser]: "/pro",
  [CATALOG_STEP.kit]: CATALOG_PATHS.kit,
  [CATALOG_STEP.tools]: CATALOG_PATHS.tools,
  [CATALOG_STEP.roleTools]: CATALOG_PATHS.tools,
  [CATALOG_STEP.howItWorks]: CATALOG_PATHS.howItWorks,
};

function baseToolSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[+]/g, "-plus")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildToolSlugMaps(): {
  slugToTool: Map<string, Tool>;
  rankToSlug: Map<number, string>;
} {
  const used = new Set<string>();
  const slugToTool = new Map<string, Tool>();
  const rankToSlug = new Map<number, string>();
  const sorted = [...allTools].sort((a, b) => a.rank - b.rank);
  for (const tool of sorted) {
    let slug = baseToolSlug(tool.name) || `tool-${tool.rank}`;
    if (used.has(slug)) slug = `${slug}-${tool.rank}`;
    used.add(slug);
    slugToTool.set(slug, tool);
    rankToSlug.set(tool.rank, slug);
  }
  return { slugToTool, rankToSlug };
}

const { slugToTool: SLUG_TO_TOOL, rankToSlug: RANK_TO_SLUG } = buildToolSlugMaps();

export function getToolSlug(tool: Pick<Tool, "rank" | "name">): string {
  return RANK_TO_SLUG.get(tool.rank) ?? baseToolSlug(tool.name);
}

export function getToolBySlug(slug: string): Tool | undefined {
  let decoded = slug.trim().toLowerCase();
  try {
    decoded = decodeURIComponent(slug).trim().toLowerCase();
  } catch {
    // keep the lowercase slug if it is not URI-encoded
  }
  return SLUG_TO_TOOL.get(decoded);
}

export function catalogToolPath(tool: Pick<Tool, "rank" | "name">): string {
  return `${CATALOG_PATHS.tools}/${getToolSlug(tool)}`;
}

export function listCatalogToolSlugs(): string[] {
  return [...SLUG_TO_TOOL.keys()];
}

export function catalogPathForStep(step: number): string {
  if (step === CATALOG_STEP.mobileMenu || step === CATALOG_STEP.role) {
    return CATALOG_PATHS.home;
  }
  return STEP_TO_PATH[step] ?? CATALOG_PATHS.home;
}

/** Home path cards — real URLs so the click works even if client JS is stale. */
export function catalogBudgetPathHref(tier: "micro" | "feature"): string {
  return `${CATALOG_PATHS.home}?step=1&budget=${tier}`;
}

export function catalogWorkflowsStageHref(stageIndex: number): string {
  if (stageIndex <= 0) return CATALOG_PATHS.workflows;
  return `${CATALOG_PATHS.workflows}?stage=${stageIndex}`;
}

export function catalogToolsHref(opts?: {
  q?: string | null;
  role?: string | null;
  kind?: CatalogKind | null;
  budget?: "micro" | "feature" | null;
}): string {
  const params = new URLSearchParams();
  if (opts?.q?.trim()) params.set("q", opts.q.trim());
  if (opts?.role?.trim()) params.set("role", opts.role.trim());
  if (opts?.kind) params.set("kind", opts.kind);
  if (opts?.budget) params.set("budget", opts.budget);
  const qs = params.toString();
  return qs ? `${CATALOG_PATHS.tools}?${qs}` : CATALOG_PATHS.tools;
}

export function isCatalogToolsStep(step: number): boolean {
  return step === CATALOG_STEP.tools || step === CATALOG_STEP.roleTools;
}

export type ParsedCatalogPath = {
  step: number;
  toolSlug: string | null;
};

export function parseCatalogPathname(pathname: string): ParsedCatalogPath | null {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === CATALOG_PATHS.home) return { step: CATALOG_STEP.home, toolSlug: null };
  if (path === CATALOG_PATHS.tools) return { step: CATALOG_STEP.tools, toolSlug: null };
  if (path === CATALOG_PATHS.workflows) return { step: CATALOG_STEP.workflows, toolSlug: null };
  if (path === CATALOG_PATHS.budgetTemplates) {
    return { step: CATALOG_STEP.budgetTemplates, toolSlug: null };
  }
  if (path === CATALOG_PATHS.kit) return { step: CATALOG_STEP.kit, toolSlug: null };
  if (path === CATALOG_PATHS.howItWorks) return { step: CATALOG_STEP.howItWorks, toolSlug: null };
  if (path === CATALOG_PATHS.about) return { step: CATALOG_STEP.about, toolSlug: null };
  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    return { step: CATALOG_STEP.tools, toolSlug: toolMatch[1] };
  }
  return null;
}

export { catalogRedirectPath } from "@/lib/catalog-legacy-redirect";

export function catalogNavHref(currentStep: number, targetStep: number, toggle = false): string {
  const onTarget = isCatalogToolsStep(targetStep)
    ? isCatalogToolsStep(currentStep)
    : currentStep === targetStep;
  if (toggle && onTarget) return CATALOG_PATHS.home;
  return catalogPathForStep(targetStep);
}
