/**
 * Catalog Wave 4 — Monday 31 Aug 2026 maintenance.
 * - Add Gemini Omni 1.1 Flash, Runway Aleph 2.0, Seedream 5.0 Pro
 * - Wan 2.7 → Wan 3.0; Nano Banana Pro → 2; Pika → 2.5; ElevenLabs rename
 * - Rank cleanup + workflow / budget remaps
 * Run: node scripts/catalog-wave4-monday.mjs
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

function insertBeforeName(name, block) {
  const re = new RegExp(
    `(\\{\\s*\\n\\s*rank:\\s*\\d+,\\s*\\n\\s*name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}")`
  );
  if (!re.test(text)) {
    console.error(`Could not insert before: ${name}`);
    process.exit(1);
  }
  text = text.replace(re, `${block.trimEnd()},\n  $1`);
}

// --- Rank kicks first so inserts/replaces land on free numbers ---
setRankByName("Kira", 80);
setRankByName("Lexis+ AI", 83);
setRankByName("Luma Ray3.2", 72);
setRankByName("Luma Relight", 73);
setRankByName("Flawless AI", 86);
setRankByName("Massif Network", 85);
setRankByName("Browzwear", 84);
setRankByName("Hedra", 81);
setRankByName("Topaz Video AI", 29);

// --- Copy + version refreshes ---
replaceToolBlock(
  "Runway Gen-4.5",
  `{
    rank: 2,
    name: "Runway Gen-4.5",
    category: "Production",
    helps: "Pro filmmaker control surface for text/image/video gen — motion brush, camera paths, reference consistency, and native audio (dialogue/SFX) on Gen-4.5; no Gen-5 as of Aug 2026. Use Aleph 2.0 when you need to edit footage you already have",
    price: "from $15/mo (Free tier available)",
    budgetFit: "hollywood",
    link: "runwayml.com",
    roles: ["Editor","DOP (Director of Photography)","Director"],
    shortDescription: "Pro control surface for AI video — motion brush, camera paths, and native audio; hand existing clips to Aleph 2.0 instead of regenerating",
    howToUse: [
      "Step 1: Sign in at runwayml.com",
      "Step 2: Prefer image-to-video from a Midjourney/Flux plate for consistency",
      "Step 3: Use motion brush / camera controls for the exact move",
      "Step 4: Generate alternates; keep one hero take per beat",
      "Step 5: If you only need to change wardrobe, product, or a detail on a finished clip, open Aleph 2.0 / Edit Studio instead",
    ],
    examplePrompt: "Slow dolly-in on a detective at a rainy window, neon bounce, anamorphic bokeh, locked wardrobe from reference still, 10s",
  }`
);

replaceToolBlock(
  "ChatGPT",
  `{
    rank: 11,
    name: "ChatGPT",
    category: "Pre-Prod",
    helps: "Script ideation, dialogue passes, beat sheets, and GPT Image 2 concept frames in one workspace most filmmakers already use",
    price: "Free / Plus / Pro",
    budgetFit: "indie",
    link: "chatgpt.com",
    roles: ["Director","Producer / Line Producer","Script Supervisor"],
    shortDescription: "Default writing + GPT Image 2 ideation for treatments and concept frames — not Sora video (app closed Apr 2026; API ends 24 Sep 2026)",
    howToUse: [
      "Step 1: Paste your logline or rough scene and ask for a formatted screenplay pass",
      "Step 2: Request INT./EXT. scene headings and shot-friendly action lines",
      "Step 3: Generate concept stills with GPT Image 2 when you need fast visual options",
      "Step 4: Export dialogue/ADR lists for ElevenLabs",
      "Step 5: Move locked scenes into Filmustage / LTX / your Pro project — generate motion in Veo, Omni Flash, Kling, Seedance, or Runway, not Sora",
    ],
    examplePrompt: "Rewrite this scene in screenplay format with clear INT./EXT. headings, tighter dialogue, and visual action a DOP can board",
  }`
);

replaceToolBlock(
  "DaVinci Resolve AI",
  `{
    rank: 13,
    name: "DaVinci Resolve AI",
    category: "Post-Prod",
    helps: "DaVinci Resolve 21 Neural Engine — IntelliSearch, CineFocus, Face Age, UltraSharpen, Magic Mask, Voice Isolation, plus the new Photo page for stills color",
    price: "Free / Studio version paid",
    budgetFit: "both",
    link: "blackmagicdesign.com",
    roles: ["Editor","Colorist"],
    shortDescription: "Finish-lane NLE — Resolve 21 ships a new AI suite in Free and Studio; grade, isolate, search, and sharpen in one app",
    howToUse: [
      "Step 1: Open DaVinci Resolve 21 (Free or Studio)",
      "Step 2: Import generated clips and production audio",
      "Step 3: Use IntelliSearch / Magic Mask / Voice Isolation as needed; UltraSharpen only after picture lock",
      "Step 4: Grade in scene groups on the Color page; optional Photo page for stills",
      "Step 5: Export festival and platform masters from the same project",
    ],
    examplePrompt: "Use AI to isolate and enhance dialogue in this noisy location audio, then apply a light film-print grade",
  }`
);

replaceToolBlock(
  "ElevenLabs Voice Cloning",
  `{
    rank: 16,
    name: "ElevenLabs",
    category: "Post-Prod",
    helps: "ElevenCreative studio — Studio Agent + Flows Agent for timeline VO/SFX, plus industry-leading voice cloning, emotional reads, and multi-language dubbing",
    price: "from $5/mo (Free tier available)",
    budgetFit: "both",
    link: "elevenlabs.io",
    roles: ["Sound Designer","Editor","Director"],
    shortDescription: "Default AI audio lane — clone and dub in ElevenLabs, or build a voiced cut in Studio Agent / Flows without leaving the timeline",
    howToUse: [
      "Step 1: Open elevenlabs.io (Studio at elevenlabs.io/app/studio, Flows at /app/flows)",
      "Step 2: Clone from a short clean sample, or pick a library voice",
      "Step 3: Paste script; set emotion, pacing, and language",
      "Step 4: For a first cut, ask Studio Agent to place VO and SFX on the timeline",
      "Step 5: Export WAV stems into DaVinci, CapCut, or Premiere",
    ],
    examplePrompt: "A calm, professional male narrator with slight British accent reading: 'In the quiet moments before dawn, the city held its breath.'",
  }`
);

replaceToolBlock(
  "Wan 2.7",
  `{
    rank: 17,
    name: "Wan 3.0",
    category: "Production",
    helps: "Alibaba Tongyi Wan 3.0 (GA Aug 2026) — up to ~30s single-pass with omni reference (image/video/audio plus documents and web), Thinking Mode, and instruction-based clip edits (Western access via Model Studio / wan.video / fal / Higgsfield)",
    price: "Free tier on Tongyi Wanxiang / usage via API partners",
    budgetFit: "both",
    link: "tongyi.aliyun.com/wan",
    roles: ["Director","DOP (Director of Photography)","Editor"],
    shortDescription: "Current Alibaba video model — 30s omni-input takes; use first/last-frame and references instead of hoping the camera move lands",
    howToUse: [
      "Step 1: Open Tongyi Wanxiang, wan.video, fal, Higgsfield, or Alibaba Model Studio and select Wan 3.0 (not 2.7)",
      "Step 2: Prefer image-to-video or first/last-frame from locked Midjourney/Flux/Nano Banana 2 plates",
      "Step 3: Attach extra refs (clip, audio, even a deck) when the shot must follow existing material",
      "Step 4: Use Thinking Mode on complex multi-beat prompts; edit an existing clip with a plain-language instruction when you only need a wardrobe or sky change",
      "Step 5: Download and assemble in CapCut, DaVinci, or Premiere",
    ],
    examplePrompt: "First frame: wide rainy alley. Last frame: MCU of the detective under a fire escape. Slow push-in, wet asphalt, practical neon, 12s, 16:9",
  }`
);

replaceToolBlock(
  "Nano Banana Pro",
  `{
    rank: 18,
    name: "Nano Banana 2",
    category: "Pre-Prod",
    helps: "Google Gemini 3.1 Flash Image (Nano Banana 2) — fast 4K stills, multi-ref character lock, and instruction edits; default image model in Gemini, Search, and Flow (Pro remains a high-fidelity option in the Gemini menu)",
    price: "Free with Google AI Studio / Flow (zero-credit default in Flow)",
    budgetFit: "indie",
    link: "gemini.google.com",
    roles: ["Production Designer","Director","Storyboard Artist"],
    shortDescription: "Current Google stills path for boards and image-to-video starters — use Nano Banana 2 for speed; Pro only when you need the slower high-fidelity pass",
    howToUse: [
      "Step 1: Open gemini.google.com, Flow, or Google AI Studio",
      "Step 2: Generate with Nano Banana 2 (Flash Image); keep Pro for a hero still if the 2 pass is soft",
      "Step 3: Attach character/location refs (up to ~14) when continuity matters",
      "Step 4: Iterate with plain-language edits rather than a full regen",
      "Step 5: Hand locked plates to Veo, Omni Flash, Kling, or Wan 3.0 for motion",
    ],
    examplePrompt: "Cinematic wide shot of a lone cowboy riding through a desert at sunset, dramatic lighting, western style, 2.39:1, no text",
  }`
);

replaceToolBlock(
  "Adobe Firefly",
  `{
    rank: 20,
    name: "Adobe Firefly",
    category: "Pre-Prod",
    helps: "Adobe's generative studio — commercially safe image, video, and audio (Generate Music / Speech / SFX GA Aug 2026) plus partner models (Kling, Luma, Runway, Gemini Omni Flash, ElevenLabs) and Elements for character/location continuity",
    price: "Subscription (AI Assistant has a free daily-generation tier)",
    budgetFit: "both",
    link: "adobe.com/firefly",
    roles: ["Production Designer","Editor","Sound Designer"],
    shortDescription: "Adobe-native hub: Firefly stills and audio, plus Kling/Runway/Omni/ElevenLabs under one Adobe ID — not only Generative Fill",
    howToUse: [
      "Step 1: Sign in with your Adobe ID and open Firefly on the web or from a Creative Cloud app",
      "Step 2: Save recurring characters and locations as Elements so later shots match",
      "Step 3: Generate or partner-model a clip, then add Generate Speech (Firefly or ElevenLabs) and Music/SFX in the same project",
      "Step 4: Use Firefly AI Assistant skills (storyboard, brand kit) when you need a first assembly",
      "Step 5: Send keepers into Photoshop, Premiere, or Frame.io for finish",
    ],
    examplePrompt: "Neo-noir alley at night, 35mm lens feel, wet pavement; generate a 8s clip then add licensed-safe score and a dry VO of the detective's opening line",
  }`
);

replaceToolBlock(
  "Higgsfield Cinema Studio",
  `{
    rank: 21,
    name: "Higgsfield Cinema Studio",
    category: "Production",
    helps: "Cinema Studio 3.x — camera/lens profiles plus a hub for Veo, Omni Flash, Kling, Seedance, Wan 3.0, and Hailuo in one credit workflow (not a single model)",
    price: "from $9/mo (Free tier available)",
    budgetFit: "both",
    link: "higgsfield.ai",
    roles: ["DOP (Director of Photography)","Director","Gaffer (Lighting)"],
    shortDescription: "Director-style shot builder (ARRI/RED language) and a multi-model hub — pick Veo, Omni, Kling, Wan 3.0, or Hailuo per shot",
    howToUse: [
      "Step 1: Go to higgsfield.ai and create a free account",
      "Step 2: Open Cinema Studio (prefer 3.0/3.5 over 2.0) or the model hub",
      "Step 3: Lock camera profile (ARRI Alexa, RED, etc.) and lens, or pick Veo / Omni Flash / Kling / Seedance / Wan 3.0 / Hailuo per shot",
      "Step 4: Use Soul ID / references when character lock matters",
      "Step 5: Export the clip and import into your editor",
    ],
    examplePrompt: "A rainy neon street in Tokyo at night, shot on ARRI Alexa Mini LF with anamorphic lenses, moody blue and pink lighting, shallow depth of field, cinematic film grain",
  }`
);

replaceToolBlock(
  "Pika Labs",
  `{
    rank: 47,
    name: "Pika 2.5",
    category: "Production",
    helps: "Pika 2.5 (early 2026) — cinematic short-form text/image-to-video with scene extension up to ~25s via Pikaframes, 1080p on Pro, and stronger camera motion than 2.2",
    price: "from $8/mo (Free tier available)",
    budgetFit: "both",
    link: "pika.art",
    roles: ["Director","Editor","Gaffer (Lighting)"],
    shortDescription: "Short-form clip engine — 5–25s social and ad plates; use Pikaframes to extend a locked beat instead of stitching random 5s takes",
    howToUse: [
      "Step 1: Go to pika.art (or the Pika iOS app) and create an account",
      "Step 2: Write a text prompt or upload a keyframe; set 16:9 or 9:16",
      "Step 3: Generate on 2.5; prefer Pikaframes when the beat must run past 10s",
      "Step 4: Extend or remix the keeper rather than starting over",
      "Step 5: Download and import into CapCut or your NLE",
    ],
    examplePrompt: "A slow motion shot of a car exploding with fire and debris flying, cinematic, 4K, 8s, 16:9",
  }`
);

replaceToolBlock(
  "PixVerse",
  `{
    rank: 46,
    name: "PixVerse",
    category: "Production",
    helps: "PixVerse V6 for fast short-form with native audio and camera controls; C1 for film/action/VFX storyboard-to-video with physics-aware motion (not only stylized B-roll)",
    price: "from $8/mo (Free tier)",
    budgetFit: "both",
    link: "pixverse.ai",
    roles: ["Director","Editor","DOP (Director of Photography)"],
    shortDescription: "Pick V6 for social and product clips; pick C1 when the shot needs fight/VFX physics or multi-panel storyboard continuity",
    howToUse: [
      "Step 1: Sign in at pixverse.ai and pick V6 (general) or C1 (cinematic action)",
      "Step 2: Set duration (V6 is per-second up to ~15s) and aspect ratio",
      "Step 3: For C1, upload a storyboard panel or action still; write camera + physics verbs",
      "Step 4: Generate variants; keep the pass with the cleanest contact and continuity",
      "Step 5: Download and comp over temp audio in your NLE",
    ],
    examplePrompt: "C1: two-shot fight on a wet rooftop, punch contact and weight transfer, handheld follow, night practicals, 8s, 16:9",
  }`
);

replaceToolBlock(
  "Google Flow",
  `{
    rank: 22,
    name: "Google Flow",
    category: "Production",
    helps: "Google's filmmaking studio for Veo 3.1 and Gemini Omni 1.1 Flash — ingredients, native audio, scene extend, first/last-frame, and 4K upscale in one project (Plus/Pro/Ultra)",
    price: "Free 50 credits/day; Google AI Pro from ~$19.99/mo (1,000 credits); Ultra from ~$249.99/mo",
    budgetFit: "both",
    link: "labs.google/flow",
    roles: ["Director","DOP (Director of Photography)","Editor"],
    shortDescription: "Veo for cinematic hero takes, Omni 1.1 Flash for fast conversational edits and 40s extends — same Flow project, not Google Vids",
    howToUse: [
      "Step 1: Open labs.google/flow with a Google AI Plus, Pro, or Ultra account",
      "Step 2: Create a project and set aspect ratio to match delivery",
      "Step 3: Build character and location ingredients (Nano Banana 2 is the default stills model, often zero credits)",
      "Step 4: Generate Veo 3.1 for hero cinematic clips, or Omni 1.1 Flash to draft/extend/edit in plain language",
      "Step 5: Export clips for your NLE; do not use the retiring Omni Flash preview endpoint after 30 Sep 2026",
    ],
    examplePrompt: "2.39:1 night interior — detective at rain-streaked window, slow push-in, practical lamp key, native room tone and dialogue",
  }`
);

replaceToolBlock(
  "MiniMax Hailuo H3",
  `{
    rank: 23,
    name: "MiniMax Hailuo H3",
    category: "Production",
    helps: "MiniMax H3 / Hailuo 3.0 — up to ~15s at 2K with native stereo audio, omni-reference, first/last-frame, and instruction edits; hosted on hailuoai.video and also in Luma Agents (open weights have regional license limits)",
    price: "Free tier / API (hosted 2K); local weights have territory limits",
    budgetFit: "indie",
    link: "hailuoai.video",
    roles: ["Director","DOP (Director of Photography)","Editor"],
    shortDescription: "Open-weight-class 2K video with native stereo — a volume/control option next to Wan 3.0 and Omni Flash, not a tail listing",
    howToUse: [
      "Step 1: Create an account at hailuoai.video and choose MiniMax H3 (not Hailuo 2.3)",
      "Step 2: Choose text-to-video, image-to-video, first/last-frame, or omni-reference",
      "Step 3: Write explicit camera moves — dolly, rack focus, handheld, pan",
      "Step 4: Add reference stills/clips when character or wardrobe must hold",
      "Step 5: Download clips for edit assemblies or pre-vis boards",
    ],
    examplePrompt: "Handheld chase in narrow alley, overcast, wet pavement reflections, whip pan to close-up, shallow DOF, no text overlays",
  }`
);

replaceToolBlock(
  "Topaz Video AI",
  `{
    rank: 29,
    name: "Topaz Video AI",
    category: "Post-Prod",
    helps: "AI video upscaling, denoising, and quality enhancement — apply after picture lock, not as a substitute for a better generate",
    price: "from $299 one-time",
    budgetFit: "both",
    link: "topazlabs.com",
    roles: ["Editor","DOP (Director of Photography)"],
    shortDescription: "Best tool for upscaling and restoring old or low-quality footage — last, not first",
    howToUse: [
      "Step 1: Download and install Topaz Video AI",
      "Step 2: Import your picture-locked clip",
      "Step 3: Choose upscaling, denoising, or stabilization model",
      "Step 4: Adjust settings and preview skin/grain so you do not over-sharpen",
      "Step 5: Export the enhanced video",
    ],
    examplePrompt: "Upscale this 1080p footage to 4K while removing noise and sharpening details",
  }`
);

replaceToolBlock(
  "Google Vids",
  `{
    rank: 30,
    name: "Google Vids",
    category: "Post-Prod",
    helps:
      "Google Workspace editor for assembly, captions, and workplace/festival cutdowns — not Google’s Veo or Omni generators (use Veo 3.1, Omni 1.1 Flash, or Flow for generative cinema)",
    price: "Subscription",
    budgetFit: "both",
    link: "workspace.google.com/products/vids",
    roles: ["Editor","Production Coordinator"],
    shortDescription:
      "Edit and package footage in Workspace — distinct from Veo/Omni (generate) and Flow (studio)",
    howToUse: [
      "Step 1: Open Google Workspace Vids (editor), not AI Studio Veo or Flow",
      "Step 2: Upload live or generated footage you already have",
      "Step 3: Use AI to suggest edits, captions, and transitions",
      "Step 4: Add voiceover or titles for a shareable cut",
      "Step 5: Export; for new cinematic generation use Google Veo 3.1, Omni 1.1 Flash, or Flow instead",
    ],
    examplePrompt: "Turn this 45-minute interview + B-roll into a 3-minute festival teaser with captions",
  }`
);

// --- New listings ---
if (!text.includes('name: "Gemini Omni 1.1 Flash"')) {
  insertBeforeName(
    "Topaz Video AI",
    `{
    rank: 9,
    name: "Gemini Omni 1.1 Flash",
    category: "Production",
    helps: "Google conversational video gen + edit (GA 27 Aug 2026) — 10s clips, scene extend toward ~40s, first/last-frame, 360p draft, and 4K upscale in Flow, Gemini, and AI Studio (use gemini-omni-1.1-flash, not the preview id that dies 30 Sep 2026)",
    price: "via Google AI Plus / Pro / Ultra (Flow + Gemini); API in AI Studio",
    budgetFit: "both",
    link: "aistudio.google.com",
    roles: ["Director","DOP (Director of Photography)","Editor"],
    shortDescription: "Fast Google video editor — draft, extend, and interpolate in plain language; keep Veo 3.1 for cinematic hero takes",
    howToUse: [
      "Step 1: Open Google Flow, Gemini, or AI Studio and select Omni 1.1 Flash (not Veo, not the Flash preview endpoint)",
      "Step 2: Draft at 360p until camera and action lock, then re-render at 720p/1080p/4K",
      "Step 3: Use first + last frame from Nano Banana 2 / Midjourney plates when the move must land",
      "Step 4: Extend a keeper in ~10s steps instead of regenerating the whole scene",
      "Step 5: Export to CapCut or DaVinci; use Veo 3.1 in the same Flow project for a hero cinematic pass",
    ],
    examplePrompt: "Continue this rainy alley push-in for 8 more seconds, keep wardrobe and neon, add faint city hum, 16:9",
  }`
  );
}

if (!text.includes('name: "Runway Aleph 2.0"')) {
  insertBeforeName(
    "Flawless AI",
    `{
    rank: 24,
    name: "Runway Aleph 2.0",
    category: "Post-Prod",
    helps: "Runway in-context video editor (Edit Studio) — change wardrobe, product, or a detail across a clip up to ~30s / 1080p and across multi-shot sequences, while leaving everything you didn't ask to change",
    price: "Included on paid Runway plans",
    budgetFit: "both",
    link: "runway.com/product/aleph-2",
    roles: ["Editor","Director","Production Designer"],
    shortDescription: "Edit existing footage instead of regenerating — pair with Gen-4.5 for new shots, Aleph for targeted post changes",
    howToUse: [
      "Step 1: Open Runway Edit Studio (paid plan) and upload the clip you want to change",
      "Step 2: Preview the edit as a still so you can lock the look before spending a video generation",
      "Step 3: Describe only the change (coat color, signage, time of day) — do not rewrite the whole shot",
      "Step 4: For a sequence, apply the same edit across relevant cuts",
      "Step 5: Export and replace in your NLE; keep Gen-4.5 for shots that do not exist yet",
    ],
    examplePrompt: "Change the detective's coat from black leather to a wet wool trench; keep the rainy window, neon, and camera move",
  }`
  );
}

if (!text.includes('name: "Seedream 5.0 Pro"')) {
  insertBeforeName(
    "Massif Network",
    `{
    rank: 27,
    name: "Seedream 5.0 Pro",
    category: "Pre-Prod",
    helps: "ByteDance Seedream 5.0 Pro stills — region-precise edits, multilingual in-image text, and campaign-polish plates (via Dreamina / Jimeng / fal); not Seedance video",
    price: "Usage-based / bundled on Dreamina and partner hosts",
    budgetFit: "both",
    link: "dreamina.capcut.com",
    roles: ["Production Designer","Director","Producer / Line Producer"],
    shortDescription: "ByteDance stills partner to Midjourney and Nano Banana 2 — stronger when you need a precise regional edit or readable poster type",
    howToUse: [
      "Step 1: Open Dreamina, Jimeng, or a partner host (e.g. fal) and select Seedream 5.0 Pro — not Seedance",
      "Step 2: Generate a plate or upload a Midjourney/Flux still to edit",
      "Step 3: Target one region (wardrobe, sign, sky) instead of regenerating the whole frame",
      "Step 4: For posters and title cards, prompt exact title text; keep a no-text version for video gen",
      "Step 5: Hand locked stills to Kling / Veo / Wan 3.0 / Omni Flash for motion",
    ],
    examplePrompt: "Photoreal production still, INT. diner night, edit only the neon window sign to read NIGHT SHIFT, keep actress and tungsten key, 2.39:1, no extra text",
  }`
  );
}

// --- Workflow + budget remaps ---
text = text.replace(
  `tools: [6, 8, 18],
        proTip:
          "Build still plates in Midjourney or Flux first — 2026 video tools work best from locked images, not only text."`,
  `tools: [6, 8, 18, 27],
        proTip:
          "Build still plates in Midjourney, Flux, Nano Banana 2, or Seedream 5.0 Pro first — 2026 video tools work best from locked images, not only text."`
);

text = text.replace(
  `tools: [6, 18],
        proTip:
          "Photograph every approved look under shoot lighting. Continuity fixes in post are expensive."`,
  `tools: [6, 18],
        proTip:
          "Photograph every approved look under shoot lighting. Continuity fixes in post are expensive. Nano Banana 2 is fine for fast makeup/wardrobe stills."`
);

text = text.replace(
  `"Budget for Grok Imagine / Kling / Veo / Runway / Seedance (often via CapCut) — not a single video vendor."`,
  `"Budget for Grok Imagine / Kling / Veo / Omni Flash / Runway / Seedance / Wan 3.0 (often via CapCut) — not a single video vendor."`
);

text = text.replace(
  `tools: [1, 2, 3, 5, 15, 83],
        proTip:
          "Start with Grok for speed; FLUX 3 Video or Wan 2.7 for controlled takes; Runway for craft; Veo/Kling/Seedance 2.5 for cinematic volume. Do not start new work on Sora."`,
  `tools: [1, 2, 3, 5, 9, 15, 17],
        proTip:
          "Start with Grok for speed; Omni 1.1 Flash to draft/extend; FLUX 3 Video or Wan 3.0 for controlled takes; Runway Gen-4.5 for craft; Veo/Kling/Seedance 2.5 for cinematic volume. Do not start new work on Sora (API ends 24 Sep 2026)."`
);

text = text.replace(
  `tools: [1, 5, 7, 15],
        proTip:
          "Image-to-video from your still board beats pure text prompts for consistency on set."`,
  `tools: [1, 5, 7, 9, 15],
        proTip:
          "Image-to-video from your still board beats pure text prompts for consistency on set. Omni Flash is the fast on-set iterate; Veo/Kling for the keeper."`
);

text = text.replace(
  `tools: [80],
        proTip:
          "Always record room tone. Pair production audio with ElevenLabs only for ADR / missing lines."`,
  `tools: [16],
        proTip:
          "Always record room tone. Pair production audio with ElevenLabs only for ADR / missing lines."`
);

text = text.replace(
  `tools: [10, 13, 80],
        proTip:
          "Many indie teams now assemble Kling/Seedance/Veo clips in CapCut, then finish grade in DaVinci."`,
  `tools: [10, 13, 16],
        proTip:
          "Many indie teams now assemble Kling/Seedance/Veo/Omni clips in CapCut, then finish grade in DaVinci Resolve 21."`
);

text = text.replace(
  `tools: [1, 2, 9],
        proTip: "Upscale late. Fix story and motion first — Topaz last."`,
  `tools: [1, 2, 24, 29],
        proTip: "Aleph 2.0 for targeted picture changes; Topaz last for upscale. Fix story and motion first."`
);

text = text.replace(
  `tools: [80],
        proTip: "Record ADR while emotion is fresh; clone only when you must."`,
  `tools: [16],
        proTip: "Record ADR while emotion is fresh; clone only when you must. Studio Agent can place a temp VO on a first cut."`
);

text = text.replace(
  `tools: [80],
        proTip: "Start with Spanish and Mandarin for festivals and streaming reach."`,
  `tools: [16],
        proTip: "Start with Spanish and Mandarin for festivals and streaming reach."`
);

text = text.replace(
  `{ rank: 80, qty: 1 },
  { rank: 10, qty: 1 },
  { rank: 11, qty: 1 },
  { rank: 4, qty: 1 },`,
  `{ rank: 16, qty: 1 },
  { rank: 10, qty: 1 },
  { rank: 11, qty: 1 },
  { rank: 4, qty: 1 },`
);

text = text.replace(
  `{ rank: 15, qty: 1 },
  { rank: 80, qty: 2 },`,
  `{ rank: 15, qty: 1 },
  { rank: 9, qty: 1 },
  { rank: 17, qty: 1 },
  { rank: 16, qty: 2 },`
);

fs.writeFileSync(dataPath, text);

const verify = fs.readFileSync(dataPath, "utf8");
const mustHave = [
  'name: "Gemini Omni 1.1 Flash"',
  'name: "Runway Aleph 2.0"',
  'name: "Seedream 5.0 Pro"',
  'name: "Wan 3.0"',
  'name: "Nano Banana 2"',
  'name: "Pika 2.5"',
  'name: "ElevenLabs"',
  "Gemini Omni 1.1 Flash",
];
const mustNot = [
  'name: "Wan 2.7"',
  'name: "Nano Banana Pro"',
  'name: "Pika Labs"',
  'name: "ElevenLabs Voice Cloning"',
  "Wan 2.7 for controlled",
];
for (const s of mustHave) {
  if (!verify.includes(s)) {
    console.error(`Missing: ${s}`);
    process.exit(1);
  }
}
for (const s of mustNot) {
  if (verify.includes(s)) {
    console.error(`Should be gone: ${s}`);
    process.exit(1);
  }
}

const rankPairs = [...verify.matchAll(/rank:\s*(\d+),\s*\n\s*name:\s*"([^"]+)"/g)];
const ranks = rankPairs.map((m) => +m[1]);
const names = rankPairs.map((m) => m[2]);
const dupes = ranks.filter((r, i) => ranks.indexOf(r) !== i);
if (dupes.length) {
  console.error("Duplicate ranks:", [...new Set(dupes)]);
  process.exit(1);
}

const expected = {
  1: "Grok Imagine",
  2: "Runway Gen-4.5",
  3: "Google Veo 3.1",
  9: "Gemini Omni 1.1 Flash",
  16: "ElevenLabs",
  17: "Wan 3.0",
  18: "Nano Banana 2",
  22: "Google Flow",
  23: "MiniMax Hailuo H3",
  24: "Runway Aleph 2.0",
  27: "Seedream 5.0 Pro",
  29: "Topaz Video AI",
  47: "Pika 2.5",
  80: "Kira",
  81: "Hedra",
  82: "SuperScout.ai",
  83: "Lexis+ AI",
};
const byRank = Object.fromEntries(rankPairs.map((m) => [+m[1], m[2]]));
for (const [rank, name] of Object.entries(expected)) {
  if (byRank[rank] !== name) {
    console.error(`Rank ${rank} expected ${name}, got ${byRank[rank]}`);
    process.exit(1);
  }
}

console.log(`Wave 4 applied — ${names.length} tools, ranks 1–${Math.max(...ranks)}`);
console.log("New:", "Omni 1.1 Flash #9, Wan 3.0 #17, Aleph 2.0 #24, Seedream 5.0 Pro #27");
console.log("Renames:", "ElevenLabs #16, Nano Banana 2 #18, Pika 2.5 #47");
console.log("Promoted:", "Google Flow #22, Hailuo H3 #23");
