import type { Metadata } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand/brand-identity";
import type { Tool } from "@/app/data";

export const CATALOG_DEFAULT_TITLE = `${BRAND_NAME} – ${BRAND_TAGLINE}`;
export const CATALOG_DEFAULT_DESCRIPTION =
  "Plan gear and post with mostly AI-first tools and retailer picks built for independent filmmakers from script to screen.";

export function catalogPageTitle(page: string): string {
  return `${page} — ${BRAND_NAME}`;
}

export function toolPageTitle(tool: Tool): string {
  return `${tool.name} — ${BRAND_NAME} catalog`;
}

export function toolPageDescription(tool: Tool): string {
  const source = (tool.shortDescription || tool.helps || CATALOG_DEFAULT_DESCRIPTION)
    .replace(/\s+/g, " ")
    .trim();
  if (source.length <= 160) return source;
  return `${source.slice(0, 157).trimEnd()}...`;
}

export function catalogRouteMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.path,
      type: "website",
      siteName: BRAND_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}
