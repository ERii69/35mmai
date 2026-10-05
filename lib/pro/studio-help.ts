import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

export type StudioHelpSectionId = "start" | "export" | "beats" | "budget" | "phases";

export type StudioHelpSection = {
  id: StudioHelpSectionId;
  label: string;
  why: string;
  steps: string[];
};

export const STUDIO_HELP_INTRO = `${BRAND_NAME_PRO} does not generate images or video. Paste a script. Each shot has a sentence. Pick the tool. Copy the prompt and paste it there.`;

export const STUDIO_HELP_SECTIONS: StudioHelpSection[] = [
  {
    id: "start",
    label: "15-minute path",
    why: "This is the job: one sentence per shot, the tool you picked, and a prompt you can paste. Beats, Kit, Phases, World, and Budget are not part of that path.",
    steps: [
      "Open your project. Template should be Script to prompt (default).",
      "Script: paste pages with INT./EXT. headings, or Try 3-scene demo (that loads a sample, not your other projects). Run prep. That drafts a sentence for each shot, plus the people and places.",
      "Finish → Prompts. Edit a sentence and that shot’s paste follows. Pick the tool under the sentence. Suggested: Grok Imagine, Midjourney, Nano Banana 2, Kling, LTX Studio, Higgsfield. The paste is rewritten for that tool. The sentence stays.",
      "People and places is on the same page. Change a face, a place, or the kept-still words and every paste that uses them updates as you type. The kept still is the face prompt in words. Nothing is uploaded.",
      "Copy the prompt. Open the tool. Paste it there. The picture is made there, not here.",
      "Export is the tab next to Prompts. Download prompt pack (.md) or CSV. If a yellow line says a detail is in some scenes and missing in another, the pack stays until the sentences match. Shot list still downloads.",
    ],
  },
  {
    id: "export",
    label: "Export",
    why: "The file is not on the Prompts screen. Export is the tab next to Prompts. The pack is what you paste. The shot list is the one-page handoff.",
    steps: [
      "Tap Finish at the top. Under it: Prompts, Export, Sign-off. Export is not inside More.",
      "Tap Export. From Prompts, the Export button at the top of the list jumps here too.",
      "Wait until the bar says Saved.",
      "Download prompt pack (.md) is the file you take away. CSV (prompt pack) is the same prompts as a spreadsheet. Copy all prompts puts them on the clipboard. Shot list is the sentences, one page.",
      "A yellow line means a detail (such as a coat) is in the sentences for some scenes and missing in another. The pack buttons stay off until that matches. Shot list still downloads.",
      "Optional extras sit under the pack: Kit & planning, Look & locations, and other file types.",
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
