"use client";

import { formatDisplayHeading } from "@/lib/pro/format-display-heading";
import { PromptBeatCard } from "@/components/pro/PromptBeatCard";
import { PromptBeatRow } from "@/components/pro/PromptBeatRow";
import type { ShotSequence } from "@/lib/pro/types";
import type { PromptToolOption } from "@/lib/pro/sync-shot-prompts";

type Props = {
  seq: ShotSequence;
  seqIndex: number;
  toolOptions: PromptToolOption[];
  copiedKey: string | null;
  onToolChange: (shotIndex: number, rank: number) => void;
  onPromptChange: (shotIndex: number, text: string) => void;
  onNegativeChange: (shotIndex: number, text: string) => void;
  onCopy: (key: string, text: string, label: string) => void;
};

export function PromptSceneSection({
  seq,
  seqIndex,
  toolOptions,
  copiedKey,
  onToolChange,
  onPromptChange,
  onNegativeChange,
  onCopy,
}: Props) {
  if (seq.shots.length === 0) return null;

  const title = formatDisplayHeading(seq.title || `Sequence ${seqIndex + 1}`);

  const beatProps = (shotIndex: number) => ({
    seqIndex,
    shotIndex,
    toolOptions,
    copiedKey,
    onToolChange: (rank: number) => onToolChange(shotIndex, rank),
    onPromptChange: (text: string) => onPromptChange(shotIndex, text),
    onNegativeChange: (text: string) => onNegativeChange(shotIndex, text),
    onCopy,
  });

  return (
    <section className="overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-pro-elevated/80 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-pro-text">{title}</h3>
          {seq.sceneNumber != null ? (
            <p className="text-xs text-pro-text-secondary">Scene {seq.sceneNumber}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-pro-muted px-2.5 py-0.5 text-[10px] font-medium text-pro-text-secondary">
          {seq.shots.length} prompt{seq.shots.length === 1 ? "" : "s"}
        </span>
      </header>

      <div className="md:hidden">
        {seq.shots.map((shot, shotIndex) => (
          <PromptBeatCard key={shot.id} shot={shot} {...beatProps(shotIndex)} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-pro-surface text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">
            <tr>
              <th className="px-3 py-2">Beat</th>
              <th className="px-3 py-2">Tool</th>
              <th className="px-3 py-2">Prompt</th>
              <th className="hidden px-3 py-2 lg:table-cell">Negative</th>
            </tr>
          </thead>
          <tbody className="bg-pro-elevated">
            {seq.shots.map((shot, shotIndex) => (
              <PromptBeatRow key={shot.id} shot={shot} {...beatProps(shotIndex)} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
