# Phase 0 — 35mmPRO product lock

**Status:** Locked for planning (revise when you ship or learn).  
**Audience notes:** Solo indie directors, small production companies, students.

---

## Job to be done

When someone is **exploring a new film idea**, they need to **discover which AI tools fit their workflow** so they can **keep the budget low without changing how they actually make films** (same phases, same craft — smarter tool choices).

---

## One-sentence v1 promise (PRO)

**35mmPRO gives you a filmmaker-grounded workspace—saved kit, workflow, and budget context in the cloud—plus enough paid “runs” on one curated AI pipeline so you can try real outputs without hunting ten APIs or blowing the budget.**

*(Refine marketing copy later; this is the scope anchor.)*

---

## What v1 includes (agreed direction)

| Pillar | Meaning |
| ------ | ------- |
| **A — Cloud workspace** | Account-backed **My Kit + workflow + budget context** (cross-device, not only `localStorage`). Aligns with “low budget, same process.” |
| **One concrete pipeline (“run”)** | **Single** end-to-end capability with **credits** (metered wholesale API cost). Not a model zoo; one golden path to validate PRO. |
| **Credits** | Users spend credits per run; you map credits → wholesale cost + margin. |

---

## Subscription vs monthly credits (how it helps you *and* them)

You were unsure whether **subscription + monthly credits** is worth it. Short comparison:

| Model | User benefit | Your benefit |
| ----- | ------------ | ------------ |
| **Sub only (no included credits)** | Predictable monthly fee; may still pay per run or hit limits. | Simple billing; risk if API runs are expensive (support + margin pressure). |
| **Sub + monthly credit allowance** | “I pay once and get **N runs worth** per month” — easy to understand; fits students/indies. | Predictable revenue; credits cap your exposure; upsell top-ups when they love the pipeline. |
| **Sub unlocks app + buy credits only** | Pay only for runs they need. | Revenue scales with usage; harder to price “fair” minimum sub. |

**Recommendation for v1:** **Paid tier includes a modest monthly credit allowance** (e.g. enough for **X runs** of the one pipeline) **plus** optional **credit top-ups**. That matches **one pipeline + credits** without forcing a second tier on day one. You can still offer **one paid tier** (single price) that bundles access + credits.

**Starter vs Pro (two tiers):** Defer until **after** one tier proves retention. Phase 0 keeps **one paid tier** unless you strongly want price segmentation immediately.

---

## Non-goals for v1 (explicit)

- **No native phone apps** (responsive web is enough).
- **No full storyboard graph editor** (React Flow–style).
- **No 10-model / multi-provider zoo** — **one** curated pipeline first.
- *(From earlier plan)* Team seats / org billing — **out of v1** unless you revisit.

---

## Pricing & billing (Phase 0 assumptions)

- **Stripe**, **USD only** at first.
- **One paid tier** to start; optional second tier later.
- Detailed prices → Phase 1 commercial PRD, not Phase 0.

---

## Engineering / ops (confirmed)

- PRO development stays on branch **`35mmpro-prototype`**, **local-only** (no `git push` of that branch) **until you decide otherwise** — see `docs/35mmpro-local-prototype.md`.
- Live site continues to ship from **`main`** only.

---

## Resolved (updated after Phase 0 Q&A)

- **Pipeline (product intent):** **Still mood board + 5s clip** (implementation follows Phase 1 foundation — see Phase 1 PRD).
- **Credits:** **Monthly included credits + top-ups.**

## Open decisions (later PRDs)

1. **Export formats** for v1 (PDF kit/budget summary — must-have vs later).
2. Numeric **credit amounts**, **top-up SKUs**, Stripe **Price** ids.

---

## Phase 1 pointer (next)

Phase 1 = **identity + Stripe subscription + entitlement + shell Pro dashboard**, wired so **credits + pipeline** can plug in without redoing auth/billing.
