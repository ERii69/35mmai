"use client";

import { ProProjectProgressChips } from "@/components/pro/ProProjectProgressChips";

type Props = {
  approvedScenes: number;
  percentComplete: number;
  totalShots: number;
  promptsReady?: number;
  totalPromptSlots?: number;
  hasScript?: boolean;
  hasLook?: boolean;
  scriptToPrompt?: boolean;
  summaryLine?: string;
};

export function ProProjectCardStatsDesktop({
  approvedScenes,
  percentComplete,
  totalShots,
  promptsReady = 0,
  totalPromptSlots = 0,
  hasScript = false,
  hasLook = false,
  scriptToPrompt = false,
  summaryLine,
}: Props) {
  return (
    <div className="mt-3 space-y-1.5">
      <ProProjectProgressChips
        scriptDone={hasScript}
        lookDone={hasLook}
        promptsReady={promptsReady}
        totalPrompts={totalPromptSlots}
        approvedScenes={approvedScenes}
        totalShots={totalShots}
        percentComplete={percentComplete}
        scriptToPrompt={scriptToPrompt}
      />
      {summaryLine ? (
        <p className="text-[11px] text-pro-text-secondary">{summaryLine}</p>
      ) : null}
    </div>
  );
}
