# Soft launch Phase 1 — access, allowlist, kill switches

**Deploy order:** Local → Preview → Production.

## Flags (`.env.local` / Vercel)

| Var | Soft launch | Live public |
|-----|-------------|-------------|
| `PRO_INVITE_ONLY` | `1` | `0` |
| `PRO_INVITE_CODES` | 10 codes | optional |
| `PRO_PUBLIC_CHECKOUT` | `0` (no Stripe Subscribe) | `1` |
| `PRO_SUBSCRIPTION_TRIAL_DAYS` / `NEXT_PUBLIC_PRO_SUBSCRIPTION_TRIAL_DAYS` | ignored (Checkout off) | `7` or `0` pay-from-day-one |
| `PRO_AGENTS_ENABLED` | `0` / unset (local prep only) | `1` + key when quotas ready |
| `ANTHROPIC_API_KEY` | **unset** | only after quotas + Preview smoke |
| `ANTHROPIC_MODEL` | n/a | `claude-3-5-haiku-20241022` (beta default) |
| `PRO_AI_QUOTA_DAILY` | `3` | tune after Preview |
| `PRO_AI_QUOTA_MONTHLY` | `20` | tune after Preview |
| `PRO_WAITLIST_WEBHOOK_URL` | optional Zapier/Make/Slack | optional |

**Phase 4 billing:** Subscription = studio + save + export (prompt packs). AI = `PRO_AGENTS_ENABLED` + quota — not “unlimited AI”. Soft launch ignores Stripe trial; invite allowlist grants `trialing` on profiles.

**Phase 5 AI safety:** Apply `supabase/migrations/20260720000007_pro_ai_quota.sql` before enabling the key. Hammering Run AI prep returns **429** — `Daily AI limit reached — use quick prep`. Unset key → local S2P still works.

> **Soft launch does not require Phase 5.** Ship invite-only + allowlist with `PRO_AGENTS_ENABLED=0` / `ANTHROPIC_API_KEY` unset — local Script → Prompt, **$0 AI**. Skip the migration, Anthropic console ceiling, Preview AI env, and 429 hammer test until you intentionally turn the key on. Phase 5 is the seatbelt for that later step only.

With `PRO_PUBLIC_CHECKOUT=0`, `/pro` and `/account` hide **Start trial / Subscribe**. Invited users sign up; you entitle them via SQL (below).

---

## Allowlist playbook (SQL)

Run in **Supabase → SQL Editor** (production project). User must already exist in Auth (they opened invite → magic link / signed up).

### Entitle one filmmaker (7-day window)

```sql
-- Replace the email
UPDATE public.profiles AS p
SET
  subscription_status = 'trialing',
  subscription_current_period_end = (timezone('utc', now()) + interval '7 days')
FROM auth.users AS u
WHERE p.id = u.id
  AND lower(u.email) = lower('filmmaker@example.com')
RETURNING p.id, u.email, p.subscription_status, p.subscription_current_period_end;
```

### Entitle several emails at once

```sql
UPDATE public.profiles AS p
SET
  subscription_status = 'trialing',
  subscription_current_period_end = (timezone('utc', now()) + interval '7 days')
FROM auth.users AS u
WHERE p.id = u.id
  AND lower(u.email) = ANY (ARRAY[
    'a@example.com',
    'b@example.com'
  ]::text[])
RETURNING u.email, p.subscription_status, p.subscription_current_period_end;
```

### Revoke allowlist access

```sql
UPDATE public.profiles AS p
SET
  subscription_status = 'canceled',
  subscription_current_period_end = timezone('utc', now())
FROM auth.users AS u
WHERE p.id = u.id
  AND lower(u.email) = lower('filmmaker@example.com')
RETURNING u.email, p.subscription_status;
```

### Check who is entitled

```sql
SELECT u.email, p.subscription_status, p.subscription_current_period_end
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.subscription_status IN ('active', 'trialing')
ORDER BY p.subscription_current_period_end DESC NULLS LAST;
```

Spreadsheet columns: name · email · invite code · link sent · signed up? · SQL entitled?

---

## Waitlist (Mode B)

1. Create a Zapier / Make / Slack incoming webhook.
2. Set `PRO_WAITLIST_WEBHOOK_URL=https://…` in env.
3. On `/pro` without an invite, CTA is **Join waitlist** (not Start trial).
4. Submissions POST JSON: `{ email, note?, source: "35mmAiPro-waitlist", submittedAt }`.
5. If webhook unset, UI still succeeds and can offer mailto fallback.

Confirm: submit a test email from `/pro` and see it in Zapier/Slack.

---

## Kill switches checklist

Print / paste into Notion. Use before or during incidents.

- [ ] **AI spend:** Unset / delete `ANTHROPIC_API_KEY` on Vercel (Production + Preview) → Redeploy
- [ ] **Checkout:** Set `PRO_PUBLIC_CHECKOUT=0` → Redeploy (or keep at `0` for soft launch)
- [ ] **Invites:** Remove codes from `PRO_INVITE_CODES` (or set `PRO_INVITE_ONLY=1` with empty codes) → Redeploy
- [ ] **Allowlist:** Run revoke SQL for specific emails
- [ ] **Stripe Price:** Pause / archive price in Stripe Dashboard (when checkout is on)
- [ ] **Anthropic org:** Monthly spend ceiling + email alert at 50%/80% (only when key exists) — see **Phase 5** below

---

## Phase 5 — AI safety (before turning the key on)

**Not a soft-launch gate.** Soft launch with key unset / `PRO_AGENTS_ENABLED=0` already has $0 AI spend. Do this section only when you decide to enable Anthropic for invitees.

### 1. Supabase migration

Run in **Supabase → SQL Editor** (Preview project first, then Production):

`supabase/migrations/20260720000007_pro_ai_quota.sql`

Creates `pro_ai_quota`, `pro_ai_run_log`, and RPCs `consume_pro_ai_run` / `get_pro_ai_quota` (service_role only).

### 2. Anthropic console (org spend)

In [Anthropic Console](https://console.anthropic.com/) → **Settings → Billing / Limits**:

1. Set a **monthly spend ceiling** low enough for soft launch (e.g. $20–50).
2. Enable **email alerts at 50% and 80%** of that ceiling.
3. Keep the key in Vercel **Preview** only until smoke passes.

### 3. Env (Preview first — invitees only)

```bash
PRO_AGENTS_ENABLED=1
ANTHROPIC_API_KEY=sk-ant-…
ANTHROPIC_MODEL=claude-3-5-haiku-20241022   # cheaper beta default
PRO_AI_QUOTA_DAILY=3
PRO_AI_QUOTA_MONTHLY=20
# Keep PRO_INVITE_ONLY=1 so only invitees hit AI
```

Redeploy **Preview**. Smoke:

- [ ] Unset key / `PRO_AGENTS_ENABLED=0` → Script → quick prep → Look → Prompts → Export still works
- [ ] Key on → Run AI prep works once
- [ ] Hammer Run AI prep → **429** + `Daily AI limit reached — use quick prep` (no extra Anthropic spend)
- [ ] Quick prep still works after limit

### 4. Production

Only after Preview smoke: set the same vars on **Production**, redeploy, then re-check the 429 hammer test with one invite account.

Kill switch: unset `ANTHROPIC_API_KEY` or set `PRO_AGENTS_ENABLED=0` → Redeploy.

---

## Staging Preview first

Before touching Production:

1. Push branch / open PR → Vercel **Preview** deploy.
2. Preview env (same as local soft launch):
   - Supabase + Stripe **test** keys
   - `NEXT_PUBLIC_APP_URL` = the Preview URL (e.g. `https://35mmai-git-….vercel.app`)
   - `PRO_INVITE_ONLY=1`, `PRO_PUBLIC_CHECKOUT=0`, invite codes
   - `ANTHROPIC_API_KEY` unset (enable only after Phase 5 quota migration + console ceiling)
3. Stripe webhook (test): forward to `https://PREVIEW_URL/api/webhooks/stripe` **or** rely on Account `session_id` finalize when checkout is later enabled.
4. Smoke (from HANDOFF, adapted for allowlist):
   - [ ] Open `/pro` → see invite-only + **Join waitlist**
   - [ ] Valid `/pro/invite/CODE` → magic-link accept (`/pro/invite/accept`)
   - [ ] Email OTP → `/auth/callback` → Account
   - [ ] SQL entitle email → `/pro/app` opens
   - [ ] Cancel/revoke SQL → studio locks
   - [ ] Free `/` still works

Only then promote to Production (same flags). Open `PRO_PUBLIC_CHECKOUT=1` when you want Stripe trials.
