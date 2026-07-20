"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  isPromptStyleSequenceNotes,
  parseSequenceNoteLines,
} from "@/lib/pro/format-sequence-notes";
import type { SceneRow } from "@/lib/pro/types";

const fieldClass = proSurface.field;

type Props = {
  scene?: SceneRow;
  notes: string;
  shotCount: number;
  scriptToPrompt: boolean;
  onNotesChange: (notes: string) => void;
};

export function ShotSequenceContext({
  scene,
  notes,
  shotCount,
  scriptToPrompt,
  onNotesChange,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const sceneBeat = scene?.oneLine?.trim() || "";
  const bullets = parseSequenceNoteLines(notes);
  const promptStyle = isPromptStyleSequenceNotes(notes);

  if (scriptToPrompt) {
    return (
      <div className="mb-3 rounded-xl bg-pro-muted/40 px-3 py-2.5 ring-1 ring-white/[0.06]">
        <p className="text-xs font-medium text-pro-text">Visual beats</p>
        <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">
          {shotCount} beat{shotCount === 1 ? "" : "s"} from prep — one card per generation pass.
          Copy-ready text lives in <span className="text-pro-text">Finish → Prompts</span>.
        </p>
        {sceneBeat ? (
          <p className="mt-2 text-xs text-pro-text-secondary">
            <span className="font-medium text-pro-text">Scene:</span> {sceneBeat}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mb-3 space-y-2 rounded-xl bg-pro-muted/40 px-3 py-2.5 ring-1 ring-white/[0.06]">
      <div>
        <p className="text-xs font-medium text-pro-text">Coverage plan</p>
        <p className="mt-0.5 text-[11px] text-pro-text-secondary">
          One card below = one angle (wide, medium, close-up). Generate shot plan rebuilds from Prep;
          Suggest coverage adds missing angles.
        </p>
      </div>

      {sceneBeat ? (
        <p className="text-xs leading-relaxed text-pro-text-secondary">
          <span className="font-medium text-pro-text">Scene beat:</span> {sceneBeat}
        </p>
      ) : null}

      {bullets.length > 0 && !promptStyle ? (
        <ul className="space-y-1 text-xs text-pro-text-secondary">
          {bullets.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-pro-primary" aria-hidden>
                ·
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : shotCount > 0 ? (
        <p className="text-xs text-pro-text-secondary">
          {shotCount} shot card{shotCount === 1 ? "" : "s"} in this scene — edit labels and camera
          notes on each card.
        </p>
      ) : (
        <p className="text-xs text-pro-text-secondary">
          No shots yet — use <span className="text-pro-text">Generate shot plan</span> or{" "}
          <span className="text-pro-text">Suggest coverage</span>.
        </p>
      )}

      <button
        type="button"
        className="flex items-center gap-1 text-[11px] text-pro-text-secondary hover:text-pro-text"
        onClick={() => setEditOpen((v) => !v)}
        aria-expanded={editOpen}
      >
        {editOpen ? (
          <ChevronDown className="size-3.5" aria-hidden />
        ) : (
          <ChevronRight className="size-3.5" aria-hidden />
        )}
        {editOpen ? "Hide raw notes" : "Edit coverage notes"}
      </button>

      {editOpen ? (
        <textarea
          rows={4}
          className={fieldClass}
          placeholder="One line per planned angle, e.g. Wide master — geography"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      ) : null}
    </div>
  );
}
