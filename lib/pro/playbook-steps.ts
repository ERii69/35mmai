import { AI_MEDIUM_NOTE } from "@/lib/pro/free-vs-pro";
import { getToolByRank } from "@/app/data";

export type WorkspaceTabId =
  | "director"
  | "world"
  | "visual"
  | "shots"
  | "prompts"
  | "kit"
  | "workflow"
  | "budget"
  | "export"
  | "post";

export type PlaybookToolRef = {
  rank: number;
  why: string;
};

export type PlaybookStep = {
  id: string;
  title: string;
  body: string;
  workspaceTab: WorkspaceTabId;
  tools: PlaybookToolRef[];
};

export type PlaybookIntro = {
  lead: string;
  footer: string;
};

export type StructuredPlaybook = {
  id: string;
  name: string;
  intro: PlaybookIntro;
  steps: PlaybookStep[];
};

/** Classical AI short — location-pass pipeline (original 35mmAiPro methodology). */
const CLASSICAL_LOCATION_PASS_PLAYBOOK: StructuredPlaybook = {
  id: "classical-location-pass",
  name: "Classical film — location-pass method",
  intro: {
    lead: `A serious short can take months and still beat the old gatekeeping model — if you treat creativity as the job, not the software brand. Free lists tools; Pro saves the **sequence** (world → places → stills → motion → edit). ${AI_MEDIUM_NOTE}`,
    footer:
      "Built for festival-minded storytelling — not feed-sized clips or trend formats.",
  },
  steps: [
    {
      id: "accumulated-bible",
      title: "1. Build on work you already have",
      workspaceTab: "world",
      body: "Strong films rarely start at blank page. Sketches, drafts, or earlier episodes give you tone, faces, and rules the audience will feel even when they cannot name them. This project holds that memory — not just today's model release.",
      tools: [
        { rank: 14, why: "Breakdown and schedule in Filmustage when the script is production-ready." },
        { rank: 4, why: "Turn script beats into visual planning once the story is true." },
      ],
    },
    {
      id: "story-beats",
      title: "2. Story before software",
      workspaceTab: "world",
      body: "Chat will always ask which app you use. Your bible answers whether the scene belongs in your film. Write need, conflict, and tone first.",
      tools: [{ rank: 14, why: "Tag cast, props, and locations on a stable draft." }],
    },
    {
      id: "location-passes",
      title: "3. One pass per place",
      workspaceTab: "shots",
      body: "Split the film by environments — high rise, vessel interior, open sky over the city, street, crowded market — not one vague “cinematic” mood for everything. Geography and class change the light; let the list drive exploration.",
      tools: [{ rank: 6, why: "Still exploration for each place before any motion." }],
    },
    {
      id: "explore-then-compose",
      title: "4. Explore in stills, then composite",
      workspaceTab: "visual",
      body: "Use a wide-range image tool to find the look of each location (plates, color, texture). Use a compositing-oriented tool second — place actors into those plates. Skipping the exploration step usually gives you the app's default face, not yours.",
      tools: [
        { rank: 6, why: "Location plates and mood exploration." },
        { rank: 18, why: "Place characters and props into approved plates." },
      ],
    },
    {
      id: "push-past-default",
      title: "5. Refuse the generic set",
      workspaceTab: "visual",
      body: "A tense scene does not have to be a gray box with a metal table. Decide a specific spatial idea — circular room, glass walls, harsh overhead — then gather refs that match. Taste lives in profiles and boards more than in one-line prompts.",
      tools: [
        { rank: 6, why: "Test layouts and light before you lock a plate." },
        { rank: 18, why: "Merge furniture and detail refs into the plate." },
      ],
    },
    {
      id: "hero-shots",
      title: "6. Anchor frames, then fill between",
      workspaceTab: "shots",
      body: "For each place, choose a few frames that set exposure and mood. Only after those anchors are approved, generate the in-between frames — for example how light shifts as you move from a tower interior down to street level.",
      tools: [
        { rank: 6, why: "Hero stills per environment." },
        { rank: 18, why: "Bridge frames between anchors." },
      ],
    },
    {
      id: "grade-in-stills",
      title: "7. Most of the look lives in stills",
      workspaceTab: "visual",
      body: "Decide color and atmosphere while everything is frozen — steam, neon spill, damp pavement, cramped stalls — so motion inherits the grade. Final color work should mostly match shots and lift quiet areas, not reinvent the film.",
      tools: [{ rank: 21, why: "Lens and contrast language on stills before motion." }],
    },
    {
      id: "world-texture",
      title: "8. Depth the camera barely sees",
      workspaceTab: "world",
      body: "Invent signage, props, handwriting, workshop clutter — details that never get a line of dialogue but make the frame feel occupied. Most of this work never appears on screen; a little of it stops the world from feeling stock.",
      tools: [{ rank: 6, why: "Exploration stills for props and signage." }],
    },
    {
      id: "modular-characters",
      title: "9. Fresh recipe every shot",
      workspaceTab: "visual",
      body: "Generate close, medium, wide, and behind views separately. For each shot, list ingredients: angle on the lead, supporting figure, environment plate, short note. Rebuild the mix per scene instead of one reference image for the whole film.",
      tools: [{ rank: 18, why: "Composite the shot recipe into the plate." }],
    },
    {
      id: "animate",
      title: "10. Motion from approved plates",
      workspaceTab: "kit",
      body: "Animate from stills you trust. When you need every pixel accounted for, work in smaller chunks. Lip sync tools can help but often need careful audio alignment.",
      tools: [
        { rank: 5, why: "Primary motion from image plates (Kling in catalog)." },
        { rank: 7, why: "Dialogue and performance touch-ups when needed." },
        { rank: 2, why: "Alternate motion tool if a scene needs different control." },
      ],
    },
    {
      id: "voice-human",
      title: "11. Prefer human voices",
      workspaceTab: "post",
      body: "When budget allows, record actors. Synthetic voice can cover pickups or dubs, but lead performances usually need a human timbre and breath.",
      tools: [{ rank: 16, why: "Synthetic or dubbed lines when budget requires it." }],
    },
    {
      id: "edit-cohesion",
      title: "12. The edit is the real set",
      workspaceTab: "post",
      body: "There is no physical stage to walk on. You write, plan, and note shots — but the film becomes watchable in the edit. Someone who knows where AI breaks (faces, hands, continuity) is worth their weight here.",
      tools: [{ rank: 13, why: "Assembly, grade polish, and sound in an NLE workflow." }],
    },
    {
      id: "grain-not-upscale",
      title: "13. Texture in post, careful with upscale",
      workspaceTab: "post",
      body: "Heavy upscaling can sharpen skin oddly and smooth away surface detail you fought for in stills. Many teams skip it. A light grain pass can make digital frames feel less sterile.",
      tools: [
        { rank: 29, why: "Understand upscale impact before you depend on it." },
        { rank: 21, why: "Re-check grade if you must upscale." },
      ],
    },
    {
      id: "flexible-process",
      title: "14. Plan, then adapt",
      workspaceTab: "workflow",
      body: `${AI_MEDIUM_NOTE} Film-school control on a soundstage does not map cleanly to generators. Strong results come from clear references and calm revision, not from forcing one perfect take.`,
      tools: [],
    },
  ],
};

const VISUAL_LOOK_BIBLE_STEPS: StructuredPlaybook = {
  id: "visual-look-bible",
  name: "Look bible first",
  intro: {
    lead: "Set the look before you write motion prompts.",
    footer: "If a frame drifts, fix the bible before generating again.",
  },
  steps: [
    {
      id: "visual",
      title: "Visual bible",
      workspaceTab: "visual",
      body: "Palette, lighting intent, and reference URLs first.",
      tools: [
        { rank: 6, why: "Master stills for palette and costume silhouette." },
        { rank: 18, why: "Fast lighting and layout iterations." },
        { rank: 21, why: "Lens character on approved stills." },
      ],
    },
  ],
};

const VISUAL_CONTACT_SHEET_STEPS: StructuredPlaybook = {
  id: "visual-contact-sheet",
  name: "Scene contact sheet",
  intro: {
    lead: "Nine shot sizes for one scene — plan the grid, then generate to it.",
    footer: "Each row in Shots should name lens feeling and what must match the design sheet.",
  },
  steps: [
    {
      id: "shots",
      title: "Shot plan (9-panel grid)",
      workspaceTab: "shots",
      body: "Fill wide through close shots before opening any generator.",
      tools: [
        { rank: 6, why: "One still per panel — same wardrobe and light." },
        { rank: 2, why: "Optional motion test on one panel." },
        { rank: 4, why: "Share boards with collaborators." },
      ],
    },
    {
      id: "visual",
      title: "Visual bible",
      workspaceTab: "visual",
      body: "Scene-specific rules — only break the global bible where the script demands it.",
      tools: [{ rank: 6, why: "Reuse global refs; branch for this scene only." }],
    },
  ],
};

const DIRECTOR_PREP_NARRATIVE_PLAYBOOK: StructuredPlaybook = {
  id: "director-prep-narrative-short",
  name: "Director's Prep — narrative short",
  intro: {
    lead: "Script-to-Pre-Production Agent: paste script → copy agent prompt → import JSON → export Markdown report.",
    footer: "Nothing generates inside 35mmAI — external Claude/ChatGPT is copy/paste only.",
  },
  steps: [
    {
      id: "agent",
      title: "Run Script-to-Pre-Production Agent",
      workspaceTab: "director",
      body: "Paste your full script, copy the agent prompt, run in Claude, paste JSON back, and Apply. Fills scenes, shot lists, locations, refs, and budget band.",
      tools: [],
    },
    {
      id: "rules",
      title: "Set Director's Bible rules",
      workspaceTab: "director",
      body: "Style, preferred shots, budget tier, tone, and genre tags — included in the agent prompt.",
      tools: [],
    },
    {
      id: "script",
      title: "Paste or upload your script",
      workspaceTab: "director",
      body: "Paste up to ~30 pages into the script field, or upload a .txt file.",
      tools: [{ rank: 4, why: "Optional: refine script beats before breakdown." }],
    },
    {
      id: "review",
      title: "Review & approve scenes",
      workspaceTab: "director",
      body: "Approve draft scenes, check Shots tab for linked sequences, pull locations into World bible if needed.",
      tools: [{ rank: 14, why: "Breakdown and schedule in Filmustage when prep is locked." }],
    },
    {
      id: "export",
      title: "Download pre-production report",
      workspaceTab: "director",
      body: "Export the Markdown report — executive summary, scene table, shot lists, locations, budget estimate, next steps.",
      tools: [{ rank: 6, why: "Still exploration per approved scene heading." }],
    },
  ],
};

const SCRIPT_TO_PROMPT_PLAYBOOK: StructuredPlaybook = {
  id: "director-prep-script-to-prompt",
  name: "Script to prompt",
  intro: {
    lead: "Turn script + look into copy-ready prompts for Midjourney, Higgsfield, LTX, and your kit.",
    footer: "One planned shot, one modular prompt. Nothing generates inside 35mmPRO.",
  },
  steps: [
    {
      id: "script",
      title: "Paste script and prompt-first look",
      workspaceTab: "director",
      body: "Set modular generation rules in vision fields, then run Script → Run prep.",
      tools: [],
    },
    {
      id: "look",
      title: "Lock references in Look",
      workspaceTab: "visual",
      body: "Palette, mood board, and photo refs feed every prompt in Finish → Prompts.",
      tools: [{ rank: 6, why: "Primary still exploration tool in the kit." }],
    },
    {
      id: "shots",
      title: "Build the shot plan",
      workspaceTab: "shots",
      body: "Each planned shot becomes one external generation prompt.",
      tools: [{ rank: 21, why: "Motion tests after stills are approved." }],
    },
    {
      id: "prompts",
      title: "Build and copy prompts",
      workspaceTab: "prompts",
      body: "Finish → Prompts: build empty or refresh all, pick tool per shot, copy into Midjourney, Higgsfield, or LTX.",
      tools: [
        { rank: 6, why: "Midjourney still prompts." },
        { rank: 21, why: "Higgsfield motion prompts." },
        { rank: 4, why: "LTX video prompts." },
      ],
    },
    {
      id: "export",
      title: "Export prompt pack",
      workspaceTab: "export",
      body: "Finish → Export: download prompt pack CSV or Markdown for spreadsheets and sharing.",
      tools: [],
    },
  ],
};

const PLAYBOOKS: StructuredPlaybook[] = [
  CLASSICAL_LOCATION_PASS_PLAYBOOK,
  VISUAL_LOOK_BIBLE_STEPS,
  VISUAL_CONTACT_SHEET_STEPS,
  DIRECTOR_PREP_NARRATIVE_PLAYBOOK,
  SCRIPT_TO_PROMPT_PLAYBOOK,
];

export function listStructuredPlaybooks(): StructuredPlaybook[] {
  return PLAYBOOKS;
}

export function structuredPlaybookForTemplate(templateId: string): StructuredPlaybook | null {
  switch (templateId) {
    case "classical-ai-short":
    case "patchwright-classical-short":
    case "ai-native-prep":
      return CLASSICAL_LOCATION_PASS_PLAYBOOK;
    case "visual-look-bible":
      return VISUAL_LOOK_BIBLE_STEPS;
    case "visual-contact-sheet":
      return VISUAL_CONTACT_SHEET_STEPS;
    case "director-prep-narrative-short":
    case "director-prep-documentary":
    case "director-prep-commercial":
    case "director-prep-music-video":
    case "director-prep-feature":
    case "director-prep-blank":
      return DIRECTOR_PREP_NARRATIVE_PLAYBOOK;
    case "director-prep-script-to-prompt":
      return SCRIPT_TO_PROMPT_PLAYBOOK;
    default:
      return null;
  }
}

export function examplePromptForRank(rank: number, maxLen = 160): string | null {
  const tool = getToolByRank(rank);
  if (!tool?.examplePrompt) return null;
  const t = tool.examplePrompt.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}
