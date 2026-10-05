"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAudioPromptTool } from "@/lib/pro/build-shot-tool-prompt";
import { getToolOutboundUrlByRank } from "@/lib/pro/catalog-tool-link";
import { formatShotNumber } from "@/lib/pro/shot-plan";
import { toolSuggestionForShot } from "@/lib/pro/sync-shot-prompts";
import type { PlannedShot, PromptJob } from "@/lib/pro/types";
import type { PromptToolOption } from "@/lib/pro/sync-shot-prompts";

type Props = {
  shot: PlannedShot;
  seqIndex: number;
  shotIndex: number;
  toolOptions: PromptToolOption[];
  copiedKey: string | null;
  onToolChange: (rank: number) => void;
  onSentenceChange: (text: string) => void;
  onPromptChange: (text: string) => void;
  toolShapeKnown: (rank: number) => boolean;
  onToolShape: (rank: number, job: PromptJob) => void;
  onNegativeChange: (text: string) => void;
  onCopy: (key: string, text: string, label: string) => void;
};

export function PromptBeatRow({
  shot,
  seqIndex,
  shotIndex,
  toolOptions,
  copiedKey,
  onToolChange,
  onSentenceChange,
  onPromptChange,
  toolShapeKnown,
  onToolShape,
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
  const showSuggestedBadge = toolRank === suggestion.rank;

  return (
    <tr className="border-t border-white/[0.06] align-top hover:bg-white/[0.02]">
      <td className="px-3 py-3">
        <p className="text-xs font-semibold text-pro-text">{shotNum}</p>
        <p className="mt-0.5 text-[10px] capitalize text-pro-text-secondary">
          {shot.shotType.replace(/_/g, " ")}
        </p>
        <label className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">
          Your sentence
          <textarea
            rows={3}
            aria-label={`Frame sentence for beat ${shotNum}`}
            className="mt-1 w-full min-w-[10rem] rounded-lg border border-white/10 bg-pro-muted px-2 py-1.5 text-xs normal-case tracking-normal text-pro-text"
            value={shot.frameSentence ?? ""}
            onChange={(e) => onSentenceChange(e.target.value)}
          />
        </label>
      </td>
      <td className="px-3 py-3">
        <select
          aria-label={`Tool for beat ${shotNum}`}
          className="w-full min-w-[8.5rem] rounded-lg border border-white/10 bg-pro-muted px-2 py-1.5 text-xs text-pro-text"
          value={toolRank}
          onChange={(e) => onToolChange(Number(e.target.value))}
        >
          <optgroup label="Suggested">
            {toolOptions
              .filter((t) => t.suggested)
              .map((t) => (
                <option key={t.rank} value={t.rank}>
                  {t.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="Other visual tools">
            {toolOptions
              .filter((t) => !t.suggested)
              .map((t) => (
                <option key={t.rank} value={t.rank}>
                  {t.name}
                </option>
              ))}
          </optgroup>
        </select>
        {!toolShapeKnown(toolRank) ? (
          <label className="mt-1 block text-[10px] text-pro-text-secondary">
            What do you paste here?
            <select
              aria-label={`Prompt shape for beat ${shotNum}`}
              className="mt-1 w-full rounded-lg border border-white/10 bg-pro-muted px-2 py-1 text-xs text-pro-text"
              defaultValue=""
              onChange={(e) => {
                const job = e.target.value as PromptJob;
                if (!job) return;
                onToolShape(toolRank, job);
                onToolChange(toolRank);
              }}
            >
              <option value="" disabled>
                Choose
              </option>
              <option value="still">A still</option>
              <option value="edit">An edit</option>
              <option value="move">A move</option>
              <option value="scene">A scene</option>
              <option value="grade">Camera and grade</option>
            </select>
          </label>
        ) : null}
        {showSuggestedBadge ? (
          <p className="mt-1 text-[10px] text-emerald-400/90">{suggestion.reason}</p>
        ) : (
          <p className="mt-1 text-[10px] text-pro-text-secondary">Override</p>
        )}
        {tool ? (
          <a
            href={getToolOutboundUrlByRank(tool.rank) ?? "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-pro-primary hover:underline"
          >
            Open tool
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : null}
      </td>
      <td className="px-3 py-3">
        <textarea
          rows={4}
          aria-label={`Prompt for beat ${shotNum}`}
          className="w-full min-w-[12rem] rounded-lg border border-white/10 bg-pro-muted px-2 py-1.5 font-mono text-[11px] leading-relaxed text-pro-text"
          value={shot.aiGenerationPrompt ?? ""}
          onChange={(e) => onPromptChange(e.target.value)}
        />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-11 min-h-11 border-white/10 px-3 text-xs text-pro-text touch-manipulation"
            aria-label={`Copy prompt for beat ${shotNum}`}
            onClick={() => void onCopy(promptKey, shot.aiGenerationPrompt ?? "", "Prompt")}
          >
            {copiedKey === promptKey ? (
              <Check className="mr-1 size-3 text-emerald-400" aria-hidden />
            ) : (
              <Copy className="mr-1 size-3" aria-hidden />
            )}
            Copy
          </Button>
        </div>
        {!audioTool ? (
          <div className="mt-3 border-t border-white/[0.06] pt-3 lg:hidden">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">
              Negative
            </p>
            <textarea
              rows={2}
              aria-label={`Negative prompt for beat ${shotNum}`}
              className="w-full rounded-lg border border-white/10 bg-pro-muted px-2 py-1.5 font-mono text-[11px] leading-relaxed text-pro-text-secondary"
              value={shot.aiNegativePrompt ?? ""}
              onChange={(e) => onNegativeChange(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-1.5 h-11 min-h-11 border-white/10 px-3 text-xs text-pro-text-secondary touch-manipulation"
              aria-label={`Copy negative prompt for beat ${shotNum}`}
              onClick={() => void onCopy(negKey, shot.aiNegativePrompt ?? "", "Negative")}
            >
              {copiedKey === negKey ? (
                <Check className="mr-1 size-3 text-emerald-400" aria-hidden />
              ) : (
                <Copy className="mr-1 size-3" aria-hidden />
              )}
              Copy neg
            </Button>
          </div>
        ) : null}
      </td>
      <td className="hidden px-3 py-3 lg:table-cell">
        {audioTool ? (
          <p className="text-[10px] text-pro-text-secondary">N/A — voice tool</p>
        ) : (
          <>
            <textarea
              rows={3}
              aria-label={`Negative prompt for beat ${shotNum}`}
              className="w-full min-w-[10rem] rounded-lg border border-white/10 bg-pro-muted px-2 py-1.5 font-mono text-[11px] leading-relaxed text-pro-text-secondary"
              value={shot.aiNegativePrompt ?? ""}
              onChange={(e) => onNegativeChange(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-1.5 h-11 min-h-11 border-white/10 px-3 text-xs text-pro-text-secondary touch-manipulation"
              aria-label={`Copy negative prompt for beat ${shotNum}`}
              onClick={() => void onCopy(negKey, shot.aiNegativePrompt ?? "", "Negative")}
            >
              {copiedKey === negKey ? (
                <Check className="mr-1 size-3 text-emerald-400" aria-hidden />
              ) : (
                <Copy className="mr-1 size-3" aria-hidden />
              )}
              Copy neg
            </Button>
          </>
        )}
      </td>
    </tr>
  );
}
