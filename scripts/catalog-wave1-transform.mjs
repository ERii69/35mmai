/**
 * Wave 1 free-catalog transform (2026):
 * - Add Veo / Seedance / Flux / ChatGPT / Claude / Ideogram
 * - Reshuffle Top ranks; demote Higgsfield off #1
 * - Thin fashion cluster to Style2D + Browzwear
 * - Remap workflowStages + budget presets
 *
 * Run: node --experimental-strip-types scripts/catalog-wave1-transform.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "app/data.ts");

const { allTools } = await import(pathToFileURL(path.join(root, "app/data.ts")).href);

function byName(name) {
  const t = allTools.find((x) => x.name === name);
  if (!t) throw new Error(`Missing tool: ${name}`);
  return { ...t };
}

function withRank(tool, rank, patch = {}) {
  return { ...tool, rank, ...patch };
}

const REMOVE = new Set([
  "NewArc",
  "Refabric",
  "Yumdu",
  "Onbrand AI Design",
  "Fashable",
]);

const higgs = byName("Higgsfield Cinema Studio");
const runway = byName("Runway Gen-4.5");
const eleven = byName("ElevenLabs Voice Cloning");
const ltx = byName("LTX Studio");
const pika = byName("Pika Labs");
const midjourney = byName("Midjourney");
const flawless = byName("Flawless AI");
const wonder = byName("Wonder Studio");
const topaz = byName("Topaz Video AI");
const lumaRay = byName("Luma Ray");
const lightDepth = byName("Light Depth (Luminar Neo)");
const superscout = byName("SuperScout.ai");
const massif = byName("Massif Network");
const filmustage = byName("Filmustage");
const googleVids = byName("Google Vids");
const kira = byName("Kira");
const lexis = byName("Lexis+ AI");
const nano = byName("Nano Banana Pro");
const davinci = byName("DaVinci Resolve AI");
const firefly = byName("Adobe Firefly");
const kling = byName("Kling AI 3.0");
const lumaDream = byName("Luma Dream Machine");
const style2d = byName("Style2D AI");
const browzwear = byName("Browzwear");
const capcut = byName("CapCut");

const veo = {
  rank: 2,
  name: "Google Veo 3.1",
  category: "Production",
  helps:
    "Cinematic text-to-video and image-to-video with native audio, strong prompt adherence, and 4K-oriented output for narrative scenes",
  price: "via Google AI Pro / Ultra (subscription)",
  budgetFit: "both",
  link: "aistudio.google.com",
  roles: ["Director", "DOP (Director of Photography)", "Editor"],
  shortDescription:
    "Post-Sora cinematic video model — native audio and photoreal scenes for filmmakers",
  howToUse: [
    "Step 1: Open Google AI Studio (or Gemini apps with Veo access)",
    "Step 2: Choose text-to-video or image-to-video from a locked still",
    "Step 3: Write shot language: lens, move, lighting, and dialogue/SFX if needed",
    "Step 4: Generate, then iterate with the same character/location refs",
    "Step 5: Download and finish in CapCut, DaVinci, or Premiere",
  ],
  examplePrompt:
    "INT. diner booth, night — medium two-shot, 35mm spherical, soft practical tungsten, rain on window, quiet dialogue, slow push-in, cinematic 2.39:1",
};

const seedance = {
  rank: 7,
  name: "Seedance 2.0",
  category: "Production",
  helps:
    "ByteDance video model with strong physics, multi-shot motion, and native audio — widely used via Dreamina and CapCut after Sora shut down",
  price: "Free tier / CapCut Pro (varies by region)",
  budgetFit: "indie",
  link: "capcut.com",
  roles: ["Director", "Editor", "Production Coordinator"],
  shortDescription:
    "High-reach AI video gen after Sora — often used inside CapCut for social and short-form film",
  howToUse: [
    "Step 1: Open CapCut (or Dreamina where Seedance is available in your region)",
    "Step 2: Start from a Midjourney/Flux still when you need character lock",
    "Step 3: Generate with clear camera move + action verbs",
    "Step 4: Use CapCut timeline to cut multi-shot beats",
    "Step 5: Export festival/social versions from the same project",
  ],
  examplePrompt:
    "Image-to-video: locked character walks through a neon alley, light rain, handheld follow, fabric and reflections hold physics, subtle city ambience",
};

const flux = {
  rank: 8,
  name: "Flux",
  category: "Pre-Prod",
  helps:
    "Photoreal image generation with strong prompt fidelity and character consistency for plates, storyboards, and image-to-video starters",
  price: "Free open weights / Pro via API platforms",
  budgetFit: "both",
  link: "blackforestlabs.ai",
  roles: ["Production Designer", "Director", "Storyboard Artist"],
  shortDescription:
    "Photoreal stills partner to Midjourney — best for live-action look and consistent characters",
  howToUse: [
    "Step 1: Open Flux via your preferred host (fal, Replicate, or official apps)",
    "Step 2: Lock a character reference before generating scene plates",
    "Step 3: Match aspect ratio to your delivery frame (e.g. 2.39:1)",
    "Step 4: Pick hero stills for Veo / Kling / Seedance / Runway image-to-video",
    "Step 5: Archive refs in your look bible",
  ],
  examplePrompt:
    "Photoreal production still, INT. kitchen night, practical fridge light, 35mm, shallow DOF, same actress as reference sheet, film grain, no text",
};

const chatgpt = {
  rank: 11,
  name: "ChatGPT",
  category: "Pre-Prod",
  helps:
    "Script ideation, dialogue passes, beat sheets, and GPT Image concept frames in one workspace most filmmakers already use",
  price: "Free / Plus / Pro",
  budgetFit: "indie",
  link: "chatgpt.com",
  roles: ["Director", "Producer / Line Producer", "Script Supervisor"],
  shortDescription:
    "Default writing + image ideation layer for treatments, rewrites, and quick concept frames",
  howToUse: [
    "Step 1: Paste your logline or rough scene and ask for a formatted screenplay pass",
    "Step 2: Request INT./EXT. scene headings and shot-friendly action lines",
    "Step 3: Generate concept images when you need fast visual options",
    "Step 4: Export dialogue/ADR lists for ElevenLabs",
    "Step 5: Move locked scenes into Filmustage / LTX / your Pro project",
  ],
  examplePrompt:
    "Rewrite this scene in screenplay format with clear INT./EXT. headings, tighter dialogue, and visual action a DOP can board",
};

const claude = {
  rank: 12,
  name: "Claude",
  category: "Pre-Prod",
  helps:
    "Long-context script analysis, structure notes, scene breakdowns, and continuity-aware rewrites for features and series",
  price: "Free / Pro / Team",
  budgetFit: "both",
  link: "claude.ai",
  roles: ["Director", "Producer / Line Producer", "Script Supervisor"],
  shortDescription:
    "Best long-form writing partner for structure, breakdowns, and page-one rewrites",
  howToUse: [
    "Step 1: Upload or paste the full script (or act)",
    "Step 2: Ask for beat sheet, character arcs, and weak-scene flags",
    "Step 3: Generate production breakdown lists (cast, locations, props)",
    "Step 4: Tighten dialogue while preserving voice",
    "Step 5: Hand clean scenes to Filmustage or your board tool",
  ],
  examplePrompt:
    "Analyze this 20-page sample: list scene headings, emotional turn of each scene, and three rewrite notes that improve clarity without changing the genre",
};

const ideogram = {
  rank: 20,
  name: "Ideogram",
  category: "Pre-Prod",
  helps:
    "Image generation with reliable text-in-image for title cards, posters, signage, and pitch decks",
  price: "Free tier / paid plans",
  budgetFit: "indie",
  link: "ideogram.ai",
  roles: ["Production Designer", "Director", "Producer / Line Producer"],
  shortDescription:
    "Poster and title-card stills when readable typography matters",
  howToUse: [
    "Step 1: Create an Ideogram account",
    "Step 2: Prompt with exact title text in quotes",
    "Step 3: Generate poster / title card variants",
    "Step 4: Export for festival packets and social",
    "Step 5: Keep a no-text plate version for video gen if needed",
  ],
  examplePrompt:
    'Minimal festival poster, dark alley rain, title text "NIGHT SHIFT" in clean sans, muted red accent, space for laurels',
};

// Refresh copies for key existing tools
Object.assign(runway, {
  category: "Production",
  helps:
    "Pro filmmaker control surface for text/image/video gen — motion brush, camera paths, and reference consistency (Gen-4.5)",
  shortDescription:
    "Industry control standard for AI video after Sora — best when you need precise motion and multi-shot craft",
  howToUse: [
    "Step 1: Sign in at runwayml.com",
    "Step 2: Prefer image-to-video from a Midjourney/Flux plate for consistency",
    "Step 3: Use motion brush / camera controls for the exact move",
    "Step 4: Generate alternates; keep one hero take per beat",
    "Step 5: Bring clips into DaVinci or CapCut for assembly",
  ],
  examplePrompt:
    "Slow dolly-in on a detective at a rainy window, neon bounce, anamorphic bokeh, locked wardrobe from reference still, 10s",
});

Object.assign(kling, {
  helps:
    "High-volume cinematic text/image-to-video with strong human motion, multi-shot storytelling, and competitive cost per second",
  shortDescription:
    "Most-used daily AI video workhorse for filmmakers — motion, length, and value after Sora",
  howToUse: [
    "Step 1: Go to kling.ai and create an account",
    "Step 2: Start from an approved still when character lock matters",
    "Step 3: Write camera + action; set duration and aspect",
    "Step 4: Use multi-shot / storyboard modes for scene coverage",
    "Step 5: Download and cut in CapCut or Resolve",
  ],
  examplePrompt:
    "Image-to-video: woman turns toward camera in a crowded market, handheld follow, fabric and hair physics, warm late-day light, 5s",
});

Object.assign(midjourney, {
  helps:
    "Cinematic concept art, look development, and hero stills that feed Kling, Veo, Runway, and Seedance image-to-video",
  shortDescription:
    "Still the look standard — generate plates first, then animate in 2026 video models",
  howToUse: [
    "Step 1: Open Midjourney and set your aspect (e.g. --ar 21:9)",
    "Step 2: Build character and location boards before any motion",
    "Step 3: Upscale hero frames for image-to-video",
    "Step 4: Pair with Flux when you need stricter photoreal prompt fidelity",
    "Step 5: Export refs into your look bible / Pro project",
  ],
});

Object.assign(capcut, {
  helps:
    "Editor plus generative video (including Seedance where available) for trailers, vertical cutdowns, captions, and fast assembly",
  shortDescription:
    "Indie finish + gen hub — CapCut is where many filmmakers cut Seedance/Kling clips after Sora",
  howToUse: [
    "Step 1: Import generated clips and production audio",
    "Step 2: Auto-caption dialogue; fix timing",
    "Step 3: Where available, generate Seedance beats inside CapCut",
    "Step 4: Build trailer and social cutdowns from the same timeline",
    "Step 5: Export platform-specific masters",
  ],
  examplePrompt:
    "45s festival teaser from AI plates + live B-roll, punchy captions, end card with title treatment",
});

Object.assign(lumaDream, {
  name: "Luma Dream Machine (Ray)",
  helps:
    "Cinematic image-to-video and Dream Machine generation with strong lighting/depth (Ray family)",
  shortDescription: "HDR-leaning cinematic motion from stills — lighting and camera feel",
  link: "lumalabs.ai/dream-machine",
});

Object.assign(nano, {
  helps:
    "Google Gemini image path for fast hero frames and storyboard plates (Nano Banana Pro)",
  shortDescription:
    "Fast Google-side stills for boards and image-to-video starters",
});

Object.assign(higgs, {
  shortDescription:
    "Specialty cinema-camera look tool — ARRI/RED profiles and lens simulation (not a general video model)",
  helps:
    "Applies real film camera profiles (ARRI, RED), lens characteristics, and cinematic lighting to footage or prompts",
});

/** New rank order (79 tools after removing 5 fashion, adding 6 = 78-5+6=79) */
const orderedFront = [
  withRank(runway, 1),
  withRank(veo, 2),
  withRank(eleven, 3),
  withRank(ltx, 4),
  withRank(kling, 5),
  withRank(midjourney, 6),
  withRank(seedance, 7),
  withRank(flux, 8),
  withRank(topaz, 9),
  withRank(capcut, 10),
  withRank(chatgpt, 11),
  withRank(claude, 12),
  withRank(davinci, 13),
  withRank(filmustage, 14),
  withRank(pika, 15),
  withRank(kira, 16),
  withRank(lexis, 17),
  withRank(nano, 18),
  withRank(ideogram, 19),
  withRank(firefly, 20),
  withRank(higgs, 21),
  withRank(lumaDream, 22),
  withRank(lumaRay, 23, {
    name: "Luma Ray Relight",
    shortDescription: "AI video relighting for existing footage (Ray relight path)",
  }),
  withRank(flawless, 24),
  withRank(wonder, 25),
];

// Remaining tools: everything else not in orderedFront and not REMOVE, keep relative order
const usedNames = new Set(orderedFront.map((t) => t.name));
usedNames.add("Luma Dream Machine"); // renamed
usedNames.add("Luma Ray"); // renamed to Luma Ray Relight

const rest = allTools
  .filter((t) => !REMOVE.has(t.name))
  .filter((t) => {
    if (usedNames.has(t.name)) return false;
    // CapCut already placed; old Luma names handled
    if (t.name === "CapCut") return false;
    if (t.name === "Kling AI 3.0") return false;
    if (t.name === "Runway Gen-4.5") return false;
    if (t.name === "Higgsfield Cinema Studio") return false;
    if (t.name === "DaVinci Resolve AI") return false;
    if (t.name === "Pika Labs") return false;
    if (t.name === "Topaz Video AI") return false;
    if (t.name === "Filmustage") return false;
    if (t.name === "Google Vids") return false; // demote — keep later
    if (t.name === "Light Depth (Luminar Neo)") return false; // demote later
    if (t.name === "SuperScout.ai") return false;
    if (t.name === "Massif Network") return false;
    if (t.name === "Style2D AI") return false;
    if (t.name === "Browzwear") return false;
    if (t.name === "Adobe Firefly") return false;
    if (t.name === "ElevenLabs Voice Cloning") return false;
    if (t.name === "LTX Studio") return false;
    if (t.name === "Midjourney") return false;
    if (t.name === "Nano Banana Pro") return false;
    if (t.name === "Flawless AI") return false;
    if (t.name === "Wonder Studio") return false;
    if (t.name === "Kira") return false;
    if (t.name === "Lexis+ AI") return false;
    return true;
  });

const demoted = [
  withRank(superscout, 0),
  withRank(massif, 0),
  withRank(style2d, 0),
  withRank(browzwear, 0),
  withRank(googleVids, 0),
  withRank(lightDepth, 0),
];

let rank = 26;
const tail = [];
for (const t of demoted) {
  tail.push(withRank(t, rank++));
}
for (const t of rest) {
  // skip if somehow duplicate
  if (tail.some((x) => x.name === t.name) || orderedFront.some((x) => x.name === t.name)) {
    continue;
  }
  tail.push(withRank(t, rank++));
}

const nextTools = [...orderedFront, ...tail];

// Ensure Style2D + Browzwear kept, fashion others gone
for (const name of REMOVE) {
  if (nextTools.some((t) => t.name === name)) {
    throw new Error(`Failed to remove ${name}`);
  }
}
for (const must of [
  "Google Veo 3.1",
  "Seedance 2.0",
  "Flux",
  "ChatGPT",
  "Claude",
  "Ideogram",
  "Style2D AI",
  "Browzwear",
  "Runway Gen-4.5",
  "Kling AI 3.0",
  "Midjourney",
]) {
  if (!nextTools.some((t) => t.name === must)) throw new Error(`Missing ${must}`);
}

const ranks = nextTools.map((t) => t.rank);
if (new Set(ranks).size !== ranks.length) throw new Error("Duplicate ranks");

const rankOf = (name) => {
  const t = nextTools.find((x) => x.name === name);
  if (!t) throw new Error(`rankOf missing ${name}`);
  return t.rank;
};
const R = {
  runway: rankOf("Runway Gen-4.5"),
  veo: rankOf("Google Veo 3.1"),
  eleven: rankOf("ElevenLabs Voice Cloning"),
  ltx: rankOf("LTX Studio"),
  kling: rankOf("Kling AI 3.0"),
  mj: rankOf("Midjourney"),
  seedance: rankOf("Seedance 2.0"),
  flux: rankOf("Flux"),
  topaz: rankOf("Topaz Video AI"),
  capcut: rankOf("CapCut"),
  chatgpt: rankOf("ChatGPT"),
  claude: rankOf("Claude"),
  davinci: rankOf("DaVinci Resolve AI"),
  filmustage: rankOf("Filmustage"),
  pika: rankOf("Pika Labs"),
  nano: rankOf("Nano Banana Pro"),
  ideogram: rankOf("Ideogram"),
  higgs: rankOf("Higgsfield Cinema Studio"),
  style2d: rankOf("Style2D AI"),
  superscout: rankOf("SuperScout.ai"),
};

function serializeTool(t) {
  const lines = ["  {"];
  lines.push(`    rank: ${t.rank},`);
  lines.push(`    name: ${JSON.stringify(t.name)},`);
  lines.push(`    category: ${JSON.stringify(t.category)},`);
  lines.push(`    helps: ${JSON.stringify(t.helps)},`);
  lines.push(`    price: ${JSON.stringify(t.price)},`);
  lines.push(`    budgetFit: ${JSON.stringify(t.budgetFit)},`);
  lines.push(`    link: ${JSON.stringify(t.link)},`);
  if (t.affiliateLink) lines.push(`    affiliateLink: ${JSON.stringify(t.affiliateLink)},`);
  if (t.partnerLogo) lines.push(`    partnerLogo: ${JSON.stringify(t.partnerLogo)},`);
  if (t.catalogKind) lines.push(`    catalogKind: ${JSON.stringify(t.catalogKind)} as const,`);
  lines.push(`    roles: ${JSON.stringify(t.roles)},`);
  if (t.shortDescription) lines.push(`    shortDescription: ${JSON.stringify(t.shortDescription)},`);
  if (t.howToUse) {
    lines.push(`    howToUse: [`);
    for (const s of t.howToUse) lines.push(`      ${JSON.stringify(s)},`);
    lines.push(`    ],`);
  }
  if (t.examplePrompt) lines.push(`    examplePrompt: ${JSON.stringify(t.examplePrompt)},`);
  lines.push("  }");
  return lines.join("\n");
}

const arrayBody = nextTools.map(serializeTool).join(",\n");

const src = fs.readFileSync(dataPath, "utf8");
const start = src.indexOf("export const allTools = [");
const endMarker = "\n];\n\n/**\n * Catalog kind for UI badges:";
const end = src.indexOf(endMarker);
if (start < 0 || end < 0) {
  throw new Error(`Could not locate allTools block start=${start} end=${end}`);
}

const before = src.slice(0, start);
const after = src.slice(end); // begins with \n];\n\n/** Catalog kind...

const newAllTools = `export const allTools: Tool[] = [\n${arrayBody}`;
let next = before + newAllTools + after;

const budgetMicro = `export const BUDGET_DEFAULT_MICRO_ROWS = [
  { rank: ${R.mj}, qty: 1 },
  { rank: ${R.flux}, qty: 1 },
  { rank: ${R.kling}, qty: 1 },
  { rank: ${R.seedance}, qty: 1 },
  { rank: ${R.eleven}, qty: 1 },
  { rank: ${R.capcut}, qty: 1 },
  { rank: ${R.chatgpt}, qty: 1 },
  { rank: ${R.ltx}, qty: 1 },
] as const;`;

const budgetLow = `export const BUDGET_DEFAULT_LOW_ROWS = [
  { rank: ${R.runway}, qty: 1 },
  { rank: ${R.veo}, qty: 1 },
  { rank: ${R.kling}, qty: 1 },
  { rank: ${R.mj}, qty: 1 },
  { rank: ${R.flux}, qty: 1 },
  { rank: ${R.eleven}, qty: 2 },
  { rank: ${R.davinci}, qty: 1 },
  { rank: ${R.filmustage}, qty: 1 },
  { rank: ${R.topaz}, qty: 1 },
  { rank: ${R.capcut}, qty: 1 },
] as const;`;

next = next.replace(
  /export const BUDGET_DEFAULT_MICRO_ROWS = \[[\s\S]*?\] as const;/,
  budgetMicro
);
next = next.replace(
  /export const BUDGET_DEFAULT_LOW_ROWS = \[[\s\S]*?\] as const;/,
  budgetLow
);

const workflow = `export const workflowStages = [
  {
    title: "Pre-Production",
    description: "4–12 weeks: Turn your idea into a shoot-ready plan",
    steps: [
      {
        step: "1.1 Idea Development & Scripting",
        description: "Refine concept, write/rewrite script, create treatment.",
        tools: [${R.chatgpt}, ${R.claude}, ${R.ltx}],
        proTip:
          "Draft in ChatGPT or Claude with clear INT./EXT. headings, then move locked scenes into LTX or Filmustage.",
      },
      {
        step: "1.2 Storyboarding & Visualization",
        description: "Create visual references and shot lists.",
        tools: [${R.mj}, ${R.flux}, ${R.nano}],
        proTip:
          "Build still plates in Midjourney or Flux first — 2026 video tools work best from locked images, not only text.",
      },
      {
        step: "1.3 Casting & Talent",
        description: "Breakdown roles, hold auditions, negotiate contracts.",
        tools: [${R.mj}, ${R.flux}],
        proTip:
          "Generate character references before casting calls so actors can see the intended look.",
      },
      {
        step: "1.4 Location Scouting & Permits",
        description: "Find, photograph, and secure locations + permits.",
        tools: [${R.superscout}],
        proTip: "Always scout at the same time of day you plan to shoot. Lighting changes everything.",
      },
      {
        step: "1.5 Production Design, Props & Costume",
        description: "Design sets, source props, plan wardrobe.",
        tools: [${R.mj}, ${R.flux}, ${R.style2d}],
        proTip:
          "Use Midjourney/Flux for world plates; keep Style2D for costume explorations only.",
      },
      {
        step: "1.6 Makeup & Hair Planning",
        description: "Design looks, test products, create continuity references.",
        tools: [${R.mj}, ${R.nano}],
        proTip:
          "Photograph every approved look under shoot lighting. Continuity fixes in post are expensive.",
      },
      {
        step: "1.7 Budgeting, Scheduling & Crew",
        description: "Build detailed budget, shooting schedule, and assemble crew.",
        tools: [${R.filmustage}, ${R.chatgpt}, ${R.claude}],
        proTip:
          "After Sora shut down, budget for Kling / Veo / Runway / Seedance (often via CapCut) — not a single video vendor.",
      },
    ],
  },
  {
    title: "Production",
    description: "Principal photography: Capture the footage efficiently",
    steps: [
      {
        step: "2.1 Shooting & Cinematic Look",
        description: "Capture or generate cinematic coverage.",
        tools: [${R.runway}, ${R.veo}, ${R.kling}],
        proTip:
          "Pick the model for the job: Runway for control, Veo for cinematic audio scenes, Kling for volume and motion.",
      },
      {
        step: "2.2 On-set Creative Support",
        description: "Generate quick VFX previews and reference clips.",
        tools: [${R.kling}, ${R.seedance}, ${R.pika}],
        proTip:
          "Image-to-video from your still board beats pure text prompts for consistency on set.",
      },
      {
        step: "2.3 Lighting, Grip & Camera",
        description: "Execute lighting design and camera movement.",
        tools: [${R.higgs}, ${R.runway}],
        proTip:
          "Use Higgsfield when you need camera-profile language; use Runway when you need motion control.",
      },
      {
        step: "2.4 Sound Recording",
        description: "Capture clean production audio.",
        tools: [${R.eleven}],
        proTip:
          "Always record room tone. Pair production audio with ElevenLabs only for ADR / missing lines.",
      },
      {
        step: "2.5 Makeup, Costume & Continuity",
        description: "Daily application and matching shots.",
        tools: [${R.mj}, ${R.style2d}],
        proTip: "Snap continuity photos at call time every day before rolling.",
      },
    ],
  },
  {
    title: "Post-Production",
    description: "4–12 weeks: Shape raw footage into the final film",
    steps: [
      {
        step: "3.1 Editing & Assembly",
        description: "Rough cut → Director’s cut.",
        tools: [${R.capcut}, ${R.davinci}, ${R.eleven}],
        proTip:
          "Many indie teams now assemble Kling/Seedance/Veo clips in CapCut, then finish grade in DaVinci.",
      },
      {
        step: "3.2 Visual Effects & Enhancement",
        description: "Add VFX, clean plates, upscale.",
        tools: [${R.runway}, ${R.topaz}, ${R.kling}],
        proTip: "Upscale late. Fix story and motion first — Topaz last.",
      },
      {
        step: "3.3 Sound Design & Dubbing",
        description: "Foley, ADR, voiceovers, multi-language dubbing.",
        tools: [${R.eleven}],
        proTip: "Record ADR while emotion is fresh; clone only when you must.",
      },
      {
        step: "3.4 Color Grading",
        description: "Final look and mood.",
        tools: [${R.davinci}, ${R.higgs}],
        proTip: "Grade in scene groups (day / night / interior) for consistency over perfection.",
      },
    ],
  },
  {
    title: "Distribution & Marketing",
    description: "Get your film seen and monetized",
    steps: [
      {
        step: "4.1 Marketing Assets",
        description: "Trailers, posters, social clips, behind-the-scenes.",
        tools: [${R.capcut}, ${R.ideogram}, ${R.mj}],
        proTip:
          "Ideogram for readable title cards; CapCut for trailer cutdowns from your AI + live plates.",
      },
      {
        step: "4.2 Localization & Dubbing",
        description: "Dub into other languages for global reach.",
        tools: [${R.eleven}],
        proTip: "Start with Spanish and Mandarin for festivals and streaming reach.",
      },
      {
        step: "4.3 Audience Targeting & Release",
        description: "Festival strategy, platform optimization, metadata.",
        tools: [${R.chatgpt}, ${R.capcut}],
        proTip: "Draft platform metadata in ChatGPT; cut vertical teasers in CapCut from the same master.",
      },
    ],
  },
];`;

next = next.replace(/export const workflowStages = \[[\s\S]*?\n\];/, workflow);

fs.writeFileSync(dataPath, next);

// Write rank map for Pro updates
const mapPath = path.join(root, "tmp/catalog-wave1-rank-map.json");
const oldByName = Object.fromEntries(allTools.map((t) => [t.name, t.rank]));
const newByName = Object.fromEntries(nextTools.map((t) => [t.name, t.rank]));
fs.writeFileSync(
  mapPath,
  JSON.stringify(
    {
      count: nextTools.length,
      proCritical: {
        Midjourney: newByName["Midjourney"],
        "Nano Banana Pro": newByName["Nano Banana Pro"],
        "Kling AI 3.0": newByName["Kling AI 3.0"],
        "LTX Studio": newByName["LTX Studio"],
        "Higgsfield Cinema Studio": newByName["Higgsfield Cinema Studio"],
        "ElevenLabs Voice Cloning": newByName["ElevenLabs Voice Cloning"],
        "Runway Gen-4.5": newByName["Runway Gen-4.5"],
      },
      oldToNewByName: Object.fromEntries(
        Object.keys(newByName).map((n) => [n, { old: oldByName[n] ?? null, new: newByName[n] }])
      ),
      top20: nextTools.slice(0, 20).map((t) => `${t.rank}. ${t.name}`),
    },
    null,
    2
  )
);

console.log("Wrote", nextTools.length, "tools");
console.log("Top 12:");
for (const t of nextTools.slice(0, 12)) console.log(`  ${t.rank}. ${t.name}`);
console.log("Pro critical:", {
  MJ: newByName["Midjourney"],
  Nano: newByName["Nano Banana Pro"],
  Kling: newByName["Kling AI 3.0"],
  LTX: newByName["LTX Studio"],
  Higgs: newByName["Higgsfield Cinema Studio"],
  Eleven: newByName["ElevenLabs Voice Cloning"],
});
