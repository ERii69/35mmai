import { catalogOgImage } from "@/lib/catalog-og-image";
import { CATALOG_DEFAULT_DESCRIPTION } from "@/lib/catalog-metadata";

export const alt = "35mmAi — Filmmaker's AI Workspace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return catalogOgImage({
    title: "Cut costs. Elevate your film.",
    subtitle: CATALOG_DEFAULT_DESCRIPTION,
  });
}
