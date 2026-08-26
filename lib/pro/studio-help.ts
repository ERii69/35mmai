import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

export type StudioHelpSectionId = "start" | "beats" | "budget" | "phases";

export type StudioHelpSection = {
  id: StudioHelpSectionId;
  label: string;
  why: string;
  steps: string[];
};

export const STUDIO_HELP_INTRO = `${BRAND_NAME_PRO} does not generate images or video. You paste a screenplay, lock a look, and leave with copy-ready prompts for tools you already use — Midjourney, Kling, LTX, and the rest of your kit.`;

export const STUDIO_HELP_SECTIONS: StudioHelpSection[] = [
  {
    id: "start",
    label: "15-minute path",
    why: "This is the job: script + look → a prompt pack you can paste. You do not need Beats, Budget, or Phases to finish.",
    steps: [
      "Open your project. Template should be Script to prompt (default).",
      "Script: paste pages with INT./EXT. headings, or Try 3-scene demo (that loads a sample, not your other projects). Run prep.",
      "Look: add one palette swatch or a short mood line. Wait for Saved.",
      "Finish → Prompts. If you changed the script, tap Build all. Each beat is a different shot (wide / medium / close-up).",
      "Copy a prompt. Open tool. Paste into that app. Midjourney: shot text first, --ar flags at the end — if flags come first, Midjourney says the prompt is empty.",
      "Finish → Export → Download prompt pack (.md or CSV). That file is the deliverable.",
    ],
  },
  {
    id: "beats",
    label: "Beats",
    why: "Use Beats when you want to see coverage as cards — one angle per card — and reorder them. Not required to export a prompt pack.",
    steps: [
      "Finish → More → Beats (labeled Shots in some places).",
      "You should see one group per approved scene. If a scene is empty, tap Build from script.",
      "Drag a card to reorder. Wait for Saved, then reload — order should stick.",
      "Optional: Suggest coverage if wide / medium / close-up is missing. Match visual bible if you already set a look.",
    ],
  },
  {
    id: "budget",
    label: "Budget",
    why: "A rough monthly tooling range from your scenes or shot plan — so the kit stays honest. Not a line-producer budget.",
    steps: [
      "Finish → More → Budget.",
      "Tap Suggest from shot plan (or Suggest from scenes). Review the modal → Apply to budget.",
      "Change a quantity if you need. Wait for Saved. Reload to confirm it stuck.",
      "To download: Finish → Export → open Kit & planning (collapsed) → Budget CSV.",
    ],
  },
  {
    id: "phases",
    label: "Phases",
    why: "Track where this project sits in pre-production vs production, using the same catalog phases as the free site. Optional checklist, not a second workflow picker.",
    steps: [
      "Finish → More → Phases.",
      "You should see pre-production through production steps.",
      "Mark one phase done. Wait for Saved. Reload — the check should remain.",
      "Kit and Post links stay in this same project; your script is not replaced.",
    ],
  },
];
