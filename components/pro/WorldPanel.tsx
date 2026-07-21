"use client";

import { useState } from "react";
import { ExternalLink, Loader2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  applyWorldBibleToState,
  generateWorldFromScript,
  worldBibleHasUserContent,
} from "@/lib/pro/apply-world-bible";
import {
  locationResearchDisplayName,
  openInMapsUrl,
  staticMapImageUrl,
} from "@/lib/pro/location-research";
import {
  locationsFromApprovedScenes,
  mergeLocationLists,
} from "@/lib/pro/locations-from-scenes";
import type { LocationResearchRecord, ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  projectId: string;
  state: ProjectStatePayload;
  agentsEnabled: boolean;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToScript?: () => void;
};

export function WorldPanel({
  projectId,
  state,
  agentsEnabled,
  updateState,
  onGoToScript,
}: Props) {
  const { showToast } = useProToast();
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function toastSuccess(message: string) {
    showToast({ message, variant: "success" });
  }

  function toastError(message: string) {
    showToast({ message, variant: "error" });
  }

  const fieldClass = proSurface.field;
  const parsedLocations = locationsFromApprovedScenes(state.directorPrep.scenes);
  const approvedWithHeadings = state.directorPrep.scenes.filter(
    (s) => s.status === "approved" && s.heading.trim()
  ).length;
  const hasScript = state.directorPrep.screenplay.rawText.trim().length > 0;
  const hasScenes = state.directorPrep.scenes.length > 0;
  const canGenerate = hasScript || hasScenes;

  function pullLocationsFromScenes() {
    if (parsedLocations.length === 0) return;

    const next = mergeLocationLists(state.worldBible.locations, parsedLocations);
    const added = next.length - state.worldBible.locations.length;

    if (added === 0) {
      toastError("All parsed locations are already in your World bible list.");
      return;
    }

    const ok = confirm(
      `Add ${added} location${added === 1 ? "" : "s"} from approved scene headings?\n\n${parsedLocations.join("\n")}`
    );
    if (!ok) return;

    updateState((p) => ({
      ...p,
      worldBible: { ...p.worldBible, locations: next },
    }));
    toastSuccess(`Added ${added} location${added === 1 ? "" : "s"}.`);
  }

  async function generateFromScript() {
    if (!canGenerate) {
      setFeedback("Paste your screenplay in Prep first, or add scenes.");
      onGoToScript?.();
      return;
    }

    if (worldBibleHasUserContent(state)) {
      const ok = confirm(
        "Replace your World bible with a fresh pass from the script? Notes, characters, and locations will be overwritten."
      );
      if (!ok) return;
    }

    setGenerating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/pro/world/${projectId}/generate`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        source?: string;
        warning?: string;
        worldBible?: ProjectStatePayload["worldBible"];
        characterCount?: number;
        locationCount?: number;
      };

      if (!res.ok || !data.ok || !data.worldBible) {
        if (res.status === 429) {
          const msg = data.error ?? "Daily AI limit reached — use quick prep";
          setFeedback(msg);
          toastError(msg);
          return;
        }
        if (!agentsEnabled && hasScript) {
          const local = generateWorldFromScript(state);
          updateState((p) => applyWorldBibleToState(p, local, "replace"));
          toastSuccess(
            `Built world bible locally — ${local.characters.length} characters, ${local.locations.length} locations.`
          );
          return;
        }
        throw new Error(data.error ?? "World bible generation failed.");
      }

      updateState((p) => ({
        ...p,
        worldBible: data.worldBible!,
      }));

      const msg = data.warning
        ? `World bible (${data.source}) — ${data.warning}`
        : `World bible ready — ${data.characterCount ?? 0} characters, ${data.locationCount ?? 0} locations (${data.source}).`;
      toastSuccess(msg);
    } catch (e) {
      if (hasScript || hasScenes) {
        const local = generateWorldFromScript(state);
        updateState((p) => applyWorldBibleToState(p, local, "replace"));
        toastSuccess(
          `Used local fallback — ${local.characters.length} characters, ${local.locations.length} locations.`
        );
      } else {
        const msg = e instanceof Error ? e.message : "Could not generate world bible.";
        setFeedback(msg);
        toastError(msg);
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-pro-text">World bible</h2>
          <p className="mt-1 text-sm text-pro-text-secondary">
            Story truth — characters, places, and tone pulled from your script.
          </p>
        </div>
        <Button
          type="button"
          className={`${proBtn.primary} shrink-0`}
          disabled={generating || !canGenerate}
          onClick={() => void generateFromScript()}
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          {generating ? "Generating…" : "Generate from script"}
        </Button>
      </div>

      {feedback ? (
        <ProStatusBanner
          variant="info"
          message={
            onGoToScript
              ? `${feedback} Open Prep → Script to paste your screenplay.`
              : feedback
          }
        />
      ) : null}

      {!canGenerate ? (
        <p className="text-xs text-pro-text-secondary/80">
          Paste a screenplay in Prep → Script, then run Generate from script.
        </p>
      ) : agentsEnabled ? (
        <p className="text-xs text-pro-text-secondary/80">
          Uses your script plus approved prep scenes for characters, locations, and world notes.
        </p>
      ) : (
        <p className="text-xs text-pro-text-secondary/80">
          Local mode: parses ALL CAPS and title-case character cues, INT./EXT. and documentary
          sluglines (DAY - FIELDS).
        </p>
      )}

      <LocationResearchSection
        records={state.directorPrep.locationResearch ?? []}
        updateState={updateState}
      />

      <label className="block text-sm text-pro-text-secondary">
        Notes
        <textarea
          rows={4}
          className={`mt-1 ${fieldClass}`}
          value={state.worldBible.notes}
          onChange={(e) =>
            updateState((p) => ({
              ...p,
              worldBible: { ...p.worldBible, notes: e.target.value },
            }))
          }
        />
      </label>
      <StringListEditor
        label="Characters (one per line)"
        values={state.worldBible.characters}
        onChange={(characters) =>
          updateState((p) => ({ ...p, worldBible: { ...p.worldBible, characters } }))
        }
      />
      <StringListEditor
        label="Locations (one per line)"
        values={state.worldBible.locations}
        onChange={(locations) =>
          updateState((p) => ({ ...p, worldBible: { ...p.worldBible, locations } }))
        }
      />
      <div className="space-y-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-[#444] text-[#e5e5e5]"
          disabled={parsedLocations.length === 0}
          onClick={pullLocationsFromScenes}
        >
          Pull locations from approved scenes
        </Button>
        <p className="text-xs text-pro-text-secondary/80">
          {parsedLocations.length > 0
            ? `Parses INT./EXT. headings from ${parsedLocations.length} approved scene${parsedLocations.length === 1 ? "" : "s"}: ${parsedLocations.join(", ")}`
            : approvedWithHeadings > 0
              ? "No parseable locations in approved headings (use formats like INT. KITCHEN - NIGHT)."
              : "Approve scenes with standard headings in Director's Prep first."}
        </p>
      </div>
    </div>
  );
}

function LocationResearchSection({
  records,
  updateState,
}: {
  records: LocationResearchRecord[];
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
}) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-pro-elevated/50 px-4 py-3">
        <p className="text-sm font-medium text-pro-text">Location research</p>
        <p className="mt-1 text-xs text-pro-text-secondary">
          Approve locations in Prep → Research review to commit pins, scout suggestions, and rules
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-pro-text">Location research</h3>
        <p className="mt-0.5 text-xs text-pro-text-secondary">
          Committed from prep review — map pins, kept suggestions, and rules.
        </p>
      </div>
      <ul className="space-y-3">
        {records.map((rec) => (
          <LocationResearchWorldCard
            key={rec.id}
            record={rec}
            onUpdate={(next) =>
              updateState((p) => ({
                ...p,
                directorPrep: {
                  ...p.directorPrep,
                  locationResearch: (p.directorPrep.locationResearch ?? []).map((row) =>
                    row.id === rec.id ? next : row
                  ),
                },
              }))
            }
          />
        ))}
      </ul>
    </div>
  );
}

function LocationResearchWorldCard({
  record,
  onUpdate,
}: {
  record: LocationResearchRecord;
  onUpdate: (next: LocationResearchRecord) => void;
}) {
  const [geocoding, setGeocoding] = useState(false);
  const display = locationResearchDisplayName(record);
  const pin = record.pinnedPlace;
  const mapQuery = pin?.mapQuery ?? record.scriptName;
  const thumbUrl = staticMapImageUrl(pin);

  async function geocodePin() {
    setGeocoding(true);
    try {
      const res = await fetch("/api/pro/locations/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mapQuery }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        result?: { lat: number; lng: number; label: string; mapQuery: string };
      };
      if (!res.ok || !data.result) {
        throw new Error(data.error ?? "Geocode failed.");
      }
      onUpdate({
        ...record,
        pinnedPlace: {
          label: data.result.label,
          mapQuery: data.result.mapQuery,
          lat: data.result.lat,
          lng: data.result.lng,
        },
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // silent in world tab — user can retry
    } finally {
      setGeocoding(false);
    }
  }

  return (
    <li className="rounded-xl border border-white/[0.08] bg-pro-elevated px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-pro-text">{display}</p>
          {record.sceneNumbers.length > 0 ? (
            <p className="mt-0.5 text-xs text-pro-text-secondary">
              Scenes {record.sceneNumbers.join(", ")}
            </p>
          ) : null}
          {record.notes.trim() ? (
            <p className="mt-1 text-xs text-pro-text-secondary">{record.notes}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {!pin?.lat ? (
            <button
              type="button"
              className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-pro-text ring-1 ring-white/10 hover:bg-white/10"
              disabled={geocoding}
              onClick={() => void geocodePin()}
            >
              {geocoding ? <Loader2 className="size-3.5 animate-spin" /> : "Find on map"}
            </button>
          ) : null}
          <a
            href={openInMapsUrl(pin, mapQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-pro-primary ring-1 ring-pro-primary/30 hover:bg-pro-primary/10"
          >
            Open in Maps
            <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
      </div>

      {thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbUrl}
          alt={`Map for ${display}`}
          className="mt-3 max-h-40 w-full rounded-lg object-cover ring-1 ring-white/10"
        />
      ) : pin?.mapQuery ? (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-pro-primary/90">
          <MapPin className="size-3" aria-hidden />
          {pin.mapQuery}
        </p>
      ) : null}

      {record.shootSuggestions.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
          {record.shootSuggestions.map((s) => (
            <li key={s.id} className="text-xs">
              <p className="font-medium text-pro-text">{s.title}</p>
              <p className="text-pro-text-secondary">{s.why}</p>
              <a
                href={openInMapsUrl(null, s.mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-pro-primary hover:underline"
              >
                {s.mapQuery}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {record.rulesAndLimitations.length > 0 ? (
        <ul className="mt-3 list-disc space-y-0.5 border-t border-white/[0.06] pt-3 pl-4 text-xs text-pro-text-secondary">
          {record.rulesAndLimitations.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function StringListEditor({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <label className="block text-sm text-pro-text-secondary">
      {label}
      <textarea
        rows={3}
        className={`mt-1 ${proSurface.field}`}
        value={values.join("\n")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
      />
    </label>
  );
}
