# 35mmAiPro v0.9 — Public Demo Script (PRO-405)

**Product:** 35mmAiPro “Director’s Agent”  
**Runtime:** ~8 minutes  
**Audience:** Filmmakers, producers, film-school partners  
**Prereqs:** `npm run dev:pro`, Pro subscriber test account, sample script below

---

## Before you record

1. Copy **`.env.local`** with Supabase + Stripe (optional: `ANTHROPIC_API_KEY` for live agents).
2. Open `http://localhost:3001/pro` → sign in → open a **test project**.
3. Paste the **sample script** (end of this doc) or use your own with `INT./EXT.` headings.
4. Close extra browser tabs; zoom UI to 100%; dark mode already on-brand.

**One-liner for the video intro:**  
*“35mmAiPro turns your screenplay into a director’s prep package and shot plan in minutes — with human approval at every step.”*

---

## Demo flow (8:00)

| Time | Beat | On screen | Say (approx.) |
|------|------|-----------|----------------|
| **0:00** | Hook | Marketing / login | “You pasted a script. Now you need scenes, look, shots, and budget — without losing control to a black box.” |
| **0:30** | Enter PRO | `/pro/app` workspace | “This is 35mmAiPro — cloud projects, not browser-only kit lists.” |
| **1:00** | **Prep → Script** | Step 1, paste sample | “Paste Fountain-style text or upload `.txt`. Nothing trains on your script — it stays in your project.” |
| **1:30** | **Vision** | Step 2, style + refs | “Director’s Bible: tone, shot prefs, mood links. Optional but makes everything sharper.” |
| **1:50** | **Reference library** | Look tab → upload 1–2 stills | “Upload reference stills. With an API key, Analyze runs **vision** on pixels — palette and design notes land in your visual bible.” |
| **2:30** | **Run prep** | Step 3 → **Run local prep** (or AI if keyed) | “One click: five agents in sequence when configured — or **local prep in ~30 seconds** from scene headings.” |
| **3:00** | **Review** | Scene cards → Accept all → Save | “Every suggestion is approve or reject. Memory records what you keep for the next run.” |
| **3:30** | **Production → Shots** | Generate / Build from script | “Smart shot plan from approved scenes — coverage, duration, camera notes. Drag cards to reorder.” |
| **4:00** | **Magic buttons** | Suggest coverage · Match visual bible | “Fill missing wides and close-ups. Pull palette and lens notes onto every shot.” |
| **4:30** | **Budget** | Suggest from shot plan → Apply | “Budget scales from your **shot count and shoot days**, not a static template.” |
| **5:00** | **Exports** | Download panel | “Storyboard HTML for print, **Final Draft .fdx**, Fountain, pre-production report.” |
| **5:30** | **Storyboard** | Open downloaded HTML | “Print to PDF for investors or your DP.” |
| **5:45** | **Final Draft** | Open `.fdx` in FD 12+ | “Native Final Draft import — scene headings plus shot lists inline as action lines.” |
| **6:15** | **Refine** (optional) | Step 4 → Preview changes → Refine | “Refine with AI shows **which agents** will run before you spend tokens.” |
| **6:45** | **Trust** | Thinking log + project memory | “You see plain-language agent progress — not raw model dumps.” |
| **7:15** | **Close** | Cross-tab banner | “Prep, Look, and Production stay linked. Under eight minutes from paste to shot plan.” |
| **7:45** | CTA | Pricing / sign-up | “Start on 35mmAiPro — link in description.” |

---

## B-roll shots (optional cutaways)

- Shot card drag-and-drop reorder  
- Coverage gaps banner → Suggest coverage  
- Keyboard hints: ⌘↵ run prep, ⌘⇧G generate shots  
- Export file list downloading  
- Final Draft with imported script + shot lines visible  

---

## Sample script (paste in Step 1)

```fountain
INT. COFFEE SHOP - DAY

MAYA (30s) stirs an espresso. Rain on the window.

EXT. ALLEY - NIGHT

She runs, clutching a red envelope. Neon reflects in puddles.

INT. APARTMENT - NIGHT

MAYA slams the envelope on the table. LEO (40s) doesn't look up.

LEO
You shouldn't have come here.

MAYA
They know. We have one hour.

INT. ROOFTOP - DAWN

Wide city. Maya and Leo stand at the edge, silent.

MAYA
Then we finish it tonight.
```

**Expected after local prep:** 4 scenes · shot sequences with default coverage · budget band suggestion.

---

## Troubleshooting on camera

| Issue | Fix on camera |
|-------|----------------|
| “No scenes found” | Confirm headings start with `INT.` or `EXT.` |
| Agents stuck spinning | Refresh; use **Run local prep**; Esc cancels |
| Empty shot plan | Production → **Build from script** or Generate from approved |
| Export 401 | Stay signed in; Pro subscription active |
| FDX won’t open | Final Draft 10+; File → Open (not drag-drop on some versions) |

---

## Post-demo checklist (publish)

- [ ] Upload recording (Loom / YouTube unlisted)  
- [ ] Link from `/pro` marketing page  
- [ ] Add changelog bullet: **v0.9 Director’s Agent** (link `docs/35mmpro-v09-prioritized-roadmap.md`)  
- [ ] Note: API key optional; local path is the hero for cost-free demos  

---

## Changelog blurb (copy-paste)

**35mmAiPro v0.9 — Director’s Agent**  
Multi-agent prep with human approval, smart shot plans, visual bible vision on reference stills, production dashboard (coverage, budget from shots), and exports including **Final Draft (.fdx)** and print-ready storyboards.
