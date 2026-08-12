/**
 * Catalog Wave 2 — insert Grok Imagine at #1; shift Runway/Veo; move ElevenLabs to 80.
 * Keeps PHASE4 ranks (4,5,6,18,21) unchanged.
 * Run: node scripts/catalog-wave2-grok.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "app", "data.ts");
let text = fs.readFileSync(dataPath, "utf8");

const start = text.indexOf("export const allTools: Tool[] = [");
const endMarker = "\n];\n\n/**\n * Catalog kind for UI badges:";
const end = text.indexOf(endMarker, start);
if (start < 0 || end < 0) {
  console.error("Could not find allTools");
  process.exit(1);
}

let toolsBody = text.slice(start, end);

// Temp ranks to avoid collisions
const swaps = [
  [1, 9001], // Runway
  [2, 9002], // Veo
  [3, 9003], // ElevenLabs
];
for (const [from, to] of swaps) {
  toolsBody = toolsBody.replace(
    new RegExp(`(\\{\\s*\\n\\s*rank:\\s*)${from}(,\\s*\\n\\s*name:)`, "g"),
    `$1${to}$2`
  );
}

toolsBody = toolsBody.replace(
  /(\{\s*\n\s*rank:\s*)9001(,\s*\n\s*name:)/,
  `$12$2`
);
toolsBody = toolsBody.replace(
  /(\{\s*\n\s*rank:\s*)9002(,\s*\n\s*name:)/,
  `$13$2`
);
toolsBody = toolsBody.replace(
  /(\{\s*\n\s*rank:\s*)9003(,\s*\n\s*name:)/,
  `$180$2`
);

const grokEntry = `{
    rank: 1,
    name: "Grok Imagine",
    category: "Production",
    helps: "xAI image + video generation with native audio — text/image-to-video up to ~15s, multi-ref edits, and fast iteration on grok.com/imagine (Video 1.5)",
    price: "via SuperGrok / X Premium (subscription)",
    budgetFit: "both",
    link: "grok.com/imagine",
    roles: ["Director","DOP (Director of Photography)","Editor"],
    shortDescription: "2026 breakout AI video + stills stack from xAI — native audio, strong image-to-video, and the catalog's top new highlight for filmmakers",
    howToUse: [
      "Step 1: Open grok.com/imagine (or the Grok app → Imagine)",
      "Step 2: Generate a locked still, or upload a Midjourney/Flux plate",
      "Step 3: Animate with image-to-video — set aspect (prefer 16:9 / 2.39-friendly), duration, and motion",
      "Step 4: Use references when available for character/wardrobe continuity",
      "Step 5: Download clips and assemble in CapCut, DaVinci, or Premiere",
    ],
    examplePrompt: "Slow cinematic push-in on a detective at a rainy window, neon bounce, anamorphic bokeh, locked wardrobe from reference still, subtle city hum, 8s, 16:9",
  },
  `;

// Insert after `export const allTools: Tool[] = [`
toolsBody = toolsBody.replace(
  "export const allTools: Tool[] = [",
  `export const allTools: Tool[] = [\n  ${grokEntry}`
);

// Refresh Runway / Veo short copy to acknowledge Grok peer
toolsBody = toolsBody.replace(
  /name: "Runway Gen-4.5"[\s\S]*?shortDescription: "[^"]*"/,
  (block) =>
    block.replace(
      /shortDescription: "[^"]*"/,
      'shortDescription: "Pro control surface for AI video — motion brush and camera paths when you need craft beyond one-click Grok/Veo clips"'
    )
);

toolsBody = toolsBody.replace(
  /name: "Google Veo 3.1"[\s\S]*?shortDescription: "[^"]*"/,
  (block) =>
    block.replace(
      /shortDescription: "[^"]*"/,
      'shortDescription: "Google cinematic video with native audio — pair with Grok Imagine for speed and Runway when you need finer motion control"'
    )
);

text = text.slice(0, start) + toolsBody + text.slice(end);

// Budget presets: old 1→2 (Runway), 2→3 (Veo), 3→80 (ElevenLabs); add Grok as 1 in low kit
text = text.replace(
  `export const BUDGET_DEFAULT_MICRO_ROWS = [
  { rank: 6, qty: 1 },
  { rank: 8, qty: 1 },
  { rank: 5, qty: 1 },
  { rank: 7, qty: 1 },
  { rank: 3, qty: 1 },
  { rank: 10, qty: 1 },
  { rank: 11, qty: 1 },
  { rank: 4, qty: 1 },
] as const;`,
  `export const BUDGET_DEFAULT_MICRO_ROWS = [
  { rank: 6, qty: 1 },
  { rank: 8, qty: 1 },
  { rank: 5, qty: 1 },
  { rank: 7, qty: 1 },
  { rank: 1, qty: 1 },
  { rank: 80, qty: 1 },
  { rank: 10, qty: 1 },
  { rank: 11, qty: 1 },
  { rank: 4, qty: 1 },
] as const;`
);

text = text.replace(
  `export const BUDGET_DEFAULT_LOW_ROWS = [
  { rank: 1, qty: 1 },
  { rank: 2, qty: 1 },
  { rank: 5, qty: 1 },
  { rank: 6, qty: 1 },
  { rank: 8, qty: 1 },
  { rank: 3, qty: 2 },
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
  { rank: 80, qty: 2 },
  { rank: 13, qty: 1 },
  { rank: 14, qty: 1 },
  { rank: 9, qty: 1 },
  { rank: 10, qty: 1 },
] as const;`
);

// Workflow stage tool lists — update ElevenLabs 3→80; production stacks include Grok #1
text = text.replace(
  /tools: \[1, 2, 5\],\n\s*proTip:\n\s*"Pick the model for the job: Runway for control, Veo for cinematic audio scenes, Kling for volume and motion\."/,
  `tools: [1, 2, 3, 5],
        proTip:
          "Start with Grok Imagine for fast native-audio clips; Runway for control, Veo for Google cinematic scenes, Kling for volume."`
);

text = text.replace(
  /tools: \[5, 7, 15\],/,
  `tools: [1, 5, 7],`
);

text = text.replace(
  /tools: \[21, 1\],/,
  `tools: [21, 1, 2],`
);

text = text.replace(
  /tools: \[3\],\n\s*proTip:\n\s*"Always record room tone\. Pair production audio with ElevenLabs only for ADR \/ missing lines\."/,
  `tools: [80],
        proTip:
          "Always record room tone. Pair production audio with ElevenLabs only for ADR / missing lines."`
);

text = text.replace(
  /tools: \[1, 9, 5\],/,
  `tools: [1, 2, 9],`
);

text = text.replaceAll("tools: [3],", "tools: [80],");
text = text.replaceAll("tools: [3, ", "tools: [80, ");
text = text.replaceAll(", 3],", ", 80],");
text = text.replaceAll(", 3, ", ", 80, ");

// Budget tip mentioning vendors
text = text.replace(
  "After Sora shut down, budget for Kling / Veo / Runway / Seedance (often via CapCut) — not a single video vendor.",
  "Budget for Grok Imagine / Kling / Veo / Runway / Seedance (often via CapCut) — not a single video vendor."
);

fs.writeFileSync(dataPath, text);
console.log("Updated app/data.ts with Grok Imagine #1");
