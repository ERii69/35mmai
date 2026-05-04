# Affiliate Link Checklist

Run this before pushing affiliate updates:

1. Add/update `affiliateLink` for approved tools in `app/data.ts`.
2. Run:
   - `npm run affiliates:check`
3. Confirm:
   - Missing list only includes tools still pending approval.
4. Click-test at least one updated tool in local dev:
   - `npm run dev`
5. If all good, commit and push.
