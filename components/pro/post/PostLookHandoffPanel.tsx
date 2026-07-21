"use client";

import { Palette, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToLook?: () => void;
};

export function PostLookHandoffPanel({ state, updateState, onGoToLook }: Props) {
  const vb = state.visualBible;
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const tone = state.directorPrep.directorRules.toneAndRefs.trim();
  const gradeNotes = state.postChecklist.gradeHandoffNotes ?? "";

  const refs = vb.referenceUrls.slice(0, 6);

  return (
    <div className="space-y-6">
      <p className="max-w-xl text-sm text-pro-text-secondary">
        Keep approved look references visible while you grade — pulled from prep and Look.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${proSurface.card} space-y-3`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
            Look bible
          </p>
          {mood ? (
            <p className="text-sm text-pro-text">
              <span className="text-pro-text-secondary">Mood: </span>
              {mood}
            </p>
          ) : null}
          {tone ? (
            <p className="text-sm text-pro-text">
              <span className="text-pro-text-secondary">Tone & refs: </span>
              {tone}
            </p>
          ) : null}
          {vb.palette.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <Palette className="size-4 text-pro-text-secondary" aria-hidden />
              {vb.palette.map((color) => (
                <span
                  key={color}
                  className="rounded-full bg-pro-muted px-2.5 py-1 text-xs text-pro-text ring-1 ring-white/[0.08]"
                >
                  {color}
                </span>
              ))}
            </div>
          ) : null}
          {vb.lensAndFraming.trim() ? (
            <p className="text-xs text-pro-text-secondary">
              Lens / framing: {vb.lensAndFraming}
            </p>
          ) : null}
          {!mood && !tone && vb.palette.length === 0 ? (
            <p className="text-sm text-pro-text-secondary">No look locked yet — add mood and palette in Look.</p>
          ) : null}
          {onGoToLook ? (
            <Button type="button" size="sm" variant="outline" className="border-white/10" onClick={onGoToLook}>
              Open Look
            </Button>
          ) : null}
        </div>

        <div className={`${proSurface.card} space-y-3`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
            Reference stills
          </p>
          {refs.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2">
              {refs.map((url, i) => (
                <li key={`${url}-${i}`} className="aspect-video overflow-hidden rounded-lg ring-1 ring-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-full object-cover" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-sm text-pro-text-secondary">
              <ImageIcon className="size-4" aria-hidden />
              Add photos or mood board tiles in Look.
            </div>
          )}
        </div>
      </div>

      <label className={`${proSurface.card} block space-y-2`}>
        <span className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
          Grade against this
        </span>
        <textarea
          rows={4}
          className={proSurface.field}
          placeholder="Note what must match the approved look — skin tones, contrast, grain, night exteriors…"
          value={gradeNotes}
          onChange={(e) =>
            updateState((p) => ({
              ...p,
              postChecklist: { ...p.postChecklist, gradeHandoffNotes: e.target.value },
            }))
          }
        />
      </label>
    </div>
  );
}
