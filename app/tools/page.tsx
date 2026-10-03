import { CatalogApp } from "@/components/catalog/CatalogApp";
import { catalogPageTitle, catalogRouteMetadata } from "@/lib/catalog-metadata";
import { CATALOG_PATHS } from "@/lib/catalog-routes";

export const metadata = catalogRouteMetadata({
  title: catalogPageTitle("All Tools"),
  description:
    "Browse the 35mmAi catalog of AI-first filmmaking tools, hardware, and retailer picks. Filter by role, budget, and production stage.",
  path: CATALOG_PATHS.tools,
});

export default function ToolsPage() {
  return <CatalogApp initialPath={CATALOG_PATHS.tools} />;
}
