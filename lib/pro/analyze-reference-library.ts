import { buildLocalMoodBoard } from "@/lib/pro/build-local-mood-board";
import type { ProjectStatePayload } from "@/lib/pro/types";

export type ReferenceLibraryAnalysis = {
  summary: string;
  palette: string[];
  designNotes: string;
  mood: string;
  lensAndFraming: string;
  grainAndTexture: string;
};

/** Synthesize look notes from reference library + prep (no vision API). */
export function buildLocalReferenceLibraryAnalysis(
  state: ProjectStatePayload
): ReferenceLibraryAnalysis {
  const urls = state.visualBible.referenceUrls;
  const stillCount = urls.filter((u) => u.startsWith("data:image")).length;
  const linkCount = urls.length - stillCount;
  const visual = buildLocalMoodBoard(state);

  const summary = [
    `${urls.length} reference${urls.length === 1 ? "" : "s"} in library`,
    stillCount ? `${stillCount} uploaded still${stillCount === 1 ? "" : "s"}` : null,
    linkCount ? `${linkCount} external link${linkCount === 1 ? "" : "s"}` : null,
    state.directorPrep.scenes.length
      ? `${state.directorPrep.scenes.length} prep scene${state.directorPrep.scenes.length === 1 ? "" : "s"} cross-checked`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const designNotes = [
    "## Reference library analysis",
    summary + ".",
  ].join("\n");

  return {
    summary,
    palette: visual.palette,
    designNotes,
    mood: visual.mood,
    lensAndFraming: visual.lensAndFraming ?? "",
    grainAndTexture: visual.grainAndTexture ?? "",
  };
}
