# Phase 0 — 35mmAiPro product lock

**Status:** Active direction — **API-free PRO** (no inference APIs in v1). **Script to prompt** is the primary product (refocus, 2026). Supersedes earlier “credits + pipeline” and “full shooting list” positioning.  
**Audience:** Professional and classical filmmakers who already use external AI tools — solo directors, small crews, students.

---

## Marketing line (locked)

> **35mmAiPro turns your screenplay and look into copy-ready prompts for the tools you already use — Midjourney, Kling, LTX, and your kit. Nothing generates inside the app.**

**Continuity with Free 35mmAI:** Free answers *what tools exist and what they cost*. Pro answers *what to paste into them, scene by scene*.

---

## Job to be done

When a filmmaker has a **script** (and often a breakdown elsewhere), they need **professional, tool-specific generation prompts** locked to their **visual intent** — without learning prompt engineering per app, rebuilding packs every project, or paying for in-app AI generation.

---

## One-sentence v1 promise (PRO)

**Paste your screenplay, lock your look, export a shot-quality prompt pack — one visual beat, one prompt, one catalog tool.**

---

## Honest scope (locked — say this in product copy)

| Claim | Meaning |
| ----- | ------- |
| **“Full script”** | Every **approved scene** gets a **modular set of generation prompts** (typically 3–4 visual beats per scene: establishing, medium, detail, optional movement). |
| **Not promised** | A prompt for every dialogue line; a Hollywood shoot list; stripboard; DOOD; in-app image/video generation. |
| **Human gate** | User approves scenes and look before prompts are final — same discipline as classical prep. |

---

## What Pro is / is not

### Pro is

- **Script → look → prompt pack** on the existing cloud workspace spine (projects, autosave, export).
- **Tool-native prompts** — syntax tuned per tool (Midjourney, Kling, LTX, Higgsfield, Nano, etc.) with **tool name + catalog outbound link** on every row.
- **Classical filmmaker fit** — story and look first; external tools for execution; festival-minded framing, not social/viral formats.
- **Partner to the free catalog** — Pro uses 35mmAI ranks and links; it does not replace tool discovery.

### Pro is not

- A **script breakdown**, **scheduling**, or **shoot-list** product — **Filmustage** and similar tools own that job.
- A **Filmustage clone** — no stripboard hero, no coverage % gamification, no competing breakdown UX.
- An **AI generator** — no inference APIs, no credits ledger, no “the film makes itself.”

### Filmustage (partner, not competitor)

- Catalog partner with affiliate link (rank #14). In-app guidance: *break down and schedule in Filmustage; use 35mmPRO for AI-ready prompts.*
- v1 integration: **copy/paste only** (scene headings or exported text) — no API dependency.

---

## Primary user path (app — locked)

Default experience for new projects:

| Step | User action | Outcome |
| ---- | ----------- | ------- |
| **1. Script** | Paste / upload screenplay; set short look rules (style, tone, aspect, negatives) | Scenes parsed and approved |
| **2. Look** | Palette, mood refs, consistency (lightweight visual bible) | Look locked into all prompts |
| **3. Prompts** | Review per-scene prompts; pick or accept suggested tool per beat; copy | Prompt pack ready |
| **Export** | Download **prompt pack** (.md / .csv) | Deliverable for DOP / AI artist / self |

**Advanced (not default):** classical location-pass template, budget, workflow, world bible, FDX/Fountain exports, native prep agent — available behind “Advanced,” not the first-run path.

**Default template:** `director-prep-script-to-prompt` — applied on new project without forcing a template gallery.

---

## What v1 includes (current direction)

| Pillar | Meaning |
| ------ | ------- |
| **Script to prompt** | Scene-first prep → visual beats → **copy-ready prompts** with tool names and catalog links. |
| **Cloud persistence** | Screenplay, look, prompts, and project state synced per account. |
| **Projects** | Multiple productions; resume on any device. |
| **Exports** | **Prompt pack** (Markdown + CSV) as primary deliverable; other exports secondary / advanced. |
| **Templates** | **Script to prompt** default; classical / production templates demoted to advanced. |
| **Kit & catalog** | Tools from free `app/data.ts` — ranks, affiliate links, outbound URLs in prompt UI. |
| **Simple subscription** | **One PRO tier**, **Stripe**, **USD** — no credits, no inference APIs. |

---

## Explicitly deferred (not v1)

- **Wholesale inference APIs** (image/video/LLM generation), **credit packs**, **top-ups**, **metered runs**.
- **Filmustage-style breakdown / scheduling / call sheets** — partner externally; do not rebuild.
- **Shoot-list / coverage planner** as hero product — demote or hide in script-to-prompt flow.
- **Prompt for every script line** — scene-level visual beats only.
- Native **phone apps**, **full storyboard graph**, **multi-seat org billing**, **multi-tier** Starter/Pro.
- **PDF director packet** — optional after prompt-pack quality is proven.

---

## Pricing & billing

- **Stripe**, **USD**, **single subscription product** (monthly to start; annual optional later).
- No per-generation cost to you beyond fixed hosting + auth + DB.

---

## Engineering / ops (confirmed)

- PRO development on **`35mmpro-prototype`**, **local-only** until you choose otherwise — **`docs/35mmpro-local-prototype.md`**.
- **Live** ships from **`main`** only (free catalog + partner updates); Pro merge when intentional.

---

## Pro membership story (aligned with Script to prompt refocus)

**Free** = curated tool directory + local kit / workflow / budget in the browser.  
**Pro** = cloud **script + look → prompt pack** for classical filmmakers using AI tools **outside** the app.

**Marketing subline ( `/pro` and workspace):**  
*Free shows you what to use. Pro tells you what to paste — scene by scene, tool by tool.*

**Implementation plan:** phased refocus on existing spine (3-step nav, scene-first prep, extended tool formatters, prompt-pack export) — see conversation / HANDOFF session log; canonical build guide: **`docs/35mmpro-phase1-implementation-guide.md`** (update as slices land).

**Not Phase 1 hero:** “AI Filmmaking Academy,” auto-scraped vault, in-app AI chat, location-pass epic as default onboarding — see **`docs/ideas/archive-35mmpro-academy-brainstorm-may15.md`** (ideas only).

---

## Success criteria (refocus sign-off)

Checklist: **`docs/v1-script-to-prompt-refocus-done.md`**

| Criterion | Done when |
| --------- | --------- |
| **15-minute path** | New user with **5-scene test script** (`lib/pro/demo-script-five-scenes.ts`) reaches **Export prompt pack** without opening Shots / Budget / Workflow. |
| **Happy path tabs** | `getNextWorkspaceStep` for script-to-prompt: Script → Look → Prompts → Export only. |
| **Marketing** | `/pro` hero and metadata do **not** say “shooting list,” “full shooting list,” “stripboard,” or “coverage” as the product promise. |
| **Default project** | `bootstrapDefaultProject` applies **`director-prep-script-to-prompt`**. |
| **Prompt quality** | Working DOP can paste **≥80%** of prompts without rewrite (5-scene sample). |
| **Filmustage** | Partner link in catalog; no breakdown/scheduling UX in Pro happy path. |

**Stop saying (Pro surfaces):** “Full shooting list,” “shooting list” (as Pro outcome), “coverage,” “stripboard” — except Filmustage’s own catalog listing in `app/data.ts`.

---

## PRD index

| Doc | Scope |
| --- | ----- |
| **`docs/35mmpro-phase1-implementation-guide.md`** | **Canonical** — built vs next; update for script-to-prompt refocus. |
| **`tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`** | Phase 1 — auth, Stripe, projects, workspace, exports (spine reused). |
| **`tasks/0001-prd-35mmpro-phase1-membership-credits.md`** | **Superseded** — credits + pipeline prep. |
| **`HANDOFF.md`** | Env, routes, smoke checklists, session logs. |

---

## Open decisions (carry into implementation)

1. **Export v1 hero** — prompt-pack Markdown only vs Markdown + CSV (both likely).
2. **Tool formatters v1 set** — confirm minimum: MJ (6), Kling (21), LTX (4), Higgsfield (1), Nano (18).
3. **Advanced drawer** — which legacy tabs (budget, workflow, classical template) stay vs hide.
4. **Migration path** — import existing `localStorage` kit into first project on upgrade (optional).
5. **Filmustage in-app** — link-only vs future “paste scene export” helper (no API v1).
