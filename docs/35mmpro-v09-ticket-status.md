# 35mmAiPro v0.9 “Director’s Agent” — Ticket Status

**Last audited:** 2026-05-26  
**Branch baseline:** workspace prototype with Pro cloud stack

| Status | Meaning |
|--------|---------|
| ✅ Done | Acceptance criteria met in code + smoke |
| ⚠️ Partial | Core shipped; documented limits |
| ❌ Not done | Not implemented |

---

## 1 — Foundation & Intelligence

| ID | Title | Status | Evidence |
|----|-------|--------|----------|
| **PRO-101** | Smart Shot Plan – Auto-generate from Approved Scenes | ✅ Done | `generate-shot-plan-from-prep.ts`, `ShotsPanel` **“Generate Shot Plan from Approved Scenes”**, API `POST /api/pro/shot-plan/.../generate`, shot fields via `shot-plan-enrichment` |
| **PRO-102** | Project Memory System | ✅ Done | `AgentProjectMemory`, `append-memory-decision`, `recordStagingDecisions`, `ProjectMemoryPanel` in wizard; manual approve + accept-all record memory |
| **PRO-103** | Upgrade Visual Bible Agent prompts | ✅ Done | `visual-bible-prompts.ts`, mood-board + consistency APIs |
| **PRO-104** | Cost & Time Estimation before agents | ✅ Done | `prep-cost-estimate.ts` per-agent breakdown, `AgentCostEstimate`, cancel via Esc / don’t run |
| **PRO-105** | Shot Planner Agent | ✅ Done | `shot-list-agent.ts`, orchestrator; **`commitAgentStaging` parses agent shot notes** (not generic coverage only) |

---

## 2 — Production Power Features

| ID | Title | Status | Evidence |
|----|-------|--------|----------|
| **PRO-201** | Rich Shot Card UI with drag & drop | ✅ Done | `ShotCard.tsx`, DnD in `ShotsPanel`, collapse sequences |
| **PRO-202** | Link Shots to Visual Bible | ✅ Done | `shot-plan-enrichment.ts`, **Look note on cards**, Match Visual Bible toolbar |
| **PRO-203** | Coverage Analysis | ✅ Done | `getCoverageGaps`, `ShotPlanSummary` coverage %, Suggest coverage |
| **PRO-204** | Budget tab from Shot Plan | ✅ Done | `budget-from-shot-plan.ts`, auto cross-tab summary, **tier pressure warning** |
| **PRO-205** | Suggest Coverage & Match Visual Bible | ✅ Done | `ShotsPanel` toolbar |

---

## 3 — Polish & Trust

| ID | Title | Status | Evidence |
|----|-------|--------|----------|
| **PRO-301** | Human-readable Thinking Log | ✅ Done | `ThinkingLogPanel` + timestamps; prep wizard + **Shots AI generate** |
| **PRO-302** | Proactive Consistency Warnings | ✅ Done | `VisualBibleWarnings`, `checkVisualConsistency`, consistency API |
| **PRO-303** | Preview Changes before Refine | ✅ Done | `RefinePreviewCard`, two-step refine |
| **PRO-304** | Loading states & success feedback | ✅ Done | `ProLoadingBar`, `ProStatusBanner`, toasts; manual import panel uses shared banners |

---

## 4 — Advanced Features & Release

| ID | Title | Status | Evidence |
|----|-------|--------|----------|
| **PRO-401** | Visual Reference Library | ⚠️ Partial | Upload + vision on `data:image` stills (`reference-vision-agent.ts`); **URL refs stored, not pixel-analyzed** |
| **PRO-402** | Learning from Feedback | ⚠️ Partial | `learnedPreferences` + `memoryContextBlock` in agents; **heuristic memory, not embeddings** |
| **PRO-403** | Export Storyboard + Final Draft | ✅ Done | `storyboard-html`, `storyboard-md`, `fountain`, **`.fdx`** (`fdx-export.ts`) |
| **PRO-404** | Regression testing | ✅ Done | `npm run ci`, `npm run smoke:pro` |
| **PRO-405** | Public demo + documentation | ⚠️ Partial | `docs/35mmpro-v09-demo-script.md`; record Loom when ready |

---

## Known limits (not blocking v0.9)

- **PRO-401:** Server-side fetch of external image URLs for vision (optional follow-up).
- **PRO-402:** Semantic memory graph / fine-tuning deferred.
- **PRO-403:** `.fdx` is functional XML; validate import in Final Draft 12+ manually.

---

## Commands

```bash
npm run ci          # lint + production build + smoke:pro
npm run smoke:pro   # offline workspace smoke tests
```
