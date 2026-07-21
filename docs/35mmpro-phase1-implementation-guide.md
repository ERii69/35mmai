# 35mmAiPro Phase 1 — implementation guide (canonical)

**Status:** Active direction for engineering and agents.  
**Last updated:** May 2026 (post task 5.0 shell + product discussion).  
**Supersedes:** Using `35mmaiPro_nextstepsMay15.md` or academy/vault/auto-scrape plans as a build spec.

---

## 1. Read this first

### Product in one paragraph

**35mmAI (free)** introduces filmmakers to **AI tools** via a curated directory plus kit / workflow / budget planning in the browser.

**35mmAiPro (paid)** is **not** an in-app AI generator. It is a **subscription-backed production workspace**: projects, cloud-synced state, templates, and exports — shaped so **classical filmmakers can run an AI-native pipeline** (world → visual system → shots → external tools → post) without 35mmAI paying for inference APIs.

### Locked headline (do not replace)

> **35mmAiPro isn’t another AI generator — it’s where your kit, workflow, and budget stay organized like a real production.**

### Membership story (marketing subline — use on `/pro` when ready)

> **Free tools show you what to use. Pro gives you the workflow: world → visuals → shots → edit — organized on every project.**

This subline explains *why* Pro exists without promising generation inside the app.

### Free vs Pro

| | Free | Pro |
|---|------|-----|
| **Job** | Discover tools; plan kit, phases, budget locally | Same mental model, **per project**, **in the cloud**, with **exports** and **templates** |
| **AI help** | Links + catalog | **Structured workflow** + playbooks + tool map by phase — user generates **outside** the app |
| **Billing** | — | Stripe USD subscription (`active` / `trialing`) |

---

## 2. What is already built (do not redo)

Verified through **task 5.0** (Pro shell). Details: `docs/AGENT-ONBOARDING-35mmAiPro-NEXT-STEPS.md` § “What is already implemented”.

| Task | Summary |
|------|---------|
| **1.0** | Supabase + Stripe deps, `.env.example`, HANDOFF |
| **2.0** | `/login`, `/sign-up`, `/auth/*`, `/account`, middleware session |
| **3.0** | Checkout + Customer Portal on `/account` |
| **4.0** | Webhooks → `profiles` + `stripe_events_processed`; `isProEntitled()` |
| **5.0** | `/pro` marketing split; `/pro/app` gated workspace shell |

### Key routes

- `/pro` — marketing / waitlist; header varies by auth + entitlement  
- `/pro/app` — subscriber workspace (dashboard, subscription card, stub nav)  
- `/account` — billing  
- `POST /api/webhooks/stripe`

### Stripe webhook events handled

`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, **`customer.updated`** (Portal address/billing saves).

Period end is read from **`subscription.items.data[].current_period_end`** after full `subscriptions.retrieve` with `expand: ['items.data.price']`.

---

## 3. What we are building next (Phase 1 engineering)

**Authoritative checkboxes:** `tasks/tasks-0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`  
**PRD:** `tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`

Work **6.0 → 11.0** in order:

1. **6.0** — `projects` + `project_state` tables, RLS, Server Actions (CRUD + load/save state)  
2. **7.0** — Workspace UI: load/save kit, workflow, budget (and extended AI-native sections — see §5)  
3. **8.0** — Project switcher, create, rename, archive  
4. **9.0** — Templates (include at least one **AI-native short** template)  
5. **10.0** — Exports (CSV/PDF from cloud state; “director packet”)  
6. **11.0** — CI, smoke tests, HANDOFF, inert-on-main without env  

Optional before 6.0: **light UI alignment** with free app (fonts, colors, `components/ui`).

---

## 4. How Pro delivers “help with AI” (without inference APIs)

Pro helps classical filmmakers **change workflow**, not generate clips inside 35mmAI.

### Reference workflow (Gossip Goblin–class)

Inspired by creator pipelines such as [PJaccetturo on Gossip Goblin / Patchwright-style work](https://x.com/PJaccetturo/status/2054567105924899147):

1. **World / story bible first** — lore, invisible detail, tone  
2. **Visual system** — design sheets, consistency refs, shot-list-as-reference  
3. **Generation** — user’s tools (Seedance, Kling, etc.) via **catalog links**  
4. **Post** — edit, sound, grade; cohesion in the cut (“wet clay”)  
5. **Repeatable project** — next film starts from a template, not zero  

35mmAI does **not** host generation; it **orchestrates and persists** this path.

### Three implementation layers (on top of current codebase)

#### Layer A — Workspace structure (primary — code in this repo)

Extend **`project_state`** (task 6.2) beyond kit/workflow/budget only. Suggested sections:

| Section | Purpose |
|---------|---------|
| `worldBible` | Characters, locations, props, tone, checklist items |
| `visualBible` | Design sheet notes, ref URLs, consistency rules |
| `shotPlan` | Sequences, hero shots, per-shot tool/ref notes (text) |
| `kit` / `workflow` / `budget` | Same as free app (existing shapes from `app/data.ts`) |
| `postChecklist` | Edit, sound, grade, export steps |

**UI:** Pro shell nav evolves from stubs to **Bible → Visuals → Shots → Kit/Workflow/Budget → Post → Exports** (can ship incrementally).

**Templates (task 9):** e.g. `ai-short-world-first`, `ai-short-consistency-first`, plus classical presets from budget/workflow data.

**Exports (task 10):** PDF/CSV “director packet” = bible + shot plan + kit + budget snapshot.

#### Layer B — Curated methodology (content, minimal code)

- Static playbook pages under `/pro/app/...` or linked PDFs/Notion (owner-maintained)  
- **Monthly drop** = one curated workflow write-up + links (manual or simple CMS later)  
- Case studies = **commentary + links**, not rehosted courses  

No auto-scraping X/YouTube in Phase 1.

#### Layer C — Community (optional, later)

Discord, challenges, member showcase — **retention**, not required for 6.0–8.0. Stripe → Discord role is **deferred**.

---

## 5. Mapping layers to task list

| Goal | Tasks | Notes |
|------|-------|-------|
| Per-film container | **6.0**, **8.0** | `projects`, switcher |
| Persist bible + shots + kit | **6.2**, **6.6**, **7.0** | Extend `lib/pro/types.ts` |
| “Start like Gossip Goblin” | **9.0** | Template seeds world + visual + shot sections |
| Shareable output | **10.0** | Director packet export |
| Teach workflow without video platform | **Layer B** | After 7.0 has real UI |

---

## 6. What NOT to do first (explicit)

Do **not** implement from the May 2026 academy brainstorm until the owner reopens scope:

- Rebrand Pro as **“AI Filmmaking Academy”** before workspace has project + bible/shot surfaces  
- **Auto-curation** Edge Functions scraping X/YouTube + Grok commentary  
- **`pro_resources`** vault with JWT `user_role = 'pro'` (we use `profiles.subscription_status`)  
- In-app **“Ask the AI Director”** chat (inference APIs + cost)  
- **Pro+** second tier, Discord role automation, fake testimonials on `/pro`  
- Replacing Phase 1 with Notion-as-product instead of in-app workspace  

See: `docs/ideas/archive-35mmpro-academy-brainstorm-may15.md`.

---

## 7. Success criteria (product, not only billing)

A paying member should say after ~2 weeks:

- “My **project** has a bible and shot plan.”  
- “I know **which tools** to use in which order.”  
- “I’m **directing**, not random-prompting.”  

If they only say “I have a subscription and a dashboard,” **membership value is not shipped yet** — only billing is.

---

## 8. Document map (avoid confusion)

| Doc | Use for |
|-----|---------|
| **This file** | Direction + how to implement Pro on what’s built |
| `docs/AGENT-ONBOARDING-35mmAiPro-NEXT-STEPS.md` | Quick agent entry: paths, done list, backlog bullets |
| `docs/phase-0-35mmpro-product-lock.md` | Locked constraints |
| `docs/35mmpro-api-free-summary.md` | Tier capabilities, no-inference rules |
| `HANDOFF.md` | Env, Stripe CLI, migrations, routes |
| `tasks/tasks-0002-…` | Checkbox execution order |
| `docs/35mmpro-directors-prep-phase1-5-prd.md` | Director’s Prep product scope (Phase 1.5, API-free) |
| `tasks/tasks-0003-directors-prep-phase1-5.md` | Director’s Prep implementation checklist (schema v3, exports) |
| `docs/ideas/archive-35mmpro-academy-brainstorm-may15.md` | **Ideas only** |

---

## 9. First actions for a new agent

1. Read **`HANDOFF.md`** and **this file**.  
2. Skim **`docs/ideas/archive-…may15.md`** only to know what **not** to build.  
3. Run **`npm run ci`**.  
4. Start **6.1** migration (`projects` / `project_state`) unless owner asked for UI-only pass.  
5. When extending `project_state`, design for **§4 Layer A** (AI-native sections + kit/workflow/budget).

---

*Update this guide when 6.0 lands or positioning changes with owner approval.*
