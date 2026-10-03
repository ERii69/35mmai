import { catalogOgImage } from "@/lib/catalog-og-image";
import { toolPageDescription } from "@/lib/catalog-metadata";
import { getToolBySlug } from "@/lib/catalog-routes";

export const alt = "35mmAi catalog tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ToolOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  return catalogOgImage({
    kicker: "35mmAi catalog",
    title: tool?.name ?? "Tool not found",
    subtitle: tool ? toolPageDescription(tool) : "This listing is not in the current catalog.",
  });
}
