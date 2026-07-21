# PRD: Director’s Prep — Phase 1.5 (API-free)

**Document:** `docs/35mmpro-directors-prep-phase1-5-prd.md`  
**Status:** **In progress** — core shipped on `35mmpro-prototype` (May 2026); manual smoke + polish ongoing  
**Parent:** Phase 1 cloud workspace (`tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`)  
**Related:** `docs/35mmpro-phase1-implementation-guide.md` §4 Layer A, `lib/pro/types.ts`, `components/pro/ProWorkspace.tsx`  
**Branch:** `35mmpro-prototype` (local-only until PRO launch)  
**Constraint:** **No inference APIs** in this slice — user may run external Claude/ChatGPT; PRO stores, structures, approves, and exports.

---

## 1. Overview

### Problem

Directors preparing a short or feature need a **repeatable pre-production package**: script breakdown, scene summaries, visual references, shot notes, and a rough budget — usually scattered across docs, notes apps, and chat threads. Generic “AI director chat” is expensive to host and hard to trust without **approval** and **version history**.

### Solution (Phase 1.5)

Add **Director’s Prep** to the Pro workspace: per-project **directing rules**, **script intake**, a structured **scene table**, links into existing **visual bible / shot plan / budget / kit**, optional **copy-paste from external AI**, and a **Director’s Packet** export (Markdown + CSV v1; PDF stretch).

This is the **productized foundation** for a future multi-agent “Director’s Agent” (Phase 2) without breaking the **API-free** product lock.

### One-sentence promise

> **Set your directing rules once, break down your script scene by scene, approve what sticks, and export a producer-ready prep pack — without generating inside 35mmAI.**

---

## 2. Goals

1. Subscriber can define **Director’s Bible** rules per project (style, tone, budget tier, shot preferences, references).
2. Subscriber can **paste or upload** screenplay text (20–30 pages v1 target) and maintain a **scene list** with one-line summaries and visual refs.
3. Subscriber can **approve** scene rows before they feed shot plan / export (human-in-the-loop v1).
4. Subscriber can **copy a structured prompt** (rules + script excerpt) for external Claude and **import** parsed scene rows (paste JSON/Markdown table v1).
5. Subscriber can **export** a Director’s Packet combining bible + scenes + shot plan snapshot + budget/kit summary.
6. **No** hosted LLM calls, **no** credits ledger, **no** web-scraping agents in this slice.

---

## 3. Non-goals (explicit)

- In-app “Ask the Director” chat or autonomous multi-agent runs  
- PDF/Fountain **parsing** beyond plain-text paste (defer `.fdx` / PDF extract)  
- Real-world location database or booking integrations  
- Auto-generated reference **images** inside the app  
- Feature-length (90+ pp) single-shot processing — user works in **acts or page chunks**  
- Replacing existing world/visual/shot tabs — **extend**, don’t duplicate

---

## 4. User stories

1. **As a** director, **I want** project-specific rules (naturalistic, slow-burn, low budget), **so that** every breakdown matches my voice.
2. **As a** director, **I want** to paste my script and see **scenes as rows**, **so that** I can prep like a real breakdown.
3. **As a** director, **I want** three **visual reference slots per scene**, **so that** I can brief DOP / art without a separate mood board doc.
4. **As a** director, **I want** to run Claude **outside** the app but **paste results back**, **so that** I get AI help without 35mmAI paying for tokens.
5. **As a** producer, **I want** a **single export** (CSV/PDF), **so that** I can share prep without Pro login.
6. **As a** returning user, **I want** scenes and rules **saved in the cloud**, **so that** I can continue on another device.

---

## 5. Functional requirements

### 5.1 Director’s Bible (`directorRules`)

1. UI fields (all optional text / selects):
   - `styleNotes` — e.g. “visual, slow-burn, naturalistic”
   - `preferredShots` — e.g. “wide masters, minimal handheld”
   - `budgetTier` — `indie` | `mid` | `high`
   - `toneAndRefs` — free text (films, photographers, eras)
   - `genreTags` — string array (e.g. `horror`, `doc`) for future template hints
2. Values persist in `project_state` and appear in export + external prompt builder.

### 5.2 Script intake (`screenplay`)

1. **Paste** plain text into a textarea (required v1).
2. Optional metadata: `title`, `draftLabel` (e.g. “Draft 3”), `pageEstimate`.
3. Store `rawText` (max **120k characters** v1 — ~30 pages plain text); show char count.
4. **Upload** `.txt` only in v1 (client read → `rawText`); PDF/FDX deferred.

### 5.3 Scene breakdown (`scenes[]`)

1. Table columns: `#`, `heading`, `oneLine`, `intExt`, `dayNight`, `visualRefs[]` (max 3 strings), `shotNotes`, `status`.
2. User can add / edit / delete / reorder rows manually.
3. `status`: `draft` | `approved` — only **approved** rows included in export by default (toggle “include drafts” on export).
4. **Import v1:** paste JSON array or simple Markdown table → parser validates → creates `draft` rows; user reviews before bulk approve.
5. **Link to shots:** optional `linkedSequenceId` on scene → ties to `shotPlan.sequences[].id` (manual pick v1).

### 5.4 External AI assist (no API)

1. Button **“Copy prompt for Claude”** builds Markdown including:
   - `directorRules` summary  
   - Script excerpt (user-selected page range or first N chars)  
   - Fixed instruction block (step-by-step, continuity, output JSON schema)  
2. Button **“Import AI response”** opens modal; user pastes JSON; server validates shape; merges as `draft` scenes.
3. Playbook sidebar (reuse `PlaybookSteps` pattern): 5 steps — Rules → Paste script → Copy prompt → Import scenes → Approve → Export.

### 5.5 Budget hint (deterministic, not LLM)

1. **“Estimate from scenes”** button: `approvedSceneCount` × tier multiplier → suggested line items using existing `BUDGET_DEFAULT_*` presets from `app/data.ts` (read-only suggestion; user edits budget tab manually).
2. No automatic kit changes without confirm dialog.

### 5.6 Export — Director’s Packet

1. **CSV export** (v1 must-have): scenes table + director rules summary + project name + date.
2. **Markdown export** (v1 must-have): same content, formatted for Notion/email.
3. **PDF** (stretch / task 10.x): styled director packet; can reuse export pipeline from Phase 1 task 10.
4. Filename: `{project-slug}-directors-prep-{YYYY-MM-DD}.csv|md`.

### 5.7 Version snapshots (lightweight)

1. On **“Save snapshot”**, append to `directorPrep.snapshots[]`: `{ id, label, createdAt, sceneCount, rulesHash }` plus full `scenes` + `directorRules` copy (cap **10** snapshots per project v1).
2. User can restore a snapshot (confirm overwrite current scenes).

---

## 6. Data model

### 6.1 Schema version bump

- Bump `PROJECT_STATE_SCHEMA_VERSION` from **2 → 3** when this ships.
- Migration: existing projects get empty defaults for new keys via `createEmptyProjectState` / load normalizer.

### 6.2 New TypeScript shapes (`lib/pro/types.ts`)

```ts
export type DirectorRulesState = {
  styleNotes: string;
  preferredShots: string;
  budgetTier: "indie" | "mid" | "high";
  toneAndRefs: string;
  genreTags: string[];
};

export type ScreenplayState = {
  title: string;
  draftLabel: string;
  pageEstimate: number | null;
  rawText: string;
  lastImportedAt: string | null; // ISO
};

export type SceneRowStatus = "draft" | "approved";

export type SceneRow = {
  id: string;
  number: number;
  heading: string;       // e.g. "INT. KITCHEN - NIGHT"
  oneLine: string;
  intExt: "INT" | "EXT" | "INT/EXT" | "";
  dayNight: "DAY" | "NIGHT" | "DAWN" | "DUSK" | "";
  visualRefs: string[];  // max 3 in UI
  shotNotes: string;
  status: SceneRowStatus;
  linkedSequenceId: string | null;
};

export type DirectorPrepSnapshot = {
  id: string;
  label: string;
  createdAt: string;
  directorRules: DirectorRulesState;
  scenes: SceneRow[];
};

export type DirectorPrepState = {
  directorRules: DirectorRulesState;
  screenplay: ScreenplayState;
  scenes: SceneRow[];
  snapshots: DirectorPrepSnapshot[];
};
```

### 6.3 Extended `ProjectStatePayload`

```ts
export type ProjectStatePayload = {
  schemaVersion: number;
  kit: unknown[];
  workflow: WorkflowState;
  budget: BudgetState;
  worldBible: WorldBibleState;
  visualBible: VisualBibleState;
  shotPlan: ShotPlanState;
  postChecklist: PostChecklistState;
  directorPrep: DirectorPrepState; // NEW
};
```

### 6.4 Example JSON (minimal)

```json
{
  "schemaVersion": 3,
  "directorPrep": {
    "directorRules": {
      "styleNotes": "Naturalistic, slow-burn; hold on faces.",
      "preferredShots": "Wide masters, slow dolly, minimal handheld.",
      "budgetTier": "indie",
      "toneAndRefs": "Nomadland, Aftersun, sodium-vapor nights.",
      "genreTags": ["drama"]
    },
    "screenplay": {
      "title": "The Last Shift",
      "draftLabel": "Draft 2",
      "pageEstimate": 28,
      "rawText": "INT. DINER - NIGHT\n\n...",
      "lastImportedAt": null
    },
    "scenes": [
      {
        "id": "sc_01",
        "number": 1,
        "heading": "INT. DINER - NIGHT",
        "oneLine": "A tired waitress closes up; a stranger waits for coffee.",
        "intExt": "INT",
        "dayNight": "NIGHT",
        "visualRefs": [
          "Aftersun — fluorescent kitchen",
          "Edward Hopper — Nighthawks (composition only)",
          "Sodium vapor + wet window reflections"
        ],
        "shotNotes": "Master wide, slow push on stranger.",
        "status": "approved",
        "linkedSequenceId": null
      }
    ],
    "snapshots": []
  }
}
```

### 6.5 External AI import JSON schema (for paste)

```json
{
  "scenes": [
    {
      "heading": "INT. DINER - NIGHT",
      "oneLine": "…",
      "intExt": "INT",
      "dayNight": "NIGHT",
      "visualRefs": ["…", "…", "…"],
      "shotNotes": "…"
    }
  ]
}
```

Importer assigns `id`, `number`, `status: "draft"`, `linkedSequenceId: null`.

---

## 7. UI — workspace tabs

Insert **Director’s Prep** as the **first** production tab (before World bible):

| Tab id | Label | Contents |
|--------|-------|----------|
| `director` | **Director’s Prep** | Rules + script paste + scene table + import/export actions |
| `world` | World bible | (existing) |
| `visual` | Visual bible | (existing) |
| `shots` | Shots | (existing) — show link badge if scene linked |
| `kit` | Kit | (existing) |
| `workflow` | Workflow | (existing) |
| `budget` | Budget | (existing) + “Suggest from scenes” |
| `post` | Post | (existing) |

**Director’s Prep panel layout (single tab, scroll sections):**

1. **Director’s Bible** — form fields  
2. **Script** — title, draft, paste area, char count  
3. **Scenes** — editable table; filter draft/approved  
4. **AI assist (external)** — Copy prompt | Import JSON  
5. **Snapshots** — save / restore  
6. **Export** — CSV | Markdown (links to existing export panel if present)

Mobile: table → card list per scene.

---

## 8. Template

New template id: **`director-prep-narrative-short`**

- Seeds `directorRules` with placeholder copy  
- Empty `scenes[]`, empty `screenplay.rawText`  
- Pre-links playbook steps for Director’s Prep  
- Optionally pre-fills `worldBible.locations` checklist from approved scenes later (Phase 1.5.1)

Register in `lib/pro/templates.ts` under group **`classical-ai`** or new group **`director-prep`**.

---

## 9. Engineering tasks (suggested checkboxes)

| # | Task | Files / notes |
|---|------|----------------|
| 1 | Add types + defaults + schema v3 bump | `lib/pro/types.ts`, `project-state-defaults.ts`, `validate-project-state.ts` |
| 2 | Normalizer for v2 → v3 on load | `lib/pro/validate-project-state.ts` |
| 3 | `DirectorPrepPanel` UI | `components/pro/DirectorPrepPanel.tsx`, wire in `ProWorkspace.tsx` |
| 4 | Scene table CRUD + approve | same |
| 5 | Prompt builder + JSON import parser | `lib/pro/director-prep-prompt.ts`, `lib/pro/import-scenes-json.ts` |
| 6 | Snapshot save/restore | panel + state patch |
| 7 | CSV/MD export route | extend `app/api/pro/export/[projectId]/[kind]/route.ts` → kinds `directors-prep`, `directors-prep-md` |
| 8 | Template `director-prep-narrative-short` | `lib/pro/templates.ts` |
| 9 | Playbook steps (5-step) | `lib/pro/playbook-steps.ts` or template-specific |
| 10 | Smoke: paste script → import JSON → approve → export | manual + `npm run ci` |

---

## 10. Success criteria

After Phase 1.5, a subscriber can:

- [ ] Set Director’s Bible rules and see them in export  
- [ ] Paste a **20–30 page** script and maintain **≥10 scene rows**  
- [ ] Copy external prompt, import JSON, approve rows  
- [ ] Export CSV/Markdown director packet  
- [ ] Reload project on second browser and see same scenes  

Qualitative: *“This feels like prep, not chat.”*

---

## 11. Phase 2 pointer — Multi-agent Director’s Agent

When API scope reopens (BYOK or credits), add:

| Agent | Input | Output |
|-------|-------|--------|
| Script Analyzer | `screenplay.rawText` | `scenes[]` draft |
| Research | scene heading + rules | `visualRefs[]` suggestions (web search API) |
| Shot List | approved scenes | `shotPlan.sequences` draft |
| Budget | scenes + `budgetTier` | `budget` suggestion rows |

Orchestrator runs server-side; each step writes **draft** state; **approval UI** from Phase 1.5 stays unchanged.

**Do not start Phase 2 until Phase 1.5 export + scene model ship.**

---

## 12. Document map

| Doc | Use |
|-----|-----|
| **This file** | Director’s Prep scope & schema |
| `docs/35mmpro-phase1-implementation-guide.md` | Layer A context |
| `docs/phase-0-35mmpro-product-lock.md` | API-free constraint |
| `tasks/tasks-0002-…` | Phase 1 base checklist |

---

*Phase 1.5 core implemented May 2026 on prototype branch. See `HANDOFF.md` § Director’s Prep smoke checklist and `tasks/tasks-0003-directors-prep-phase1-5.md`.*
