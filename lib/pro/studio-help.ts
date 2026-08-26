import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

export type StudioHelpSectionId = "start" | "export" | "beats" | "budget" | "phases";

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
      "Then download the pack — tap Export next to Prompts (same Finish row, not More). Green box: Download prompt pack (.md). Open the Export tab in this guide if you cannot find it.",
    ],
  },
  {
    id: "export",
    label: "Export",
    why: "The file is not on the Prompts screen. Export is a tab next to Prompts, under Finish. The green box is the deliverable.",
    steps: [
      "Tap Finish at the top (after Script and Look). Under it you should see Prompts · Export · Sign-off. Export is not inside More.",
      "Tap Export. Still on Prompts? Use the Export button at the bottom of the prompt list (arrow). Sign-off's Download prompt pack button jumps here too.",
      "Wait until the nav says Saved. If the green buttons are locked, tap Save in the bar first, then try again.",
      "Green box Download prompt pack: tap Download prompt pack (.md). That is the file you take away. CSV (prompt pack) is the same prompts as a spreadsheet. Copy all prompts puts them on the clipboard.",
      "Optional extras are collapsed under the green box. Open Kit & planning for Budget CSV, Kit CSV, and Workflow CSV. Also export… has Fountain, Final Draft, and storyboard. Look & locations has the visual bible.",
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
      "To download: Finish → Export (next to Prompts, not More) → open Kit & planning under the green box → Budget CSV.",
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
