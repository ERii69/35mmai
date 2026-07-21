import type { LocationPin } from "@/lib/pro/types";

export type GeocodeResult = {
  lat: number;
  lng: number;
  label: string;
  mapQuery: string;
};

/** Server-side geocode via OpenStreetMap Nominatim (no API key). */
export async function geocodeMapQuery(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "35mmAiPro/1.0 (location research; contact: support@35mmai.com)",
      Accept: "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const rows = (await res.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
  }>;
  const hit = rows[0];
  if (!hit?.lat || !hit?.lon) return null;

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    lat,
    lng,
    label: hit.display_name?.split(",").slice(0, 2).join(",").trim() || q,
    mapQuery: q,
  };
}

export function applyGeocodeToPin(pin: LocationPin, result: GeocodeResult): LocationPin {
  return {
    ...pin,
    label: result.label || pin.label,
    mapQuery: result.mapQuery || pin.mapQuery,
    lat: result.lat,
    lng: result.lng,
  };
}
