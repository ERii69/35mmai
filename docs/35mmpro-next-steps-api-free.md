# 35mmPRO — next steps (API-free, minimum budget)

**Direction:** Subscription-only PRO — **cloud persistence, projects, exports, templates**, workflow/budget depth aligned with the free app. **No** inference APIs, **no** credits.  
**Marketing line:** *“35mmPRO isn’t another AI generator — it’s where your kit, workflow, and budget stay organized like a real production.”*

---

## Step 0 — Lock stack (half day)

Pick and document:

| Decision | Options |
| -------- | ------- |
| Auth + database | **Supabase** (Auth + Postgres + RLS) vs **Clerk** + Supabase/Neon Postgres |
| Stripe | Test keys + **Stripe CLI** for webhooks locally |
| Env | `.env.local` only; never commit secrets |

No code required until chosen; note the choice in the first implementation PR or `HANDOFF.md`.

---

## Step 1 — Generate implementation tasks

1. Open **`tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`** (current Phase 1 PRD).
2. Use your **`generate-tasks.md`** workflow: parent tasks → confirm → sub-tasks → `tasks/tasks-0002-prd-….md`.
3. Work **slice order** from the PRD: **1A → 1B → 1C → 1D → 1E → 1F**.

---

## Step 2 — Implement 1A + 1B (first vertical slice)

- Stripe **Checkout** for one **USD** monthly product.
- Webhook handler: **verified**, **idempotent**, updates `subscriptions` (or equivalent).
- **Middleware / server gate:** only **active** subscribers reach Pro app routes.
- **Pro dashboard shell:** status, **Manage billing** (Customer Portal), placeholder sections for projects / exports.

**Done when:** Test-mode subscribe → see dashboard; cancel → lose access.

---

## Step 3 — Implement 1C (core value)

- Schema for **project state**: kit + workflow + budget blobs (or normalized tables).
- **API or Server Actions:** load on mount, save on change (debounced or explicit — per open question in PRD).
- **RLS** (if Supabase) or equivalent **server checks** so users only touch their rows.

**Done when:** Same account on two browsers shows the same kit after save.

---

## Step 4 — Implement 1D + 1E

- **Projects:** CRUD + active switcher.
- **Templates:** seed data + “Apply template” with confirm if overwriting non-empty project.

---

## Step 5 — Implement 1F (exports)

- Ship **CSV** and/or **PDF** per PRD open question; minimum one format.
- Export from **server-stored** state.

---

## Step 6 — Polish & migration (optional but high ROI)

- **Import from localStorage:** one-click for existing free users moving to Pro (reduces support).
- Copy refresh on **`/pro`** marketing vs **`/pro/app`** (or chosen paths).
- Run **`npm run ci`** before any future merge to `main`.

---

## Step 7 — When you are ready to go live

- Merge **`35mmpro-prototype` → `main`** only when intentional.
- Add Production env vars on Vercel (Stripe live, auth prod, DB prod).
- Update pricing page / waitlist → **Subscribe**.

---

## Doc map

| File | Role |
| ---- | ---- |
| `docs/phase-0-35mmpro-product-lock.md` | Product + marketing lock |
| `tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md` | Phase 1 PRD (implement this) |
| `tasks/0001-prd-…` | Archived credits path |
| `docs/35mmpro-local-prototype.md` | LAN + local-only branch policy |
