# 35mmAiPro — local network prototype (separate from live)

> **Status: ON HOLD (May 2026)** — LAN testing of 35mmAiPro is paused. Use **`npm run dev:pro`** for **localhost-only** work on this machine (`http://127.0.0.1:3001`). Do **not** use **`npm run dev:pro:lan`** unless you are deliberately resuming Wi‑Fi / office-LAN demos.

This repo can host **35mmAI live** (directory / workflow; deploy from `main`) and **35mmAiPro development** on your machine **without shipping PRO work to production**, as long as you follow the branch and push rules below.

## Quick start (this Mac only — current default)

1. Check out the branch used for PRO work (see [Git workflow](#git-workflow)).
2. Install deps once: `npm ci`
3. Start Pro dev **localhost only** on port **3001**:
   ```bash
   npm run dev:pro
   ```
4. Open **`http://localhost:3001`** (or `http://127.0.0.1:3001`) in a browser on **this computer**.

The free catalog stays on **`npm run dev`** → `http://localhost:3000`.

## LAN / Wi‑Fi (on hold — resume when ready)

When you want phone/tablet testing on the same network again:

```bash
npm run dev:pro:lan
```

Then on another device: `http://<your-computer-LAN-IP>:3001`

Find your IP: **macOS** → System Settings → Network → Wi‑Fi → Details → IP address; or run `ipconfig getifaddr en0` (Wi‑Fi).

**Firewall:** If the phone/tablet cannot connect, allow incoming connections for **Node** or port **3001** in macOS Firewall settings.

### Scripts

| Script | Use case |
| ------ | -------- |
| `npm run dev` | Default localhost only, port **3000** (free catalog) |
| `npm run dev:lan` | Catalog on LAN + port **3000** (all interfaces) |
| `npm run dev:pro` | **Pro on localhost only**, port **3001** — **current default** |
| `npm run dev:pro:lan` | Pro on LAN + port **3001** — **on hold**; use only when resuming LAN demos |

Nothing in these scripts talks to Vercel or production; they only run Next.js locally.

## Git workflow — PRO must not go live by accident

**Production** is tied to **`main`** (see `HANDOFF.md`): push to `main` → Vercel production deploy.

### Recommended setup

| Branch / usage | Purpose |
| -------------- | ------- |
| **`main`** | Matches live site; only catalog fixes, bugfixes, and changes you intend to deploy. |
| **`35mmpro-prototype`** (or similar) | All 35mmAiPro membership, dashboard, billing, and PRO-only features until you intentionally release. |

**Policy (current):** Keep **`35mmpro-prototype` local-only** — do **not** `git push` it to GitHub until you are comfortable with preview deploys / remote exposure. Live updates stay on **`main`** as usual.

**Rules:**

1. Do **not** merge `35mmpro-prototype` into **`main`** until you deliberately ship PRO.
2. Do **not** push **`35mmpro-prototype`** to **`origin`** while staying local-only. Pushing that branch can trigger **Vercel preview builds** and copies code off your machine — fine later, not while you want zero cloud footprint.
3. **Hotfixes for live:** Work on **`main`** (or `fix/*` off `main`). Do not rely only on the PRO branch for production fixes — avoids merging unfinished PRO with live.

### Backup without pushing PRO

Local-only means **no GitHub backup** for that branch unless you push. Mitigations:

- **Time Machine** or another full-disk backup of the project folder.
- Occasional **`git bundle`** (creates a single file you can stash on a drive or encrypted archive):

  ```bash
  git bundle create ~/Desktop/35mmai-pro-prototype-backup.bundle 35mmpro-prototype
  ```

  Restore later with `git clone ~/Desktop/35mmai-pro-prototype-backup.bundle` or `git bundle verify` / `git pull` from the bundle as documented in `git help bundle`.

### Optional: second folder, no remote

For maximum isolation, clone the repo again into e.g. `~/35mmai-pro-only`, remove `origin`, and keep PRO work there; merge tooling commits manually when needed. Use only when team discipline is not enough.

## Environment variables

PRO features (Stripe, Supabase, etc.) should use **local-only** `.env.local` on the PRO branch machine. Never copy production Vercel env vars into a shared doc; never commit `.env*`.

The live site’s Vercel env vars apply **only** to deployments — your local `npm run dev:pro` does not read Vercel automatically.

## Summary

- **`npm run dev:pro`** → Pro prototype on **:3001**, **this Mac only** (LAN on hold).
- **`npm run dev:pro:lan`** → Pro on your LAN when you resume Wi‑Fi testing.
- **`main`** + push → live; PRO stays on **`35mmpro-prototype`**, **not pushed**, until you choose otherwise.
