# 35mmAiPro Phase 2 — Native Claude Agents

Phase 2 adds **server-side multi-agent pre-production** inside the PRO workspace. Phase 1’s copy/paste flow remains as a fallback when no API key is configured.

## Architecture

| Sub-agent | Responsibility | Output |
|-----------|----------------|--------|
| Script Analyzer | Scene breakdown, one-liners, continuity | Staged scenes |
| Research Agent | Locations, references, accuracy notes | Staged locations + `researchNotes` (offloaded) |
| Shot List Agent | Shot sequences, camera notes | Staged shot sequences |
| Budget Agent | Tier + tooling estimate | Staged budget |
| Visual Bible Agent | Mood, palette, refs | Staged visual bible |

**Orchestrator:** `lib/pro/agents/orchestrator.ts` — runs agents sequentially, streams NDJSON progress to the client.

**Approval gate:** Suggestions land in `directorPrep.agentStaging` with per-item `pending | approved | rejected`. Only approved items are written on **Commit approved** (`lib/pro/commit-agent-staging.ts`).

**Project memory:** `directorPrep.agentMemory` stores compressed script summary, fingerprint, and recent approval decisions for cross-session context (`lib/pro/agents/context.ts`).

## API

- `POST /api/pro/agent/[projectId]/run` — NDJSON stream (`progress`, `complete`, `error`)
- Requires: Pro subscription, `ANTHROPIC_API_KEY`, screenplay pasted in workspace

## Env

```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514  # optional
```

## UI

**Director's Prep → Director's Agent** panel:

1. Paste script + Director's Bible (existing fields)
2. **Run Director's Agent** — live progress
3. Review scenes, locations, shots, budget, visual — approve/reject
4. **Refine** — partial re-run (e.g. “lower budget”, “more cinematic”)
5. **Commit approved** — merges into workspace tabs
6. **Export package (.md)** — full pre-production report

Manual fallback: collapsed **copy/paste** panel (API-free tier).

## Context engineering (v1)

- **Write:** decisions appended to `agentMemory`
- **Select:** sub-agents receive director rules + memory block + isolated scene summaries
- **Compress:** long script truncated per agent; full text only for script analyzer
- **Isolate:** research notes stored in staging, not re-injected into every prompt

## Product tiers (planned)

| Tier | Price | Agents |
|------|-------|--------|
| API-free | $9/mo | Copy/paste prompt + import JSON |
| Hybrid | $19/mo | Native agents + approval workflow |

Implementation today: feature flag via env (`ANTHROPIC_API_KEY`), not billing split.

## Deferred

- Claude Agent SDK (native binaries) — using Anthropic Messages API for Vercel/serverless
- Drag-drop scene table, keyboard shortcuts, version control
- Midjourney/Runway/location DB integrations
