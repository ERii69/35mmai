import { CatalogApp } from "@/components/catalog/CatalogApp";
import { catalogPageTitle, catalogRouteMetadata } from "@/lib/catalog-metadata";
import { CATALOG_PATHS } from "@/lib/catalog-routes";
import { BUDGET_PATH_FEATURE, BUDGET_PATH_MICRO, BUDGET_TEMPLATES_LABEL } from "@/lib/catalog-labels";

export const metadata = catalogRouteMetadata({
  title: catalogPageTitle(BUDGET_TEMPLATES_LABEL),
  description:
    `${BUDGET_PATH_MICRO} and ${BUDGET_PATH_FEATURE} templates that pull tools from My Kit so you can plan spend next to the catalog.`,
  path: CATALOG_PATHS.budgetTemplates,
});

export default function BudgetTemplatesPage() {
  return <CatalogApp initialPath={CATALOG_PATHS.budgetTemplates} />;
}
