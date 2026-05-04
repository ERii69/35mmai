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

## Regenerate the partner media kit PDF

From the repo root (use the project venv with Pillow + fpdf2):

```bash
python3 -m venv .venv-media-kit
. .venv-media-kit/bin/activate
pip install -r scripts/requirements-media-kit.txt
python3 scripts/generate-media-kit-pdf.py
```

This updates `docs/35mmAI-media-kit.pdf` and images under `docs/media-kit-assets/`. The script loads the live favicon when SSL allows; the hero and homepage-style preview are generated to match 35mmai.com branding.
