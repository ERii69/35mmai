# 35mmPRO — API-free product summary (north star)

**Purpose:** Single place to re-read intent before continuing implementation.  
**Stack docs:** `HANDOFF.md`, `docs/phase-0-35mmpro-product-lock.md`, `tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`, `tasks/tasks-0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`.

---

## Marketing line

> **35mmPRO isn’t another AI generator — it’s where your kit, workflow, and budget stay organized like a real production.**

Position as **production prep OS**, not an AI studio. Do not promise generated clips unless/until inference APIs are added later.

---

## What “no inference APIs” means

- **Dropped:** Paid wholesale AI (image / video / voice generation), metered “runs,” credit packs for API spend.
- **Still allowed:** Your own backend (accounts, Postgres, exports), **Supabase** (auth + DB), **Stripe** (subscription), client-side UX (calculators, browser PDF where appropriate), **links** to catalog tools (users may leave the site for Runway, etc. — no platform API key spend for that).

**Cost model:** Mostly **fixed** infra (hosting, auth, domain) — not per-generation wholesale bills.

---

## What PRO is (still a “real” product)

Think **production OS for prep**, not **AI generator**.

### Tier 1 — Must feel Pro

| Capability | Filmmaker value | Cost shape |
|------------|-----------------|------------|
| **Cloud workspace** | Kit + workflow + notes + budget across devices | DB rows |
| **Projects** | Separate films / drafts, not one giant kit | Same |
| **Exports** | PDF / CSV: kit, phase checklist, budget snapshot | App / server generation |
| **Templates & presets** | Start from micro-budget / doc / student patterns | Static JSON you maintain (`app/data.ts` patterns) |
| **Version / snapshot** | “Kit as of this date” or named snapshots | Cheap storage |

### Tier 2 — Differentiation vs generic productivity

- **Role-aware views** (department / phase lens on same data).
- **Budget discipline** (caps, currency, simple scenarios).
- **Workflow checklist tied to phases** (pre → prod → post as **account** state, not only `localStorage`).
- **“Director one-pager”** — one PDF: logline, phase status, top tools, rough budget.

### Tier 3 — Optional “smart” without paid inference

- **Rules + templates** from `app/data.ts` (not LLMs).
- **Prompt starters as curated library** (content, not generation).
- **Integrations later** (e.g. `.ics`, CSV for other tools) — still no AI bill.

---

## Pricing (this direction)

- **Flat USD subscription** — Pro = cloud + exports + projects + templates (+ workflow depth).
- **No credit ledger** unless you add inference or metered add-ons later.
- **Stripe:** subscription (+ optional one-time “lifetime” later if you ever want it).

---

## Minimum budget stack (realistic)

- **Frontend:** Next.js (this repo).
- **Auth + DB:** Supabase (Auth + Postgres + RLS).
- **Billing:** Stripe (fees when you charge).
- **Email:** Supabase auth email / provider defaults.
- **Hosting:** Vercel; **no** per-generation meter.

Rough pre-revenue burn: often **~$0–25/mo** (domain + occasional overages at scale).

---

## PRD / task alignment in this repo

| Artifact | Role |
|----------|------|
| `tasks/0001-prd-…` | **Superseded** — credits + pipeline placeholder; keep only if APIs return. |
| `tasks/0002-prd-…` | **Active Phase 1 PRD** — subscription, cloud workspace slices, no credits. |
| `tasks/tasks-0002-…` | **Implementation checklist** — work in suggested order. |

**Subscription-only:** no empty “credits” columns reserved; add a future PRD + migrations if APIs ship later.

---

## Implementation status (high level)

- **Done (examples):** Auth (Supabase SSR), Stripe Checkout + Customer Portal, `profiles` + post-checkout sync (webhooks still to harden).
- **Ahead:** Webhooks (**task 4**), Pro app shell + entitlement gate, cloud kit/workflow/budget, projects, templates, exports — per **`tasks/tasks-0002-…`**.

---

*Last aligned with the API-free direction agreed in planning; update this file if product scope changes.*
