# Phase 2 — App IA: 3-step pipeline (done)

**Goal:** One obvious path inside the workspace for script-to-prompt projects.

## Shipped

### 3-step primary navigation (script-to-prompt only)

| Step | Label | What user does |
|------|--------|----------------|
| 1 | **Script** | Paste screenplay + look rules; run prep (Script / Generate sub-tabs) |
| 2 | **Look** | Palette, mood refs, consistency check (Photos · Mood · Check) |
| 3 | **Prompts** | Review beats, copy or export (Prompts · Export; Kit in More) |

- `lib/pro/workspace-pipeline.ts` — pipeline rules, nav items, look tab filter, advanced destinations
- `ProWorkspaceModeNav.tsx` — renders Script · Look · Prompts instead of Prep · Produce · Post
- **Advanced** menu — Shots grid, Budget, Workflow, World bible, Look details, Post checklist

### Hidden from primary nav (script-to-prompt)

- Produce → Shots, Coverage / Suggest coverage (via Shots panel in Advanced)
- Budget, Workflow, World bible
- Post checklist (Advanced menu)
- Template picker on day one (moved to **Advanced prep** slide-over)

### Linear happy path

- `getNextWorkspaceStep()` — Script → Look → Prompts → Export (no Shots/Budget hints for script-to-prompt)

### New projects

- `bootstrap-default-project.ts` — auto-applies `director-prep-script-to-prompt` (unchanged, verified)

### Dashboard

- Project cards: **"12 scenes · 48 prompts ready"** for script-to-prompt (`summaryLine` in `project-progress-stats.ts`)
- Legacy projects still show scenes · % complete · shots

## Verify

```bash
npm run smoke:pro
npx tsc --noEmit
```

Manual: open default project → top nav shows **Script · Look · Prompts · Advanced**; dashboard card shows scenes · prompts ready.
