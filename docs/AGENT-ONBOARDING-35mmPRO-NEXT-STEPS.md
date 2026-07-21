# 35mmAiPro — agent onboarding (short)

**New to the repo?** Read in this order:

1. [`HANDOFF.md`](../HANDOFF.md) — env, Stripe, routes, smoke checklist, merge caution  
2. **[`35mmpro-phase1-implementation-guide.md`](./35mmpro-phase1-implementation-guide.md)** — **canonical** product direction + how to build on what exists  
3. [`tasks/tasks-0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`](../tasks/tasks-0002-prd-35mmpro-phase1-cloud-workspace-subscription.md) — checkbox backlog (**Phase 1 complete**)

**Do not use** [`ideas/archive-35mmpro-academy-brainstorm-may15.md`](./ideas/archive-35mmpro-academy-brainstorm-may15.md) as a build spec.  
**Doc index:** [`docs/README.md`](./README.md)

---

## Product (one line)

**Free** = tool directory + local kit/workflow/budget. **Pro** = cloud **projects** + **AI-native workflow structure** (world → visuals → shots → external tools → post) + templates + exports — **no inference APIs** in Phase 1.

---

## Branch policy

- PRO work on **`35mmpro-prototype`**; **`main`** = live catalog on Vercel.  
- Do not merge PRO secrets to **`main`** until intentional launch — see **HANDOFF → Merge to `main` caution** and **`lib/pro-stack-config.ts`**.

---

## Repo map

| Area | Paths |
|------|--------|
| Free app | `app/page.tsx`, `app/data.ts` |
| Auth | `lib/supabase/*`, `middleware.ts`, `app/login`, `app/sign-up`, `app/auth/*` |
| Account / Stripe actions | `app/account/*`, `app/actions/stripe.ts` |
| Pro marketing | `app/pro/page.tsx`, `components/pro/ProMarketingHeader.tsx` |
| Pro workspace | `app/pro/app/*`, `components/pro/ProWorkspace.tsx`, `ProProjectSwitcher.tsx` |
| Templates / exports | `lib/pro/templates.ts`, `lib/pro/export-csv.ts`, `app/api/pro/export/*` |
| Entitlements | `lib/entitlements.ts`, `lib/pro-stack-config.ts` |
| Webhooks | `app/api/webhooks/stripe/route.ts`, `lib/stripe/process-webhook-event.ts` |
| Migrations | `supabase/migrations/20260212*.sql`, `20260213000003_*.sql`, `20260213000004_*.sql` |

---

## Phase 1 status (tasks 1.0–11.0)

All core slices shipped on the prototype branch: auth, Stripe, webhooks, `/pro/app` gate, projects + cloud state, workspace UI, project switcher, templates, CSV exports, merge-safe config guards, HANDOFF smoke checklist.

**Deferred:** PDF exports (task 10.3), localStorage import (task 7.6 optional).

**Your job if continuing:** run the **manual smoke checklist** in HANDOFF, then decide merge/deploy — not more Phase 1 features unless product scope changes.

---

## Commands

```bash
cd /path/to/35mmai-prototype
npm run dev          # http://localhost:3000
npm run dev:pro      # http://localhost:3001 (localhost only; LAN on hold)
npm run dev:pro:lan  # http://0.0.0.0:3001 — only when resuming Wi‑Fi demos
npm run ci
```

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Put CLI `whsec_…` in `.env.local` as `STRIPE_WEBHOOK_SECRET`; restart dev server after env changes.
