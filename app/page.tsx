import { CatalogApp } from "@/components/catalog/CatalogApp";
import {
  CATALOG_DEFAULT_DESCRIPTION,
  CATALOG_DEFAULT_TITLE,
  catalogRouteMetadata,
} from "@/lib/catalog-metadata";
import { CATALOG_PATHS } from "@/lib/catalog-routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = catalogRouteMetadata({
  title: CATALOG_DEFAULT_TITLE,
  description: CATALOG_DEFAULT_DESCRIPTION,
  path: CATALOG_PATHS.home,
});

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <CatalogApp initialPath={CATALOG_PATHS.home} signedIn={Boolean(user)} />;
}
