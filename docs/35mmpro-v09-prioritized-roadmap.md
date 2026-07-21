# 35mmAiPro v0.9 — Prioritized Roadmap (Director’s Agent)

**Last updated:** 2026-05-19

This doc mirrors the product tier list and records **implementation status** in this repo.

---

## Tier 1 — Must build first (Smart Shot Plan + Project Memory)

| P | ID | Title | Status | Notes |
|---|-----|-------|--------|-------|
| 1 | PRO-101 | Smart Shot Plan from approved scenes | ✅ Done | `generate-shot-plan-from-prep.ts`, API route, Shots panel CTAs |
| 2 | PRO-102 | Project memory | ✅ Done | `agentMemory`, `append-memory-decision`, `synthesize-project-memory` |
| 3 | PRO-105 | Shot Planner agent | ✅ Done | `shot-list-agent.ts` + orchestrator |
| 4 | PRO-103 | Visual Bible prompts | ✅ Done | `visual-bible-prompts.ts` |
| 5 | PRO-201 | Rich shot cards + DnD | ✅ Done | `ShotCard`, `ShotsPanel` drag reorder |

**Tier 1 focus delivered.** Critical fix for “script but zero shots”: `ensure-shot-plan-from-script.ts` — parses INT./EXT. headings and builds coverage without API.

---

## Tier 2 — High value (connected Production tab)

| P | ID | Title | Status | Notes |
|---|-----|-------|--------|-------|
| 6 | PRO-202 | Shots ↔ Visual Bible | ✅ Done | `matchVisualBibleToShotPlan`, enrichment |
| 7 | PRO-204 | Budget from shot plan | ✅ Done | `budget-from-shot-plan.ts` |
| 8 | PRO-104 | Cost/time estimates | ✅ Done | `prep-cost-estimate`, `AgentCostEstimate` |
| 9 | PRO-203 | Coverage analysis | ✅ Done | `getCoverageGaps`, suggest coverage |
| 10 | PRO-205 | Suggest coverage / Match bible | ✅ Done | Shots toolbar buttons |

---

## Tier 3 — Polish & trust

| P | ID | Title | Status | Notes |
|---|-----|-------|--------|-------|
| 11 | PRO-301 | Thinking log | ✅ Done | `ThinkingLogPanel`, humanized summaries |
| 12 | PRO-302 | Consistency warnings | ✅ Done | `VisualBibleWarnings`, heuristic + API |
| 13 | PRO-303 | Preview before refine | ✅ Done | `RefinePreviewCard` |
| 14 | PRO-304 | Loading & success UX | ✅ Done | `ProLoadingBar`, banners, toasts |

---

## Tier 4 — Advanced / release prep

| P | ID | Title | Status | Next step |
|---|-----|-------|--------|-----------|
| 15 | PRO-401 | Reference library | ✅ Done | Upload + `analyze-refs` vision pass (`reference-vision-agent.ts`) |
| 16 | PRO-402 | Learning from feedback | ✅ Done | Stronger `memoryContextBlock`; memory on ref analyze + staging |
| 17 | PRO-403 | Storyboard + Final Draft | ✅ Done | Storyboard HTML/MD + Fountain + **`.fdx`** (`fdx-export.ts`) |
| 18 | PRO-305 | Keyboard shortcuts | ✅ Done | ⌘↵ prep, Esc cancel, ⌘⇧G shots |
| — | PRO-404 | Regression testing | ✅ Done | `npm run ci` includes `smoke:pro` |
| — | PRO-405 | Demo + docs | ✅ Done | **`docs/35mmpro-v09-demo-script.md`** (record Loom when ready) |

---

## v0.9 complete

All 18 tickets + release prep doc are implemented in codebase. Remaining work is **operational**: record demo video, publish changelog on marketing site.

Optional follow-up: server-side fetch of external reference URLs for vision (links stay text-only today).

---

## 8-minute user path (validated)

1. Paste script (INT./EXT. headings) — Prep step 1  
2. Run **local prep** (~30s) — step 3  
3. Accept scenes → Save to project  
4. Production → Shots — **Build from script** or auto via `ensureShotPlanFromScript`  
5. Suggest coverage → Match visual bible  
6. Budget → Suggest from shot plan  
7. Export storyboard HTML + Fountain  

---

## Commands

```bash
npm run ci        # lint + build + smoke
npm run smoke:pro # offline workspace tests only
```
