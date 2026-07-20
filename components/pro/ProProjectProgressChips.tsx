"use client";

type Props = {
  scriptDone: boolean;
  lookDone: boolean;
  promptsReady: number;
  totalPrompts: number;
  approvedScenes?: number;
  totalShots?: number;
  percentComplete?: number;
  scriptToPrompt?: boolean;
  className?: string;
};

function Chip({
  label,
  done,
  detail,
}: {
  label: string;
  done: boolean;
  detail?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        done
          ? "bg-pro-success/15 text-pro-success ring-1 ring-pro-success/25"
          : "bg-pro-muted/80 text-pro-text-secondary ring-1 ring-white/[0.06]"
      }`}
    >
      {label}
      {done ? <span aria-hidden>✓</span> : null}
      {detail ? <span className="font-normal text-pro-text-secondary/90">{detail}</span> : null}
    </span>
  );
}

export function ProProjectProgressChips({
  scriptDone,
  lookDone,
  promptsReady,
  totalPrompts,
  approvedScenes = 0,
  totalShots = 0,
  percentComplete = 0,
  scriptToPrompt = true,
  className = "",
}: Props) {
  if (scriptToPrompt) {
    const promptLabel =
      totalPrompts > 0 ? `${promptsReady}/${totalPrompts} prompts` : `${promptsReady} prompts`;

    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        <Chip label="Script" done={scriptDone} />
        <span className="text-[10px] text-pro-text-secondary/50" aria-hidden>
          ·
        </span>
        <Chip label="Look" done={lookDone} />
        <span className="text-[10px] text-pro-text-secondary/50" aria-hidden>
          ·
        </span>
        <Chip label={promptLabel} done={totalPrompts > 0 && promptsReady >= totalPrompts} />
      </div>
    );
  }

  const sceneLabel = approvedScenes === 1 ? "1 scene" : `${approvedScenes} scenes`;
  const shotLabel = totalShots === 1 ? "1 shot" : `${totalShots} shots`;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <Chip label="Script" done={scriptDone} />
      <span className="text-[10px] text-pro-text-secondary/50" aria-hidden>
        ·
      </span>
      <Chip label={sceneLabel} done={approvedScenes > 0} />
      <span className="text-[10px] text-pro-text-secondary/50" aria-hidden>
        ·
      </span>
      <Chip
        label={shotLabel}
        done={totalShots > 0}
        detail={percentComplete > 0 ? `${percentComplete}%` : undefined}
      />
    </div>
  );
}
