# Task list: 35mmPRO Phase 1 (API-free)

**Source PRD:** `tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`  
**Branch:** `35mmpro-prototype` (local-only until you push).  
**Do not merge to `main`** until intentional PRO launch.

---

## Relevant Files

*Paths below are **expected** to be created or modified during implementation; adjust names if your auth vendor differs.*

- `package.json` — Add dependencies (e.g. `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, or `@clerk/nextjs`).
- `.env.example` — Document required env vars (no secrets): auth URLs/keys placeholders, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, price IDs, database URL if external.
- `middleware.ts` *(create at repo root if missing)* — Session refresh; protect `/pro/app` routes.
- `lib/supabase/client.ts` — Browser Supabase client (`createBrowserClient`).
- `lib/supabase/server.ts` — Server Supabase client (`createServerClient` + `cookies()`).
- `lib/supabase/middleware.ts` — `updateSession` for cookie refresh.
- `app/login/` — Sign-in page (+ layout with `Suspense` for `useSearchParams`).
- `app/sign-up/` — Sign-up page.
- `app/account/page.tsx` — Account shell (email + sign out).
- `app/auth/callback/route.ts` — OAuth / email-confirm code exchange.
- `app/auth/auth-code-error/page.tsx` — Failed auth redirect UX.
- `app/actions/auth.ts` — `signOut` server action.
- `app/pro/page.tsx` — Marketing / pricing / CTA vs current waitlist-only flow (align with PRD §4.4).
- `app/pro/layout.tsx` — Metadata; optional nested layout for marketing vs app.
- `app/pro/app/` *(new route group or folder)* — Authenticated Pro workspace (`layout.tsx`, `page.tsx`, child routes as needed).
- `app/api/webhooks/stripe/route.ts` — Stripe webhook POST handler, signature verification, idempotency.
- `lib/stripe.ts` — Stripe SDK singleton, app URL, PRO monthly price id helpers.
- `lib/stripe/finalize-checkout.ts` — Persist customer + subscription after Checkout return (bridge before webhooks).
- `app/actions/stripe.ts` — `startProCheckout`, `openCustomerPortal` server actions.
- `supabase/migrations/20260212000001_profiles.sql` — `profiles` table + RLS for Stripe ids.
- `lib/auth.ts` / `lib/supabase/server.ts` / `lib/supabase/client.ts` — Auth helpers (exact paths depend on Supabase vs Clerk).
- `lib/entitlements.ts` — `isProEntitled(userId)` (or session-based) reading DB subscription row.
- `supabase/migrations/*.sql` *(if Supabase)* — `profiles`, `subscriptions`, `stripe_events_processed`, `projects`, `project_state` (or equivalent); RLS policies.
- `db/schema.sql` or Prisma *(if Clerk + other DB)* — Same conceptual tables.
- `app/actions/pro/*.ts` — Server Actions: save/load project state, project CRUD, template apply (server-only auth checks).
- `components/pro/*` — Dashboard shell, project switcher, empty states, export buttons (reuse `components/ui/*`).
- `lib/pro/types.ts` — TypeScript types for kit/workflow/budget JSON (mirror shapes used in `app/page.tsx` / `app/data.ts` where possible).
- `lib/pro/templates.ts` — Static template definitions (≥3) mapping to `workflowStages` / budget presets from `app/data.ts`.
- `lib/pro/export-csv.ts` / `lib/pro/export-pdf.ts` — Pure helpers or server-only generators for exports.
- `HANDOFF.md` — Env vars, new routes, how to run Stripe CLI locally.
- `docs/35mmpro-local-prototype.md` — Optional: note new scripts or ports if any.

### Notes

- This repo currently runs **`npm run ci`** (ESLint + `next build`) as the quality gate; **no Jest** is configured. Add **`*.test.ts`** / **`*.test.tsx`** alongside code only if you introduce a test runner (e.g. Vitest); then run `npx vitest` or the chosen command.
- Keep **catalog ranks and tool identity** compatible with `app/data.ts` (`getToolByRank`, `rehydrateKitEntry`) when defining persisted kit shape.
- **Credits / inference:** do not add; superseded by API-free scope.

---

## Tasks

- [x] **1.0** Foundation & environment
  - [x] 1.1 Confirm auth vendor (**Supabase** vs **Clerk**) and database host; document choice in `HANDOFF.md` or `docs/35mmpro-next-steps-api-free.md`.
  - [x] 1.2 Add required npm dependencies and lockfile update (`npm ci` still passes).
  - [x] 1.3 Extend **`.env.example`** with all public/private variable **names** (Stripe test keys, webhook secret, price id placeholders, auth keys — no real values).
  - [x] 1.4 Document local Stripe webhook testing (**Stripe CLI** `listen --forward-to …`) in `HANDOFF.md` or `docs/35mmpro-next-steps-api-free.md`.

- [x] **2.0** Authentication — sign up, sign in, sign out
  - [x] 2.1 Implement auth provider setup (client + server helpers per vendor docs for App Router).
  - [x] 2.2 Add routes or modals for **sign up** and **sign in** (email or OAuth per choice); **sign out** control in header or account menu.
  - [x] 2.3 Ensure session is available in **Server Components** and **Server Actions** (cookie/session refresh pattern).
  - [x] 2.4 Add minimal **account** or profile surface (email display, sign out) if not part of Pro layout yet.

- [x] **3.0** Stripe — Checkout (USD monthly) & Customer Portal
  - [x] 3.1 Create **Stripe Product** and **recurring Price** (USD monthly) in Dashboard; store Price ID in env.
  - [x] 3.2 Implement **Checkout Session** creation (server-side): mode `subscription`, `customer` or `customer_email`, `success_url` / `cancel_url` pointing back to app (e.g. `/pro/app?checkout=success`).
  - [x] 3.3 Implement **Customer Portal** session creation for signed-in user with valid `stripe_customer_id`.
  - [x] 3.4 Add UI: **Subscribe** (starts Checkout) for signed-in non-subscribers; **Manage billing** for subscribers.

- [ ] **4.0** Stripe webhooks & subscription persistence
  - [ ] 4.1 Create DB table(s) for **subscriptions** (user id, stripe_customer_id, stripe_subscription_id, status, current_period_end, price_id, updated_at).
  - [ ] 4.2 Create **`stripe_events_processed`** (or equivalent) table: `event_id` unique, `processed_at` — for idempotency.
  - [ ] 4.3 Implement **`POST` `/api/webhooks/stripe`**: verify signature; on unknown event types, return 200 after logging (optional); on known types, upsert subscription row.
  - [ ] 4.4 Handle **`checkout.session.completed`** (link session to user, set customer id, subscription id, initial status).
  - [ ] 4.5 Handle **`customer.subscription.updated`** and **`customer.subscription.deleted`** (or `…` end states) to mirror status and period end.
  - [ ] 4.6 Ensure **replay** of same `event.id` does not duplicate writes (transaction or insert-on-conflict-do-nothing on event id).
  - [ ] 4.7 Implement **`isProEntitled(userId)`** (or session variant) reading DB: allowlist statuses e.g. `active`, `trialing` only.

- [ ] **5.0** Pro shell, routing & marketing split (slice **1B**)
  - [ ] 5.1 Add **`/pro/app`** (or agreed path) layout: authenticated + **subscription gate** — redirect non-subscribers to `/pro` or dedicated “subscribe” view with CTA.
  - [ ] 5.2 **Middleware** (or layout server check): unauthenticated users hitting `/pro/app` → sign-in with `returnUrl`.
  - [ ] 5.3 Pro dashboard **shell**: header with marketing line or subtitle, nav slots for Projects / Workspace / Exports (can be stubs until slices land).
  - [ ] 5.4 Show **subscription status** + **current period end** on dashboard when available.
  - [ ] 5.5 Update **`/pro`** marketing page: distinguish **logged-out** (pricing + waitlist optional) vs **signed-in non-Pro** (Subscribe) vs **subscriber** (link to app); avoid confusing labels (PRD §4.4).
  - [ ] 5.6 Empty states: **no projects yet**, **no subscription** — copy aligned with *“isn’t another AI generator…”* line.

- [ ] **6.0** Database — projects & cloud state (slices **1C** / **1D** backend)
  - [ ] 6.1 Create **`projects`** table: id, user_id, name, archived_at nullable, created_at, updated_at, optional `is_default` flag.
  - [ ] 6.2 Create **`project_state`** (or JSONB column on `projects`): kit JSON, workflow JSON, budget JSON — schema version field recommended (`schema_version` integer).
  - [ ] 6.3 Add **RLS** (Supabase) or equivalent **authorization in every Server Action** so `user_id` on rows matches session user only.
  - [ ] 6.4 Server Actions or route handlers: **list projects**, **create project**, **rename**, **archive**, **set active** (active can be user preference column on `profiles` or derive from last opened).
  - [ ] 6.5 **Default project**: on first successful subscription webhook (or first app visit), auto-create **one** project if none exist.
  - [ ] 6.6 Implement **loadProjectState(projectId)** and **saveProjectState(projectId, payload)** with validation (Zod optional) and max payload size guard.

- [ ] **7.0** Workspace UI — cloud sync for kit, workflow, budget (slice **1C**)
  - [ ] 7.1 Define **TypeScript types** for persisted kit/workflow/budget (reuse concepts from `app/page.tsx` local state where practical).
  - [ ] 7.2 **Load** active project state into Pro workspace on mount (Server Component fetch or client + Server Action).
  - [ ] 7.3 **Save** strategy: implement **debounced autosave** and/or explicit **Save** button (resolve PRD open question; document choice in `HANDOFF.md`).
  - [ ] 7.4 Conflict policy v1: **last-write-wins**; document in code comment.
  - [ ] 7.5 Surface **save errors** and **offline / retry** messaging (basic toast or inline alert).
  - [ ] 7.6 *(Optional)* **Import from localStorage**: button on Pro workspace reads existing free-app keys from browser, maps to cloud schema, saves to active project (one-time or merge policy documented).

- [ ] **8.0** Projects UI (slice **1D**)
  - [ ] 8.1 **Project switcher** in Pro shell (dropdown or sidebar): lists non-archived projects; switching loads that project’s state.
  - [ ] 8.2 **Create project** flow: name input, create via Server Action, switch to new project.
  - [ ] 8.3 **Rename** and **archive** (confirm dialog for archive); archived hidden from default list or in “Archived” section.
  - [ ] 8.4 Verify **isolation**: switching projects never shows another project’s kit without reload bug.

- [ ] **9.0** Templates (slice **1E**)
  - [ ] 9.1 Add **`lib/pro/templates.ts`** (or similar) with **≥3** static templates; each references budget preset keys / phase lists aligned with `app/data.ts` (`workflowStages`, `budgetLinesFromPreset` patterns).
  - [ ] 9.2 **Apply template** UI: picker + **confirm** if current project state is non-empty (overwrite warning).
  - [ ] 9.3 Server Action **applyTemplate(projectId, templateId)**: writes initial workflow + suggested kit placeholders + budget preset into `project_state`.
  - [ ] 9.4 After apply, client refreshes or receives updated state from action return.

- [ ] **10.0** Exports (slice **1F**)
  - [ ] 10.1 Implement **CSV export** for **kit list** (name, rank, category, link columns as useful) from **server-loaded** cloud state.
  - [ ] 10.2 Implement **CSV** and/or **PDF** for **budget summary** / **workflow checklist** — minimum **one** format beyond kit CSV if PRD “prefer both” is deferred, document in `HANDOFF.md`.
  - [ ] 10.3 If **PDF**: use `@react-pdf/renderer`, `pdfkit`, or server-friendly library; keep generation in **Route Handler** or Server Action returning `Response` / download URL.
  - [ ] 10.4 Add **Export** buttons on Pro workspace; filenames include project name + date slug.
  - [ ] 10.5 Verify exports **never** read only `localStorage` — always authoritative cloud snapshot.

- [ ] **11.0** Quality, continuity & docs
  - [ ] 11.1 Run **`npm run ci`** after each major slice; fix lint and type errors.
  - [ ] 11.2 Manual smoke checklist: subscribe (test) → app access → save state → second browser login → same data → Portal cancel → access revoked.
  - [ ] 11.3 Update **`HANDOFF.md`** with Pro routes, env vars, auth choice, and “merge to `main`” caution.
  - [ ] 11.4 Ensure new Pro code paths are **inert on `main`** if merged without env (graceful missing-config messages, or feature flag) per PRD §4.9.

---

## Suggested implementation order

Work **1.0 → 2.0 → 3.0 → 4.0 → 5.0** first (vertical slice: pay → see dashboard). Then **6.0 → 7.0 → 8.0**, then **9.0 → 10.0**, finish **11.0**.

---

*When completing a sub-task, check the box in this file or your tracker of choice.*
