import {
  BUDGET_DEFAULT_MICRO_ROWS,
  BUDGET_DEFAULT_LOW_ROWS,
  budgetLinesFromPreset,
  rehydrateKitEntry,
  workflowStages,
} from "@/app/data";
import { memoryWithLearnedPreferences } from "@/lib/pro/synthesize-project-memory";
import {
  reconcileShotPlanForTemplate,
  templatePromptPackModeChanged,
} from "@/lib/pro/reconcile-template-shot-plan";
import { createEmptyProjectState, createEmptyDirectorRules } from "@/lib/pro/project-state-defaults";
import type { ChecklistItem, DirectorBudgetTier, DirectorRulesState, ProjectStatePayload, ShotSequence } from "@/lib/pro/types";

function shotSeq(
  id: string,
  title: string,
  notes: string,
  sceneNumber: number | null = null
): ShotSequence {
  return { id, title, notes, sceneNumber, shots: [] };
}

export type ProTemplateGroupId = "classical-ai" | "production" | "director-prep";

/** Default Director's Prep template for new projects and the prep picker. */
export const DEFAULT_DIRECTOR_PREP_TEMPLATE_ID: ProTemplateId = "director-prep-script-to-prompt";

export type ProTemplateId =
  | "patchwright-classical-short"
  | "classical-ai-short"
  | "visual-look-bible"
  | "visual-contact-sheet"
  | "indie-narrative-short"
  | "documentary-interview"
  | "director-prep-narrative-short"
  | "director-prep-documentary"
  | "director-prep-commercial"
  | "director-prep-music-video"
  | "director-prep-feature"
  | "director-prep-script-to-prompt"
  | "director-prep-blank"
  /** @deprecated Use `classical-ai-short` — kept for compatibility */
  | "ai-native-prep";

export type ProTemplateMeta = {
  id: ProTemplateId;
  name: string;
  description: string;
  workflowStageTitle: string;
  group: ProTemplateGroupId;
  groupLabel: string;
};

const GROUP_LABELS: Record<ProTemplateGroupId, string> = {
  "classical-ai": "Classical AI film — location-pass method",
  production: "Production & budget",
  "director-prep": "Script workflows",
};

function kitFromRanks(ranks: number[]): unknown[] {
  const out: unknown[] = [];
  const seen = new Set<number>();
  for (const rank of ranks) {
    if (seen.has(rank)) continue;
    const entry = rehydrateKitEntry({ catalogRank: rank, qty: 1 });
    if (entry && typeof entry === "object") {
      seen.add(rank);
      out.push(entry);
    }
  }
  return out;
}

function checklist(items: { id: string; label: string }[]): ChecklistItem[] {
  return items.map((item) => ({ ...item, done: false }));
}

const TEMPLATES: ProTemplateMeta[] = [
  {
    id: "patchwright-classical-short",
    name: "Classical film — location-pass method",
    description:
      "Months-scale path: story bible → one pass per place → still exploration → compositing → motion → edit. Human judgment throughout.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "classical-ai",
    groupLabel: GROUP_LABELS["classical-ai"],
  },
  {
    id: "classical-ai-short",
    name: "Classical AI short (same method)",
    description: "Same pipeline as location-pass method — either menu entry works.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "classical-ai",
    groupLabel: GROUP_LABELS["classical-ai"],
  },
  {
    id: "visual-look-bible",
    name: "Look bible first",
    description: "Lock palette, lens, and references before any generation — classical look discipline.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "classical-ai",
    groupLabel: GROUP_LABELS["classical-ai"],
  },
  {
    id: "visual-contact-sheet",
    name: "Scene contact sheet (9 shots)",
    description: "Nine classical shot sizes for one scene — coverage plan before external AI or camera.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "classical-ai",
    groupLabel: GROUP_LABELS["classical-ai"],
  },
  {
    id: "indie-narrative-short",
    name: "Indie narrative short",
    description: "Pre-production focus with micro-budget line items and festival-oriented post checklist.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "production",
    groupLabel: GROUP_LABELS.production,
  },
  {
    id: "documentary-interview",
    name: "Documentary / interview",
    description: "Production-phase kit for talking-head and location work; micro + low budget presets.",
    workflowStageTitle: workflowStages[1]?.title ?? "Production",
    group: "production",
    groupLabel: GROUP_LABELS.production,
  },
  {
    id: "director-prep-narrative-short",
    name: "Narrative short",
    description:
      "Festival-minded drama — naturalistic performance, wide masters, scene-by-scene approval.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "director-prep",
    groupLabel: GROUP_LABELS["director-prep"],
  },
  {
    id: "director-prep-documentary",
    name: "Documentary / interview",
    description:
      "Talking-head spine plus B-roll — observational tone, releases, and location notes.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "director-prep",
    groupLabel: GROUP_LABELS["director-prep"],
  },
  {
    id: "director-prep-commercial",
    name: "Commercial / brand",
    description:
      "Product-forward spots — hero frames, lifestyle coverage, tight pacing and polish.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "director-prep",
    groupLabel: GROUP_LABELS["director-prep"],
  },
  {
    id: "director-prep-music-video",
    name: "Music video",
    description:
      "Performance plus narrative beats — stylized look, insert coverage, sync-friendly masters.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "director-prep",
    groupLabel: GROUP_LABELS["director-prep"],
  },
  {
    id: "director-prep-feature",
    name: "Indie feature",
    description:
      "Longer-form coverage discipline — character arcs, location breadth, mid-tier budget band.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "director-prep",
    groupLabel: GROUP_LABELS["director-prep"],
  },
  {
    id: "director-prep-script-to-prompt",
    name: "Script to prompt",
    description:
      "Turn script + look into copy-ready prompts for Midjourney, Higgsfield, LTX, and your kit. One shot, one prompt.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "director-prep",
    groupLabel: GROUP_LABELS["director-prep"],
  },
  {
    id: "director-prep-blank",
    name: "Blank prep",
    description: "Empty rules and script — start from scratch with the standard prep workflow.",
    workflowStageTitle: workflowStages[0]?.title ?? "Pre-Production",
    group: "director-prep",
    groupLabel: GROUP_LABELS["director-prep"],
  },
];

export type ProTemplateGroup = {
  id: ProTemplateGroupId;
  label: string;
  templates: ProTemplateMeta[];
};

export function listProTemplateGroups(): ProTemplateGroup[] {
  const classical = TEMPLATES.filter((t) => t.group === "classical-ai");
  const production = TEMPLATES.filter((t) => t.group === "production");
  const directorPrep = TEMPLATES.filter((t) => t.group === "director-prep").sort((a, b) => {
    if (a.id === DEFAULT_DIRECTOR_PREP_TEMPLATE_ID) return -1;
    if (b.id === DEFAULT_DIRECTOR_PREP_TEMPLATE_ID) return 1;
    return a.name.localeCompare(b.name);
  });
  return [
    { id: "director-prep", label: GROUP_LABELS["director-prep"], templates: directorPrep },
    { id: "classical-ai", label: GROUP_LABELS["classical-ai"], templates: classical },
    { id: "production", label: GROUP_LABELS.production, templates: production },
  ];
}

export function listProTemplates(): ProTemplateMeta[] {
  return TEMPLATES;
}

export function getProTemplate(id: string): ProTemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function isProTemplateId(id: string): id is ProTemplateId {
  if (id === "ai-native-prep") return true;
  return TEMPLATES.some((t) => t.id === id);
}

function buildClassicalLocationPassState(): ProjectStatePayload {
  const base = createEmptyProjectState();
  return {
    ...base,
    workflow: { stageIndex: 0 },
    kit: kitFromRanks([6, 18, 21, 7, 19, 1]),
    budget: {
      microTools: budgetLinesFromPreset(BUDGET_DEFAULT_MICRO_ROWS),
      lowTools: [],
      selectedRole: "Director",
      selectedBudget: "indie",
      currency: "USD",
    },
    worldBible: {
      notes:
        "Carry forward everything you already know about this world — tone, history, invented writing systems, small props. That memory keeps generations aligned; the latest app name does not.\n\nFor this cut, finish the sentence: what should the audience feel when the last frame ends?",
      characters: [
        "Lead — cast for performance; record voice live when you can",
        "Supporting — separate reference sets per angle (close / medium / wide / behind)",
      ],
      locations: [
        "Pass 1 — high interior (e.g. executive suite)",
        "Pass 2 — enclosed transport or vessel",
        "Pass 3 — open air above the city",
        "Pass 4 — street level",
        "Pass 5 — dense market or bazaar (steam, neon, narrow aisles)",
      ],
    },
    visualBible: {
      designSheetNotes:
        "Each place: still exploration first (mood plates, color). Compositing second — actors and props into those plates, not the other way around.\n\nReject stock sets. Name a specific spatial idea per scene. Profiles and reference boards beat copy-paste prompts.",
      referenceUrls: [],
      palette: ["High interior anchor", "Street / market anchor", "Skin + shadow", "Accent light"],
      lensAndFraming: "Lock hero frames per place before generating connective stills.",
      grainAndTexture:
        "Set most contrast and color while frames are still. Add grain in post if surfaces feel too smooth. Be cautious with upscaling — it can change faces and fine detail.",
      moodBoardReferences: [],
      negativePromptNotes:
        "Avoid: catalog-looking props, lazy cultural shorthand in signage, vertical social framing, waxy skin, upscale passes that change the look.",
      consistencyChecklist: checklist([
        { id: "v-plate", label: "Exploration plate approved for this place before compositing" },
        { id: "v-hero", label: "Anchor frames locked; connective stills follow" },
        { id: "v-modular", label: "Shot built from a fresh ingredient list" },
        { id: "v-grade", label: "Look settled in stills before motion" },
      ]),
    },
    shotPlan: {
      sequences: [
        shotSeq(
          "loc-high",
          "Place — high interior",
          "Still exploration → composite characters. Lock 2–3 anchor frames (light + tone)."
        ),
        shotSeq(
          "loc-vessel",
          "Place — vessel interior",
          "Same order. Note how light shifts toward the next pass."
        ),
        shotSeq(
          "loc-skyline",
          "Place — air above city",
          "Bridge palette from upper levels toward street."
        ),
        shotSeq(
          "loc-street",
          "Place — street level",
          "More grit; wardrobe must match bible."
        ),
        shotSeq(
          "loc-market",
          "Place — crowded market",
          "Steam, narrow paths, mixed light — color refs lead the grade."
        ),
        shotSeq(
          "recipe-example",
          "Shot ingredient list",
          "Example: behind angle on lead + supporting figure + environment plate + short note — rebuild every time."
        ),
      ],
    },
    postChecklist: {
      items: [
        { id: "post-voice", label: "Lead dialogue recorded with actors when possible", done: false },
        { id: "post-motion", label: "Motion from approved stills — revise when the tool drifts", done: false },
        { id: "post-edit", label: "Story and rhythm locked in the edit", done: false },
        { id: "post-grade", label: "Match shots and lift quiet areas — do not depend on upscale", done: false },
        { id: "post-grain", label: "Add grain if the image feels too digitally clean", done: false },
      ],
    },
  };
}

function buildVisualLookBibleState(): ProjectStatePayload {
  const base = createEmptyProjectState();
  return {
    ...base,
    workflow: { stageIndex: 0 },
    kit: kitFromRanks([6, 18, 1]),
    budget: {
      microTools: budgetLinesFromPreset(BUDGET_DEFAULT_MICRO_ROWS),
      lowTools: [],
      selectedRole: "DOP (Director of Photography)",
      selectedBudget: "indie",
      currency: "USD",
    },
    worldBible: {
      notes: "One paragraph: genre, era, emotional temperature.",
      characters: [],
      locations: [],
    },
    visualBible: {
      designSheetNotes: "Master design sheet: characters in environment, scale, silhouette readable at thumbnail size.",
      referenceUrls: [],
      palette: ["Shadow", "Midtone", "Highlight", "Accent"],
      lensAndFraming: "Primary lens family and when you break it.",
      grainAndTexture: "Film stock or digital emulation target.",
      moodBoardReferences: [],
      negativePromptNotes: "Forbidden looks (e.g. stock photo lighting, AI gloss, vertical promo framing).",
      consistencyChecklist: checklist([
        { id: "v-palette", label: "Every ref tagged with palette role" },
        { id: "v-shared", label: "Design sheet shared before first generation session" },
      ]),
    },
  };
}

function buildVisualContactSheetState(): ProjectStatePayload {
  const shots = [
    ["ELS", "Extreme long — world and isolation"],
    ["LS", "Long — body in space"],
    ["MLS", "Medium long — entrance / exit"],
    ["MS", "Medium — dialogue geography"],
    ["MCU", "Medium close — intention"],
    ["CU", "Close — eyes / hands"],
    ["ECU", "Detail — object or micro-emotion"],
    ["Low", "Low angle — power"],
    ["High", "High angle — vulnerability"],
  ] as const;

  return {
    ...createEmptyProjectState(),
    workflow: { stageIndex: 0 },
    kit: kitFromRanks([6, 18, 2]),
    budget: {
      microTools: budgetLinesFromPreset(BUDGET_DEFAULT_MICRO_ROWS),
      lowTools: [],
      selectedRole: "Director",
      selectedBudget: "indie",
      currency: "USD",
    },
    worldBible: {
      notes: "Scene objective in one sentence. What changes by the last frame?",
      characters: ["Who is in scene"],
      locations: ["Where"],
    },
    visualBible: {
      designSheetNotes: "Scene-specific look: same global bible, note any exceptions for this scene only.",
      referenceUrls: [],
      palette: [],
      lensAndFraming: "",
      grainAndTexture: "",
      moodBoardReferences: [],
      negativePromptNotes: "",
      consistencyChecklist: checklist([
        { id: "v-grid", label: "All nine panels match same lighting and wardrobe" },
      ]),
    },
    shotPlan: {
      sequences: shots.map(([title, notes], i) =>
        shotSeq(`contact-${i}`, title, notes)
      ),
    },
  };
}

type DirectorPrepTemplateConfig = {
  templateId: ProTemplateId;
  kitRanks: number[];
  selectedRole: string;
  budgetTier: DirectorBudgetTier;
  rules: Partial<DirectorRulesState>;
  draftLabel?: string;
};

function buildDirectorPrepTemplateState({
  templateId,
  kitRanks,
  selectedRole,
  budgetTier,
  rules,
  draftLabel = "Draft 1",
}: DirectorPrepTemplateConfig): ProjectStatePayload {
  const base = createEmptyProjectState();
  return {
    ...base,
    workflow: { stageIndex: 0 },
    kit: kitFromRanks(kitRanks),
    budget: {
      microTools: budgetLinesFromPreset(BUDGET_DEFAULT_MICRO_ROWS),
      lowTools: budgetTier === "indie" ? [] : budgetLinesFromPreset(BUDGET_DEFAULT_LOW_ROWS),
      selectedRole,
      selectedBudget: "indie",
      currency: "USD",
    },
    directorPrep: {
      ...base.directorPrep,
      appliedTemplateId: templateId,
      agentStaging: null,
      directorRules: {
        ...createEmptyDirectorRules(),
        budgetTier,
        ...rules,
      },
      screenplay: {
        ...base.directorPrep.screenplay,
        title: "",
        draftLabel,
        rawText: "",
      },
      scenes: [],
      snapshots: [],
    },
  };
}

export function proTemplateDisplayName(templateId: string | null | undefined): string | null {
  if (!templateId) return null;
  return TEMPLATES.find((t) => t.id === templateId)?.name ?? null;
}

export function isDirectorPrepTemplateId(id: string): boolean {
  return id.startsWith("director-prep-");
}

/** Apply a Director's Prep template preset — refresh kit, budget, and style rules; keep script and prep work. */
export function mergeDirectorPrepTemplate(
  existing: ProjectStatePayload,
  templateState: ProjectStatePayload
): ProjectStatePayload {
  const merged: ProjectStatePayload = {
    ...existing,
    kit: templateState.kit,
    budget: templateState.budget,
    directorPrep: {
      ...existing.directorPrep,
      appliedTemplateId: templateState.directorPrep.appliedTemplateId,
      directorRules: templateState.directorPrep.directorRules,
      screenplay: existing.directorPrep.screenplay,
      scenes: existing.directorPrep.scenes,
      snapshots: existing.directorPrep.snapshots,
      agentStaging: existing.directorPrep.agentStaging,
      agentMemory: existing.directorPrep.agentMemory,
      agentMeta: existing.directorPrep.agentMeta,
      locationResearch: existing.directorPrep.locationResearch,
      prepRunSettings: existing.directorPrep.prepRunSettings,
    },
  };

  const withMemory: ProjectStatePayload = {
    ...merged,
    directorPrep: {
      ...merged.directorPrep,
      agentMemory: memoryWithLearnedPreferences(
        merged.directorPrep.agentMemory,
        merged.directorPrep.directorRules,
        merged.directorPrep.appliedTemplateId
      ),
    },
  };

  if (
    templatePromptPackModeChanged(
      existing.directorPrep.appliedTemplateId,
      templateState.directorPrep.appliedTemplateId
    ) &&
    withMemory.directorPrep.scenes.length > 0
  ) {
    return reconcileShotPlanForTemplate(withMemory);
  }

  return withMemory;
}

/** Keep script/prep work when switching to a full-workspace template (e.g. Classical AI). */
export function mergeTemplateApply(
  existing: ProjectStatePayload,
  templateState: ProjectStatePayload
): ProjectStatePayload {
  const merged: ProjectStatePayload = {
    ...templateState,
    directorPrep: {
      ...existing.directorPrep,
      appliedTemplateId: templateState.directorPrep.appliedTemplateId,
    },
  };

  if (
    templatePromptPackModeChanged(
      existing.directorPrep.appliedTemplateId,
      templateState.directorPrep.appliedTemplateId
    ) &&
    merged.directorPrep.scenes.length > 0
  ) {
    return reconcileShotPlanForTemplate(merged);
  }

  return merged;
}

/** Full workspace document to persist when a template is applied (overwrites project state). */
export function buildTemplateState(id: ProTemplateId): ProjectStatePayload {
  const state = buildTemplateStateBody(id);
  if (state.directorPrep.appliedTemplateId === id) return state;
  return {
    ...state,
    directorPrep: {
      ...state.directorPrep,
      appliedTemplateId: id,
    },
  };
}

function buildTemplateStateBody(id: ProTemplateId): ProjectStatePayload {
  switch (id) {
    case "patchwright-classical-short":
    case "classical-ai-short":
    case "ai-native-prep":
      return buildClassicalLocationPassState();

    case "visual-look-bible":
      return buildVisualLookBibleState();

    case "visual-contact-sheet":
      return buildVisualContactSheetState();

    case "indie-narrative-short": {
      const base = createEmptyProjectState();
      return {
        ...base,
        workflow: { stageIndex: 0 },
        kit: kitFromRanks([1, 4, 6, 12, 18, 52]),
        budget: {
          microTools: budgetLinesFromPreset(BUDGET_DEFAULT_MICRO_ROWS),
          lowTools: [],
          selectedRole: "Director",
          selectedBudget: "indie",
          currency: "USD",
        },
        worldBible: {
          notes:
            "Logline, tone, and visual rules for a festival-ready short. Keep one sentence per story beat.",
          characters: ["Protagonist", "Antagonist / pressure"],
          locations: ["Primary location", "Secondary location"],
        },
        visualBible: {
          ...base.visualBible,
          designSheetNotes: "Indie festival look: motivated light, grounded wardrobe, avoid trailer beat every 30 seconds.",
          consistencyChecklist: checklist([
            { id: "v-indie", label: "Reads as cinema, not content feed" },
          ]),
        },
        postChecklist: {
          items: [
            { id: "post-lock", label: "Picture lock", done: false },
            { id: "post-color", label: "Color grade", done: false },
            { id: "post-mix", label: "Mix / master", done: false },
            { id: "post-dcp", label: "Festival export / DCP check", done: false },
          ],
        },
      };
    }

    case "documentary-interview": {
      const base = createEmptyProjectState();
      return {
        ...base,
        workflow: { stageIndex: 1 },
        kit: kitFromRanks([1, 12, 15, 54, 55]),
        budget: {
          microTools: budgetLinesFromPreset(BUDGET_DEFAULT_MICRO_ROWS),
          lowTools: budgetLinesFromPreset(BUDGET_DEFAULT_LOW_ROWS),
          selectedRole: "Producer / Line Producer",
          selectedBudget: "indie",
          currency: "USD",
        },
        worldBible: {
          notes: "Interview spine, B-roll list, and release / location risks.",
          characters: ["Subject A", "Subject B"],
          locations: ["Interview space", "B-roll locations"],
        },
        visualBible: {
          ...base.visualBible,
          designSheetNotes: "Naturalistic interview lighting reference; B-roll must match interview skin tone and season.",
          lensAndFraming: "Eye-level interview; B-roll observational, not stylized social cuts.",
        },
        shotPlan: {
          sequences: [
            shotSeq(
              "seq-interview",
              "Interview block",
              "Two-camera or single + cutaways; room tone on every location."
            ),
            shotSeq(
              "seq-broll",
              "B-roll package",
              "Process, environment, hands — support testimony without sensationalizing."
            ),
          ],
        },
      };
    }

    case "director-prep-narrative-short":
      return buildDirectorPrepTemplateState({
        templateId: "director-prep-narrative-short",
        kitRanks: [4, 6, 52],
        selectedRole: "Director",
        budgetTier: "indie",
        rules: {
          styleNotes: "Naturalistic, slow-burn; motivated light and grounded performance.",
          preferredShots:
            "Wide masters first, then coverage. Minimal handheld unless the script demands it.",
          toneAndRefs: "Festival-minded narrative short — not feed-sized clips.",
          genreTags: ["drama", "narrative short"],
        },
      });

    case "director-prep-documentary":
      return buildDirectorPrepTemplateState({
        templateId: "director-prep-documentary",
        kitRanks: [1, 12, 15, 52, 55],
        selectedRole: "Producer / Line Producer",
        budgetTier: "indie",
        rules: {
          styleNotes: "Observational and intimate — vérité interviews, natural light when possible.",
          preferredShots:
            "Eye-level interview masters, cutaways on hands/process, B-roll that supports testimony.",
          toneAndRefs: "Documentary truth over sensational cuts — room tone on every location.",
          genreTags: ["documentary", "interview"],
        },
      });

    case "director-prep-commercial":
      return buildDirectorPrepTemplateState({
        templateId: "director-prep-commercial",
        kitRanks: [6, 1, 4, 18],
        selectedRole: "Director",
        budgetTier: "mid",
        rules: {
          styleNotes: "Polished, product-forward; crisp lighting and confident pacing.",
          preferredShots:
            "Hero product frames, lifestyle wide/medium, macro detail inserts, clean logo end card.",
          toneAndRefs: "Brand-safe, premium but not sterile — reads on a phone and in a pitch deck.",
          genreTags: ["commercial", "branded content"],
        },
      });

    case "director-prep-music-video":
      return buildDirectorPrepTemplateState({
        templateId: "director-prep-music-video",
        kitRanks: [6, 18, 1, 7],
        selectedRole: "Director",
        budgetTier: "mid",
        rules: {
          styleNotes: "Stylized and rhythmic — performance energy plus narrative or abstract beats.",
          preferredShots:
            "Wide performance masters, close performance, cutaway inserts, one hero slow-motion beat.",
          toneAndRefs: "Sync-friendly coverage — lock performance before stylized VFX passes.",
          genreTags: ["music video"],
        },
      });

    case "director-prep-feature":
      return buildDirectorPrepTemplateState({
        templateId: "director-prep-feature",
        kitRanks: [4, 14, 52, 6],
        selectedRole: "Director",
        budgetTier: "mid",
        rules: {
          styleNotes: "Character-driven indie feature — continuity of tone across acts.",
          preferredShots:
            "Scene geography first (master-wide), then coverage; save inserts for emotional turns.",
          toneAndRefs: "Long-form discipline — every scene earns its place in the arc.",
          genreTags: ["drama", "feature"],
        },
      });

    case "director-prep-script-to-prompt":
      return buildDirectorPrepTemplateState({
        templateId: "director-prep-script-to-prompt",
        kitRanks: [6, 18, 21, 4, 1],
        selectedRole: "Director",
        budgetTier: "indie",
        rules: {
          styleNotes:
            "Modular AI generation. One shot, one self-contained prompt. Match the look bible on every pass.",
          preferredShots:
            "Establishing first, then medium and detail beats. Each visual prompt maps to one external generation.",
          toneAndRefs:
            "Copy prompts into Midjourney, Higgsfield, or LTX. No vertical/social crops; 2.39:1 film still discipline.",
          genreTags: ["ai-native", "prompt pack"],
          projectInstructions:
            "One modular prompt per planned shot. Keep wardrobe, palette, and lens feeling consistent across the pack. Copy from Finish → Prompts; export the pack from Finish → Export when ready.",
        },
      });

    case "director-prep-blank":
      return buildDirectorPrepTemplateState({
        templateId: "director-prep-blank",
        kitRanks: [4, 52],
        selectedRole: "Director",
        budgetTier: "indie",
        rules: {},
      });

    default:
      return createEmptyProjectState();
  }
}
