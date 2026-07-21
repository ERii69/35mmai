# 35mmAI prototype — handoff for future work

Use this file when opening a new chat so context is not “from zero.”

## Current session goal (Jun 2026)

**Script-to-prompt refocus** — Pro is the paid next step of the free catalog, not a different product.

| Surface | Message |
|---------|---------|
| **`/pro` hero** | Script → Look → Prompt pack |
| **Subhead** | Midjourney, Kling, LTX, Nano, Higgsfield |
| **Free catalog** | “Have a script? Get copy-ready prompts for tools above.” → `/pro` |
| **Compare tiers** | Free = discover tools · Pro = script + look → prompt pack (cloud, export) |
| **Happy path** | Prep (script) → Look → Produce → Prompts → Export — **no Shots/Budget/Workflow/World** on script-to-prompt template |
| **Done checklist** | `docs/v1-script-to-prompt-refocus-done.md` |

**Key files:** `lib/pro/marketing-copy.ts`, `lib/pro/free-vs-pro.ts`, `lib/pro/workspace-modes.ts` (`productionTabsForState`), `lib/pro/slim-project-state.ts` (save-size breakdown + strip prompts on save), `lib/pro/prompt-pack-export.ts` (build at export), `lib/pro/demo-script-five-scenes.ts` (Prep sample button).

## What it is

- **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind**, UI pieces under `components/`.
- Main experience lives in **`app/page.tsx`**. Catalog and presets live in **`app/data.ts`** (single source of truth for tools, ranks, workflow stages, budget defaults, `rehydrateKitEntry`, `getToolByRank`, etc.).

## 35mmAiPro local prototype (on hold on LAN)

- **Status (May 2026):** **LAN / Wi‑Fi Pro testing is on hold.** Do not run `npm run dev:pro:lan` unless resuming demos on other devices.
- **This Mac only:** `npm run dev:pro` → **`http://localhost:3001`** (binds `127.0.0.1`, not the network).
- **Goal:** Develop 35mmAiPro on your machine **without** deploying it or exposing it on the office/home Wi‑Fi. PRO work should live on a **long-lived branch** (e.g. `35mmpro-prototype`), not merged to `main` until you intentionally ship PRO.
- **Policy:** Keep **`35mmpro-prototype` local-only** (do not `git push` that branch) until you are comfortable with remote previews / exposure; use disk backup or `git bundle` if you want safety without pushing.
- **Documentation index:** **`docs/README.md`** — start here for all PRO docs.
- **Phase 1 implementation guide (canonical for agents):** **`docs/35mmpro-phase1-implementation-guide.md`** — what is built, AI-native workflow on existing stack, what not to build yet.
- **Phase 0 (product lock):** **`docs/phase-0-35mmpro-product-lock.md`** — API-free PRO, marketing line, v1 pillars.
- **API-free north star:** **`docs/35mmpro-api-free-summary.md`** — positioning, tiers, no-inference rules.
- **Phase 1 PRD:** **`tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`**.
- **Implementation task list:** **`tasks/tasks-0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`** — **Phase 1 engineering complete** (tasks **1.0–11.0**; optional PDF export **10.3** deferred).
- **Director’s Prep Phase 1.5 PRD:** **`docs/35mmpro-directors-prep-phase1-5-prd.md`** — API-free script breakdown, external Claude copy/paste, Director’s Packet export.
- **Director’s Prep task list:** **`tasks/tasks-0003-directors-prep-phase1-5.md`** — schema v3 + **`director`** workspace tab (core shipped on prototype branch; polish/docs ongoing).
- **Phase 2 (native agents):** **`docs/35mmpro-phase2-claude-agents.md`** — multi-agent orchestration, approval staging, project memory (optional `ANTHROPIC_API_KEY`).
- **Ideas archive (not a build spec):** **`docs/ideas/archive-35mmpro-academy-brainstorm-may15.md`** (May 2026 academy brainstorm).
- **Archived PRD (credits + pipeline prep):** **`tasks/0001-prd-35mmpro-phase1-membership-credits.md`** — superseded; keep if APIs return later.
- **Run locally:** `npm run dev:pro` → **localhost:3001** only. LAN script: `npm run dev:pro:lan` (**on hold**). Full checklist: **`docs/35mmpro-local-prototype.md`**.
- **`main`** push → **production** on Vercel. Catalog-only updates for live stay on `main`; they do not require the PRO branch.

## Soft launch (invite link only)

- **Doc:** [`docs/soft-launch-invite.md`](docs/soft-launch-invite.md)
- **Phase 1 ops:** [`docs/soft-launch-phase1-ops.md`](docs/soft-launch-phase1-ops.md) — allowlist SQL, kill switches, Preview smoke
- **Env:** `PRO_INVITE_ONLY=1`, `PRO_PUBLIC_CHECKOUT=0`, `PRO_INVITE_CODES=…` (see `.env.example`)
- **Generate 10 links:** `node scripts/generate-pro-invite-codes.mjs https://YOUR_DOMAIN`
- **Entry URL:** `/pro/invite/[code]` → magic link → auto-entitle → **`/pro/app`** (Open projects on Account / header if needed)
- **AI:** leave `ANTHROPIC_API_KEY` unset / `PRO_AGENTS_ENABLED=0` for local Script→Prompt ($0). **Phase 5 (quotas, Anthropic ceiling, Preview AI smoke) is not required for soft launch** — only before you turn the key on (`docs/soft-launch-phase1-ops.md`).
- **Deploy order (locked):** **Local → Preview → Production.** Do not `vercel --prod` until the change is verified on `npm run dev:pro` and a Preview deploy.

## Live stack

- **Repo:** GitHub `ERii69/35mmai` (or current remote).
- **Hosting:** **Vercel** — auto-deploy on push to **`main`**.
- **Domain:** Custom domain on **GoDaddy DNS**; apex **`A` @** → Vercel IP (no trailing dot in GoDaddy); **`www`** → Vercel **`*.vercel-dns-*.com`** CNAME from Vercel Domains UI. Do not edit locked **`NS` / `SOA`** `@` rows — add **`A` @** separately.
- **Default Vercel URL:** `35mmai.vercel.app` (plus production custom domain when configured).

## 35mmAiPro stack (locked)

| Layer | Choice | Notes |
|--------|--------|--------|
| **Auth** | **Supabase Auth** (email + password; invite magic link) | Routes: `/login`, `/sign-up`, `/pro/invite/accept`, `/auth/callback`. Session refresh in `middleware.ts` when Supabase env is set. |
| **Database** | **Supabase Postgres** + RLS | `profiles`, `projects`, `project_state`, `stripe_events_processed`. |
| **Payments** | **Stripe** Checkout + Customer Portal + webhooks | USD monthly price `STRIPE_PRICE_ID_PRO_MONTHLY`. Entitlement: `active` / `trialing` on `profiles`. |
| **Config probe** | **`lib/pro-stack-config.ts`** | `isSupabaseConfigured()`, `isStripeConfigured()`, `isProStackConfigured()`. |

- **Env template:** **`.env.example`** — copy to **`.env.local`**; never commit real secrets.

### Environment variables (35mmAiPro)

| Variable | Required for | Notes |
|----------|----------------|-------|
| `NEXT_PUBLIC_APP_URL` | Stripe redirects | e.g. `http://localhost:3000` or `3001` for `dev:pro` |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, DB, workspace | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth, DB (client + RLS) | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, checkout finalize | Server-only; bypasses RLS |
| `STRIPE_SECRET_KEY` | Checkout, Portal, webhooks | Test keys locally |
| `STRIPE_WEBHOOK_SECRET` | `POST /api/webhooks/stripe` | CLI `whsec_…` locally; Dashboard secret in prod |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | Subscription Checkout | `price_…` recurring USD |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional client Stripe UI | Not required for current server Checkout flow |
| `ANTHROPIC_API_KEY` | Phase 2 native Director's Agent | Server-only; unset = copy/paste fallback |
| `ANTHROPIC_MODEL` | Optional agent model override | Default `claude-sonnet-4-20250514` |
| `PRO_WAITLIST_WEBHOOK_URL` | Optional | Waitlist on marketing page only |

### Stripe webhooks (local)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Login: `stripe login`
3. Forward events (match dev port):

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy **`whsec_…`** into **`STRIPE_WEBHOOK_SECRET`** in **`.env.local`**, restart dev server.

5. **Production:** Stripe Dashboard → Webhooks → `https://<domain>/api/webhooks/stripe` with events: **`checkout.session.completed`**, **`customer.subscription.updated`**, **`customer.subscription.deleted`**, **`customer.updated`**. Use that endpoint’s signing secret in Vercel (not the CLI secret).

**Webhook handler needs `SUPABASE_SERVICE_ROLE_KEY`** to upsert `profiles` and record `stripe_events_processed`.

### Supabase migrations (run in SQL Editor, in order)

1. `supabase/migrations/20260212000001_profiles.sql`
2. `supabase/migrations/20260212000002_stripe_webhooks.sql`
3. `supabase/migrations/20260213000003_projects_and_project_state.sql`
4. `supabase/migrations/20260213000004_projects_grants.sql`
5. `supabase/migrations/20260213000005_projects_delete_policy.sql` (optional if 6 is applied)
6. `supabase/migrations/20260213000006_project_state_delete.sql` — **required for dashboard Delete**

### Pro routes

| Route | Purpose |
|-------|---------|
| `/pro` | Marketing + waitlist; shows “Open workspace” when entitled |
| `/pro/app` | Dashboard (subscription card, project list) |
| `/pro/app/workspace` | Redirect to most recent project |
| `/pro/app/workspace/[projectId]` | Workspace tabs, templates, exports, autosave |
| `/account` | Sign-in billing: Checkout, Portal, subscription status |
| `/login`, `/sign-up` | Supabase email auth |
| `GET /api/pro/export/[projectId]/[kind]` | CSV or Markdown from cloud `project_state` |
| `POST /api/pro/agent/[projectId]/run` | NDJSON stream — native Director's Agent (requires `ANTHROPIC_API_KEY`) |

**Export kinds (`kind`):** `kit`, `budget`, `workflow`, `visual`, `shot-plan`, `storyboard-html`, `storyboard-md`, `fountain`, `fdx`, `directors-prep`, `directors-prep-md`, `preproduction-report`. Director’s Prep exports accept `?includeDrafts=1` (default: approved scenes only). **`fdx`** = Final Draft XML (scene headings + shot lists). Demo script: **`docs/35mmpro-v09-demo-script.md`**.

**Server Actions:** `app/actions/pro/projects.ts`, `project-state.ts`, `templates.ts`; `app/actions/stripe.ts`.

**Workspace autosave:** debounced **1.5s** + **Save now**; **last-write-wins** (`components/pro/ProWorkspace.tsx`).

**Project state schema:** **`PROJECT_STATE_SCHEMA_VERSION` = 3** — includes **`directorPrep`** (Director’s Bible, screenplay paste, scene rows, snapshots). v2 projects migrate to empty `directorPrep` on load (`lib/pro/validate-project-state.ts`).

**Director’s Prep tab:** first workspace tab **`director`** (`components/pro/DirectorPrepPanel.tsx`). **Phase 2:** one-click **Director’s Agent** (`components/pro/DirectorAgentPanel.tsx`) when `ANTHROPIC_API_KEY` is set — sub-agents stream progress; approve/reject before commit. **Fallback:** copy/paste external Claude prompt + JSON import (`ScriptToPrepAgentPanel.tsx`).

**Exports (v1):** CSV — kit, budget, workflow, visual, directors-prep. Markdown — directors-prep-md. Filenames `{project-slug}-{kind}-{YYYY-MM-DD}.csv|md` (Director’s Prep uses `{slug}-directors-prep-{date}`). **PDF deferred** (Phase 1 task 10.3 / Phase 1.5 task 7.6).

**Templates:** `lib/pro/templates.ts` — includes **`director-prep-narrative-short`** (Director’s Prep group) plus classical / production starters; `applyTemplate` overwrites `project_state` (confirm if project has content).

### Merge to `main` caution (PRD §4.9)

- **Do not** merge PRO to **`main`** until you intend to ship subscription + workspace on production.
- **Safe to merge later:** Pro code is **merge-safe** when env is missing:
  - **`/` (free catalog)** does not call Supabase — unchanged behavior.
  - **`middleware`** skips session refresh if Supabase env is absent.
  - **`/pro`**, **`/account`**, **`/pro/app/*`**, export API return **friendly “not configured”** UI or **503**, not a crash (`lib/pro-stack-config.ts`, `ProStackUnavailable`).
- **Before enabling PRO on Vercel:** set all required env vars, run migrations on production Supabase, register production Stripe webhook, smoke-test (checklist below).
- **Do not** copy `.env.local` or service-role keys into the repo.

## Manual smoke checklist (Phase 1 sign-off)

Run on a machine with full **`.env.local`**, migrations applied, and **`stripe listen`** (or Dashboard webhooks in staging).

- [ ] **`npm run ci`** passes locally.
- [ ] **Subscribe (test mode):** `/account` → Subscribe → Stripe Checkout (test card) → return to `/account` → status **active** or **trialing**.
- [ ] **App access:** `/pro/app` loads dashboard; default project exists in Supabase `projects` + `project_state` (`schema_version` **1**).
- [ ] **Save state:** `/pro/app/workspace/[id]` → edit world bible or kit → wait for **Saved** → row in `project_state` updates.
- [ ] **Second browser / incognito:** same user login → same project name and field values.
- [ ] **Template:** apply a template (confirm overwrite) → kit/budget/workflow populate.
- [ ] **Exports:** download kit + budget + workflow CSV; open in Sheets; data matches workspace.
- [ ] **Portal cancel:** Account → Manage billing → cancel at period end (or immediate in test) → webhook fires → `/pro/app` redirects to `/pro?subscribe=required` when entitlement ends.
- [ ] **Free site:** `/` still works with no Supabase env (optional: temporarily unset `NEXT_PUBLIC_SUPABASE_*` on a local build and confirm catalog loads).

## Manual smoke checklist (Director’s Prep Phase 1.5)

Run on **`35mmpro-prototype`** with full **`.env.local`**, migrations applied, entitled test user, and `npm run dev` (or `npm run dev:pro` on port 3001).

**Setup:** `/pro/app` → open a project → **Director’s Prep** tab (first tab). Optional: apply template **Director’s Prep — narrative short**.

- [ ] **Director’s Bible:** fill style, shots, tier, tone, genre tags → wait for **Saved** → reload page → values persist.
- [ ] **Script:** paste title + draft label + screenplay text (or upload `.txt`) → char counter stays under 120k → reload → text persists.
- [ ] **Copy prompt:** **Copy prompt for Claude** → paste in external assistant → prompt includes rules + script excerpt + JSON schema.
- [ ] **Import JSON:** **Import AI response** → paste sample JSON (see below) → **Append scenes** → rows appear as **draft** → fix a heading → approve ≥3 scenes.
- [ ] **Scene CRUD:** add scene manually, reorder (↑↓), filter All / Drafts / Approved, link a scene to a shot sequence (add a sequence on Shots tab first).
- [ ] **Shots link badge:** on **Shots** tab, linked scene numbers appear on the matching sequence card.
- [ ] **World bible locations:** approve scenes with headings like `INT. KITCHEN - NIGHT` → **World bible** tab → **Pull locations from approved scenes** → locations list updates.
- [ ] **Snapshots:** **Save snapshot** → **Restore** (confirm) → rules + scenes match snapshot.
- [ ] **Budget hint:** **Budget** tab → **Suggest from scenes** → review modal → **Apply to budget** (confirm) → micro/low line counts update; kit unchanged.
- [ ] **Exports:** Director’s Prep panel → download **CSV** and **Markdown** (approved only) → open files; rules + approved scenes present. Toggle **Include draft scenes** → re-download → drafts included.
- [ ] **Export panel:** sidebar **Director’s Prep CSV / Markdown** links work for same project.
- [ ] **Second browser / incognito:** same user → same `directorPrep` data after cloud reload.
- [ ] **`npm run ci`** passes.
- [ ] **`npm run smoke:pro`** passes (import/apply/report unit smoke — no browser).

**Script-to-Pre-Production Agent (automated + manual):**

- [ ] **`npm run smoke:pro`** — parses agent JSON, applies to state, builds Markdown report.
- [ ] **Agent panel:** paste script → **Copy agent prompt** → full script + schema in clipboard.
- [ ] **Agent import:** paste sample agent JSON (below) → preview shows 3 scenes / 2 shot lists / locations → **Apply (append)** or **Replace**.
- [ ] **After apply:** **Shots** tab has sequences; **World bible** has locations; **Budget** has preset lines if checkbox on.

## Manual smoke checklist (Phase 2 — native Director's Agent)

Requires **`ANTHROPIC_API_KEY`** in `.env.local`, entitled user, script pasted in workspace.

- [ ] **Feature flag:** without key → amber banner + manual fallback panel; **Run Director's Agent** disabled.
- [ ] **With key:** **Run Director's Agent** → progress steps stream (Analyzing → Research → Shots → Budget → Visual).
- [ ] **Review:** approve ≥2 scenes, reject 1 → confidence badges visible → **Commit approved** → scenes appear in table below.
- [ ] **Refine:** enter "lower budget" → **Refine** → budget section updates; prior approvals preserved where applicable.
- [ ] **Export:** **Export package (.md)** downloads pre-production report.
- [ ] **Persistence:** reload workspace → staging + memory survive autosave (`agentStaging`, `agentMemory` in `project_state`).
- [ ] **`npm run smoke:pro`** — 10/10 pass (includes agent staging normalization).
- [ ] **Report:** **Download pre-production report (.md)** — executive summary, scenes, locations, shot lists, budget, next steps.

**Sample agent JSON** (paste into Script-to-Pre-Production Agent step 3):

```json
{
  "executiveSummary": "A tense micro-budget night interior with two exterior beats.",
  "visualMood": "Warm tungsten interiors, neon alley spill.",
  "locations": ["KITCHEN", "ALLEY", "APARTMENT"],
  "scenes": [
    {
      "heading": "INT. KITCHEN - NIGHT",
      "oneLine": "She discovers the letter.",
      "intExt": "INT",
      "dayNight": "NIGHT",
      "visualRefs": ["Chungking Express", "warm tungsten"],
      "shotNotes": "Wide master, slow push-in."
    },
    {
      "heading": "EXT. ALLEY - NIGHT",
      "oneLine": "He runs into the rain.",
      "intExt": "EXT",
      "dayNight": "NIGHT",
      "visualRefs": ["Blade Runner 2049 alley"],
      "shotNotes": "Handheld, neon spill."
    },
    {
      "heading": "INT. APARTMENT - DAY",
      "oneLine": "They confront each other.",
      "intExt": "INT",
      "dayNight": "DAY",
      "visualRefs": [],
      "shotNotes": "Two-shot, natural window light."
    }
  ],
  "shotSequences": [
    {
      "sceneNumber": 1,
      "title": "Scene 1 — INT. KITCHEN - NIGHT",
      "shots": ["1A — Wide master", "1B — CU letter"]
    },
    {
      "sceneNumber": 2,
      "title": "Scene 2 — EXT. ALLEY - NIGHT",
      "shots": ["2A — Handheld run"]
    }
  ],
  "budgetEstimate": {
    "tier": "indie",
    "summary": "Micro-budget AI-assisted short.",
    "monthlyToolingUsdLow": 40,
    "monthlyToolingUsdHigh": 95
  }
}
```

**Sample import JSON** (legacy — Optional: get scenes from Claude, scenes only):

```json
{
  "scenes": [
    {
      "heading": "INT. KITCHEN - NIGHT",
      "oneLine": "She discovers the letter.",
      "intExt": "INT",
      "dayNight": "NIGHT",
      "visualRefs": ["Chungking Express", "warm tungsten"],
      "shotNotes": "Wide master, slow push-in."
    },
    {
      "heading": "EXT. ALLEY - NIGHT",
      "oneLine": "He runs into the rain.",
      "intExt": "EXT",
      "dayNight": "NIGHT",
      "visualRefs": ["Blade Runner 2049 alley"],
      "shotNotes": "Handheld, neon spill."
    },
    {
      "heading": "INT. APARTMENT - DAY",
      "oneLine": "They confront each other.",
      "intExt": "INT",
      "dayNight": "DAY",
      "visualRefs": [],
      "shotNotes": "Two-shot, natural window light."
    }
  ]
}
```

## Day-to-day catalog updates

1. Edit **`app/data.ts`** (`allTools`, ranks, `workflowStages`, budget presets as needed).
2. “Last updated” renders from the current date in the UI.
3. Run **`npm run ci`** before push.
4. **`git commit`** → **`git push`** to **`main`** for catalog-only production deploys.

## CI

- **`.github/workflows/ci.yml`:** `npm ci` + **`npm run ci`** on push/PR to `main` / `master`.
- **GitHub PAT for `git push`:** needs **`repo`** + **`workflow`** scopes if pushing workflow files.

## UX / product notes (free app)

- Workflow builder: phases, sticky outline, bulk add, `workflowStage` in `localStorage`, tool rows by **rank**.
- Budget / currency custom menus; My Kit rehydration from catalog.

## Operational reminders

- **Do not** commit **`node_modules`**, **`.next`**, or real **`.env`** files.
- After GoDaddy **Website Builder** on apex, replace with Vercel **`A` @** only — avoid duplicate **`A` @** records.

## Session log — 2026-05-15

- **Product story:** Pro framed as classical AI short pipeline (bible → place-by-place → stills → composite → motion → edit), not social/viral.
- **Templates & playbooks:** Location-pass method template + 14-step structured playbook; catalog tool links per step; free vs Pro callout.
- **State:** Richer `visualBible` (schema v2 in code); template seeds for location passes, shot recipes, post checklist.
- **Copy pass:** Removed example wording lifted from a reference write-up (“wet clay”, etc.); user-facing label **“Classical film — location-pass method”** (template id `patchwright-classical-short` kept for compatibility).
- **Still open:** Manual smoke checklists above; PDF export (task 10.3 / Director’s Prep 7.6); optional World bible location pull from scene headings (task 9.2).

---

*Last updated: Phase 1 complete; Director’s Prep Phase 1.5 core on `35mmpro-prototype` (schema v3, May 2026).*
