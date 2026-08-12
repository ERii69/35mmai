/**
 * Catalog Wave 3 — stale name refresh + FLUX 3 Video + World Labs Marble.
 * - Luma Dream Machine → Luma Ray3.2
 * - Wonder Studio → Autodesk Flow Studio
 * - Flux stills copy clarified; Luma Relight no longer cites Dream Machine
 * - Add FLUX 3 Video at #15 (Pika → #81); Marble at #26 (SuperScout → #82)
 * Run: node scripts/catalog-wave3-refresh.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "app", "data.ts");
let text = fs.readFileSync(dataPath, "utf8");

function replaceToolBlock(name, nextBlock) {
  const re = new RegExp(
    `\\{\\s*\\n\\s*rank:\\s*\\d+,\\s*\\n\\s*name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?examplePrompt:[\\s\\S]*?\\n\\s*\\},`,
    "m"
  );
  if (!re.test(text)) {
    console.error(`Could not find tool block: ${name}`);
    process.exit(1);
  }
  text = text.replace(re, nextBlock.trimEnd() + ",");
}

function setRankByName(name, rank) {
  const re = new RegExp(
    `(\\{\\s*\\n\\s*rank:\\s*)\\d+(,\\s*\\n\\s*name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}")`
  );
  if (!re.test(text)) {
    console.error(`Could not set rank for: ${name}`);
    process.exit(1);
  }
  text = text.replace(re, `$1${rank}$2`);
}

// --- Flux stills (keep rank 8) ---
replaceToolBlock(
  "Flux",
  `{
    rank: 8,
    name: "Flux",
    category: "Pre-Prod",
    helps: "Photoreal stills (Flux image family) for plates, boards, and image-to-video starters — not FLUX 3 Video clips",
    price: "Free open weights / Pro via API platforms",
    budgetFit: "both",
    link: "bfl.ai",
    roles: ["Production Designer","Director","Storyboard Artist"],
    shortDescription: "Photoreal stills partner to Midjourney — use for locked plates; use FLUX 3 Video when you need motion + audio",
    howToUse: [
      "Step 1: Open Flux image models via BFL, fal, Replicate, or partner apps",
      "Step 2: Lock a character reference before generating scene plates",
      "Step 3: Match aspect ratio to your delivery frame (e.g. 2.39:1)",
      "Step 4: Hand hero stills to FLUX 3 Video / Veo / Kling / Runway for motion",
      "Step 5: Archive refs in your look bible",
    ],
    examplePrompt: "Photoreal production still, INT. kitchen night, practical fridge light, 35mm, shallow DOF, same actress as reference sheet, film grain, no text",
  }`
);

// --- Luma Ray3.2 (was Dream Machine) ---
replaceToolBlock(
  "Luma Dream Machine",
  `{
    rank: 22,
    name: "Luma Ray3.2",
    category: "Production",
    helps: "Luma's current production video model (Ray3.2) — cinematic text/image-to-video with strong lighting, depth, and camera feel (Dream Machine / Ray2 are deprecated)",
    price: "Subscription",
    budgetFit: "both",
    link: "lumalabs.ai/ray",
    roles: ["Director","Editor"],
    shortDescription: "Luma's current clip generator (Ray3.2) — ambient motion and cinematic lighting; use Luma Relight only to change lighting on existing footage",
    howToUse: [
      "Step 1: Go to lumalabs.ai/ray (or the Luma app) and sign up",
      "Step 2: Prefer image-to-video from a Midjourney/Flux plate for consistency",
      "Step 3: Generate variations; lean on lighting and camera language",
      "Step 4: Extend or remix the best takes",
      "Step 5: If you only need to change lighting on existing footage, use Luma Relight instead",
    ],
    examplePrompt: "Image-to-video: wide desert road at blue hour, slow lateral track, volumetric haze, HDR highlights, 5s",
  }`
);

// --- Luma Relight ---
replaceToolBlock(
  "Luma Relight",
  `{
    rank: 23,
    name: "Luma Relight",
    category: "Post-Prod",
    helps: "Relight existing footage or plates — change time of day, key direction, and practicals without regenerating the shot",
    price: "Subscription",
    budgetFit: "both",
    link: "lumalabs.ai/ray",
    roles: ["Gaffer (Lighting)","DOP (Director of Photography)"],
    shortDescription: "Post tool: change lighting on plates you already have — use Luma Ray3.2 when you need new generated clips",
    howToUse: [
      "Step 1: Open Luma Relight in the Luma app (relight / modify flow — not Ray3.2 generate)",
      "Step 2: Upload an existing video clip or plate",
      "Step 3: Describe the new lighting (time of day, key direction, practicals)",
      "Step 4: Adjust intensity and direction",
      "Step 5: Export the relit clip into your edit",
    ],
    examplePrompt: "Relight this night scene to look like it was shot during golden hour with soft practical lights",
  }`
);

// --- Autodesk Flow Studio (was Wonder Studio) ---
replaceToolBlock(
  "Wonder Studio",
  `{
    rank: 25,
    name: "Autodesk Flow Studio",
    category: "Production",
    helps: "AI-native filmmaking / VFX workspace (ex-Wonder Studio) — character replacement, mocap, and 3D Editor + Canvas for blocking cameras before AI render; pair worlds with Marble",
    price: "from $40/mo",
    budgetFit: "indie",
    link: "flowstudio.autodesk.com",
    roles: ["VFX Artist","Director"],
    shortDescription: "Autodesk's AI scene-direction studio — 3D block + Canvas refine; not Google Flow (Veo workspace)",
    howToUse: [
      "Step 1: Sign in at flowstudio.autodesk.com (legacy wonder.studio redirects here)",
      "Step 2: Upload plate footage or start a scene in 3D Editor",
      "Step 3: Place characters, cameras, and timing; import Marble worlds when you need persistent environments",
      "Step 4: Refine looks in Canvas with generation/edit nodes",
      "Step 5: Export renders and tracks for Maya / Unreal / your NLE",
    ],
    examplePrompt: "Block a superhero landing on a city street — 3D camera crane down, lock character performance, then Canvas-refine night neon look",
  }`
);

// Rank moves before inserting new tools
setRankByName("Pika Labs", 81);
setRankByName("SuperScout.ai", 82);

const flux3Video = `{
    rank: 15,
    name: "FLUX 3 Video",
    category: "Production",
    helps: "Black Forest Labs multimodal video — text/image-to-video up to ~20s with native audio, keyframes, multi-shot, and draft mode via BFL API / partners (distinct from Flux stills)",
    price: "via BFL API / partner platforms (usage-based)",
    budgetFit: "both",
    link: "bfl.ai/models/flux-3",
    roles: ["Director","DOP (Director of Photography)","Editor"],
    shortDescription: "BFL's filmmaker video model — up to ~20s HD/FHD with dialogue + SFX; use Flux for stills, FLUX 3 Video for motion",
    howToUse: [
      "Step 1: Access FLUX 3 Video via BFL API or a listed partner host",
      "Step 2: Start from text, or image-to-video / keyframes from a Flux or Midjourney plate",
      "Step 3: Use Draft mode to explore, then render full quality",
      "Step 4: Add multi-shot or continue up to ~4s of prior clip+audio when extending",
      "Step 5: Download and assemble in CapCut, DaVinci, or Premiere",
    ],
    examplePrompt: "INT. diner night — medium two-shot, soft tungsten, rain on glass, quiet dialogue with lip sync, slow push-in, 12s, 16:9",
  },
  `;

const marble = `{
    rank: 26,
    name: "World Labs Marble",
    category: "Pre-Prod",
    helps: "Persistent, explorable 3D worlds from text, images, video, or panoramas — spatial previs/sets you can move through, edit, and export (not a clip generator)",
    price: "Credits / subscription (via World Labs)",
    budgetFit: "both",
    link: "marble.worldlabs.ai",
    roles: ["Director","Production Designer","DOP (Director of Photography)","VFX Artist"],
    shortDescription: "Spatial world builder for previs and virtual sets — pair with Autodesk Flow Studio; not another text-to-video model",
    howToUse: [
      "Step 1: Open marble.worldlabs.ai and create a world from text, stills, or reference video",
      "Step 2: Walk the space; tweak layout and expand or combine worlds",
      "Step 3: Capture camera angles as stills or export 3D/2D assets for your pipeline",
      "Step 4: Bring environments into Autodesk Flow Studio or your DCC for shot blocking",
      "Step 5: Hand hero angles to Veo / Runway / FLUX 3 Video only if you need generated motion plates",
    ],
    examplePrompt: "Rainy neon alley at night, wet asphalt reflections, fire escapes, walkable 40m corridor, cinematic practicals, no people",
  },
  `;

// Insert FLUX 3 Video just before Pika (now rank 81)
if (!text.includes('name: "FLUX 3 Video"')) {
  text = text.replace(
    /(\{\s*\n\s*rank:\s*81,\s*\n\s*name:\s*"Pika Labs")/,
    `${flux3Video}$1`
  );
}

// Insert Marble just before SuperScout (now rank 82)
if (!text.includes('name: "World Labs Marble"')) {
  text = text.replace(
    /(\{\s*\n\s*rank:\s*82,\s*\n\s*name:\s*"SuperScout\.ai")/,
    `${marble}$1`
  );
}

// Workflows: location scouting now SuperScout #82; add Marble to design; add FLUX 3 to shoot
text = text.replace(
  `tools: [26],
        proTip: "Always scout at the same time of day you plan to shoot. Lighting changes everything."`,
  `tools: [82, 26],
        proTip: "Scout real locations in SuperScout; use Marble when you need a persistent virtual world instead of a clip."`
);

text = text.replace(
  `tools: [6, 8, 28],
        proTip:
          "Use Midjourney/Flux for world plates; keep Style2D for costume explorations only."`,
  `tools: [6, 8, 26, 28],
        proTip:
          "Use Midjourney/Flux for still plates; Marble for walkable 3D sets; Style2D for costume only."`
);

text = text.replace(
  `tools: [1, 2, 3, 5],
        proTip:
          "Start with Grok Imagine for fast native-audio clips; Runway for control, Veo for Google cinematic scenes, Kling for volume."`,
  `tools: [1, 2, 3, 5, 15],
        proTip:
          "Start with Grok for speed; FLUX 3 Video for longer multimodal takes; Runway for control; Veo/Kling for cinematic volume."`
);

text = text.replace(
  `tools: [1, 5, 7],
        proTip:
          "Image-to-video from your still board beats pure text prompts for consistency on set."`,
  `tools: [1, 5, 7, 15],
        proTip:
          "Image-to-video from your still board beats pure text prompts for consistency on set."`
);

// Budget low kit: include FLUX 3 Video alongside Topaz
if (!text.includes("{ rank: 15, qty: 1 }")) {
  text = text.replace(
    `export const BUDGET_DEFAULT_LOW_ROWS = [
  { rank: 1, qty: 1 },
  { rank: 2, qty: 1 },
  { rank: 3, qty: 1 },
  { rank: 5, qty: 1 },
  { rank: 6, qty: 1 },
  { rank: 8, qty: 1 },
  { rank: 80, qty: 2 },
  { rank: 13, qty: 1 },
  { rank: 14, qty: 1 },
  { rank: 9, qty: 1 },
  { rank: 10, qty: 1 },
] as const;`,
    `export const BUDGET_DEFAULT_LOW_ROWS = [
  { rank: 1, qty: 1 },
  { rank: 2, qty: 1 },
  { rank: 3, qty: 1 },
  { rank: 5, qty: 1 },
  { rank: 6, qty: 1 },
  { rank: 8, qty: 1 },
  { rank: 15, qty: 1 },
  { rank: 80, qty: 2 },
  { rank: 13, qty: 1 },
  { rank: 14, qty: 1 },
  { rank: 9, qty: 1 },
  { rank: 10, qty: 1 },
] as const;`
  );
}

fs.writeFileSync(dataPath, text);

const verify = fs.readFileSync(dataPath, "utf8");
const checks = [
  ['name: "Luma Ray3.2"', true],
  ['name: "Luma Dream Machine"', false],
  ['name: "Autodesk Flow Studio"', true],
  ['name: "Wonder Studio"', false],
  ['name: "FLUX 3 Video"', true],
  ['name: "World Labs Marble"', true],
  ["Companion to Luma Dream Machine", false],
  ["use Dream Machine when you need new clips", false],
];
for (const [needle, want] of checks) {
  const has = verify.includes(needle);
  if (has !== want) {
    console.error(`Verify failed: ${needle} expected ${want}, got ${has}`);
    process.exit(1);
  }
}

const ranks = [...verify.matchAll(/rank:\s*(\d+)/g)].map((m) => +m[1]);
const toolRanks = ranks.slice(0, 82); // rough
const dupes = toolRanks.filter((r, i) => toolRanks.indexOf(r) !== i);
console.log("Updated app/data.ts — Wave 3 refresh");
console.log("FLUX 3 Video + Marble added; Luma/Wonder/Flux/Relight refreshed");
if (verify.match(/name: "Pika Labs"[\s\S]{0,40}rank:\s*81|rank:\s*81[\s\S]{0,40}Pika/)) {
  /* ok */
}
console.log(
  "Pika rank 81:",
  /rank:\s*81,\s*\n\s*name:\s*"Pika Labs"/.test(verify)
);
console.log(
  "SuperScout rank 82:",
  /rank:\s*82,\s*\n\s*name:\s*"SuperScout\.ai"/.test(verify)
);
console.log(
  "Marble rank 26:",
  /rank:\s*26,\s*\n\s*name:\s*"World Labs Marble"/.test(verify)
);
console.log(
  "FLUX 3 rank 15:",
  /rank:\s*15,\s*\n\s*name:\s*"FLUX 3 Video"/.test(verify)
);
