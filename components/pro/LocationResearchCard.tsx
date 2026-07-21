"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Loader2, MapPin } from "lucide-react";
import { removeLocationConsequence } from "@/lib/pro/staging-review-stats";
import {
  defaultMapQueryForLocation,
  openInMapsUrl,
  staticMapImageUrl,
} from "@/lib/pro/location-research";
import { KeepRemoveButtons } from "@/components/pro/ux/KeepRemoveButtons";
import type {
  AgentStagingBundle,
  AgentSuggestionStatus,
  LocationPin,
  LocationShootSuggestion,
  StagedLocationSuggestion,
} from "@/lib/pro/types";

type Props = {
  staging: AgentStagingBundle;
  location: StagedLocationSuggestion;
  promptPack?: boolean;
  editable: boolean;
  onKeep: () => void;
  onRemove: () => void;
  onUndo: () => void;
  onPatch: (patch: Partial<StagedLocationSuggestion>) => void;
  onShootStatus: (shootId: string, status: AgentSuggestionStatus) => void;
};

export function LocationResearchCard({
  staging,
  location,
  promptPack = false,
  editable,
  onKeep,
  onRemove,
  onUndo,
  onPatch,
  onShootStatus,
}: Props) {
  const [expanded, setExpanded] = useState(location.status === "pending");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const mapQuery =
    location.mapQuery?.trim() ||
    location.pinnedPlace?.mapQuery?.trim() ||
    defaultMapQueryForLocation(location.name, location.notes);
  const pinnedPlace = location.pinnedPlace ?? null;
  const shootSuggestions = location.shootSuggestions ?? [];
  const rules = location.rulesAndLimitations ?? [];
  const removeHint = editable ? removeLocationConsequence(staging, location) : null;
  const thumbUrl = staticMapImageUrl(pinnedPlace);

  async function geocodePin() {
    if (!editable || !mapQuery) return;
    setGeocoding(true);
    setGeocodeError(null);
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
      const nextPin: LocationPin = {
        label: data.result.label,
        mapQuery: data.result.mapQuery,
        lat: data.result.lat,
        lng: data.result.lng,
      };
      onPatch({ pinnedPlace: nextPin, mapQuery: data.result.mapQuery });
    } catch (e) {
      setGeocodeError(e instanceof Error ? e.message : "Could not geocode.");
    } finally {
      setGeocoding(false);
    }
  }

  const removed = location.status === "rejected";
  const cardClass =
    location.status === "approved"
      ? "bg-pro-elevated ring-emerald-600/25"
      : removed
        ? "bg-pro-muted/50 ring-white/[0.06]"
        : "bg-pro-elevated ring-white/[0.06]";

  return (
    <li className={`rounded-xl px-4 py-4 text-sm ring-1 ${cardClass}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="flex w-full items-start gap-2 text-left"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            <ChevronDown
              className={`mt-0.5 size-4 shrink-0 text-pro-text-secondary transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            />
            <div className="min-w-0">
              <p
                className={`font-semibold text-pro-text ${removed ? "line-through decoration-pro-text-secondary opacity-60" : ""}`}
              >
                {location.name}
              </p>
              <p className="mt-0.5 text-xs text-pro-text-secondary">
                {location.notes ||
                  (location.sceneNumbers?.length
                    ? `Scenes ${location.sceneNumbers.join(", ")}`
                    : promptPack
                      ? "Scene setting for prompts"
                      : "From scene headings")}
              </p>
              {mapQuery && !promptPack ? (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-pro-primary/90">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  {mapQuery}
                </p>
              ) : null}
            </div>
          </button>
        </div>
        {editable ? (
          <KeepRemoveButtons
            status={location.status}
            onKeep={onKeep}
            onRemove={onRemove}
            onUndo={onUndo}
          />
        ) : null}
      </div>

      {expanded && !removed ? (
        <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
          {removeHint ? (
            <p className="text-xs text-pro-warning">{removeHint}</p>
          ) : null}

          {promptPack ? (
            <p className="text-xs leading-relaxed text-pro-text-secondary">
              This is a <strong className="text-pro-text">scene setting</strong> from your script. It
              feeds look and prompt text, not physical location scouting. Keep it if the setting
              belongs in your prompt pack.
            </p>
          ) : null}

          {!promptPack ? (
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-pro-text">Map pin</p>
            <label className="block text-xs text-pro-text-secondary">
              Search query
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-white/10 bg-pro-base px-3 py-2 text-sm text-pro-text"
                value={mapQuery}
                disabled={!editable}
                onChange={(e) =>
                  onPatch({
                    mapQuery: e.target.value,
                    pinnedPlace: pinnedPlace
                      ? { ...pinnedPlace, mapQuery: e.target.value }
                      : null,
                  })
                }
              />
            </label>
            {editable ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-pro-text ring-1 ring-white/10 hover:bg-white/10"
                  disabled={geocoding || !mapQuery.trim()}
                  onClick={() => void geocodePin()}
                >
                  {geocoding ? (
                    <Loader2 className="inline size-3.5 animate-spin" aria-hidden />
                  ) : (
                    "Find on map"
                  )}
                </button>
                <a
                  href={openInMapsUrl(pinnedPlace, mapQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-pro-primary ring-1 ring-pro-primary/30 hover:bg-pro-primary/10"
                >
                  Open in Maps
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </div>
            ) : null}
            {geocodeError ? <p className="text-xs text-red-300">{geocodeError}</p> : null}
            {thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbUrl}
                alt={`Map preview for ${location.name}`}
                className="mt-2 max-h-36 w-full rounded-lg object-cover ring-1 ring-white/10"
              />
            ) : pinnedPlace?.lat != null ? null : (
              <p className="text-xs text-pro-text-secondary/80">
                Tap Find on map to pin coordinates for a thumbnail preview.
              </p>
            )}
          </section>
          ) : null}

          {!promptPack && shootSuggestions.length > 0 ? (
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-pro-text">
              Shoot suggestions ({shootSuggestions.filter((s) => s.status !== "rejected").length})
            </p>
            {shootSuggestions.length === 0 ? (
              <p className="text-xs text-pro-text-secondary">No scout suggestions for this location.</p>
            ) : (
              <ul className="space-y-2">
                {shootSuggestions.map((suggestion) => (
                  <ShootSuggestionRow
                    key={suggestion.id}
                    suggestion={suggestion}
                    editable={editable}
                    onStatus={(status) => onShootStatus(suggestion.id, status)}
                    onPatch={(patch) =>
                      onPatch({
                        shootSuggestions: shootSuggestions.map((s) =>
                          s.id === suggestion.id ? { ...s, ...patch } : s
                        ),
                      })
                    }
                  />
                ))}
              </ul>
            )}
          </section>
          ) : null}

          {!promptPack ? (
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-pro-text">
              Rules &amp; limitations
            </p>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-pro-base px-3 py-2 text-xs text-pro-text"
              value={rules.join("\n")}
              disabled={!editable}
              placeholder="Permits, access hours, noise limits…"
              onChange={(e) =>
                onPatch({
                  rulesAndLimitations: e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
            />
          </section>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function ShootSuggestionRow({
  suggestion,
  editable,
  onStatus,
  onPatch,
}: {
  suggestion: LocationShootSuggestion;
  editable: boolean;
  onStatus: (status: AgentSuggestionStatus) => void;
  onPatch: (patch: Partial<LocationShootSuggestion>) => void;
}) {
  const hidden = suggestion.status === "rejected";
  const rowClass =
    suggestion.status === "approved"
      ? "ring-white/[0.1] bg-pro-elevated/80"
      : hidden
        ? "opacity-50 ring-white/[0.04]"
        : "ring-white/[0.08]";

  return (
    <li className={`rounded-lg px-3 py-2 ring-1 ${rowClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          {editable ? (
            <>
              <input
                type="text"
                className="w-full rounded border border-white/10 bg-pro-base px-2 py-1 text-xs font-medium text-pro-text"
                value={suggestion.title}
                onChange={(e) => onPatch({ title: e.target.value })}
              />
              <textarea
                rows={2}
                className="w-full rounded border border-white/10 bg-pro-base px-2 py-1 text-xs text-pro-text-secondary"
                value={suggestion.why}
                onChange={(e) => onPatch({ why: e.target.value })}
              />
              <input
                type="text"
                className="w-full rounded border border-white/10 bg-pro-base px-2 py-1 text-[11px] text-pro-primary/90"
                value={suggestion.mapQuery}
                onChange={(e) => onPatch({ mapQuery: e.target.value })}
              />
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-pro-text">{suggestion.title}</p>
              <p className="text-xs text-pro-text-secondary">{suggestion.why}</p>
              <p className="text-[11px] text-pro-primary/90">{suggestion.mapQuery}</p>
            </>
          )}
          <a
            href={openInMapsUrl(null, suggestion.mapQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-pro-primary hover:underline"
          >
            Open in Maps
            <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
        {editable ? (
          <KeepRemoveButtons
            status={suggestion.status}
            onKeep={() => onStatus("approved")}
            onRemove={() => onStatus("rejected")}
            onUndo={() => onStatus("pending")}
          />
        ) : null}
      </div>
    </li>
  );
}

