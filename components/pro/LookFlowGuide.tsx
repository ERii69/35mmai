"use client";

import { Check, ChevronRight } from "lucide-react";
import type { ProjectStatePayload } from "@/lib/pro/types";

type StepId = "photos" | "build" | "apply";

type Props = {
  state: ProjectStatePayload;
  /** Script-to-prompt only needs palette + mood before export. */
  scriptToPrompt?: boolean;
  onStep?: (step: StepId) => void;
};

function hasMoodBoard(state: ProjectStatePayload): boolean {
  const vb = state.visualBible;
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  return (
    mood.length > 0 ||
    vb.palette.length > 0 ||
    vb.lensAndFraming.trim().length > 0 ||
    vb.designSheetNotes.trim().length > 0
  );
}

function hasScriptToPromptLook(state: ProjectStatePayload): boolean {
  return (
    state.visualBible.palette.length > 0 ||
    Boolean(state.directorPrep.agentMeta.visualMood.trim())
  );
}

function lookAppliedToShots(state: ProjectStatePayload): boolean {
  return state.shotPlan.sequences.some((seq) =>
    seq.shots.some((s) => s.visualBibleNote.trim().length > 0)
  );
}

export function isLookFlowComplete(state: ProjectStatePayload, scriptToPrompt = false): boolean {
  if (scriptToPrompt) return hasScriptToPromptLook(state);
  const photoCount = state.visualBible.referenceUrls.filter(Boolean).length;
  return photoCount > 0 && hasMoodBoard(state) && lookAppliedToShots(state);
}

export function LookFlowGuide({ state, scriptToPrompt = false, onStep }: Props) {
  if (isLookFlowComplete(state, scriptToPrompt)) return null;

  const photoCount = state.visualBible.referenceUrls.filter(Boolean).length;
  const steps: { id: StepId; label: string; hint: string; done: boolean }[] = scriptToPrompt
    ? [
        {
          id: "build",
          label: "Set palette & mood",
          hint: hasScriptToPromptLook(state) ? "Look locked" : "Required for prompts",
          done: hasScriptToPromptLook(state),
        },
        {
          id: "photos",
          label: "Reference photos",
          hint: photoCount > 0 ? `${photoCount} added` : "Optional",
          done: photoCount > 0,
        },
      ]
    : [
        {
          id: "photos",
          label: "Add photos",
          hint: photoCount > 0 ? `${photoCount} added` : "Upload stills",
          done: photoCount > 0,
        },
        {
          id: "build",
          label: "Build mood board",
          hint: hasMoodBoard(state) ? "Look set" : "Generate tiles",
          done: hasMoodBoard(state),
        },
        {
          id: "apply",
          label: "Apply to shots",
          hint: lookAppliedToShots(state) ? "Synced" : "In Finish → Shots",
          done: lookAppliedToShots(state),
        },
      ];

  return (
    <nav
      aria-label="Look workflow"
      className="flex flex-wrap items-center gap-1 rounded-xl bg-pro-elevated/60 px-3 py-2.5 ring-1 ring-white/[0.06] sm:gap-2 sm:px-4"
    >
      {scriptToPrompt ? (
        <p className="mb-1 w-full text-xs text-pro-text-secondary sm:mb-0 sm:mr-2 sm:w-auto">
          Prompt pack needs palette or mood — photos optional.
        </p>
      ) : null}
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1 sm:gap-2">
          {i > 0 ? (
            <ChevronRight className="hidden size-3.5 text-pro-text-secondary/50 sm:block" aria-hidden />
          ) : null}
          <button
            type="button"
            onClick={() => onStep?.(step.id)}
            className={`flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-left transition sm:px-2.5 ${
              onStep ? "hover:bg-white/5" : ""
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                step.done
                  ? "bg-pro-success/20 text-pro-success"
                  : "bg-white/5 text-pro-text-secondary ring-1 ring-white/10"
              }`}
            >
              {step.done ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium text-pro-text">{step.label}</span>
              <span className="block text-[10px] text-pro-text-secondary">{step.hint}</span>
            </span>
          </button>
        </div>
      ))}
    </nav>
  );
}
