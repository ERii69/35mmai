/** What Step 3 compares between look bible and prep scenes. */
export const LOOK_SCAN_CHECKS = [
  {
    id: "palette",
    label: "Palette",
    description: "Scene color notes vs mood board swatches",
  },
  {
    id: "lighting",
    label: "Lighting",
    description: "Hard/soft light and time of day in scene notes",
  },
  {
    id: "mood",
    label: "Mood & tone",
    description: "Genre, tone, and visual refs in Prep vs look bible",
  },
] as const;
