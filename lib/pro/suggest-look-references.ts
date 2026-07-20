import { buildLocalMoodBoard } from "@/lib/pro/build-local-mood-board";
import { isCorruptReferenceFragment, isWebReferenceUrl, normalizePhotoDataUrl } from "@/lib/pro/reference-url-utils";
import type { DirectorRulesState, ProjectStatePayload } from "@/lib/pro/types";

export type LookReferenceSuggestion = {
  id: string;
  label: string;
  why: string;
  category: "film" | "artist" | "photographer" | "search";
};

const GENRE_FILMS: Record<string, string[]> = {
  drama: ["Carol (2015)", "Nomadland", "Aftersun"],
  documentary: ["Honeyland", "For Sama", "Won't You Be My Neighbor?"],
  interview: ["The Act of Killing", "American Factory"],
  commercial: ["Apple — Shot on iPhone campaigns", "Nike — You Can't Stop Us"],
  "music video": ["Beyoncé — Lemonade", "Frank Ocean — Nikes"],
  "narrative short": ["The Phone Call", "Two Distant Strangers", "Skin"],
  feature: ["Manchester by the Sea", "The Rider", "Past Lives"],
};

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

function existingLabels(state: ProjectStatePayload): Set<string> {
  const set = new Set<string>();
  for (const url of state.visualBible.referenceUrls) {
    if (url.startsWith("data:image")) continue;
    set.add(normalizeLabel(url));
  }
  return set;
}

/** Prose tone lines from Prep — not usable as look reference cards. */
export function isProseToneReference(value: string): boolean {
  const t = value.trim();
  if (!t || t.startsWith("data:image") || isWebReferenceUrl(t)) return false;
  if (t.length > 72) return true;
  if (/[–—]/.test(t) && /\b(not|avoid|never|don't|do not)\b/i.test(t)) return true;
  if (/\b(festival|feed|clip|content|social|tiktok|reels)\b/i.test(t) && t.split(/\s+/).length > 4) {
    return true;
  }
  return false;
}

function genreFilmSuggestions(rules: DirectorRulesState): LookReferenceSuggestion[] {
  const out: LookReferenceSuggestion[] = [];
  const tags = rules.genreTags.length ? rules.genreTags : ["drama"];
  for (const tag of tags) {
    const key = tag.toLowerCase();
    const films = GENRE_FILMS[key] ?? GENRE_FILMS["narrative short"] ?? [];
    for (const label of films) {
      out.push({
        id: `genre-${normalizeLabel(label)}`,
        label,
        why: `Matches ${tag} tone from your Prep vision`,
        category: "film",
      });
    }
  }
  return out;
}

function moodBoardFilmSuggestions(state: ProjectStatePayload): LookReferenceSuggestion[] {
  const visual = buildLocalMoodBoard(state);
  return (visual.moodBoardReferences ?? [])
    .filter((r) => r.filmReference.trim())
    .map((r, i) => ({
      id: `mbr-${i}-${normalizeLabel(r.filmReference)}`,
      label: r.filmReference.trim(),
      why: r.whyItFits.trim() || r.title,
      category: "film" as const,
    }));
}

/** Deterministic look references from Prep rules + mood board tiles (no API). */
export function buildLocalLookReferenceSuggestions(
  state: ProjectStatePayload
): LookReferenceSuggestion[] {
  const rules = state.directorPrep.directorRules;
  const have = existingLabels(state);
  const seen = new Set<string>();
  const out: LookReferenceSuggestion[] = [];

  for (const s of [...moodBoardFilmSuggestions(state), ...genreFilmSuggestions(rules)]) {
    const key = normalizeLabel(s.label);
    if (have.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }

  const tone = rules.toneAndRefs.trim();
  if (tone && !isProseToneReference(tone)) {
    for (const part of tone.split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
      if (isProseToneReference(part) || part.length < 3) continue;
      const key = normalizeLabel(part);
      if (have.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: `tone-${key}`,
        label: part,
        why: "Named in your Prep vision references",
        category: part.includes("Deakins") || part.includes("Lubezki") ? "photographer" : "film",
      });
    }
  }

  return out.slice(0, 8);
}

export function filmReferenceLabels(state: ProjectStatePayload): string[] {
  return state.visualBible.referenceUrls.filter(
    (u) => !u.startsWith("data:image") && !isWebReferenceUrl(u) && !isProseToneReference(u)
  );
}

export function webReferenceLinks(state: ProjectStatePayload): string[] {
  return state.visualBible.referenceUrls.filter((u) => isWebReferenceUrl(u));
}

/** Drop prose tone lines, corrupt base64 fragments, and duplicates. */
export function sanitizeReferenceUrls(urls: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of urls) {
    const u = normalizePhotoDataUrl(raw.trim());
    if (!u || isCorruptReferenceFragment(u)) continue;
    if (!u.startsWith("data:image") && !isWebReferenceUrl(u) && isProseToneReference(u)) continue;
    const key = u.startsWith("data:image") ? `photo:${u.length}:${u.slice(-12)}` : u.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(u);
  }
  return out.slice(0, 24);
}
