import type {
  LocationPin,
  LocationResearchRecord,
  LocationShootSuggestion,
  StagedLocationSuggestion,
} from "@/lib/pro/types";

export function defaultMapQueryForLocation(name: string, notes?: string): string {
  const base = name.trim();
  if (!base) return "";
  const hint = (notes ?? "").trim();
  if (hint && !hint.toLowerCase().includes(base.toLowerCase())) {
    return `${base} ${hint}`.slice(0, 180);
  }
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    const generic = new Set([
      "fields",
      "field",
      "house",
      "room",
      "street",
      "yard",
      "barn",
      "road",
      "forest",
      "park",
      "kitchen",
      "bedroom",
    ]);
    if (generic.has(words[0]!.toLowerCase())) {
      return `${base} filming location`;
    }
  }
  return base;
}

export function createLocationPin(label: string, mapQuery?: string): LocationPin {
  const q = (mapQuery ?? label).trim();
  return {
    label: label.trim() || q,
    mapQuery: q || label.trim(),
    lat: null,
    lng: null,
  };
}

export function openInMapsUrl(pin: LocationPin | null, fallbackQuery?: string): string {
  if (pin?.lat != null && pin?.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}`;
  }
  const q = (pin?.mapQuery || pin?.label || fallbackQuery || "").trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** Static OSM thumbnail — no API key required. */
export function staticMapImageUrl(
  pin: LocationPin | null,
  size: { width: number; height: number } = { width: 400, height: 160 }
): string | null {
  if (pin?.lat == null || pin?.lng == null) return null;
  const { width, height } = size;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${pin.lat},${pin.lng}&zoom=13&size=${width}x${height}&markers=${pin.lat},${pin.lng},red`;
}

export function newShootSuggestionId(prefix = "shoot"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildDefaultShootSuggestions(
  name: string,
  notes: string,
  mapQuery: string,
  options?: {
    promptPack?: boolean;
    sceneNumbers?: number[];
    sourceHeading?: string;
    oneLine?: string;
  }
): LocationShootSuggestion[] {
  if (options?.promptPack) {
    return [];
  }

  const sceneLabel = options?.sceneNumbers?.length
    ? `Scene ${options.sceneNumbers.join(", ")}`
    : "";
  const why =
    options?.oneLine?.trim() ||
    notes.trim() ||
    options?.sourceHeading?.trim() ||
    "Setting from your script.";
  const q = mapQuery.trim() || defaultMapQueryForLocation(name, notes);
  if (!q) return [];

  return [
    {
      id: newShootSuggestionId(),
      title: sceneLabel ? `${name.trim()} · ${sceneLabel}` : `Film at ${name.trim()}`,
      why: why.slice(0, 200),
      mapQuery: q,
      status: "pending",
    },
  ];
}

export function commitLocationFromStaging(loc: StagedLocationSuggestion): LocationResearchRecord {
  const mapQuery =
    loc.mapQuery?.trim() ||
    loc.pinnedPlace?.mapQuery?.trim() ||
    defaultMapQueryForLocation(loc.name, loc.notes);
  const pinnedPlace =
    loc.pinnedPlace ??
    (mapQuery ? createLocationPin(loc.name, mapQuery) : null);
  const shootSuggestions = (loc.shootSuggestions ?? [])
    .filter((s) => s.status !== "rejected")
    .map(({ id, title, why, mapQuery: sq }) => ({
      id,
      title: title.trim(),
      why: why.trim(),
      mapQuery: sq.trim() || mapQuery,
    }));

  return {
    id: loc.suggestionId,
    scriptName: loc.name.trim(),
    sceneNumbers: loc.sceneNumbers ?? [],
    notes: loc.notes.trim(),
    pinnedPlace,
    shootSuggestions,
    rulesAndLimitations: (loc.rulesAndLimitations ?? [])
      .map((r) => r.trim())
      .filter(Boolean),
    updatedAt: new Date().toISOString(),
  };
}

export function mergeLocationResearch(
  existing: LocationResearchRecord[],
  incoming: LocationResearchRecord[]
): LocationResearchRecord[] {
  const byKey = new Map<string, LocationResearchRecord>();
  for (const row of existing) {
    byKey.set(row.scriptName.trim().toLowerCase(), row);
  }
  for (const row of incoming) {
    byKey.set(row.scriptName.trim().toLowerCase(), row);
  }
  return [...byKey.values()].sort((a, b) =>
    a.scriptName.localeCompare(b.scriptName, undefined, { sensitivity: "base" })
  );
}

export function locationResearchDisplayName(record: LocationResearchRecord): string {
  return record.pinnedPlace?.label?.trim() || record.scriptName;
}
