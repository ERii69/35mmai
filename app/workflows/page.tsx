import { CatalogApp } from "@/components/catalog/CatalogApp";
import { catalogPageTitle, catalogRouteMetadata } from "@/lib/catalog-metadata";
import { CATALOG_PATHS } from "@/lib/catalog-routes";
import { WORKFLOWS_LABEL } from "@/lib/catalog-labels";

export const metadata = catalogRouteMetadata({
  title: catalogPageTitle(WORKFLOWS_LABEL),
  description:
    "Move through pre-production, production, and post with a stage-by-stage filmmaker workflow and matching catalog tools.",
  path: CATALOG_PATHS.workflows,
});

export default function WorkflowsPage() {
  return <CatalogApp initialPath={CATALOG_PATHS.workflows} />;
}
