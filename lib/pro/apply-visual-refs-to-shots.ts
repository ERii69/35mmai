import type { ProjectStatePayload } from "@/lib/pro/types";

/**
 * Attach look metadata to prep + shot plan.
 * Photos stay once in visualBible.referenceUrls — never duplicated per scene (saves MB of state).
 */
export function applyVisualRefsToShots(state: ProjectStatePayload): ProjectStatePayload {
  const refs = state.visualBible.referenceUrls.filter(Boolean).slice(0, 6);
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const palette = state.visualBible.palette.slice(0, 4);
  const linkRefs = refs.filter((r) => !r.startsWith("data:image"));
  const photoCount = refs.length - linkRefs.length;
  const tag = [
    mood,
    ...palette,
    ...linkRefs,
    photoCount > 0 ? `${photoCount} reference photo${photoCount === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  if (!tag && linkRefs.length === 0) return stripDuplicatePhotosFromScenes(state);

  const scenes = state.directorPrep.scenes.map((scene) => {
    const withoutPhotos = scene.visualRefs.filter((r) => !r.startsWith("data:image"));
    const existing = new Set(withoutPhotos.map((r) => r.toLowerCase()));
    const added = linkRefs.filter((r) => !existing.has(r.toLowerCase()));
    if (!added.length && withoutPhotos.length === scene.visualRefs.length) return scene;
    return {
      ...scene,
      visualRefs: [...withoutPhotos, ...added].slice(0, 8),
    };
  });

  const sequences = state.shotPlan.sequences.map((seq, i) => {
    if (i > 0 || seq.notes.includes("Visual bible:")) return seq;
    return {
      ...seq,
      notes: seq.notes.trim()
        ? `${seq.notes.trim()}\n\nVisual bible: ${tag}`
        : `Visual bible: ${tag}`,
    };
  });

  return {
    ...state,
    directorPrep: { ...state.directorPrep, scenes },
    shotPlan: { sequences },
  };
}

/** Remove uploaded stills copied onto scenes — library is the single source of truth. */
export function stripDuplicatePhotosFromScenes(state: ProjectStatePayload): ProjectStatePayload {
  const scenes = state.directorPrep.scenes.map((scene) => {
    const withoutPhotos = scene.visualRefs.filter((r) => !r.startsWith("data:image"));
    if (withoutPhotos.length === scene.visualRefs.length) return scene;
    return { ...scene, visualRefs: withoutPhotos };
  });
  return { ...state, directorPrep: { ...state.directorPrep, scenes } };
}
