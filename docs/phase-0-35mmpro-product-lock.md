# Phase 0 — 35mmPRO product lock

**Status:** Active direction — **API-free PRO** (no inference APIs in v1). Supersedes earlier “credits + pipeline” scope until/unless you add wholesale AI later.  
**Audience:** Solo indie directors, small production companies, students.

---

## Marketing line (locked)

> **35mmPRO isn’t another AI generator — it’s where your kit, workflow, and budget stay organized like a real production.**

---

## Job to be done

When someone is **working on a new film idea**, they need **clarity on tools and spend** so the **budget stays low** and the **filmmaking process** (phases, roles, kit) **stays intact** — not replaced by random apps.

---

## One-sentence v1 promise (PRO)

**35mmPRO is a cloud-backed production workspace: projects, kit, workflow phases, and budget — with exports and templates — so filmmakers stay organized across devices without wholesale AI costs.**

---

## What v1 includes (current direction)

| Pillar | Meaning |
| ------ | ------- |
| **Cloud persistence** | Account-backed **My Kit**, **workflow state**, and **budget context** synced to the server (not only `localStorage`). |
| **Projects** | Multiple productions (e.g. named projects), each with its own kit / workflow / budget snapshot. |
| **Exports** | Professional outputs (e.g. **PDF** one-pager / pack, **CSV** for kit or budget lines) for producers and collaborators. |
| **Templates** | Starting points aligned with **budget presets** and **workflow stages** already modeled in the free product (`app/data.ts` patterns). |
| **Workflow & budget depth** | Same mental model as the free app — **phases**, **roles**, **ranks** — deeper save, compare, and export behavior for subscribers. |
| **Simple subscription** | **One PRO tier**, **Stripe**, **USD only** — **no credits ledger**, no inference APIs, **fixed infra** cost at small scale. |

---

## Explicitly deferred (not v1)

- **Wholesale inference APIs** (image/video/LLM generation), **credit packs**, **top-ups**, **metered runs**.
- **Still mood board + 5s clip** (and any similar pipeline) — **future phase** if you add APIs and pricing later.
- Native **phone apps**, **full storyboard graph**, **multi-seat org billing**, **multi-tier** Starter/Pro.

---

## Pricing & billing

- **Stripe**, **USD**, **single subscription product** (monthly to start; annual optional later).
- No per-generation cost to you beyond fixed hosting + auth + DB.

---

## Engineering / ops (confirmed)

- PRO development on **`35mmpro-prototype`**, **local-only** until you choose otherwise — **`docs/35mmpro-local-prototype.md`**.
- **Live** ships from **`main`** only.

---

## PRD index

| Doc | Scope |
| --- | ----- |
| **`tasks/0002-prd-35mmpro-phase1-cloud-workspace-subscription.md`** | **Current** Phase 1 — auth, Stripe subscription, entitlement, dashboard; cloud data + projects + exports + templates (see PRD phases). |
| **`tasks/0001-prd-35mmpro-phase1-membership-credits.md`** | **Superseded** — credits + pipeline prep; keep for reference if you add APIs later. |

---

## Open decisions (carry into implementation PRDs)

1. **Auth + DB** vendor (e.g. Supabase vs Clerk + Postgres).
2. **Export v1 set** — PDF only vs PDF + CSV; “director one-pager” fields.
3. **Migration path** — import existing `localStorage` kit/workflow into first project on upgrade.
