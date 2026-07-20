import type { ChecklistItem, ProjectStatePayload } from "@/lib/pro/types";

type PostStepDef = { id: string; label: string; hint: string };

const POST_STEP_DEFS: PostStepDef[] = [
  {
    id: "post-assembly",
    label: "Assembly / rough cut locked",
    hint: "Lock story order and scene lengths before color or sound. Export a review cut (ProRes or H.264) with burned-in timecode for notes.",
  },
  {
    id: "post-vfx",
    label: "VFX and cleanup passes",
    hint: "Fix continuity (wardrobe, props, eyelines), remove distractions, and plate any shots that need compositing. Keep a shot list of VFX IDs tied to timecode.",
  },
  {
    id: "post-color",
    label: "Color grade — match approved look bible",
    hint: "Grade with your look references and palette open. Do a neutral pass first, then creative; check skin tones and blacks on a calibrated display.",
  },
  {
    id: "post-sound",
    label: "Sound design, ADR, and mix",
    hint: "Build dialogue edit, room tone, and effects beds; schedule ADR for lines you cannot save. Mix to −24 LUFS for streaming or festival specs.",
  },
  {
    id: "post-music",
    label: "Music and score integration",
    hint: "Clear rights or use licensed tracks. Duck music under dialogue; leave headroom for the final mix. Note cue in/out points on the timeline.",
  },
  {
    id: "post-export",
    label: "Master export and festival / platform deliverables",
    hint: "Export master (ProRes 422 or DNxHR) plus H.264 screening file. Check safe areas, captions if required, and any platform codec sheets.",
  },
];

export const DEFAULT_POST_CHECKLIST: ChecklistItem[] = POST_STEP_DEFS.map((s) => ({
  id: s.id,
  label: s.label,
  hint: s.hint,
  done: false,
}));

function step(id: string, label: string, hint: string): ChecklistItem {
  return { id, label, hint, done: false };
}

/** Heuristic post steps from project state (no API). */
export function suggestPostChecklistItems(state: ProjectStatePayload): ChecklistItem[] {
  const items: ChecklistItem[] = [...DEFAULT_POST_CHECKLIST];
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const tone = state.directorPrep.directorRules.toneAndRefs.trim();
  if (mood || tone) {
    const ref = [mood, tone].filter(Boolean).join(" · ");
    items.push(
      step(
        `post-look-${Date.now()}`,
        `Grade review against look: ${ref.slice(0, 72)}${ref.length > 72 ? "…" : ""}`,
        "Compare a still from your grade to mood references and approved palette. Note any scene that drifts from the prep look bible before you sign off color."
      )
    );
  }
  const shotCount = state.shotPlan.sequences.flatMap((s) => s.shots).length;
  if (shotCount > 0) {
    items.push(
      step(
        `post-shots-${Date.now()}`,
        `Storyboard / shot coverage check (${shotCount} planned shots)`,
        "Spot-check that each planned shot appears in the cut (or is intentionally omitted). Flag missing coverage before picture lock so you can grab inserts if needed."
      )
    );
  }
  if (state.directorPrep.scenes.some((s) => s.status === "approved")) {
    const sceneCount = state.directorPrep.scenes.filter((s) => s.status === "approved").length;
    items.push(
      step(
        `post-prep-${Date.now()}`,
        `Verify ${sceneCount} approved prep scene${sceneCount === 1 ? "" : "s"} match final edit`,
        "Cross-read scene headings from prep against your timeline. Renumber or relabel selects if the edit reordered story beats."
      )
    );
  }
  return items;
}
