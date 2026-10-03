import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogApp } from "@/components/catalog/CatalogApp";
import { catalogRouteMetadata, toolPageDescription, toolPageTitle } from "@/lib/catalog-metadata";
import { catalogToolPath, getToolBySlug, listCatalogToolSlugs } from "@/lib/catalog-routes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listCatalogToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return catalogRouteMetadata({
    title: toolPageTitle(tool),
    description: toolPageDescription(tool),
    path: catalogToolPath(tool),
  });
}

export default async function CatalogToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return <CatalogApp initialPath={catalogToolPath(tool)} />;
}
