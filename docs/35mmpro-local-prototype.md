# 35mmPRO — local network prototype (separate from live)

This repo can host **35mmAI live** (directory / workflow; deploy from `main`) and **35mmPRO development** on your machine or LAN **without shipping PRO work to production**, as long as you follow the branch and push rules below.

## Quick start (same Wi‑Fi / LAN)

1. Check out the branch used for PRO work (see [Git workflow](#git-workflow)).
2. Install deps once: `npm ci`
3. Start the dev server bound to all interfaces on port **3001**:
   ```bash
   npm run dev:pro
   ```
4. On another device, open:
   ```text
   http://<your-computer-LAN-IP>:3001
   ```
   Example: `http://192.168.1.42:3001`

Find your IP: **macOS** → System Settings → Network → Wi‑Fi → Details → IP address; or run `ipconfig getifaddr en0` (Wi‑Fi).

**Firewall:** If the phone/tablet cannot connect, allow incoming connections for **Node** or port **3001** in macOS Firewall settings.

### Alternative scripts

| Script        | Use case                                      |
| ------------- | --------------------------------------------- |
| `npm run dev` | Default localhost only (`127.0.0.1`), port 3000 |
| `npm run dev:lan` | LAN + port **3000** (all interfaces)      |
| `npm run dev:pro` | LAN + port **3001** — recommended for PRO to avoid clashing with another app on 3000 |

Nothing in these scripts talks to Vercel or production; they only run Next.js locally.

## Git workflow — PRO must not go live by accident

**Production** is tied to **`main`** (see `HANDOFF.md`): push to `main` → Vercel production deploy.

### Recommended setup

| Branch / usage | Purpose |
| -------------- | ------- |
| **`main`** | Matches live site; only catalog fixes, bugfixes, and changes you intend to deploy. |
| **`35mmpro-prototype`** (or similar) | All 35mmPRO membership, dashboard, billing, and PRO-only features until you intentionally release. |

**Rules:**

1. Do **not** merge `35mmpro-prototype` into `main`** until you deliberately ship PRO.
2. Do **not** push `35mmpro-prototype` to GitHub if you want **zero** cloud exposure — keep PRO commits local only (no backup on remote).  
   If you **do** push the branch, GitHub/Vercel may create **preview** deployments (not your custom domain, but still on the internet). To avoid previews: in **Vercel → Project → Git → Ignored Build Step** or disable preview deployments for non‑`main` branches; or use a **second clone** of the repo with **no `remote`** for paranoid local-only work.
3. Cherry-picks: When live needs a hotfix, work on `main` (or a short-lived `fix/*` branch off `main`), **not** only on the PRO branch — avoids dragging PRO into production.

### Optional: second folder, no remote

For maximum isolation, clone the repo again into e.g. `~/35mmai-pro-only`, remove `origin`, and keep PRO work there; merge tooling commits manually when needed. Use only when team discipline is not enough.

## Environment variables

PRO features (Stripe, Supabase, etc.) should use **local-only** `.env.local` on the PRO branch machine. Never copy production Vercel env vars into a shared doc; never commit `.env*`.

The live site’s Vercel env vars apply **only** to deployments — your LAN `npm run dev:pro` does not read Vercel automatically.

## Summary

- **`npm run dev:pro`** → PRO prototype on **:3001**, reachable on your LAN.
- **`main`** + push → live; keep PRO on **`35mmpro-prototype`** (or local-only clone) until you choose to ship.
