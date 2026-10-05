import type { MetadataRoute } from "next";
import { allTools } from "@/app/data";
import { CATALOG_PATHS, catalogToolPath } from "@/lib/catalog-routes";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  const pages: MetadataRoute.Sitemap = [
    CATALOG_PATHS.home,
    CATALOG_PATHS.tools,
    CATALOG_PATHS.workflows,
    CATALOG_PATHS.budgetTemplates,
    CATALOG_PATHS.kit,
    CATALOG_PATHS.about,
    "/pro",
    "/pro/about",
    "/pro/privacy",
    "/pro/terms",
  ].map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === CATALOG_PATHS.tools || path === CATALOG_PATHS.home ? "weekly" : "monthly",
    priority: path === CATALOG_PATHS.home ? 1 : path === CATALOG_PATHS.tools ? 0.9 : 0.7,
  }));

  const tools: MetadataRoute.Sitemap = allTools.map((tool) => ({
    url: `${base}${catalogToolPath(tool)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...pages, ...tools];
}
