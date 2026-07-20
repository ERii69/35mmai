"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Film, GripVertical, ImagePlus, Loader2, Plus, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import {
  ANALYZE_REFS_MAX_PAYLOAD_BYTES,
  applyReferenceAnalysis,
  estimateReferencePayloadBytes,
} from "@/lib/pro/apply-reference-analysis";
import { buildLocalReferenceLibraryAnalysis } from "@/lib/pro/analyze-reference-library";
import {
  compressReferenceImage,
  prepareReferenceUrlsForCloud,
} from "@/lib/pro/compress-reference-image";
import {
  formatAnalyzeFallbackMessage,
  formatAnalyzeSuccessMessage,
} from "@/lib/pro/format-analyze-message";
import {
  filmReferenceSearchUrl,
  isWebReferenceUrl,
  referenceDisplayLabel,
  referenceKind,
  referenceListKey,
} from "@/lib/pro/reference-url-utils";
import {
  filmReferenceLabels,
  sanitizeReferenceUrls,
  type LookReferenceSuggestion,
} from "@/lib/pro/suggest-look-references";
import { appendMemoryDecision } from "@/lib/pro/append-memory-decision";
import type { ProjectStatePayload } from "@/lib/pro/types";

const MAX_REFS = 24;
const MAX_STILLS_RECOMMENDED = 6;
const ANALYZE_TIMEOUT_MS = 90_000;

type Props = {
  id?: string;
  projectId: string;
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  agentsEnabled?: boolean;
};

type AnalysisPayload = {
  summary?: string;
  palette?: string[];
  designNotes?: string;
  mood?: string;
  lensAndFraming?: string;
  grainAndTexture?: string;
  source?: string;
  warning?: string;
};

export function ReferenceLibrary({ id, projectId, state, updateState, agentsEnabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [findLoading, setFindLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LookReferenceSuggestion[]>([]);
  const [findSource, setFindSource] = useState<string | null>(null);
  const urls = sanitizeReferenceUrls(state.visualBible.referenceUrls);
  const palette = state.visualBible.palette;
  const stillCount = urls.filter((u) => u.startsWith("data:image")).length;
  const filmRefs = filmReferenceLabels(state);
  const hasVision =
    state.directorPrep.directorRules.styleNotes.trim() ||
    state.directorPrep.directorRules.toneAndRefs.trim() ||
    state.directorPrep.directorRules.genreTags.length > 0 ||
    state.directorPrep.scenes.length > 0;

  useEffect(() => {
    const cleaned = sanitizeReferenceUrls(state.visualBible.referenceUrls);
    if (cleaned.length !== state.visualBible.referenceUrls.length) {
      updateState((p) => ({
        ...p,
        visualBible: { ...p.visualBible, referenceUrls: cleaned },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time cleanup of corrupt refs
  }, []);

  function setUrls(referenceUrls: string[]) {
    setUrlsInternal(sanitizeReferenceUrls(referenceUrls));
  }

  function setUrlsInternal(referenceUrls: string[]) {
    updateState((p) => ({
      ...p,
      visualBible: { ...p.visualBible, referenceUrls: referenceUrls.slice(0, MAX_REFS) },
    }));
  }

  function addFilmReference(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const uploads = urls.filter((u) => u.startsWith("data:image"));
    const links = urls.filter((u) => isWebReferenceUrl(u));
    const films = filmRefs.filter((f) => f.toLowerCase() !== trimmed.toLowerCase());
    setUrls([...films, trimmed, ...links, ...uploads]);
    setSuggestions((prev) => prev.filter((s) => s.label.toLowerCase() !== trimmed.toLowerCase()));
  }

  async function findLookReferences() {
    if (findLoading) return;
    if (!hasVision) {
      setStatus("error");
      setMessage("Set style and tone in Prep → Vision first — agents use that to find film and DP references.");
      return;
    }

    setFindLoading(true);
    setStatus("loading");
    setMessage(agentsEnabled ? "Finding look references from your Prep vision…" : "Suggesting references from your Prep vision…");

    try {
      const res = await fetch(`/api/pro/visual/${projectId}/find-refs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        source?: string;
        suggestions?: LookReferenceSuggestion[];
        warning?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not find references.");
      }

      const next = (data.suggestions ?? []).filter(
        (s) => !filmRefs.some((f) => f.toLowerCase() === s.label.toLowerCase())
      );
      setSuggestions(next);
      setFindSource(data.source ?? "local");
      setStatus("success");
      setMessage(
        data.warning
          ? `${next.length} suggestion${next.length === 1 ? "" : "s"} (${data.source}) · ${data.warning}`
          : `${next.length} look reference${next.length === 1 ? "" : "s"} from ${data.source === "agent" ? "AI" : "your Prep rules"} — tap Add on any tile.`
      );
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Could not find look references.");
    } finally {
      setFindLoading(false);
    }
  }

  function reorder(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= urls.length || to >= urls.length) return;
    const next = [...urls];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setUrls(next);
  }

  function applyAnalysis(data: AnalysisPayload, referenceUrls: string[]) {
    updateState((p) => {
      let next = applyReferenceAnalysis(
        { ...p, visualBible: { ...p.visualBible, referenceUrls } },
        { mood: data.mood ?? "", palette: data.palette ?? [], source: data.source, summary: data.summary, lensAndFraming: data.lensAndFraming, grainAndTexture: data.grainAndTexture },
        referenceUrls
      );
      next = {
        ...next,
        directorPrep: {
          ...next.directorPrep,
          agentMemory: appendMemoryDecision(
            next.directorPrep.agentMemory,
            {
              agent: "visual_bible",
              summary: `Photos analyzed (${data.source ?? "local"}): ${data.palette?.length ?? 0} swatches`,
              approved: true,
            },
            next.directorPrep.directorRules
          ),
        },
      };
      return next;
    });
  }

  function handleUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Upload a JPEG or PNG still.");
      return;
    }
    if (stillCount >= MAX_STILLS_RECOMMENDED) {
      setStatus("error");
      setMessage(`Up to ${MAX_STILLS_RECOMMENDED} photos recommended — remove one to add another.`);
      return;
    }

    void (async () => {
      try {
        setStatus("loading");
        setMessage("Optimizing photo for save…");
        const { dataUrl, approxBytes } = await compressReferenceImage(file, 55_000);
        if (!dataUrl.startsWith("data:image")) {
          throw new Error("Could not process image.");
        }
        setUrls([...urls, dataUrl]);
        setStatus("success");
        setMessage(
          `Photo added (${Math.round(approxBytes / 1024)} KB) — drag to reorder, then Analyze photos.`
        );
      } catch {
        setStatus("error");
        setMessage("Could not process that image — try a smaller JPEG or PNG.");
      }
    })();
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  async function analyzeReferences() {
    if (status === "loading" || urls.length === 0) return;

    setStatus("loading");
    setMessage("Analyzing your references…");

    try {
      const preparedUrls = await prepareReferenceUrlsForCloud(urls, 55_000);

      const workingState: ProjectStatePayload = {
        ...state,
        visualBible: { ...state.visualBible, referenceUrls: preparedUrls },
      };

      const local = buildLocalReferenceLibraryAnalysis(workingState);
      let result: AnalysisPayload = { ...local, source: "local" };

      const payloadBytes = estimateReferencePayloadBytes(preparedUrls);
      const tryVision =
        agentsEnabled &&
        stillCount > 0 &&
        payloadBytes <= ANALYZE_REFS_MAX_PAYLOAD_BYTES;

      if (tryVision) {
        setMessage(`Reading ${Math.min(stillCount, 4)} photo${stillCount === 1 ? "" : "s"} with AI…`);
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

        try {
          const res = await fetch(`/api/pro/visual/${projectId}/analyze-refs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referenceUrls: preparedUrls }),
            signal: controller.signal,
          });
          const data = (await res.json().catch(() => ({}))) as AnalysisPayload & {
            error?: string;
            ok?: boolean;
          };

          if (res.ok && data.ok !== false) {
            result = {
              mood: data.mood ?? local.mood,
              palette: data.palette?.length ? data.palette : local.palette,
              lensAndFraming: data.lensAndFraming,
              grainAndTexture: data.grainAndTexture,
              source: data.source ?? "agent",
              summary: data.summary,
              warning: data.warning,
            };
          }
        } catch (e) {
          const isTimeout = e instanceof Error && e.name === "AbortError";
          if (isTimeout) {
            setMessage(formatAnalyzeFallbackMessage(stillCount, "timeout"));
          }
        } finally {
          window.clearTimeout(timeoutId);
        }
      }

      applyAnalysis(result, preparedUrls);
      setStatus("success");
      setMessage(formatAnalyzeSuccessMessage(result, stillCount));
    } catch {
      setStatus("error");
      setMessage("Could not analyze references — try removing a photo and retry.");
    }
  }

  return (
    <div id={id} className="scroll-mt-[calc(var(--pro-app-header-height,3.25rem)+var(--pro-workspace-chrome-height,5.5rem)+0.5rem)] space-y-4 rounded-xl bg-pro-elevated/80 p-3 ring-1 ring-white/[0.06] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-pro-primary">Step 1</p>
          <h3 className="mt-0.5 text-base font-semibold text-pro-text">Reference photos</h3>
          <p className="mt-1 text-sm text-pro-text-secondary">
            Upload 2–6 stills. Drag to reorder — first photo is the cover tile on your mood board.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            className={`${proBtn.primary} w-full sm:w-auto`}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="mr-1.5 size-3.5" aria-hidden />
            Upload photo
          </Button>
          {urls.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`${proBtn.outline} w-full sm:w-auto`}
              disabled={status === "loading"}
              onClick={() => void analyzeReferences()}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                  Analyzing…
                </>
              ) : (
                "Analyze photos"
              )}
            </Button>
          ) : null}
        </div>
      </div>

      {status !== "idle" ? (
        <ProStatusBanner
          variant={status === "loading" ? "loading" : status === "success" ? "success" : "error"}
          message={message}
          onDismiss={() => setStatus("idle")}
        />
      ) : null}

      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`rounded-xl border-2 border-dashed transition ${
          dragOver
            ? "border-pro-primary/50 bg-pro-primary/5"
            : urls.length === 0
              ? "border-white/10 bg-pro-muted/20"
              : "border-transparent"
        }`}
      >
        {urls.length > 0 ? (
          <>
            <p className="px-2 pt-2 text-[11px] text-pro-text-secondary">
              Drag any card to reorder · #1 = mood board cover · film names are labels, not web links
            </p>
            <ul className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 md:grid-cols-4">
              {urls.map((url, i) => (
                <li
                  key={referenceListKey(url, i)}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (dragIndex !== null) reorder(dragIndex, i);
                    setDragIndex(null);
                  }}
                  className={`group relative overflow-hidden rounded-lg border bg-pro-muted transition ${
                    dragIndex === i
                      ? "border-pro-primary/60 opacity-60"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="absolute left-1 top-1 z-10 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <span
                    className="absolute bottom-1 left-1 z-10 flex items-center gap-0.5 rounded-md bg-black/70 px-1 py-0.5 text-pro-text-secondary opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Drag card to reorder"
                    aria-hidden
                  >
                    <GripVertical className="size-3.5" />
                  </span>
                  <ReferenceThumb url={url} />
                  <div className="absolute right-1 top-1 z-10 flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      className="rounded-md bg-black/75 p-1 text-white disabled:opacity-30"
                      disabled={i === 0}
                      aria-label="Move earlier"
                      onClick={() => reorder(i, i - 1)}
                    >
                      <ChevronLeft className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-black/75 p-1 text-white disabled:opacity-30"
                      disabled={i === urls.length - 1}
                      aria-label="Move later"
                      onClick={() => reorder(i, i + 1)}
                    >
                      <ChevronRight className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white"
                      onClick={() => setUrls(urls.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 text-pro-text-secondary hover:border-pro-primary/40 hover:text-pro-primary"
                >
                  <Upload className="size-4" aria-hidden />
                  <span className="text-[10px] font-medium">Add</span>
                </button>
              </li>
            </ul>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 px-4 py-10 text-center"
          >
            <Upload className="size-8 text-pro-text-secondary/50" aria-hidden />
            <span className="text-sm font-medium text-pro-text">Drop photos here or click to upload</span>
            <span className="text-xs text-pro-text-secondary">JPEG or PNG · auto-optimized for save</span>
          </button>
        )}
      </div>

      <details className="rounded-lg bg-black/20 ring-1 ring-white/[0.04]">
        <summary className="cursor-pointer px-3 py-2 text-xs text-pro-text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
          Look references ({filmRefs.length} film{filmRefs.length === 1 ? "" : "s"}
          {palette.length ? ` · ${palette.length} palette swatches` : ""})
        </summary>
        <div className="space-y-3 border-t border-white/[0.04] px-3 py-3">
          <p className="text-xs text-pro-text-secondary">
            Agents suggest films, DPs, and photographers from your Prep vision — not pasted URLs. Tap a
            card to add it to your library, then search stills to upload as photos above.
          </p>
          <Button
            type="button"
            size="sm"
            className={`${proBtn.primary} w-full sm:w-auto`}
            disabled={findLoading || !hasVision}
            title={hasVision ? undefined : "Complete Prep → Vision first"}
            onClick={() => void findLookReferences()}
          >
            {findLoading ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                Finding references…
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 size-3.5" aria-hidden />
                {agentsEnabled ? "Find look references" : "Suggest look references"}
              </>
            )}
          </Button>

          {filmRefs.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {filmRefs.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-pro-text ring-1 ring-white/10"
                >
                  <Film className="size-3 shrink-0 text-pro-text-secondary" aria-hidden />
                  <a
                    href={filmReferenceSearchUrl(label)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-[12rem] truncate hover:text-pro-primary"
                    title={`Search stills for ${label}`}
                  >
                    {label}
                  </a>
                  <button
                    type="button"
                    className="ml-1 text-pro-text-secondary hover:text-pro-warning"
                    aria-label={`Remove ${label}`}
                    onClick={() =>
                      setUrls(urls.filter((u) => u.toLowerCase() !== label.toLowerCase()))
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-pro-text-secondary/80">No film references yet — run Find above.</p>
          )}

          {suggestions.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-white/10 bg-pro-muted p-2.5 text-left"
                >
                  <p className="text-xs font-medium text-pro-text">{s.label}</p>
                  <p className="mt-1 line-clamp-2 text-[10px] text-pro-text-secondary">{s.why}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`${proBtn.outline} h-7 px-2 text-[10px]`}
                      onClick={() => addFilmReference(s.label)}
                    >
                      <Plus className="mr-1 size-3" aria-hidden />
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`${proBtn.outline} h-7 px-2 text-[10px]`}
                      asChild
                    >
                      <a href={filmReferenceSearchUrl(s.label)} target="_blank" rel="noopener noreferrer">
                        Search stills
                      </a>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {findSource && suggestions.length === 0 && filmRefs.length > 0 ? (
            <p className="text-xs text-emerald-300/90">All suggested references are already in your library.</p>
          ) : null}
        </div>
      </details>
    </div>
  );
}

function ReferenceThumb({ url }: { url: string }) {
  if (url.startsWith("data:image")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="aspect-video w-full object-cover" draggable={false} />
    );
  }

  const kind = referenceKind(url);
  const label = referenceDisplayLabel(url);

  if (kind === "film") {
    return (
      <a
        href={filmReferenceSearchUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        title={`Search "${url}" for look references`}
        className="flex aspect-video flex-col items-center justify-center gap-1.5 p-2 text-center hover:bg-white/[0.03]"
        draggable={false}
      >
        <Film className="size-8 text-pro-text-secondary/70" aria-hidden />
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-pro-text-secondary">
          Film ref
        </span>
        <span className="line-clamp-2 text-[11px] font-medium text-pro-text">{label}</span>
        <span className="text-[9px] text-pro-text-secondary">Tap to search look refs</span>
      </a>
    );
  }

  if (!isWebReferenceUrl(url)) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-1 p-2 text-center">
        <span className="text-[10px] text-pro-text-secondary">Reference</span>
        <span className="line-clamp-2 text-[10px] text-[#737373]">{label}</span>
      </div>
    );
  }

  const domain = label;
  const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${url}`}
      className="flex aspect-video flex-col items-center justify-center gap-1 p-2 text-center hover:bg-white/[0.03]"
      draggable={false}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={favicon} alt="" className="size-10 rounded" draggable={false} />
      <span className="line-clamp-2 text-[10px] text-[#737373]">{domain}</span>
    </a>
  );
}
