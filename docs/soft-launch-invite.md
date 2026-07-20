# Soft launch — invite link only (10 filmmakers)

**Mode:** Private beta. Public `/pro` does **not** offer Subscribe/trial until someone opens a valid invite URL.

## Enable

In `.env.local` (and later Vercel):

```bash
PRO_INVITE_ONLY=1
PRO_INVITE_CODES=...   # from generator below
# Leave ANTHROPIC_API_KEY unset for $0 AI (local quick prep)
```

Generate 10 codes + links:

```bash
node scripts/generate-pro-invite-codes.mjs https://YOUR_DOMAIN
```

Copy `PRO_INVITE_CODES=...` into env. Email **one unique link** per filmmaker:

`https://YOUR_DOMAIN/pro/invite/f01-abcd1234`

## Filmmaker flow

1. Open invite link → httpOnly cookie set (60 days) → redirected to sign-up  
2. Create account → Account → Start free trial (Stripe)  
3. Open `/pro/app` when entitled  

Without an invite: `/pro` shows **invite-only + waitlist**. Checkout is blocked server-side.

## Revoke someone

Remove their code from `PRO_INVITE_CODES` and redeploy. Their cookie stops unlocking Checkout. (Already-subscribed users stay entitled until Stripe cancel.)

## Turn off invite-only (public launch)

```bash
PRO_INVITE_ONLY=0
# or remove the var
```

## Ops tips for 10 filmmakers

- Keep a spreadsheet: name · email · code · link sent · signed up?  
- Prefer Stripe **test** on Preview first; live keys only when ready  
- Do **not** set `ANTHROPIC_API_KEY` until quotas exist  
