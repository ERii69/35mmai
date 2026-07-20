"use client";

import { ArrowLeftRight } from "lucide-react";
import { LOOK_SCAN_CHECKS } from "@/lib/pro/look-scan-checks";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
};

/** Side-by-side preview + labeled scan dimensions for Step 3. */
export function LookCheckExplainer({ state }: Props) {
  const photos = state.visualBible.referenceUrls.filter((u) => u.startsWith("data:image"));
  const palette = state.visualBible.palette.slice(0, 4);
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const scenes = state.directorPrep.scenes.filter((s) => s.heading.trim()).slice(0, 3);
  const sceneTotal = state.directorPrep.scenes.length;

  if (photos.length === 0 && palette.length === 0 && sceneTotal === 0) {
    return (
      <p className="rounded-lg bg-pro-warning/10 px-3 py-2 text-xs text-pro-warning ring-1 ring-pro-warning/20">
        Add reference photos and Prep scenes before running the scan.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-xl bg-black/25 p-3 ring-1 ring-white/[0.06] sm:p-4">
      <div>
        <p className="text-xs font-semibold text-pro-text">What this scan does</p>
        <p className="mt-1 text-[11px] leading-relaxed text-pro-text-secondary">
          Read-only check: we compare your <strong className="font-medium text-pro-text">Look bible</strong>{" "}
          (photos, palette, mood from Steps 1–2) against each{" "}
          <strong className="font-medium text-pro-text">Prep scene</strong> note. Nothing is changed until
          you fix notes or update the look.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <LookSide label="Look bible · Steps 1–2">
          <div className="flex min-h-[4.5rem] items-center gap-2">
            {photos[0] ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[0]} alt="" className="size-full object-cover" />
                {photos.length > 1 ? (
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[9px] text-white">
                    +{photos.length - 1}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="min-w-0 flex-1 space-y-1.5">
              {palette.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {palette.map((swatch, swatchIndex) => (
                    <span
                      key={`look-swatch-${swatchIndex}`}
                      className="size-5 rounded-full ring-1 ring-white/15"
                      style={{ backgroundColor: swatchColor(swatch) }}
                      title={swatch}
                    />
                  ))}
                </div>
              ) : null}
              {mood ? (
                <p className="line-clamp-2 text-[10px] leading-snug text-pro-text-secondary">{mood}</p>
              ) : (
                <p className="text-[10px] text-pro-text-secondary">Mood board + photos</p>
              )}
            </div>
          </div>
        </LookSide>

        <div
          className="flex flex-col items-center justify-center gap-1 px-1 sm:px-2"
          aria-label="Compared side by side"
        >
          <ArrowLeftRight className="size-5 rotate-90 text-pro-primary sm:rotate-0" aria-hidden />
          <span className="max-w-[5rem] text-center text-[10px] font-medium leading-tight text-pro-primary">
            compared to
          </span>
        </div>

        <LookSide label={`Prep scenes · ${sceneTotal} total`}>
          {scenes.length > 0 ? (
            <ul className="space-y-1">
              {scenes.map((scene) => (
                <li
                  key={scene.id}
                  className="truncate rounded-md bg-black/30 px-2 py-1 text-[10px] text-pro-text-secondary ring-1 ring-white/[0.04]"
                >
                  {scene.heading || `Scene ${scene.number}`}
                </li>
              ))}
              {sceneTotal > scenes.length ? (
                <li className="text-[10px] text-pro-text-secondary/80">
                  +{sceneTotal - scenes.length} more…
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-[10px] text-pro-text-secondary">Add scenes in Prep first</p>
          )}
        </LookSide>
      </div>

      <div>
        <p className="text-[11px] font-medium text-pro-text">Scan checks (3)</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {LOOK_SCAN_CHECKS.map((check) => (
            <li
              key={check.id}
              className="rounded-lg bg-pro-elevated/60 px-2.5 py-2 ring-1 ring-white/[0.05]"
            >
              <p className="text-[11px] font-semibold text-pro-primary">{check.label}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-pro-text-secondary">{check.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LookSide({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 rounded-lg bg-pro-muted/30 p-2.5 ring-1 ring-white/[0.04]">
      <p className="text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function swatchColor(name: string): string {
  const hex = name.match(/#([0-9a-f]{3,8})/i)?.[0];
  if (hex) return hex;
  const lower = name.toLowerCase();
  if (lower.includes("sage")) return "#87ae73";
  if (lower.includes("grey") || lower.includes("gray")) return "#6b7280";
  if (lower.includes("gold")) return "#c9a227";
  if (lower.includes("charcoal")) return "#374151";
  if (lower.includes("cyan")) return "#06b6d4";
  if (lower.includes("amber")) return "#f59e0b";
  return "#525252";
}
