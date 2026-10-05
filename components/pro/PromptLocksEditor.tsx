"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { referenceStillPrompt } from "@/lib/pro/prompt-locks";
import type { PromptLocksState } from "@/lib/pro/types";

type Props = {
  locks: PromptLocksState;
  warnings: string[];
  onLookChange: (kind: "character" | "place", id: string, look: string) => void;
  onKeptStillChange: (id: string, text: string) => void;
  onCopy: (key: string, text: string, label: string) => void;
  copiedKey: string | null;
};

export function PromptLocksEditor({
  locks,
  warnings,
  onLookChange,
  onKeptStillChange,
  onCopy,
  copiedKey,
}: Props) {
  if (locks.characters.length === 0 && locks.places.length === 0) return null;

  return (
    <section className="space-y-4 rounded-xl bg-pro-elevated p-4 ring-1 ring-white/[0.06]">
      <div>
        <h3 className="text-sm font-semibold text-pro-text">People and places</h3>
        <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">
          Same person, same place, in every prompt. The kept still is the face prompt you chose, in words.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {locks.characters.map((person) => (
          <label key={person.id} className="block text-xs text-pro-text-secondary">
            <span className="font-medium text-pro-text">{person.name}</span>
            <textarea
              value={person.look}
              rows={2}
              onChange={(event) => onLookChange("character", person.id, event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/[0.08] bg-pro-surface px-2 py-1.5 text-sm text-pro-text"
            />
            <input
              value={person.keptStillPrompt ?? ""}
              placeholder="Kept still — the face prompt you chose"
              onChange={(event) => onKeptStillChange(person.id, event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/[0.08] bg-pro-surface px-2 py-1.5 text-sm text-pro-text"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-1 h-7 px-2 text-pro-text-secondary hover:text-pro-text"
              onClick={() =>
                onCopy(
                  `ref-${person.id}`,
                  person.keptStillPrompt?.trim() || referenceStillPrompt(person),
                  `${person.name} reference still`
                )
              }
            >
              <Copy className="mr-1.5 size-3.5" aria-hidden />
              {copiedKey === `ref-${person.id}` ? "Copied" : "Copy face prompt"}
            </Button>
          </label>
        ))}
        {locks.places.map((place) => (
          <label key={place.id} className="block text-xs text-pro-text-secondary">
            <span className="font-medium text-pro-text">
              {place.name}
              {place.sceneNumbers.length > 0 ? ` · scene ${place.sceneNumbers.join(", ")}` : ""}
            </span>
            <textarea
              value={place.look}
              rows={2}
              onChange={(event) => onLookChange("place", place.id, event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/[0.08] bg-pro-surface px-2 py-1.5 text-sm text-pro-text"
            />
          </label>
        ))}
      </div>

      {warnings.length > 0 ? (
        <ul className="space-y-1 rounded-lg bg-amber-950/40 px-3 py-2 text-xs text-amber-100" role="status">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
