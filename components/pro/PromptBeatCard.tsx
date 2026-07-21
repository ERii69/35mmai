"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAudioPromptTool } from "@/lib/pro/build-shot-tool-prompt";
import { getToolOutboundUrlByRank } from "@/lib/pro/catalog-tool-link";
import { formatShotNumber } from "@/lib/pro/shot-plan";
import { toolSuggestionForShot } from "@/lib/pro/sync-shot-prompts";
import type { PlannedShot } from "@/lib/pro/types";
import type { PromptToolOption } from "@/lib/pro/sync-shot-prompts";

type Props = {
  shot: PlannedShot;
  seqIndex: number;
  shotIndex: number;
  toolOptions: PromptToolOption[];
  copiedKey: string | null;
  onToolChange: (rank: number) => void;
  onPromptChange: (text: string) => void;
  onNegativeChange: (text: string) => void;
  onCopy: (key: string, text: string, label: string) => void;
};

/** Stacked beat editor for mobile — avoids wide table horizontal scroll. */
export function PromptBeatCard({
  shot,
  seqIndex,
  shotIndex,
  toolOptions,
  copiedKey,
  onToolChange,
  onPromptChange,
  onNegativeChange,
  onCopy,
}: Props) {
  const toolRank = shot.recommendedToolRank ?? 6;
  const tool = toolOptions.find((t) => t.rank === toolRank);
  const suggestion = toolSuggestionForShot(shot);
  const audioTool = isAudioPromptTool(toolRank);
  const shotNum = formatShotNumber(seqIndex, shotIndex);
  const promptKey = `${seqIndex}-${shotIndex}-prompt`;
  const negKey = `${seqIndex}-${shotIndex}-neg`;

  return (
    <article className="space-y-3 border-t border-white/[0.06] bg-pro-elevated p-4 first:border-t-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-pro-text">{shotNum}</p>
          <p className="mt-0.5 text-[10px] capitalize text-pro-text-secondary">
            {shot.shotType.replace(/_/g, " ")}
          </p>
        </div>
        {toolRank === suggestion.rank ? (
          <span className="text-[10px] text-emerald-400/90">{suggestion.reason}</span>
        ) : null}
      </div>

      <label className="block text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">
        Tool
        <select
          className="mt-1 w-full rounded-lg border border-white/10 bg-pro-surface px-2 py-2.5 text-sm text-pro-text"
          value={toolRank}
          onChange={(e) => onToolChange(Number(e.target.value))}
        >
          {toolOptions.map((t) => (
            <option key={t.rank} value={t.rank}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      {tool ? (
        <a
          href={getToolOutboundUrlByRank(tool.rank) ?? "/"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-pro-primary hover:underline"
        >
          Open {tool.name}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      ) : null}

      <label className="block text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">
        Prompt
        <textarea
          rows={4}
          className="mt-1 w-full rounded-lg border border-white/10 bg-pro-surface px-2 py-2 font-mono text-[11px] leading-relaxed text-pro-text"
          value={shot.aiGenerationPrompt ?? ""}
          onChange={(e) => onPromptChange(e.target.value)}
        />
      </label>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-11 min-h-11 border-white/10 px-3 text-xs text-pro-text touch-manipulation"
        onClick={() => void onCopy(promptKey, shot.aiGenerationPrompt ?? "", "Prompt")}
      >
        {copiedKey === promptKey ? (
          <Check className="mr-1.5 size-3.5 text-emerald-400" aria-hidden />
        ) : (
          <Copy className="mr-1.5 size-3.5" aria-hidden />
        )}
        Copy prompt
      </Button>

      {!audioTool ? (
        <>
          <label className="block text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">
            Negative
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-white/10 bg-pro-surface px-2 py-2 font-mono text-[11px] leading-relaxed text-pro-text-secondary"
              value={shot.aiNegativePrompt ?? ""}
              onChange={(e) => onNegativeChange(e.target.value)}
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-11 min-h-11 border-white/10 px-3 text-xs text-pro-text-secondary touch-manipulation"
            onClick={() => void onCopy(negKey, shot.aiNegativePrompt ?? "", "Negative")}
          >
            {copiedKey === negKey ? (
              <Check className="mr-1.5 size-3.5 text-emerald-400" aria-hidden />
            ) : (
              <Copy className="mr-1.5 size-3.5" aria-hidden />
            )}
            Copy negative
          </Button>
        </>
      ) : (
        <p className="text-xs text-pro-text-secondary">Negative N/A — voice tool</p>
      )}
    </article>
  );
}
