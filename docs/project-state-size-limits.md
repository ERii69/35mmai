# Project state size limits

When saves or **Apply template** fail with “Project save is too large”, use this doc — not ad-hoc cap bumps.

## Current (Phase 1 — implemented)

| Constant | Value | Where |
|----------|-------|--------|
| `PROJECT_STATE_MAX_BYTES` | **2 MB** | `lib/pro/types.ts` |
| `PROJECT_STATE_PHOTO_BUDGET_BYTES` | **500 KB** (embedded stills in JSON) | `lib/pro/types.ts` |
| Next.js `bodySizeLimit` | **2mb** | `next.config.ts` — JSON cap must not exceed this |

**Save path:** All cloud writes (`saveProjectState`, `applyTemplate`) run `prepareProjectStateForCloudSave` first — slim staging, strip stored shot prompts, re-compress photos to the photo budget.

**Why 2 MB:** Postgres `jsonb` allows much more; the real limits are app validation + server-action payload size. Phase 1 doubles headroom without new infra.

## If users still hit the cap

1. **Immediate UX:** Error copy in `projectStateTooLargeMessage` points to the real bottleneck (photos, prep staging, etc.).
2. **User actions:** Add to project on Prep → Generate; remove 1–2 photos in Look → Photos; trim prep snapshots.
3. **Do not** only raise the cap to 5–10 MB without moving photos out of JSON — autosave slows and you hit the server-action ceiling.

## Phase 2 — next proper fix (photos → Supabase Storage)

**Problem:** Reference stills are base64 inside `visualBible.referenceUrls` — they dominate JSON size.

**Solution:**

1. On upload → store in Supabase Storage (`project-assets/{userId}/{projectId}/{assetId}.jpg`).
2. Persist HTTPS/storage URLs in state, not `data:image/...`.
3. JSON target **~200–600 KB** per project; effective photo budget **~5–10 MB** in Storage.
4. Bump `bodySizeLimit` → **4mb**, `PROJECT_STATE_MAX_BYTES` → **3 MB** (JSON only).

**Cost:** ~$0–10/mo at &lt;1k users on Supabase Pro (storage included).

**Key files to touch:** `ReferenceLibrary.tsx`, `compress-reference-image.ts`, new upload action, migration for existing `data:image` URLs, RLS on storage bucket.

## Phase 3 — scale (optional)

- Split `agentStaging` into `project_prep_staging` (load only on Generate).
- `project_assets` table for photos and export artifacts.
- Tier limits: Pro Prep vs Pro Studio (script length, photo count, snapshots).

## Architecture reminder

```text
Phase 1: bigger JSON cap + compress on every save     ← you are here
Phase 2: photos out of JSON → Supabase Storage        ← do this before raising cap again
Phase 3: split staging/assets + tiered limits
```
