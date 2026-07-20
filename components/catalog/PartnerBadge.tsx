"use client";

import Image from "next/image";
import { allTools, getToolByRank, type Tool } from "@/app/data";

type ToolLike = Partial<Tool> & { catalogRank?: number; name?: string };

function resolvePartnerLogo(tool: ToolLike): string | undefined {
  if (tool.partnerLogo?.trim()) return tool.partnerLogo.trim();
  if (typeof tool.catalogRank === "number") {
    return getToolByRank(tool.catalogRank)?.partnerLogo?.trim();
  }
  if (tool.name) {
    return allTools.find((t) => t.name === tool.name)?.partnerLogo?.trim();
  }
  if (typeof tool.rank === "number") {
    return getToolByRank(tool.rank)?.partnerLogo?.trim();
  }
  return undefined;
}

type Props = {
  tool: ToolLike;
  /** Mobile / inline “Partner link” style */
  compact?: boolean;
};

export function PartnerBadge({ tool, compact = false }: Props) {
  const logo = resolvePartnerLogo(tool);
  const name = tool.name ?? "Partner";

  const className = compact
    ? "inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-950/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300"
    : "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-950/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200";

  return (
    <span className={className}>
      {logo ? (
        <Image
          src={logo}
          alt={`${name} — partner`}
          width={87}
          height={12}
          className="h-3 w-auto max-w-[5rem] object-contain object-left"
        />
      ) : (
        <span>{compact ? "Partner link" : "Partner"}</span>
      )}
    </span>
  );
}

export function resolvePartnerLogoForTool(tool: ToolLike): string | undefined {
  return resolvePartnerLogo(tool);
}
