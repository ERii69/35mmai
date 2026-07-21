"use client";

import { useState } from "react";
import { Aperture, Film, ImageIcon, ImagePlus, Pencil, RefreshCw, X } from "lucide-react";
import type { MoodBoardReference, StagedVisualSuggestion } from "@/lib/pro/types";
import type { MoodBoardSection, MoodBoardPartialOptions } from "@/lib/pro/apply-mood-board-partial";

export type MoodBoardRegenerateContext = MoodBoardPartialOptions & {
  referenceTitle?: string;
  templateOffset?: number;
};

type TileKind = "mood" | "palette" | "reference" | "lens" | "grain";

type Tile = {
  id: string;
  kind: TileKind;
  title: string;
  subtitle: string;
  section: MoodBoardSection;
  ref?: MoodBoardReference;
  imageUrl?: string;
};

type Props = {
  visual: StagedVisualSuggestion;
  referenceUrls?: string[];
  loading?: boolean;
  loadingSection?: MoodBoardSection | null;
  agentsEnabled?: boolean;
  hasPhotoStills?: boolean;
  onRegenerate: (sections: MoodBoardSection[], context?: MoodBoardRegenerateContext) => void;
  onUploadClick?: () => void;
  onEditManual?: () => void;
};

export function MoodBoardGrid({
  visual,
  referenceUrls = [],
  loading,
  loadingSection,
  agentsEnabled,
  hasPhotoStills = false,
  onRegenerate,
  onUploadClick,
  onEditManual,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const uploadedImages = referenceUrls.filter((u) => u.startsWith("data:image"));
  const refs = visual.moodBoardReferences ?? [];
  const tiles = buildTiles(visual, refs, uploadedImages);

  if (tiles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-pro-muted/30 px-4 py-8 text-center">
        <ImageIcon className="mx-auto size-8 text-pro-text-secondary/50" aria-hidden />
        <p className="mt-2 text-sm text-pro-text">No mood board yet</p>
        <p className="mt-1 text-xs text-pro-text-secondary">
          Add reference photos, then click <strong className="text-pro-text">Build mood board</strong>.
        </p>
        {onUploadClick ? (
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-pro-primary/15 px-3 py-2 text-xs font-medium text-pro-primary ring-1 ring-pro-primary/25 hover:bg-pro-primary/25"
            onClick={onUploadClick}
          >
            <ImagePlus className="size-3.5" aria-hidden />
            Upload photos
          </button>
        ) : null}
      </div>
    );
  }

  const expanded = tiles.find((t) => t.id === expandedId);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <MoodTile
            key={tile.id}
            tile={tile}
            palette={visual.palette}
            loading={loading}
            loadingSection={loadingSection}
            agentsEnabled={agentsEnabled}
            hasPhotoStills={hasPhotoStills}
            expanded={expandedId === tile.id}
            onToggle={() => setExpandedId((id) => (id === tile.id ? null : tile.id))}
            onRegenerate={() =>
              onRegenerate(
                [tile.section],
                tile.kind === "reference" && tile.ref
                  ? { replaceReferenceId: tile.ref.id, referenceTitle: tile.ref.title }
                  : tile.kind === "reference"
                    ? { templateOffset: Date.now() % 5 }
                    : undefined
              )
            }
          />
        ))}
        {onUploadClick ? (
          <button
            type="button"
            onClick={onUploadClick}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-pro-muted/20 text-pro-text-secondary transition hover:border-pro-primary/40 hover:bg-pro-primary/5 hover:text-pro-primary"
          >
            <ImagePlus className="size-6" aria-hidden />
            <span className="text-[11px] font-medium">Add photo</span>
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="rounded-xl bg-pro-elevated/80 p-4 ring-1 ring-white/[0.08]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-pro-text">{expanded.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-pro-text-secondary">{expanded.subtitle}</p>
              {expanded.ref?.whyItFits ? (
                <p className="mt-2 text-xs text-pro-text-secondary">
                  <span className="font-medium text-pro-text">Why: </span>
                  {expanded.ref.whyItFits}
                </p>
              ) : null}
              {expanded.ref?.filmReference ? (
                <p className="mt-1 text-xs text-pro-text-secondary">
                  <span className="font-medium text-pro-text">Ref: </span>
                  {expanded.ref.filmReference}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-pro-text-secondary">
                {regenerateHint(expanded, agentsEnabled, hasPhotoStills)}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2 text-pro-text-secondary hover:bg-white/5 hover:text-pro-text"
              aria-label="Close details"
              onClick={() => setExpandedId(null)}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-pro-text ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-50"
              onClick={() =>
                onRegenerate(
                  [expanded.section],
                  expanded.kind === "reference" && expanded.ref
                    ? { replaceReferenceId: expanded.ref.id, referenceTitle: expanded.ref.title }
                    : undefined
                )
              }
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
              {regenerateActionLabel(expanded)}
            </button>
            {onEditManual ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-pro-text-secondary hover:bg-white/5 hover:text-pro-text"
                onClick={onEditManual}
              >
                <Pencil className="size-3.5" aria-hidden />
                Edit manually
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="text-[11px] text-pro-text-secondary">
        Click a tile for full notes · use the button under each tile to regenerate just that section
        {agentsEnabled ? " (lens & grain re-read your photos)" : ""}.
      </p>
    </div>
  );
}

function buildTiles(
  visual: StagedVisualSuggestion,
  refs: MoodBoardReference[],
  uploadedImages: string[]
): Tile[] {
  const tiles: Tile[] = [];
  let imageIndex = 0;

  if (visual.mood) {
    tiles.push({
      id: "mood",
      kind: "mood",
      title: "Mood & tone",
      subtitle: visual.mood,
      section: "mood",
      imageUrl: uploadedImages.length > 0 ? uploadedImages[imageIndex++ % uploadedImages.length] : undefined,
    });
  }

  if (visual.palette.length > 0) {
    tiles.push({
      id: "palette",
      kind: "palette",
      title: "Palette",
      subtitle: visual.palette.join(" · "),
      section: "palette",
    });
  }

  refs.slice(0, 4).forEach((r, i) => {
    tiles.push({
      id: r.id || `ref-${i}`,
      kind: "reference",
      title: r.title,
      subtitle: r.description || r.technicalNotes,
      section: "references",
      ref: r,
      imageUrl:
        uploadedImages.length > 0
          ? uploadedImages[(imageIndex + i + 1) % uploadedImages.length]
          : undefined,
    });
  });

  if (visual.lensAndFraming?.trim()) {
    tiles.push({
      id: "lens",
      kind: "lens",
      title: "Lens & framing",
      subtitle: visual.lensAndFraming,
      section: "lens",
      imageUrl:
        uploadedImages.length > 1
          ? uploadedImages[1 % uploadedImages.length]
          : uploadedImages[0],
    });
  }

  if (visual.grainAndTexture?.trim()) {
    tiles.push({
      id: "grain",
      kind: "grain",
      title: "Grain & texture",
      subtitle: visual.grainAndTexture,
      section: "grain",
      imageUrl:
        uploadedImages.length > 2
          ? uploadedImages[2 % uploadedImages.length]
          : uploadedImages[uploadedImages.length - 1],
    });
  }

  return tiles;
}

function regenerateActionLabel(tile: Pick<Tile, "kind" | "title">): string {
  switch (tile.kind) {
    case "mood":
      return "Regenerate mood";
    case "palette":
      return "Regenerate palette";
    case "reference":
      return "New reference idea";
    case "lens":
      return "Re-infer from photos";
    case "grain":
      return "Re-infer from photos";
    default:
      return `Regenerate ${tile.title}`;
  }
}

function regenerateHint(
  tile: Pick<Tile, "kind">,
  agentsEnabled?: boolean,
  hasPhotoStills?: boolean
): string {
  switch (tile.kind) {
    case "mood":
      return "Rewrite the mood line from your references and prep rules";
    case "palette":
      return "Rebuild palette swatches from your look bible";
    case "reference":
      return "Generate a new cinematic reference idea for this tile";
    case "lens":
      return agentsEnabled
        ? "AI reads your reference stills to infer focal length and framing"
        : hasPhotoStills
          ? "Infer lens notes from your uploaded stills"
          : "Upload reference photos in Step 1 first";
    case "grain":
      return agentsEnabled
        ? "AI reads your reference stills to infer grain and texture"
        : hasPhotoStills
          ? "Infer grain notes from your uploaded stills"
          : "Upload reference photos in Step 1 first";
    default:
      return "Regenerate this section only";
  }
}

function MoodTile({
  tile,
  palette,
  loading,
  loadingSection,
  agentsEnabled,
  hasPhotoStills,
  expanded,
  onToggle,
  onRegenerate,
}: {
  tile: Tile;
  palette: string[];
  loading?: boolean;
  loadingSection?: MoodBoardSection | null;
  agentsEnabled?: boolean;
  hasPhotoStills?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRegenerate: () => void;
}) {
  const hex = tile.kind === "palette" ? paletteColor(palette[0] ?? "") : paletteColor(palette[0] ?? "");
  const tileLoading = Boolean(loading && (!loadingSection || loadingSection === tile.section));
  const needsPhotos = tile.kind === "lens" || tile.kind === "grain";
  const photoBlocked = needsPhotos && !hasPhotoStills;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-pro-elevated ring-1 transition ${
        expanded ? "ring-pro-primary/40" : "ring-white/[0.06] hover:ring-white/12"
      }`}
    >
      <button
        type="button"
        className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-pro-elevated to-pro-muted text-left"
        style={hex && tile.kind !== "palette" ? { backgroundColor: `${hex}18` } : undefined}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {tile.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
            {tile.kind === "lens" ? <LensOverlay /> : null}
            {tile.kind === "grain" ? <GrainOverlay /> : null}
          </>
        ) : tile.kind === "lens" ? (
          <LensPlaceholder subtitle={tile.subtitle} />
        ) : tile.kind === "grain" ? (
          <GrainPlaceholder subtitle={tile.subtitle} />
        ) : tile.kind === "palette" ? (
          <div className="flex flex-wrap justify-center gap-1.5 px-3">
            {palette.slice(0, 4).map((swatch, swatchIndex) => {
              const color = paletteColor(swatch);
              return (
                <span
                  key={`${tile.id}-sw-${swatchIndex}`}
                  className="size-8 rounded-full ring-2 ring-white/10"
                  style={{
                    backgroundColor: color ?? "#525252",
                  }}
                  title={swatch}
                />
              );
            })}
          </div>
        ) : (
          <>
            {hex ? (
              <span
                className="absolute inset-0 opacity-30"
                style={{ background: `linear-gradient(135deg, ${hex}66, transparent)` }}
                aria-hidden
              />
            ) : null}
            <ImageIcon className="relative size-8 text-pro-text-secondary/40" aria-hidden />
          </>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6">
          <span className="block text-[11px] font-semibold text-white">{tile.title}</span>
        </span>
      </button>

      <div className="space-y-1.5 border-t border-white/[0.04] p-2">
        <p className="line-clamp-2 text-[10px] leading-snug text-pro-text-secondary">{tile.subtitle}</p>
        <button
          type="button"
          title={
            photoBlocked
              ? "Upload reference photos in Step 1 first"
              : regenerateHint(tile, agentsEnabled, hasPhotoStills)
          }
          className={`flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium ring-1 disabled:opacity-40 ${
            photoBlocked
              ? "cursor-not-allowed bg-white/[0.02] text-pro-text-secondary ring-white/5"
              : "bg-white/[0.04] text-pro-text ring-white/10 hover:bg-white/10"
          }`}
          disabled={tileLoading || photoBlocked}
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate();
          }}
        >
          <RefreshCw className={`size-3 shrink-0 ${tileLoading ? "animate-spin" : ""}`} aria-hidden />
          {tileLoading ? "Updating…" : regenerateActionLabel(tile)}
        </button>
      </div>
    </article>
  );
}

function LensOverlay() {
  return (
    <>
      <span className="absolute inset-0 bg-black/20" aria-hidden />
      <span
        className="absolute inset-x-[12%] inset-y-[18%] rounded-sm border-2 border-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
        aria-hidden
      />
      <Aperture className="absolute right-2 top-2 size-5 text-white/80 drop-shadow" aria-hidden />
    </>
  );
}

function GrainOverlay() {
  return (
    <>
      <span
        className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      <Film className="absolute right-2 top-2 size-5 text-white/80 drop-shadow" aria-hidden />
    </>
  );
}

function LensPlaceholder({ subtitle }: { subtitle: string }) {
  const focal = subtitle.match(/\d{2,3}mm/i)?.[0] ?? "35mm";
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-3 text-center">
      <span
        className="flex h-12 w-20 items-center justify-center rounded border-2 border-dashed border-white/30 text-[10px] font-mono text-white/70"
        aria-hidden
      >
        {focal}
      </span>
      <Aperture className="size-6 text-pro-text-secondary/50" aria-hidden />
    </div>
  );
}

function GrainPlaceholder({ subtitle }: { subtitle: string }) {
  const label = subtitle.toLowerCase().includes("fine") ? "Fine grain" : "Film grain";
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-1"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      }}
    >
      <Film className="size-6 text-pro-text-secondary/60" aria-hidden />
      <span className="text-[10px] font-medium text-pro-text-secondary">{label}</span>
    </div>
  );
}

function paletteColor(name: string): string | null {
  const hex = name.match(/#([0-9a-f]{3,8})/i)?.[0];
  if (hex) return hex;
  const lower = name.toLowerCase();
  const named: Record<string, string> = {
    sage: "#87ae73",
    grey: "#6b7280",
    gray: "#6b7280",
    gold: "#c9a227",
    wood: "#8b6914",
    tungsten: "#ffb347",
    overcast: "#94a3b8",
  };
  for (const [key, color] of Object.entries(named)) {
    if (lower.includes(key)) return color;
  }
  return null;
}
