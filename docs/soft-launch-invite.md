# Soft launch — invite link only (10 filmmakers)

**Mode:** Private beta. Public `/pro` does **not** offer Subscribe/trial until someone opens a valid invite URL.

**Phase 1 ops (allowlist SQL, kill switches, Preview):** [`soft-launch-phase1-ops.md`](./soft-launch-phase1-ops.md)

## Enable

**Deploy order:** Local (`npm run dev:pro`) → Vercel **Preview** → **Production**. Do not ship with `vercel --prod` until Preview is verified.

In `.env.local` (and later Vercel Preview, then Production):

```bash
PRO_INVITE_ONLY=1
PRO_INVITE_CODES=...          # from generator below
PRO_PUBLIC_CHECKOUT=0         # Soft: no Stripe Subscribe; entitle via invite allowlist
PRO_SUBSCRIPTION_TRIAL_DAYS=7 # Live only (ignored while Checkout is off). Set 0 for pay-from-day-one
# Prefer NEXT_PUBLIC_PRO_SUBSCRIPTION_TRIAL_DAYS=7 (or 0) so marketing CTAs match Checkout
PRO_AGENTS_ENABLED=0          # Soft launch: local quick prep only (even if a key exists)
# Leave ANTHROPIC_API_KEY unset for $0 AI
# Optional: PRO_WAITLIST_WEBHOOK_URL=https://hooks.zapier.com/...
```

Generate 10 codes + links:

```bash
node scripts/generate-pro-invite-codes.mjs https://YOUR_DOMAIN
```

Copy `PRO_INVITE_CODES=...` into env. Email **one unique link** per filmmaker:

`https://YOUR_DOMAIN/pro/invite/f01-abcd1234`

## Filmmaker flow (Phase 1 — checkout off)

1. Open invite link → cookie → **`/pro/invite/accept`** (email + magic link)
2. Click link in email → signed in → **auto-entitled** (`trialing`) → **`/pro/app`** (projects dashboard)
3. If they land on Account instead: **Open projects dashboard** / header **Open projects**

Password sign-up/sign-in still available as a fallback on the accept page.

Without an invite: `/pro` shows **invite-only + Join waitlist**. Checkout is blocked (`PRO_PUBLIC_CHECKOUT=0` + server gate).

Manual SQL allowlist is optional backup (see Phase 1 ops) if service role / auto-entitle fails.

### Supabase (magic link)

In **Authentication → URL configuration**, allow redirect URLs for each environment:

- `http://127.0.0.1:3001/auth/callback` (local Pro)
- Preview: `https://YOUR-PREVIEW.vercel.app/auth/callback`
- Production: `https://www.35mmai.com/auth/callback`

Enable **Email** provider and magic-link / OTP emails (default Supabase Auth).

## When you turn Checkout on later

```bash
PRO_PUBLIC_CHECKOUT=1
NEXT_PUBLIC_PRO_SUBSCRIPTION_TRIAL_DAYS=7   # or 0 for pay-from-day-one
```

Then invited users can use Account → Subscribe / Start free trial (still invite-gated if `PRO_INVITE_ONLY=1`).
Checkout copy: **cloud projects + prompt packs** — not unlimited AI. AI stays behind `PRO_AGENTS_ENABLED` + quota.

## Revoke someone

1. Remove their code from `PRO_INVITE_CODES` and redeploy, **and/or**
2. Run revoke SQL in Phase 1 ops doc

Already Stripe-subscribed users stay entitled until Stripe cancel.

## Turn off invite-only (public launch)

```bash
PRO_INVITE_ONLY=0
PRO_PUBLIC_CHECKOUT=1
```

## Ops tips for 10 filmmakers

- Spreadsheet: name · email · code · link sent · signed up? · SQL entitled?
- Stripe **test** on Preview first
- Keep `PRO_AGENTS_ENABLED=0` (or unset) until quotas exist — local quick prep only
- Soft launch **does not** need Phase 5 (quota migration, Anthropic ceiling, Preview AI smoke). Those are only before turning the key on — see Phase 5 in `soft-launch-phase1-ops.md`
- Do **not** set `ANTHROPIC_API_KEY` until you intentionally enable AI (then: migration + console ceiling + Preview first)
- Script samples: **Try 3-scene demo** (instant) or **Load 5-scene sample** then Run quick prep
