import type { ProjectStatePayload } from "@/lib/pro/types";
import type { ReferenceLibraryAnalysis } from "@/lib/pro/analyze-reference-library";
import { stripDuplicatePhotosFromScenes } from "@/lib/pro/apply-visual-refs-to-shots";

/** Apply photo/link analysis without bloating designSheetNotes. */
export function applyReferenceAnalysis(
  state: ProjectStatePayload,
  analysis: Pick<ReferenceLibraryAnalysis, "mood" | "palette"> & {
    source?: string;
    summary?: string;
    lensAndFraming?: string;
    grainAndTexture?: string;
  },
  referenceUrls: string[]
): ProjectStatePayload {
  const next: ProjectStatePayload = {
    ...state,
    visualBible: {
      ...state.visualBible,
      referenceUrls,
      palette: analysis.palette.length > 0 ? analysis.palette : state.visualBible.palette,
      lensAndFraming:
        analysis.lensAndFraming?.trim() || state.visualBible.lensAndFraming,
      grainAndTexture:
        analysis.grainAndTexture?.trim() || state.visualBible.grainAndTexture,
    },
    directorPrep: {
      ...state.directorPrep,
      agentMeta: {
        ...state.directorPrep.agentMeta,
        visualMood: analysis.mood.trim() || state.directorPrep.agentMeta.visualMood,
        lastRunAt: new Date().toISOString(),
      },
    },
  };
  return stripDuplicatePhotosFromScenes(next);
}

export function estimateReferencePayloadBytes(referenceUrls: string[]): number {
  return new TextEncoder().encode(JSON.stringify({ referenceUrls })).length;
}

/** Max POST body for analyze-refs when sending embedded stills (~700KB JSON). */
export const ANALYZE_REFS_MAX_PAYLOAD_BYTES = 700_000;
