# 35mmAI prototype — handoff for future work

Use this file when opening a new chat so context is not “from zero.”

## What it is

- **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind**, UI pieces under `components/`.
- Main experience lives in **`app/page.tsx`**. Catalog and presets live in **`app/data.ts`** (single source of truth for tools, ranks, workflow stages, budget defaults, `rehydrateKitEntry`, `getToolByRank`, etc.).

## 35mmPRO local prototype (LAN, not live)

- **Goal:** Develop 35mmPRO on your machine / office Wi‑Fi **without** deploying it. PRO work should live on a **long-lived branch** (e.g. `35mmpro-prototype`), not merged to `main` until you intentionally ship PRO.
- **Policy:** Keep **`35mmpro-prototype` local-only** (do not `git push` that branch) until you are comfortable with remote previews / exposure; use disk backup or `git bundle` if you want safety without pushing.
- **Phase 0 (product lock):** **`docs/phase-0-35mmpro-product-lock.md`** — API-free PRO, marketing line, v1 pillars.
- **Phase 1 PRD (implement):** **`tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`** — auth, Stripe USD subscription, cloud kit/workflow/budget, projects, templates, exports; **no** inference APIs or credits.
- **Next steps checklist:** **`docs/35mmpro-next-steps-api-free.md`**.
- **Implementation task list:** **`tasks/tasks-0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`** (from PRD 0002; work sub-tasks in order).
- **Archived PRD (credits + pipeline prep):** **`tasks/0001-prd-35mmpro-phase1-membership-credits.md`** — superseded; keep if APIs return later.
- **Run on LAN:** `npm run dev:pro` (listens on **0.0.0.0:3001**). Open `http://<your-LAN-IP>:3001` from other devices. Full checklist: **`docs/35mmpro-local-prototype.md`**.
- **`main`** push → **production** on Vercel. Catalog-only updates for live stay on `main`; they do not require the PRO branch.

## Live stack

- **Repo:** GitHub `ERii69/35mmai` (or current remote).
- **Hosting:** **Vercel** — auto-deploy on push to **`main`**.
- **Domain:** Custom domain on **GoDaddy DNS**; apex **`A` @** → Vercel IP (no trailing dot in GoDaddy); **`www`** → Vercel **`*.vercel-dns-*.com`** CNAME from Vercel Domains UI. Do not edit locked **`NS` / `SOA`** `@` rows — add **`A` @** separately.
- **Default Vercel URL:** `35mmai.vercel.app` (plus production custom domain when configured).

## 35mmPRO stack (task 1.0 — locked)

- **Auth + database:** **Supabase** (Auth, Postgres, Row Level Security). Fits API-free PRO and fixed infra cost at small scale.
- **Payments:** **Stripe** (Checkout + Customer Portal + webhooks), **USD** monthly price from `STRIPE_PRICE_ID_PRO_MONTHLY`.
- **Env template:** **`.env.example`** — copy to **`.env.local`**; see variable names there. **`.env.example`** is committed (`!.env.example` in `.gitignore`).

### Stripe webhooks (local)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Login: `stripe login`
3. Forward events to the Next webhook route (adjust host/port to match `npm run dev` (**3000**) or `npm run dev:pro` (**3001**)):

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the **webhook signing secret** (`whsec_…`) the CLI prints into **`STRIPE_WEBHOOK_SECRET`** in `.env.local`.  
   *(The route `/api/webhooks/stripe` is created in a later task; until then the forward target will 404 — that is expected.)*

## Environment

- **`PRO_WAITLIST_WEBHOOK_URL`** (optional): set in **Vercel → Project → Settings → Environment Variables** for Production if the Pro waitlist should POST to a webhook. See `app/actions/waitlist.ts`.
- **35mmPRO:** use **`.env.local`** with keys from **`.env.example`** (Supabase + Stripe).
- **Supabase Auth (local):** In Dashboard → **Authentication → URL configuration**, set **Site URL** to your app (e.g. `http://localhost:3000`). Under **Redirect URLs**, add `http://localhost:3000/auth/callback` (and production URL when you deploy). Enable **Email** provider under **Sign In / Providers**. For faster local testing, you can disable **Confirm email** under **Sign Up / Email** (re-enable before production).
- **Supabase `profiles` (billing):** Run **`supabase/migrations/20260212000001_profiles.sql`** in **SQL Editor** once (creates `public.profiles` + RLS). Required before **Subscribe to 35mmPRO** / profile sync; without it, checkout return will error when saving Stripe ids.
- **Routes:** `/login`, `/sign-up`, `/auth/callback` (OAuth / magic-link exchange), `/auth/auth-code-error`, `/account` (requires session). Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (Server Components / Actions), `middleware.ts` + `lib/supabase/middleware.ts` (session refresh).
- **Stripe (35mmPRO):** After `.env.local` has `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_PRO_MONTHLY`, and **Customer portal** enabled in Stripe Dashboard, the app **`/account`** page shows **Subscribe to 35mmPRO** and **Manage billing** (when a Stripe customer exists). Webhooks (**task 4**) will harden sync; until then, returning from Checkout runs **`finalizeCheckoutSession`** once.
- Local secrets: **`.env*`** is gitignored except **`.env.example`**.

## Day-to-day catalog updates

1. Edit **`app/data.ts`** (`allTools`, ranks, `workflowStages`, budget presets as needed).
2. “Last updated” now renders automatically from the current date in the UI; no manual date bump needed.
3. Run **`npm run ci`** locally before push if you want lint + build gate.
4. **`git commit`** → **`git push`** to **`main`**. No need to leave Terminal open after push; Vercel builds on GitHub.

## CI

- **`.github/workflows/ci.yml`:** `npm ci` + **`npm run ci`** on push/PR to `main` / `master`.
- **GitHub PAT for `git push`:** needs **`repo`** + **`workflow`** scopes if pushing workflow files. macOS **Keychain** may cache an old token — remove `github.com` credential or use `git credential-osxkeychain erase` if push won’t prompt for a new token.

## UX / product notes already implemented (high level)

- Workflow builder: phases, sticky outline, bulk add, `workflowStage` in `localStorage`, tool rows by **rank**, footer styling, mobile/desktop patterns.
- **`lastStep`** restore allows steps **0–9** (incl. All Tools).
- Budget / currency custom menus; My Kit rehydration from catalog.

## Operational reminders

- **Do not** commit **`node_modules`**, **`.next`**, or real **`.env`** files.
- After GoDaddy **Website Builder** (or similar) on apex, replace with Vercel **`A` @** only — avoid duplicate conflicting **`A` @** records.

---

*Last updated this doc: align with repo when you change hosting or repo owner.*
