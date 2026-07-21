import type { ProjectStatePayload } from "@/lib/pro/types";

export type ProjectCover = {
  /** HTTPS or data:image URL for <img> */
  imageUrl: string | null;
  /** CSS gradient when no image */
  gradient: string;
  /** Mood line for alt text */
  alt: string;
};

function extractHex(swatches: string[]): string[] {
  const out: string[] = [];
  for (const s of swatches) {
    const m = s.match(/#([0-9a-f]{3,8})/i);
    if (m) out.push(m[0]);
  }
  return out;
}

function firstImageUrl(state: ProjectStatePayload): string | null {
  const candidates: string[] = [];
  for (const url of state.visualBible.referenceUrls) {
    if (url.trim()) candidates.push(url.trim());
  }
  for (const scene of state.directorPrep.scenes) {
    for (const url of scene.visualRefs) {
      if (url.trim()) candidates.push(url.trim());
    }
  }
  for (const seq of state.shotPlan.sequences) {
    for (const shot of seq.shots) {
      if (shot.visualRefUrl.trim()) candidates.push(shot.visualRefUrl.trim());
    }
  }
  for (const url of candidates) {
    if (url.startsWith("data:image")) return url;
    if (/^https?:\/\//i.test(url)) return url;
  }
  return null;
}

/** Derive dashboard / card cover from workspace state (no upload storage required). */
export function getProjectCoverFromState(state: ProjectStatePayload): ProjectCover {
  const title = state.directorPrep.screenplay.title.trim() || "Untitled project";
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const hexes = extractHex(state.visualBible.palette);
  const primary = hexes[0] ?? "#C8102E";
  const secondary = hexes[1] ?? "#1a1a1a";
  const tertiary = hexes[2] ?? "#0f0f0f";

  const gradient = `linear-gradient(135deg, ${tertiary} 0%, ${secondary} 45%, ${primary}88 100%)`;

  return {
    imageUrl: firstImageUrl(state),
    gradient,
    alt: mood ? `${title} — ${mood.slice(0, 80)}` : title,
  };
}
