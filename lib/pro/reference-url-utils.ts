/** True for http(s) links — not film titles or search phrases from the agent. */
export function isWebReferenceUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Google search for a film / artist name used as a look reference. */
export function filmReferenceSearchUrl(label: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${label.trim()} film cinematography look reference`)}`;
}

export function referenceKind(value: string): "photo" | "link" | "film" {
  if (value.startsWith("data:image")) return "photo";
  if (isWebReferenceUrl(value)) return "link";
  return "film";
}

export function referenceDisplayLabel(value: string): string {
  if (value.startsWith("data:image")) return "Photo";
  if (isWebReferenceUrl(value)) {
    try {
      return new URL(value).hostname.replace(/^www\./, "");
    } catch {
      return value;
    }
  }
  return value.trim();
}

/** Fix malformed data URLs e.g. data:image//jpeg;base64,... */
export function normalizePhotoDataUrl(value: string): string {
  const t = value.trim();
  if (!t.toLowerCase().startsWith("data:image")) return t;
  return t.replace(/^data:image\/\/+/i, "data:image/");
}

export function buildShotReferenceLabels(urls: string[]): Map<string, string> {
  const map = new Map<string, string>();
  let photoNum = 0;
  for (const url of urls) {
    if (referenceKind(url) === "photo") {
      photoNum += 1;
      map.set(url, `Photo ${photoNum}`);
      continue;
    }
    const label = referenceDisplayLabel(url);
    map.set(url, label.length > 52 ? `${label.slice(0, 49)}…` : label);
  }
  return map;
}

/** React list key — JPEG data URLs share identical base64 prefixes after compression. */
export function referenceListKey(url: string, index: number): string {
  const tail = url.length > 16 ? url.slice(-8) : url;
  return `ref-${index}-${url.length}-${tail}`;
}

/** Fragment left when a data URL was split across lines in a text field. */
export function isCorruptReferenceFragment(value: string): boolean {
  const t = value.trim();
  if (!t) return true;
  if (t.startsWith("data:image")) return false;
  if (isWebReferenceUrl(t)) return false;
  if (t.length < 28) return false;
  if (/\s/.test(t)) return false;
  return /^[A-Za-z0-9+/=_-]+$/.test(t);
}

export function partitionReferenceUrls(urls: string[]): {
  photos: string[];
  labels: string[];
} {
  const photos: string[] = [];
  const labels: string[] = [];
  for (const url of urls) {
    if (isCorruptReferenceFragment(url)) continue;
    if (url.startsWith("data:image")) photos.push(url);
    else labels.push(url);
  }
  return { photos, labels };
}

export function mergeReferenceUrls(photos: string[], labels: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const u of [...labels, ...photos]) {
    if (isCorruptReferenceFragment(u)) continue;
    const key = u.startsWith("data:image") ? u.slice(0, 80) + u.length : u.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(u);
  }
  return out.slice(0, 24);
}
