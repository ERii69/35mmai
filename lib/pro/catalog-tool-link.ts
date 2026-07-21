import { getToolByRank, type Tool } from "@/app/data";

export function toAbsoluteToolUrl(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

/** Outbound URL for a catalog tool (affiliate when set). */
export function getToolOutboundUrl(tool: Tool): string {
  return (
    toAbsoluteToolUrl(tool.affiliateLink) ??
    toAbsoluteToolUrl(tool.link) ??
    "/"
  );
}

export function getToolOutboundUrlByRank(rank: number): string | null {
  const tool = getToolByRank(rank);
  if (!tool) return null;
  return getToolOutboundUrl(tool);
}

/** Free catalog home — user can search by rank in the directory. */
export function getCatalogToolReferencePath(rank: number): string {
  return `/#tool-rank-${rank}`;
}
