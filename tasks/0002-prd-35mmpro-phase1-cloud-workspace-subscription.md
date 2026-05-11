# PRD: 35mmPRO Phase 1 — Cloud workspace, subscription, no inference APIs

**Document:** `0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`  
**Supersedes for implementation:** `0001-prd-35mmpro-phase1-membership-credits.md` (credits + wholesale AI deferred).  
**Related:** `docs/phase-0-35mmpro-product-lock.md`, `docs/35mmpro-local-prototype.md`, `app/data.ts` (catalog, `workflowStages`, budget presets).  
**Marketing line:** *“35mmPRO isn’t another AI generator — it’s where your kit, workflow, and budget stay organized like a real production.”*  
**Branch:** **`35mmpro-prototype`**; do not merge to **`main`** until intentional PRO launch. Local-only until you push.

---

## 1. Introduction / Overview

### Problem

The free 35mmAI experience is **browser-local**: My Kit, workflow steps, and budget choices do not reliably follow the user across devices or survive profile loss. Filmmakers preparing a real production need **persistence**, **multiple shows**, and **shareable exports** — without the product becoming another **AI generator** or requiring **metered inference APIs**.

### Solution (v1)

**35mmPRO** delivers a **professional, filmmaker-focused workspace** under a **simple USD subscription**: **accounts**, **projects**, **cloud-synced kit + workflow + budget state**, **templates** grounded in existing free-app structures, and **exports** — **no** wholesale AI APIs, **no** credits ledger.

### Phase 1 scope (this PRD)

Phase 1 is split into **delivery slices** so a junior developer can ship incrementally:

| Slice | Name | Summary |
| ----- | ---- | ------- |
| **1A** | Identity & entitlement | Sign up / sign in; Stripe Checkout subscription (USD); webhooks → DB; server-enforced “is PRO”; Customer Portal. |
| **1B** | Pro shell & routing | Pro dashboard layout; marketing `/pro` vs authenticated app routes; empty states aligned with marketing line. |
| **1C** | Cloud persistence | Server-backed storage for kit + workflow + budget JSON per user / per project; conflict strategy (last-write-wins v1). |
| **1D** | Projects | Create / rename / archive projects; switch active project; default project on first subscribe. |
| **1E** | Templates | Apply template from preset library (ties to `workflowStages` + budget preset concepts from free app). |
| **1F** | Exports | At least **one** export (PDF **or** CSV v1); stretch: both + “director one-pager” PDF. |

Slices **1A–1B** block nothing downstream. **1C** is the core value; **1D–1F** complete the “professional” bar.

---

## 2. Goals

1. Subscribers have **verified identity** and **active subscription** state stored **authoritatively** on the server (Stripe webhooks + DB).
2. Subscribers access a **Pro workspace** that is **visibly distinct** from the free marketing flow and reflects the **marketing line**.
3. **Kit, workflow, and budget** for at least **one project** persist in the **cloud** and reload on any device.
4. Users can manage **multiple projects** without data collision.
5. Users can **export** data in a form useful for **production prep** (PDF and/or CSV per slice 1F).
6. **No** integration with paid inference APIs; **no** credit balance or ledger in v1.
7. **Idempotent** Stripe webhooks for subscription lifecycle.
8. Compatible with **local-only** branch development (env secrets; no merge to `main` required to call Phase 1 “done”).

---

## 3. User stories

1. **As a** filmmaker, **I want to** sign in and see **my saved kit and workflow** from last time, **so that** I can pick up on another computer.
2. **As a** subscriber, **I want to** pay **one simple monthly fee (USD)** for Pro, **so that** I know my cost is fixed without per-generation charges.
3. **As a** producer, **I want** separate **projects** per film or draft, **so that** kits don’t mix between shows.
4. **As a** user new to Pro, **I want** a **template** that matches my budget size (e.g. micro / low), **so that** my workflow phases and starter kit align with reality.
5. **As a** collaborator-minded user, **I want to** **download a PDF or CSV** of my kit / checklist / budget summary, **so that** I can email it or drop it in a folder.
6. **As a** subscriber, **I want** **Manage billing** in Stripe’s portal, **so that** I can cancel or update my card without support.

---

## 4. Functional requirements

### 4.1 Authentication (Slice 1A)

1. The system must support **sign up**, **sign in**, and **sign out**.
2. The system must bind **one application user** to **one Stripe Customer** after first successful checkout (or on account creation if checkout follows).

### 4.2 Subscription — single PRO tier, USD (Slice 1A)

3. The system must offer **Stripe Checkout** for **one** recurring **PRO** product priced in **USD**.
4. The system must persist **subscription id**, **customer id**, **status**, and **current period end** (or equivalent) from Stripe in the application database.
5. The system must define **PRO entitled** as an explicit allowlist of subscription statuses (e.g. `active`, `trialing` if used).
6. The system must expose **Stripe Customer Portal** for cancel / payment update.

### 4.3 Webhooks (Slice 1A)

7. The system must implement a **Stripe webhook** endpoint with **signature verification**.
8. The system must handle **`checkout.session.completed`**, **`customer.subscription.updated`**, **`customer.subscription.deleted`** (and/or **`invoice.paid`** as needed) to keep DB in sync.
9. The system must be **idempotent** on Stripe `event.id` (no duplicate subscription rows or duplicate side effects on retry).

### 4.4 Pro dashboard & routing (Slice 1B)

10. The system must provide an **authenticated Pro app area** (e.g. under `/pro/app` or route group) **gated** by **active subscription**.
11. The system must show **subscription status** and link/button to **Manage billing**.
12. The system must **not** show Pro workspace content to users without **active PRO entitlement** (redirect to subscribe or marketing).
13. The marketing **`/pro`** page may remain **waitlist or pricing + CTA**; implementation must avoid confusing **logged-out marketing** with **subscriber app** (clear labels).

### 4.5 Cloud persistence (Slice 1C)

14. The system must persist **per project** (or per user before 1D ships — see migration): structured data for **My Kit** (tool references reconcilable with catalog ranks/ids), **workflow phase completion / selections**, and **budget state** (preset id, currency, line overrides as applicable).
15. The system must **load** this state when the user opens the Pro workspace.
16. The system must **save** changes on explicit user action and/or debounced autosave (behavior specified in tasks doc).
17. The system must use **server-side authorization**: users can only read/write **their own** rows.

### 4.6 Projects (Slice 1D)

18. The system must allow **create**, **rename**, **archive** (soft-delete), and **set active** project.
19. The system must enforce **data isolation** between projects (no cross-project kit leakage).

### 4.7 Templates (Slice 1E)

20. The system must offer at least **three** starting templates aligned with existing **budget / workflow** concepts (e.g. micro-budget short, indie feature prep, documentary prep — exact names in implementation).
21. Applying a template must **initialize** (or reset with confirmation) project **workflow outline** and **suggested kit slots** per PRD-approved mapping tables — **not** random AI output.

### 4.8 Exports (Slice 1F)

22. The system must support at least **one** export format in v1: **CSV** (kit list and/or budget lines) **or** **PDF** (combined summary). Prefer **both** if schedule allows.
23. Export must use **current cloud state**, not stale `localStorage` only.

### 4.9 Free product continuity

24. The **free** site on **`main`** must remain shippable; PRO-specific routes and server logic should be **merge-safe** (feature-flag or isolated routes) when eventually merged.

---

## 5. Non-goals (out of scope)

1. **Any** third-party **inference** API (image, video, LLM generation), queues, or GPU workers.
2. **Credits**, **ledgers**, **top-ups**, **usage metering**.
3. **Still mood board + 5s clip** or any generative pipeline (future PRD if APIs return).
4. Native mobile apps; multi-seat billing; org SSO.
5. Real-time **multiplayer** co-editing (single-user v1 is enough).
6. **Merging to `main`** as a criterion for completing Phase 1 engineering on the prototype branch.

---

## 6. Design considerations

- Reuse **35mmAI** visual language: dark base, rose accent (`#e11d48`), existing `components/ui/*` patterns.
- Pro dashboard: **calm, production-desk** density — not consumer-AI chat aesthetic.
- Surfaces for **empty project**, **no subscription**, and **import from local** (if built) must be clear and on-brand with the **marketing line**.

---

## 7. Technical considerations

- **Suggested stack:** Next.js App Router + **Supabase** (Auth + Postgres + RLS) **or** **Clerk** + Postgres; Stripe Checkout + Webhooks via **Route Handler**.
- **Data model sketch (implementation detail):** `users` / `profiles`, `subscriptions`, `projects`, `project_state` (JSONB or normalized tables — choose in tasks).
- **Catalog alignment:** Tool identity should remain compatible with **`app/data.ts`** ranks / ids for rehydration (`getToolByRank`, etc.) when syncing kit.
- **localStorage migration (optional 1C):** One-time “Import my free kit” button copies from browser into active cloud project — reduces subscriber frustration.

---

## 8. Success metrics

| Check | Target |
| ----- | ------ |
| Subscribe (test mode) → DB shows active → **Pro area accessible** | Pass |
| Cancel via portal → **Pro area blocked** on next session | Pass |
| Change device / browser → **same project state** visible after login | Pass |
| Export file opens correctly in **Numbers/Excel** or **PDF reader** | Pass |
| Webhook replay | **No** duplicate subscription side effects |

---

## 9. Open questions

1. **Auth provider** final choice (Supabase vs Clerk vs other).
2. **1F priority:** CSV-first vs PDF-first for v1 ship order.
3. **Autosave** interval vs save button (or both).
4. Whether **annual** USD plan ships with monthly or later.
5. **Free trial** days (0 vs 7) for PRO subscription.

---

*Implementation: use `generate-tasks.md` from this PRD — not from `0001`.*
