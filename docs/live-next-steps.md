# Live site — what to watch

As of October 5, 2026. Public site: [www.35mmai.com](https://www.35mmai.com). Pro is open at **$15/mo**, cancel anytime, no free trial. The studio writes prompts. It does not generate images or video. AI stays off.

Use this page as the checklist. Older soft-launch docs describe the invite period, which is over.

## Already done

- Production checkout uses live Stripe. A real $15 payment opened the studio.
- The test subscription on `cineai@pm.me` was canceled. It should not renew. Access from that payment lasts until the end of that billing month.
- These two accounts stay open without paying. Do not use them for Stripe tests.
  - `35mmaix@gmail.com`
  - `otherprojectsx@gmail.com`
- Signed-in visitors see the home catalog with no Free / Pro popup. The popup is only for people who are not signed in.
- Local development stays on Stripe Sandbox. Production is the live account.

## Watch these

Check when something happens, not on a timer.

| Where | What “good” looks like |
| --- | --- |
| Stripe → Payments | A new member is a succeeded **$15** charge. Failed cards show here. |
| Stripe → Developers → Webhooks → **energetic-sensation** | Deliveries to `https://www.35mmai.com/api/webhooks/stripe` succeed. A failed delivery is the usual reason someone paid and the studio stayed locked. |
| Vercel → project **35mmai** → Logs | Open this when a page breaks. Useful paths: `/`, `/pro`, `/account`, `/api/webhooks/stripe`. |
| Supabase → Authentication and profiles | A new signup has a profile. A paying account has subscription status `active`. |

The project purge runs once a day at 8:00 UTC. It only deletes projects after access has ended and the 7-day export window has passed.

Once a week, write down three numbers: visits, new signups, and new $15 payments.

## Still to switch on

- [ ] **Vercel Web Analytics** on the 35mmai project. It is off, so payments are visible and visits are not.
- [ ] **Stripe Customer portal** in live mode (Settings → Billing → Customer portal), with cancel allowed. That is the Manage billing button after someone pays. Confirm it on a paid account.
- [ ] After the first person who is not you pays, ask what script they pasted and which tool they opened.

## Marketing, first month

The free catalog is the front door. Pro is the paid step: paste a script, write one sentence per shot, copy a prompt for the visual tool they already use (Midjourney, Kling, LTX, and the rest). $15 a month, cancel anytime.

Talk to filmmakers who already pay for those tools and are tired of rewriting the same prompt for every shot. Ads wait until a stranger has paid.

1. Turn on Vercel Web Analytics.
2. Post the catalog note as the reason to visit. Sora is closed. Kling 4.0 is announced, not the default. The list is current as of October 10, 2026. Argil is in the catalog. Link to [www.35mmai.com](https://www.35mmai.com).
3. Leave the home popup as the only ask for people who are not signed in.
4. Write to a few filmmakers you already know. The two free accounts are for you, not for giveaways.
5. A visit that never reaches `/pro` is a catalog reader. A signup that never pays looked. A $15 payment is the result that matters.

## Leave alone

- Do not turn on `PRO_AGENTS_ENABLED`.
- Do not put live Stripe keys in `.env.local`.
- Do not change the $15 price in Stripe.
- Do not store images in the studio.
