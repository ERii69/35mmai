# v1 Script to prompt refocus — definition of done

**Branch:** `35mmpro-prototype`  
**Product lock:** `docs/phase-0-35mmpro-product-lock.md`

Use this checklist to sign off the refocus before merge or private beta.

---

## Product outcomes

- [ ] **15-minute happy path:** New subscriber with a **3-scene demo** or **5-scene test script** reaches **Export prompt pack** in under 15 minutes (manual stopwatch). Samples: `lib/pro/demo-script-three-scenes.ts`, `lib/pro/demo-script-five-scenes.ts`.
- [x] **No Shots / Budget / Workflow on happy path:** `getNextWorkspaceStep` routes Script → Look → Prompts → Export; banners and prep copy never require Shots, Budget, or Workflow for `director-prep-script-to-prompt`.
- [x] **Marketing aligned:** `/pro` hero is “Under 15 minutes” / “From script to a professional prompt pack” — no “shooting list,” “full shooting list,” “stripboard,” or “coverage” as the product promise (`lib/pro/marketing-copy.ts`, features, subscribe card, layout metadata).
- [x] **Default project:** `bootstrapDefaultProject` and `createProject` seed **`director-prep-script-to-prompt`** template state.
- [x] **No template picker on day one:** Script tab shows workflow label + **Change workflow** (3 choices). Full template gallery lives in **Advanced** drawer.
- [x] **3-scene demo:** **Try 3-scene demo → instant prompts** on Script tab loads sample + local prep + opens Prompts.
- [x] **Dashboard progress chips:** `Script ✓ · Look ✓ · N/M prompts` on project cards (script-to-prompt).
- [x] **Pro onboarding modal:** First visit to `/pro/app` shows 3-step tour (Script → Look → Finish).

---

## 15-minute walkthrough (manual)

1. Sign in → `/pro/app` → open default project.
2. **Script:** Tap **Try 3-scene demo → instant prompts** (or paste `lib/pro/demo-script-five-scenes.ts` and run Generate).
4. **Look:** Add at least one palette swatch or visual mood (30 seconds).
5. **Produce → Prompts:** Confirm prompts auto-built per scene; copy one prompt; **Open** tool link works.
6. **Produce → Export:** Download **prompt pack** Markdown (or CSV); open file — tool names + prompts present.

**Pass:** Steps 1–6 without opening Shots, Budget, or Workflow.

---

## Copy audit (user-facing Pro)

Grep before release:

```bash
rg -i "shooting list|full shooting|stripboard" --glob '*.{ts,tsx}' app/pro components/pro lib/pro
```

**Allowed:** Filmustage catalog entry in `app/data.ts` (describes the vendor product).  
**Not allowed:** Pro marketing, workspace banners, next-step hints, subscribe card.

---

## Engineering

- [x] `npm run ci` passes on `35mmpro-prototype` (after smoke location title-case fix).
- [x] `buildScriptToPromptPackState` used on script-to-prompt commit (`DirectorPrepWizard`) and Prompts panel auto-build.
- [x] `bootstrapDefaultProject` seeds script-to-prompt template state.

---

## Out of scope for this sign-off

- Kling / Nano dedicated prompt formatters (next slice).
- PDF director packet.
- Filmustage API import.
- Hiding Advanced tabs in workspace UI (follow-up slice).
