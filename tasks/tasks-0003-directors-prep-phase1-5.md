# Task list: Director’s Prep — Phase 1.5 (API-free)

**Source PRD:** `docs/35mmpro-directors-prep-phase1-5-prd.md`  
**Depends on:** Phase 1 workspace complete (`tasks/tasks-0002-prd-35mmpro-phase1-cloud-workspace-subscription.md` tasks **6.0–10.0**)  
**Branch:** `35mmpro-prototype` (local-only until PRO launch)  
**Do not merge to `main`** until intentional PRO launch.

**Constraint:** No hosted LLM / inference APIs in this slice. External Claude copy-paste only.

---

## Relevant Files

*Expected create or modify during implementation.*

- `lib/pro/types.ts` — `DirectorPrepState`, `SceneRow`, schema v3 on `ProjectStatePayload`
- `lib/pro/project-state-defaults.ts` — empty `directorPrep` defaults
- `lib/pro/validate-project-state.ts` — v2 → v3 normalizer, payload size guard
- `lib/pro/project-state-has-content.ts` — include `directorPrep` in “has content” checks if used for template overwrite
- `lib/pro/director-prep-prompt.ts` — build external Claude prompt Markdown
- `lib/pro/import-scenes-json.ts` — parse/validate pasted JSON → `SceneRow[]` drafts
- `lib/pro/budget-from-scenes.ts` — deterministic budget suggestion from approved scene count + tier
- `components/pro/DirectorPrepPanel.tsx` — rules, script, scene table, AI assist, snapshots
- `components/pro/ProWorkspace.tsx` — new **`director`** tab (first tab); budget “Suggest from scenes”
- `components/pro/ProExportPanel.tsx` — add directors-prep export kinds (if exports live here)
- `components/pro/PlaybookSteps.tsx` / `lib/pro/playbook-steps.ts` — 5-step Director’s Prep playbook
- `lib/pro/templates.ts` — template `director-prep-narrative-short`
- `app/api/pro/export/[projectId]/[kind]/route.ts` — kinds `directors-prep`, `directors-prep-md`
- `lib/pro/export-csv.ts` — helpers for director packet CSV (or dedicated `export-directors-prep.ts`)
- `docs/35mmpro-directors-prep-phase1-5-prd.md` — scope reference (update status when shipped)
- `HANDOFF.md` — note schema v3, new export kinds, smoke steps

### Notes

- Bump **`PROJECT_STATE_SCHEMA_VERSION`** to **3** when `directorPrep` ships.
- Max **`screenplay.rawText`**: 120k chars (~30 pages); enforce in validate + UI.
- Max **3** `visualRefs` per scene in UI; max **10** snapshots per project.
- Export default: **approved** scenes only; optional “include drafts” toggle on export.
- **Do not** add OpenAI/Anthropic SDK deps in this task list.
- Quality gate: **`npm run ci`** after each major slice.

---

## Tasks

- [x] **1.0** Data model & schema v3
  - [x] 1.1 Add TypeScript types: `DirectorRulesState`, `ScreenplayState`, `SceneRow`, `DirectorPrepSnapshot`, `DirectorPrepState` in `lib/pro/types.ts`.
  - [x] 1.2 Extend `ProjectStatePayload` with required `directorPrep`; bump `PROJECT_STATE_SCHEMA_VERSION` to **3**.
  - [x] 1.3 Add empty defaults in `lib/pro/project-state-defaults.ts` (`createEmptyDirectorPrep()` or inline).
  - [x] 1.4 Extend `validate-project-state.ts`: merge missing `directorPrep` on load; reject oversize `rawText` / total payload.
  - [x] 1.5 Implement **v2 → v3 migrator** on load (existing projects get empty `directorPrep`, preserve kit/world/visual/shot/budget).
  - [x] 1.6 Update `project-state-has-content.ts` (and template overwrite confirm) to consider non-empty `directorPrep.scenes` or `screenplay.rawText`.

- [x] **2.0** Director’s Prep UI — core panel
  - [x] 2.1 Create `components/pro/DirectorPrepPanel.tsx` with section layout: Bible → Script → Scenes → AI assist → Snapshots → Export shortcuts.
  - [x] 2.2 **Director’s Bible** form: `styleNotes`, `preferredShots`, `budgetTier` select, `toneAndRefs`, `genreTags` (comma or chip input).
  - [x] 2.3 **Script** section: `title`, `draftLabel`, `pageEstimate`, paste textarea + live char count (120k cap); disable save over limit with clear message.
  - [x] 2.4 **`.txt` upload** (client FileReader → `screenplay.rawText`); reject non-.txt with toast.
  - [x] 2.5 Wire panel into `ProWorkspace.tsx`: new tab id **`director`**, label **Director’s Prep**, placed **before** World bible; default tab can stay `world` or switch to `director` when template applied.
  - [x] 2.6 Mobile: scene **table → card list** below `md` breakpoint.

- [x] **3.0** Scene table — CRUD & approval
  - [x] 3.1 Editable scene rows: add, edit, delete, reorder (up/down or drag optional).
  - [x] 3.2 Columns: `#`, heading, one-line, INT/EXT, DAY/NIGHT, up to 3 visual refs, shot notes, status.
  - [x] 3.3 **Approve / unapprove** per row; bulk “Approve all drafts” with confirm.
  - [x] 3.4 Filter toggle: all | drafts | approved.
  - [x] 3.5 Optional **link to shot sequence**: dropdown of `shotPlan.sequences` → `linkedSequenceId`; show link badge on Shots tab when set.
  - [x] 3.6 Autosave via existing `updateState` / debounced save (no new save pipeline).

- [x] **4.0** External AI assist (no API)
  - [x] 4.1 Implement `lib/pro/director-prep-prompt.ts`: inject `directorRules`, script excerpt (user picks “first 8k chars” or full if under cap), fixed instructions + JSON output schema.
  - [x] 4.2 **Copy prompt for Claude** button + success toast (“Copied”).
  - [x] 4.3 Implement `lib/pro/import-scenes-json.ts`: validate `{ scenes: [...] }`; assign `id`, `number`, `status: "draft"`.
  - [x] 4.4 **Import AI response** modal: paste JSON, preview row count, confirm merge (append vs replace drafts — document choice; default **append**).
  - [x] 4.5 Surface parse errors inline (invalid JSON, missing `heading`, etc.).

- [x] **5.0** Snapshots (version history lite)
  - [x] 5.1 **Save snapshot**: prompt for label; copy `directorRules` + `scenes` into `directorPrep.snapshots[]` with ISO `createdAt`.
  - [x] 5.2 Cap at **10** snapshots; drop oldest or block with message (document choice).
  - [x] 5.3 **Restore snapshot**: confirm overwrite current rules + scenes; refresh UI from state.
  - [x] 5.4 Snapshot list UI: label, date, scene count.

- [x] **6.0** Budget hint (deterministic)
  - [x] 6.1 Implement `lib/pro/budget-from-scenes.ts`: `approvedSceneCount` + `directorRules.budgetTier` → suggested lines from `BUDGET_DEFAULT_*` / `budgetLinesFromPreset` patterns in `app/data.ts`.
  - [x] 6.2 **Suggest from scenes** button on Budget tab (or Director’s Prep section): show read-only modal with suggestion; **Apply** copies into budget state only after confirm.
  - [x] 6.3 Do **not** auto-modify kit without separate confirm.

- [x] **7.0** Exports — Director’s Packet
  - [x] 7.1 Add export kind **`directors-prep`**: CSV with project name, date, rules summary, scene rows (approved only by default).
  - [x] 7.2 Add export kind **`directors-prep-md`**: Markdown director packet (rules + scene table + optional shot plan titles + budget one-liner).
  - [x] 7.3 Extend `app/api/pro/export/[projectId]/[kind]/route.ts` + auth/entitlement checks (match existing kit/budget/workflow exports).
  - [x] 7.4 Filename pattern: `{project-slug}-directors-prep-{YYYY-MM-DD}.csv|md`.
  - [x] 7.5 Export UI: buttons on Director’s Prep panel and/or `ProExportPanel`; toggle **Include draft scenes**.
  - [x] 7.6 *(Deferred)* PDF director packet — reuse Phase 1 task 10.3 PDF work when available.

- [x] **8.0** Template & playbook
  - [x] 8.1 Add template id **`director-prep-narrative-short`** in `lib/pro/templates.ts` (new group **`director-prep`** or under `classical-ai`).
  - [x] 8.2 Seed placeholder `directorRules`, empty `scenes`, empty `screenplay.rawText`; optional starter kit ranks unchanged from narrative short preset.
  - [x] 8.3 Register template in picker UI with description aligned to PRD one-liner.
  - [x] 8.4 Add **5-step playbook** for this template in `lib/pro/playbook-steps.ts`: Rules → Paste script → Copy prompt → Import & approve → Export.
  - [x] 8.5 Wire playbook display when template active (reuse `PlaybookSteps` component).

- [x] **9.0** Integration & polish
  - [x] 9.1 Shots tab: indicate scenes linked via `linkedSequenceId` (badge or subtitle).
  - [x] 9.2 World bible: optional “Pull location names from approved scene headings” helper (parse `INT./EXT.` — stretch; skip if timeboxed).
  - [x] 9.3 Empty states: no script yet, no scenes yet, no approved scenes for export.
  - [x] 9.4 Accessibility: table headers, `summary`/`details` for mobile cards, focus order on import modal.

- [ ] **10.0** Quality, smoke & docs
  - [x] 10.1 Run **`npm run ci`** green after slices 1–9.
  - [x] 10.1b Run **`npm run smoke:pro`** (import/apply/report unit smoke).
  - [ ] 10.2 Manual smoke: set rules → paste ~20pp script → import sample JSON → approve ≥3 scenes → export CSV + MD → second browser same project.
  - [ ] 10.3 Manual smoke: snapshot save + restore preserves scenes.
  - [ ] 10.4 Manual smoke: budget suggest from scenes → apply with confirm.
  - [x] 10.5 Update **`HANDOFF.md`**: schema v3, new tab, export kinds, external-AI workflow note.
  - [x] 10.6 Update PRD **`docs/35mmpro-directors-prep-phase1-5-prd.md`** status → *In progress* / *Shipped* when done.
  - [x] 10.7 Add cross-link from `docs/35mmpro-phase1-implementation-guide.md` § document map (one line).

---

## Success criteria (from PRD)

After Phase 1.5 ships, verify:

- [ ] Director’s Bible rules persist and appear in export  
- [ ] 20–30 page script paste works within char cap  
- [ ] ≥10 scene rows manageable (CRUD + approve)  
- [ ] Copy external prompt + import JSON → draft scenes  
- [ ] CSV + Markdown director packet download  
- [ ] Cloud reload on second device shows same `directorPrep`  

Qualitative: *“This feels like prep, not chat.”*

---

## Suggested implementation order

Work **1.0 → 2.0 → 3.0** first (tab + save/load). Then **4.0 → 5.0**, then **7.0** (exports), **8.0** (template), **6.0** (budget hint), **9.0 → 10.0**.

**Do not start Phase 2 multi-agent** until **7.0** exports and **3.0** approval flow are done.

---

## Out of scope (Phase 2+)

- Hosted LLM / multi-agent orchestrator  
- PDF/Fountain parse, location database, in-app image generation  
- Web search research agent  
- BYOK / credits billing  

See PRD §11 in `docs/35mmpro-directors-prep-phase1-5-prd.md`.

---

*When completing a sub-task, check the box in this file.*
