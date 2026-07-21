"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Clapperboard, Film, GripVertical } from "lucide-react";
import {
  buildShotReferenceLabels,
  isWebReferenceUrl,
  normalizePhotoDataUrl,
  referenceDisplayLabel,
  referenceKind,
  referenceListKey,
} from "@/lib/pro/reference-url-utils";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  formatShotNumber,
  SHOT_STATUS_OPTIONS,
  SHOT_TYPE_OPTIONS,
} from "@/lib/pro/shot-plan";
import { shotTypeStyle } from "@/lib/pro/shot-type-styles";
import type { PlannedShot, ShotProductionStatus } from "@/lib/pro/types";

const fieldClass = `${proSurface.field} text-xs`;

type Props = {
  shot: PlannedShot;
  seqIndex: number;
  shotIndex: number;
  sceneLabel: string | null;
  referenceOptions: string[];
  palette?: string[];
  layout?: "filmstrip" | "sheet";
  notesDefaultOpen?: boolean;
  onChange: (shot: PlannedShot) => void;
  onStatusChange: (shot: PlannedShot, prev: ShotProductionStatus) => void;
  onRemove: () => void;
  draggable?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  /** Touch-friendly reorder when drag is unavailable. */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

export function ShotCard({
  shot,
  seqIndex,
  shotIndex,
  sceneLabel,
  referenceOptions,
  palette = [],
  layout = "filmstrip",
  notesDefaultOpen = false,
  onChange,
  onStatusChange,
  onRemove,
  draggable,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: Props) {
  const [notesOpen, setNotesOpen] = useState(notesDefaultOpen);
  const shotNum = formatShotNumber(seqIndex, shotIndex);
  const style = shotTypeStyle(shot.shotType);
  const vbPills = palette.slice(0, 3);
  const sheet = layout === "sheet";

  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex flex-col rounded-2xl border-l-4 bg-pro-elevated shadow-lg transition-all duration-150 ${style.accent} ${
        sheet ? "w-full p-4" : "min-w-[240px] max-w-[320px] p-4"
      } ${
        isDragging ? "scale-[0.97] opacity-50 ring-2 ring-pro-primary/40" : "opacity-100"
      } ${isDropTarget ? "ring-2 ring-pro-success/50" : "ring-1 ring-white/[0.06] hover:ring-white/12"}`}
    >
      <div className={`mb-2.5 flex items-start justify-between gap-2 ${sheet ? "sm:items-center" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-bold text-pro-text">Shot {shotNum}</p>
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${style.badge}`}>
              {style.label}
            </span>
          </div>
          {sceneLabel ? (
            <p className="mt-0.5 truncate text-[11px] text-pro-success/90">{sceneLabel}</p>
          ) : null}
        </div>
        {draggable ? (
          <GripVertical
            className="size-4 shrink-0 cursor-grab text-pro-text-secondary active:cursor-grabbing"
            aria-hidden
          />
        ) : onMoveUp || onMoveDown ? (
          <div className="flex shrink-0 flex-col gap-0.5 md:hidden">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg text-pro-text-secondary ring-1 ring-white/[0.08] disabled:opacity-30"
              disabled={!canMoveUp}
              aria-label={`Move shot ${shotNum} up`}
              onClick={onMoveUp}
            >
              <ChevronUp className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg text-pro-text-secondary ring-1 ring-white/[0.08] disabled:opacity-30"
              disabled={!canMoveDown}
              aria-label={`Move shot ${shotNum} down`}
              onClick={onMoveDown}
            >
              <ChevronDown className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <div className={sheet ? "grid gap-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]" : ""}>
        <ShotThumbnail shot={shot} referenceOptions={referenceOptions} style={style} onChange={onChange} sheet={sheet} />

        <div className={sheet ? "min-w-0 space-y-2" : ""}>
      {vbPills.length > 0 || shot.visualBibleNote.trim() ? (
        <div className={`flex flex-wrap gap-1 ${sheet ? "" : "mb-2"}`}>
          {vbPills.map((sw) => (
            <VisualBiblePill key={sw} label={sw} />
          ))}
          {shot.visualBibleNote.trim() && !vbPills.length ? (
            <span
              className="max-w-full truncate rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] text-violet-200 ring-1 ring-violet-500/25"
              title={shot.visualBibleNote}
            >
              {shot.visualBibleNote.slice(0, 28)}
              {shot.visualBibleNote.length > 28 ? "…" : ""}
            </span>
          ) : null}
        </div>
      ) : null}

      <select
        className={`${sheet ? "" : "mb-2"} ${fieldClass}`}
        value={shot.shotType}
        onChange={(e) =>
          onChange({ ...shot, shotType: e.target.value as PlannedShot["shotType"] })
        }
      >
        {SHOT_TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {sheet ? (
        <textarea
          rows={2}
          className={fieldClass}
          placeholder="Shot description"
          value={shot.label}
          onChange={(e) => onChange({ ...shot, label: e.target.value })}
        />
      ) : (
        <input
          className={`mb-2 ${fieldClass}`}
          placeholder="Shot label"
          value={shot.label}
          onChange={(e) => onChange({ ...shot, label: e.target.value })}
        />
      )}

      <div className={`flex flex-wrap items-center gap-3 ${sheet ? "" : "mb-2"}`}>
      <label className="flex items-center gap-2 text-[11px] text-pro-text-secondary">
        Duration
        <input
          type="number"
          min={1}
          max={600}
          className="w-14 rounded-lg bg-pro-muted px-1.5 py-0.5 text-xs text-pro-text ring-1 ring-white/[0.06]"
          value={shot.durationSeconds}
          onChange={(e) =>
            onChange({ ...shot, durationSeconds: Math.max(1, parseInt(e.target.value, 10) || 8) })
          }
        />
        <span>s</span>
      </label>

      <select
        className={`${sheet ? "min-w-[8rem] flex-1" : `mb-2 w-full`} ${fieldClass}`}
        value={shot.status}
        onChange={(e) => {
          const next = e.target.value as ShotProductionStatus;
          const prev = shot.status;
          onChange({ ...shot, status: next });
          if (prev !== next) onStatusChange({ ...shot, status: next }, prev);
        }}
      >
        {SHOT_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      </div>

      {sheet ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-pro-text-secondary">Camera &amp; lighting</p>
          <textarea
            rows={3}
            className={fieldClass}
            placeholder="Camera notes — lens, movement, framing"
            value={shot.cameraNotes}
            onChange={(e) => onChange({ ...shot, cameraNotes: e.target.value })}
          />
          <textarea
            rows={3}
            className={fieldClass}
            placeholder="Lighting notes — key, mood, practicals"
            value={shot.lightingNotes}
            onChange={(e) => onChange({ ...shot, lightingNotes: e.target.value })}
          />
        </div>
      ) : (
        <>
      <button
        type="button"
        className="mb-2 flex w-full items-center justify-between rounded-lg bg-pro-muted/60 px-2 py-1.5 text-[11px] font-medium text-pro-text-secondary hover:text-pro-text"
        onClick={() => setNotesOpen((v) => !v)}
        aria-expanded={notesOpen}
      >
        Camera &amp; lighting
        {notesOpen ? (
          <ChevronUp className="size-3.5" aria-hidden />
        ) : (
          <ChevronDown className="size-3.5" aria-hidden />
        )}
      </button>

      {notesOpen ? (
        <div className="mb-2 space-y-2">
          <textarea
            rows={2}
            className={fieldClass}
            placeholder="Camera notes"
            value={shot.cameraNotes}
            onChange={(e) => onChange({ ...shot, cameraNotes: e.target.value })}
          />
          <textarea
            rows={2}
            className={fieldClass}
            placeholder="Lighting notes"
            value={shot.lightingNotes}
            onChange={(e) => onChange({ ...shot, lightingNotes: e.target.value })}
          />
        </div>
      ) : null}
        </>
      )}

      {referenceOptions.length > 0 ? (
        <ShotReferenceSelect
          value={normalizePhotoDataUrl(shot.visualRefUrl)}
          options={referenceOptions}
          onChange={(visualRefUrl) => onChange({ ...shot, visualRefUrl })}
        />
      ) : null}

      <button
        type="button"
        className="mt-auto text-left text-[10px] text-pro-text-secondary hover:text-pro-primary"
        onClick={onRemove}
      >
        Remove shot
      </button>
        </div>
      </div>
    </article>
  );
}

function ShotReferenceSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const labels = useMemo(() => buildShotReferenceLabels(options), [options]);
  const normalizedValue = value ? normalizePhotoDataUrl(value) : "";
  const selectedLabel = normalizedValue ? labels.get(normalizedValue) ?? referenceDisplayLabel(normalizedValue) : "No ref";

  return (
    <div className="relative mb-2">
      <button
        type="button"
        className={`${fieldClass} flex w-full items-center justify-between gap-2 text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`size-3.5 shrink-0 text-pro-text-secondary transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close reference menu"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-white/10 bg-[#121212] py-1 shadow-2xl ring-1 ring-black/50"
          >
            <li role="option" aria-selected={!normalizedValue}>
              <button
                type="button"
                className={`flex w-full px-3 py-2 text-left text-xs hover:bg-white/5 ${
                  !normalizedValue ? "bg-pro-primary/15 text-pro-text" : "text-pro-text-secondary"
                }`}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                No ref
              </button>
            </li>
            {options.map((url, i) => {
              const label = labels.get(url) ?? referenceDisplayLabel(url);
              const selected = normalizedValue === url;
              return (
                <li key={referenceListKey(url, i)} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/5 ${
                      selected ? "bg-pro-primary/15 text-pro-text" : "text-pro-text-secondary"
                    }`}
                    onClick={() => {
                      onChange(url);
                      setOpen(false);
                    }}
                  >
                    {referenceKind(url) === "photo" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={normalizePhotoDataUrl(url)}
                        alt=""
                        className="size-8 shrink-0 rounded object-cover ring-1 ring-white/10"
                      />
                    ) : referenceKind(url) === "film" ? (
                      <Film className="size-4 shrink-0 text-pro-text-secondary" aria-hidden />
                    ) : null}
                    <span className="min-w-0 truncate">{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function VisualBiblePill({ label }: { label: string }) {
  const hex = label.match(/#([0-9a-f]{3,8})/i)?.[0];
  return (
    <span className="inline-flex max-w-[88px] items-center gap-1 truncate rounded-full bg-pro-muted px-2 py-0.5 text-[9px] text-pro-text-secondary ring-1 ring-white/[0.06]">
      {hex ? (
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: hex }} aria-hidden />
      ) : null}
      {label.slice(0, 12)}
    </span>
  );
}

function ShotThumbnail({
  shot,
  referenceOptions,
  style,
  onChange,
  sheet = false,
}: {
  shot: PlannedShot;
  referenceOptions: string[];
  style: ReturnType<typeof shotTypeStyle>;
  onChange: (shot: PlannedShot) => void;
  sheet?: boolean;
}) {
  const thumbClass = sheet ? "mb-0 h-28 w-full" : "mb-2.5 h-20 w-full";
  if (shot.visualRefUrl) {
    return <VisualThumb url={shot.visualRefUrl} gradient={style.thumb} className={thumbClass} />;
  }
  if (referenceOptions[0]) {
    return (
      <button
        type="button"
        className={`flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br ${style.thumb} ring-1 ring-white/5 hover:ring-pro-primary/30 ${thumbClass}`}
        onClick={() => onChange({ ...shot, visualRefUrl: referenceOptions[0] })}
      >
        <Clapperboard className="size-5 text-pro-text-secondary" aria-hidden />
        <span className="text-[10px] text-pro-text-secondary">+ Add visual ref</span>
      </button>
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${style.thumb} ring-1 ring-dashed ring-white/10 ${thumbClass}`}
      aria-hidden
    >
      <span className="text-2xl font-black tracking-widest text-white/10">{style.label}</span>
    </div>
  );
}

function VisualThumb({ url, gradient, className }: { url: string; gradient: string; className: string }) {
  const normalized = normalizePhotoDataUrl(url);
  if (normalized.startsWith("data:image")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={normalized}
        alt=""
        className={`rounded-xl object-cover ring-1 ring-white/10 ${className}`}
      />
    );
  }
  if (!isWebReferenceUrl(normalized)) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br ${gradient} px-2 ring-1 ring-white/10 ${className}`}
      >
        <Film className="size-5 shrink-0 text-pro-text-secondary/80" aria-hidden />
        <span className="line-clamp-3 text-center text-[10px] text-pro-text-secondary">
          {referenceDisplayLabel(normalized)}
        </span>
      </div>
    );
  }
  let domain = "";
  try {
    domain = new URL(normalized).hostname;
  } catch {
    return (
      <div className={`rounded-xl bg-gradient-to-br ${gradient} ring-1 ring-white/5 ${className}`} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`}
      alt=""
      className={`rounded-xl bg-gradient-to-br ${gradient} object-contain p-3 ring-1 ring-white/10 ${className}`}
    />
  );
}
