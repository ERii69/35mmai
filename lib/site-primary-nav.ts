import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { BUDGET_TEMPLATES_LABEL, WORKFLOWS_LABEL } from "@/lib/catalog-labels";
import { CATALOG_PATHS } from "@/lib/catalog-routes";

/** Same primary links as the catalog header. Logo is separate and always goes home. */
export const SITE_PRIMARY_NAV = [
  { href: CATALOG_PATHS.home, label: "Home" },
  { href: `${CATALOG_PATHS.about}#how-it-works`, label: "How it works" },
  { href: CATALOG_PATHS.tools, label: "All Tools" },
  { href: CATALOG_PATHS.workflows, label: WORKFLOWS_LABEL },
  { href: CATALOG_PATHS.budgetTemplates, label: BUDGET_TEMPLATES_LABEL },
  { href: CATALOG_PATHS.kit, label: "My Kit" },
  { href: "/pro", label: `✨ ${BRAND_NAME_PRO}` },
  { href: CATALOG_PATHS.about, label: "About" },
] as const;

export function isSiteNavCurrent(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href;
}
