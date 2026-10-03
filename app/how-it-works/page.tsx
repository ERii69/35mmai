import { CatalogApp } from "@/components/catalog/CatalogApp";
import { catalogPageTitle, catalogRouteMetadata } from "@/lib/catalog-metadata";
import { CATALOG_PATHS } from "@/lib/catalog-routes";

export const metadata = catalogRouteMetadata({
  title: catalogPageTitle("How it works"),
  description:
    "A first pass through 35mmAi: pick your production lane, move stage by stage, and keep a lean 3–5 tool kit.",
  path: CATALOG_PATHS.howItWorks,
});

export default function HowItWorksPage() {
  return <CatalogApp initialPath={CATALOG_PATHS.howItWorks} />;
}
