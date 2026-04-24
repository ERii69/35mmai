# 35mm AI prototype

Next.js app for the 35mm AI directory, workflow builder, budget templates, and My Kit.

## Requirements

- Node.js 20+

## Commands

| Command        | Purpose                          |
| -------------- | -------------------------------- |
| `npm run dev`  | Local development                |
| `npm run lint` | ESLint                           |
| `npm run build`| Production build + typecheck   |
| `npm run ci`   | Lint then build (pre-merge gate) |

## QA (before deploy)

1. Run `npm run ci` locally (same as GitHub Actions).
2. Manual smoke (dev or `npm run build && npm run start`):
   - Home → Workflow → phase list / keyboard / bulk add
   - All Tools (step 9): search, filters, open a tool card
   - Budget: preset + currency; Reset to Default vs saved `localStorage`
   - My Kit: add/remove; refresh still shows tools (rehydration from `app/data.ts`)
   - Pro waitlist: valid email; with/without `PRO_WAITLIST_WEBHOOK_URL`
   - Mobile width: nav, workflow menus, sticky outline where applicable

## Deploy

1. Connect the repo to your host (e.g. [Vercel](https://vercel.com)) with the default Next.js settings.
2. Set environment variables in the project dashboard (see `.env.example`). `PRO_WAITLIST_WEBHOOK_URL` is optional.
3. Trigger a deployment; confirm the build log matches `npm run ci`.

## Updating the catalog

Edit `app/data.ts` (`allTools`, ranks, `workflowStages`, budget presets). Deploy after merge so production matches the file.
