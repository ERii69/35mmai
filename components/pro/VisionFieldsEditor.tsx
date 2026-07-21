"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  CAMERA_PREFERENCE_CHIPS,
  STYLE_NOTE_CHIPS,
  TONE_REFERENCE_CHIPS,
  appendChipValue,
  suggestVisionFromGenre,
} from "@/lib/pro/vision-suggestions";
import {
  SCRIPT_TO_PROMPT_CAMERA_CHIPS,
  SCRIPT_TO_PROMPT_STYLE_CHIPS,
  SCRIPT_TO_PROMPT_TONE_CHIPS,
  suggestVisionForScriptToPrompt,
} from "@/lib/pro/script-to-prompt-template";
import type { DirectorRulesState } from "@/lib/pro/types";

const FIELD_CLASS = `${proSurface.field} mt-1.5`;

type Props = {
  rules: DirectorRulesState;
  onPatch: (fn: (prev: DirectorRulesState) => DirectorRulesState) => void;
  scriptToPrompt?: boolean;
};

export function VisionFieldsEditor({ rules, onPatch, scriptToPrompt = false }: Props) {
  function applyAiSuggestions() {
    const s = scriptToPrompt ? suggestVisionForScriptToPrompt() : suggestVisionFromGenre(rules);
    onPatch((prev) => ({
      ...prev,
      styleNotes: s.styleNotes,
      toneAndRefs: s.toneAndRefs,
      preferredShots: s.preferredShots,
    }));
  }

  const styleChips = scriptToPrompt ? SCRIPT_TO_PROMPT_STYLE_CHIPS : STYLE_NOTE_CHIPS;
  const toneChips = scriptToPrompt ? SCRIPT_TO_PROMPT_TONE_CHIPS : TONE_REFERENCE_CHIPS;
  const cameraChips = scriptToPrompt ? SCRIPT_TO_PROMPT_CAMERA_CHIPS : CAMERA_PREFERENCE_CHIPS;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-pro-text-secondary">
          {scriptToPrompt
            ? "Prompt-first look: chips add modular generation language for external tools."
            : "Tap chips to add, or use AI suggestions."}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/[0.1] text-pro-text"
          onClick={applyAiSuggestions}
        >
          <Sparkles className="mr-1.5 size-3.5" aria-hidden />
          AI suggestions
        </Button>
      </div>

      <VisionField
        label="Style notes"
        value={rules.styleNotes}
        placeholder={
          scriptToPrompt
            ? "Modular prompts, 2.39:1 stills, look bible locked…"
            : "Visual language: slow-burn, naturalistic, handheld…"
        }
        chips={styleChips}
        onChange={(styleNotes) => onPatch((p) => ({ ...p, styleNotes }))}
        onChip={(chip) => onPatch((p) => ({ ...p, styleNotes: appendChipValue(p.styleNotes, chip) }))}
      />
      <VisionField
        label="Tone & film references"
        value={rules.toneAndRefs}
        placeholder={
          scriptToPrompt
            ? "Midjourney, Higgsfield, LTX; film still discipline…"
            : "The Revenant, Nomadland, Chungking Express…"
        }
        chips={toneChips}
        onChange={(toneAndRefs) => onPatch((p) => ({ ...p, toneAndRefs }))}
        onChip={(chip) => onPatch((p) => ({ ...p, toneAndRefs: appendChipValue(p.toneAndRefs, chip) }))}
      />
      <VisionField
        label="Camera & shot preferences"
        value={rules.preferredShots}
        placeholder={
          scriptToPrompt
            ? "Master-wide first, one external generation per planned shot…"
            : "Wide masters, slow dolly, minimal handheld…"
        }
        chips={cameraChips}
        onChange={(preferredShots) => onPatch((p) => ({ ...p, preferredShots }))}
        onChip={(chip) =>
          onPatch((p) => ({ ...p, preferredShots: appendChipValue(p.preferredShots, chip) }))
        }
      />
    </div>
  );
}

function VisionField({
  label,
  value,
  placeholder,
  chips,
  onChange,
  onChip,
}: {
  label: string;
  value: string;
  placeholder: string;
  chips: readonly string[];
  onChange: (v: string) => void;
  onChip: (chip: string) => void;
}) {
  return (
    <label className="block text-sm text-pro-text-secondary">
      {label}
      <textarea
        rows={2}
        className={FIELD_CLASS}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="mt-2 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="rounded-full border border-white/[0.1] bg-pro-elevated px-2.5 py-0.5 text-[11px] text-pro-text-secondary transition hover:border-[#666] hover:text-pro-text"
            onClick={() => onChip(chip)}
          >
            + {chip}
          </button>
        ))}
      </span>
    </label>
  );
}
