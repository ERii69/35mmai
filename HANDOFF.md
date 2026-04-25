# 35mmAI prototype — handoff for future work

Use this file when opening a new chat so context is not “from zero.”

## What it is

- **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind**, UI pieces under `components/`.
- Main experience lives in **`app/page.tsx`**. Catalog and presets live in **`app/data.ts`** (single source of truth for tools, ranks, workflow stages, budget defaults, `rehydrateKitEntry`, `getToolByRank`, etc.).

## Live stack

- **Repo:** GitHub `ERii69/35mmai` (or current remote).
- **Hosting:** **Vercel** — auto-deploy on push to **`main`**.
- **Domain:** Custom domain on **GoDaddy DNS**; apex **`A` @** → Vercel IP (no trailing dot in GoDaddy); **`www`** → Vercel **`*.vercel-dns-*.com`** CNAME from Vercel Domains UI. Do not edit locked **`NS` / `SOA`** `@` rows — add **`A` @** separately.
- **Default Vercel URL:** `35mmai.vercel.app` (plus production custom domain when configured).

## Environment

- **`PRO_WAITLIST_WEBHOOK_URL`** (optional): set in **Vercel → Project → Settings → Environment Variables** for Production if the Pro waitlist should POST to a webhook. See `app/actions/waitlist.ts`.
- Local secrets: **`.env*`** is gitignored. Example keys only in **`.env.example`** (file may be ignored by `.env*` — add `!.env.example` to `.gitignore` if you want it committed).

## Day-to-day catalog updates

1. Edit **`app/data.ts`** (`allTools`, ranks, `workflowStages`, budget presets as needed).
2. Bump **`DIRECTORY_LAST_UPDATED_DISPLAY`** when the public “Last updated” line should change.
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
