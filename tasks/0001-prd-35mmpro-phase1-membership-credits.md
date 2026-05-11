# PRD: 35mmPRO Phase 1 — Membership, billing, credits foundation & Pro dashboard shell

> **SUPERSEDED (product direction change):** v1 PRO is **API-free** — subscription + cloud workspace only. Use **`tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`** for implementation. **Keep this file** as reference if you later add **credits + inference pipelines** (e.g. mood board + 5s clip).

---

**Document:** `0001-prd-35mmpro-phase1-membership-credits.md`  
**Related:** `docs/phase-0-35mmpro-product-lock.md`, `docs/35mmpro-local-prototype.md`  
**Inputs assumed (from product discussion):** Solo–small-team filmmakers and students; Stripe **USD only**; **monthly included credits + optional top-ups**; first AI pipeline in product will be **still mood board + 5 second clip** (implementation targeted after Phase 1 foundation).  
**Branch / deployment:** Implement on **`35mmpro-prototype`**; **do not merge to `main`** until intentionally shipping PRO. Local-only development until remote push is explicitly allowed.

---

## 1. Introduction / Overview

### Problem

35mmAI today is free: catalog, workflow builder, and My Kit live in the browser without accounts or payments. **35mmPRO** must introduce **accounts**, **paid access**, and **credit-based usage** so subscribers get a **cloud-backed workspace** (later phases) and **metered runs** on a single curated pipeline (**still mood board + 5s clip**), without exposing wholesale API costs directly.

### Phase 1 goal

Deliver **identity**, **Stripe subscription billing (USD)**, **server-enforced PRO entitlement**, a **credit balance + immutable ledger** with **monthly grants** and **top-ups**, and a **minimal Pro dashboard** that shows subscription status and credits. **Phase 1 does not** implement the mood-board + clip **generation APIs** (that is a following phase); it **must** leave hooks (data model + “cost in credits” mapping placeholder) so pipeline work does not redo billing.

---

## 2. Goals

1. A user can **sign up / sign in** and have a stable **user id** tied to billing and credits.
2. A user can **subscribe** to the single PRO tier via **Stripe Checkout** (USD); subscription state is **authoritative on the server** (webhooks + DB), not the client alone.
3. On each **billing period**, the subscriber receives a **defined monthly credit allowance** (grant), recorded in a **ledger**.
4. A user can **purchase credit top-ups** (one-time payment) and see **credits added** via webhook.
5. **Credit balance** cannot go negative for **new** debits; **runs** in later phases **deduct** credits only after Phase 1 ledger exists.
6. A signed-in subscriber with **active** subscription sees a **Pro dashboard** with **plan status**, **credit balance**, **recent ledger summary**, and **Manage billing** (Stripe Customer Portal).
7. **Idempotent** Stripe webhook handling to avoid double-grants on retries.
8. Development remains compatible with **local-only** branch workflow (env-based secrets; no requirement to deploy PRO to production).

---

## 3. User stories

1. **As a** filmmaker considering PRO, **I want to** subscribe in USD with a clear monthly price, **so that** I can access Pro features and my included credits.
2. **As a** subscriber, **I want** my monthly credits to appear automatically each billing cycle, **so that** I do not manually buy credits every month for baseline usage.
3. **As a** subscriber who needs more runs, **I want to** buy a **credit top-up**, **so that** I can keep working without upgrading tiers (single tier for now).
4. **As a** subscriber, **I want to** open **Manage billing** to update payment method or cancel, **so that** I control renewal without emailing support.
5. **As a** subscriber, **I want to** see **how many credits I have left**, **so that** I know whether I can afford the **mood board + 5s clip** run when it ships.
6. **As the** product owner, **I want** subscription and credit changes driven by **Stripe webhooks**, **so that** grants and cancellations stay accurate.

---

## 4. Functional requirements

### Authentication & session

1. The system must provide **sign up**, **sign in**, and **sign out** for Pro-related routes.
2. The system must associate **one Stripe Customer** with each paying user (create or link on first checkout).
3. The system must enforce **authentication** on all **Pro dashboard** and **billing-adjacent** server actions / routes.

### Subscription (single PRO tier, USD)

4. The system must allow starting a **new subscription** via **Stripe Checkout** for the configured **PRO monthly** product (USD). *(Annual optional: out of Phase 1 unless explicitly added.)*
5. The system must store **subscription state** in the application database: at minimum `status`, `current_period_end`, Stripe **subscription id**, Stripe **customer id**, and **price / product** identifiers as needed for webhook handling.
6. The system must treat **only** subscription states that represent **paid access** as **PRO entitled** (define allowed statuses in implementation: e.g. `active`, `trialing` if used; exclude `canceled`, `unpaid`, etc.).
7. The system must provide a **Customer Portal** link or redirect so users can **cancel**, **resume** (if applicable), and **update payment method**.

### Stripe webhooks

8. The system must expose a **single webhook endpoint** (HTTPS in production; **Stripe CLI** locally) that verifies **Stripe signatures**.
9. The system must handle at minimum: **`checkout.session.completed`** (subscription and/or top-up), **`customer.subscription.updated`**, **`customer.subscription.deleted`** (or equivalent end states), and **`invoice.paid`** (or the event used to **grant monthly credits** on renewal — exact mapping is an implementation detail but behavior must be specified in code comments).
10. The system must record processed **Stripe event ids** (or equivalent idempotency) so **retries do not double-grant** credits or duplicate side effects.

### Credits — balance & ledger

11. The system must maintain a **credit balance** per user (integer; unit = abstract “credits” mapped later to API cost).
12. The system must maintain an **append-only ledger** (or equivalent) of **transactions**: user id, **amount** (positive grant, negative spend), **reason** (e.g. `subscription_grant`, `top_up`, `pipeline_run`, `admin_adjustment`), **reference** (Stripe id / invoice id / internal job id), and **timestamp**.
13. On **successful subscription start** (first paid period), the system must **grant** the **initial monthly included credits** per product configuration.
14. On each **subscription renewal** (defined event per §9), the system must **grant** the **monthly included credits** for the new period.
15. The system must **not** roll over unused credits by default **unless** product config explicitly sets rollover (default **no rollover** per Phase 0 spirit — configurable constant).
16. For **top-up** purchases, the system must **grant** the purchased credit amount when payment **succeeds** (via webhook).
17. The system must **reject** debit operations that would drop balance **below zero** (when pipeline debits exist in a later phase).

### Pro dashboard (shell)

18. The system must provide a **Pro dashboard** route (or route group) visible only to **authenticated** users with **active PRO entitlement**.
19. The dashboard must display **current subscription status**, **renewal or period end** when available, and **current credit balance**.
20. The dashboard must show a **short recent activity** list or summary derived from the **ledger** (e.g. last 10 events).
21. The dashboard must include **Subscribe** or **Manage billing** actions as appropriate for state (not subscribed vs subscribed).
22. The dashboard may include a **placeholder** section describing the upcoming **“Still mood board + 5s clip”** run (copy only; **no API call** in Phase 1).

### Live site separation

23. Changes for Phase 1 must **not** merge to **`main`** until explicitly approved for release; **free** `main` site behavior must remain deployable without PRO secrets if PRO code lives behind feature flags or separate routes *(implementation choice: PRO routes only on PRO branch until merge)*.

---

## 5. Non-goals (out of scope for Phase 1)

1. **Implementing** the **still mood board + 5s clip** inference pipeline (API calls, queues, asset storage, preview UI beyond placeholder copy).
2. **Native mobile apps**.
3. **Multi-seat / organization** billing.
4. **Multiple subscription tiers** (Starter vs Pro); **one** PRO tier only.
5. **Non-USD** currencies and **tax localization** beyond Stripe defaults (can remain future work).
6. **Team invites**, **RBAC**, **admin console** (beyond minimal internal ops).
7. **Merging `35mmpro-prototype` to `main`** as part of Phase 1 delivery criteria (merge is a **business** decision, not a technical requirement — Phase 1 can be “done” on the branch).

---

## 6. Design considerations

- **Visual language:** Reuse existing **35mmAI** patterns: dark cinematic palette (`#0f0f0f`, rose accent `#e11d48`), typography and **shadcn/ui**-style components where the repo already uses them (`components/ui/*`).
- **Pro entry:** Existing **`/pro`** may remain marketing/waitlist on **`main`**; on **`35mmpro-prototype`**, evolve toward **Sign in / Subscribe** without breaking parity merge strategy (document route differences in implementation notes).
- **Empty states:** Clear copy when balance is **0** and when **not subscribed**.

---

## 7. Technical considerations

- **Stack (suggested, not mandatory in PRD):** Next.js App Router **Server Actions** or **Route Handlers** for webhooks; **Postgres** via **Supabase** (auth + DB) **or** **Clerk** + Postgres — **decision in Open Questions**.
- **Stripe:** Test mode for local dev; **Stripe CLI** for webhook forwarding; secrets only in **`.env.local`** (never committed).
- **Credits:** Implement debits as **ledger rows + balance update** in a **single transaction** when pipeline exists.
- **Monthly grant timing:** Tie to **`invoice.paid`** or subscription renewal events; document edge cases (failed payment, grace periods).
- **Security:** Never trust client-reported balance; **server-only** credit mutations.

---

## 8. Success metrics

| Metric | Target |
| ------ | ------ |
| End-to-end **subscribe → DB shows active → credits granted** | Works in **Stripe test mode** on branch |
| **Renewal grant** | Simulated via test clock or webhook replay |
| **Top-up grant** | Completes without duplicate grants on webhook retry |
| **Unauthorized access** | Dashboard not accessible without entitlement |
| **Idempotency** | Same Stripe event replay does not duplicate ledger rows |

Qualitative: Junior developer can implement from this PRD + Stripe/Auth docs without guessing product intent.

---

## 9. Open questions

1. **Auth provider:** Supabase Auth vs Clerk vs other — affects schema and middleware patterns.
2. **Monthly included credit amount** and **top-up pack sizes** (numeric values and Stripe Price ids).
3. **Annual billing** for the single tier in Phase 1 or **monthly-only** at launch.
4. **Free trial** (e.g. 7 days) or **no trial** for PRO subscription.
5. **Rollover:** Confirm **no rollover** of monthly credits unless product changes.
6. **Cloud sync of My Kit / workflow:** Confirm Phase 1 is **credits + entitlement + shell only**, or include **minimal** server persistence for kit (could be Phase 1b — currently **out** of strict Phase 1 per §5 pipeline focus).

---

## Clarifying questions answered (this PRD)

The following were resolved **before** drafting and are reflected above:

| Topic | Resolution |
| ----- | ---------- |
| Credit model | **Monthly included credits + top-ups** |
| First pipeline (product, not Phase 1 build) | **Still mood board + 5s clip** |
| Billing currency | **USD** |
| PRO branch safety | **`35mmpro-prototype` local-only** until you choose to push/merge |

---

*Do not implement from this file without a separate task breakdown (`generate-tasks.md`).*
