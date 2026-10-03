import { CatalogApp } from "@/components/catalog/CatalogApp";
import { catalogPageTitle, catalogRouteMetadata } from "@/lib/catalog-metadata";
import { CATALOG_PATHS } from "@/lib/catalog-routes";

export const metadata = catalogRouteMetadata({
  title: catalogPageTitle("My Kit"),
  description: "Your saved 35mmAi shortlist — the tools you actually plan to run on this production.",
  path: CATALOG_PATHS.kit,
});

export default function KitPage() {
  return <CatalogApp initialPath={CATALOG_PATHS.kit} />;
}
