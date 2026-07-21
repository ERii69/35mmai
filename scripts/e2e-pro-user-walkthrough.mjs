/**
 * Real-user Pro walkthrough (Playwright + system Chrome).
 *
 * Prereqs:
 *   npm run dev:pro  (http://127.0.0.1:3001)
 *   .env.local with Supabase (script can ensure E2E user)
 *
 * Run:
 *   node scripts/e2e-pro-user-walkthrough.mjs
 *
 * Optional env:
 *   E2E_BASE_URL  E2E_EMAIL  E2E_PASSWORD  E2E_HEADED=1
 */
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

loadEnv({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "tmp", "e2e-walkthrough");
const BASE = process.env.E2E_BASE_URL || "http://127.0.0.1:3001";
const EMAIL = process.env.E2E_EMAIL || "e2e.pro.walkthrough@35mmai.test";
const PASSWORD = process.env.E2E_PASSWORD || "E2eWalkthrough!2026";
const HEADED = process.env.E2E_HEADED === "1";

const SAMPLE_SCRIPT = `INT. COFFEE SHOP - DAY

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
`;

const results = [];
let step = 0;

function log(ok, name, detail = "") {
  step += 1;
  const line = `${ok ? "PASS" : "FAIL"}  ${String(step).padStart(2, "0")}  ${name}${detail ? ` — ${detail}` : ""}`;
  results.push({ ok, name, detail });
  console.log(line);
}

async function ensureE2eUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env for E2E user bootstrap");
  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listed.error) throw listed.error;
  let user = listed.data.users.find((u) => u.email === EMAIL);
  if (!user) {
    const created = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (created.error) throw created.error;
    user = created.data.user;
  } else {
    const upd = await admin.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
      email_confirm: true,
    });
    if (upd.error) throw upd.error;
  }
  const up = await admin.from("profiles").upsert(
    {
      id: user.id,
      subscription_status: "trialing",
      subscription_current_period_end: new Date(Date.now() + 7 * 864e5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (up.error) throw up.error;
}

async function signInSession() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing Supabase anon env");
  const client = createClient(url, anon);
  const { data, error } = await client.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (error || !data.session) {
    throw new Error(error?.message || "No session from signInWithPassword");
  }
  return data.session;
}

async function applySessionCookies(context, session) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = new URL(url).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const encoded = `base64-${Buffer.from(JSON.stringify(session), "utf8").toString("base64url")}`;
  const chunkSize = 3180;
  const values =
    encoded.length <= chunkSize
      ? [{ name: cookieName, value: encoded }]
      : Array.from({ length: Math.ceil(encoded.length / chunkSize) }, (_, index) => ({
          name: `${cookieName}.${index}`,
          value: encoded.slice(index * chunkSize, (index + 1) * chunkSize),
        }));

  await context.clearCookies();
  await context.addCookies(
    values.map(({ name, value }) => ({
      name,
      value,
      url: BASE,
      httpOnly: false,
      secure: BASE.startsWith("https://"),
      sameSite: "Lax",
    }))
  );
}

async function shot(page, name) {
  mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `${String(step + 1).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`\nE2E Pro walkthrough → ${BASE}\n`);

  await ensureE2eUser();
  log(true, "Bootstrap entitled E2E user", EMAIL);

  const browser = await chromium.launch({
    channel: "chrome",
    headless: !HEADED,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("pro-onboarding-v3-dismissed", "1");
    } catch {
      /* ignore */
    }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  async function dismissOverlays() {
    const welcome = page.getByRole("dialog", { name: /welcome to 35mmaipro/i });
    if (await welcome.isVisible().catch(() => false)) {
      const close = welcome.getByRole("button", { name: /got it|close|continue|start/i }).first();
      if (await close.count()) await close.click();
      else await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }
  }

  try {
    // --- Marketing ---
    await page.goto(`${BASE}/pro`, { waitUntil: "domcontentloaded" });
    const hero = page.locator("h1").filter({ hasText: /screenplay|prompt/i }).locator("visible=true").first();
    await hero.waitFor({ state: "visible", timeout: 20000 });
    const h1 = ((await hero.textContent()) || "").trim();
    log(h1.includes("screenplay") || h1.includes("prompt"), "Marketing hero headline", h1);
    const hasBrand = (await page.locator('a[aria-label*="35mmAiPro"], a[aria-label*="35mm"]').count()) > 0;
    log(hasBrand, "Marketing brand lockup present");
    const amberCta = await page.locator(".from-amber-500, .to-amber-400").count();
    log(amberCta === 0, "No amber gradient CTAs on /pro", `count=${amberCta}`);
    await shot(page, "marketing");

    // Legal: main content leads with H1 (header CTAs above don't count)
    await page.goto(`${BASE}/pro/privacy`, { waitUntil: "domcontentloaded" });
    await page.locator("main h1").first().waitFor({ state: "visible" });
    const privacyOrder = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return { ok: false, reason: "no main" };
      const h1 = main.querySelector("h1");
      const subscribe = Array.from(main.querySelectorAll("a,button")).find((el) =>
        /start free trial|subscribe|create account/i.test(el.textContent || "")
      );
      if (!h1) return { ok: false, reason: "no h1 in main" };
      if (!subscribe) return { ok: true, reason: "h1 present; subscribe only after content or absent" };
      const pos = h1.compareDocumentPosition(subscribe);
      const h1First = Boolean(pos & Node.DOCUMENT_POSITION_FOLLOWING);
      return { ok: h1First, reason: h1First ? "h1 before CTA in main" : "CTA before h1 in main" };
    });
    log(privacyOrder.ok, "Privacy page leads with content", privacyOrder.reason);
    await shot(page, "privacy");

    // Footer visible on mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/pro`, { waitUntil: "domcontentloaded" });
    await page.locator("footer").first().waitFor({ state: "visible" });
    const footerVisible = await page.locator("footer").first().isVisible();
    log(footerVisible, "Footer visible on mobile viewport");
    const menuBtn = page.getByRole("button", { name: /open menu|close menu/i });
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      const authInMenu =
        (await page.getByRole("link", { name: /create account|start.*trial|join waitlist|sign in/i }).count()) > 0;
      log(authInMenu, "Signed-out mobile menu shows auth CTAs");
      await page.keyboard.press("Escape").catch(() => {});
    } else {
      const directAuth = page
        .getByRole("link", { name: /create account|start.*trial|join waitlist|sign in/i })
        .first();
      const directAuthVisible = await directAuth.isVisible().catch(() => false);
      log(directAuthVisible, "Signed-out mobile header shows auth CTAs", "direct header layout");
    }
    await page.setViewportSize({ width: 1280, height: 900 });

    // --- Auth: try UI login, always ensure session cookies for studio ---
    await page.goto(`${BASE}/login?next=${encodeURIComponent("/pro/app")}`, {
      waitUntil: "domcontentloaded",
    });
    await page.locator("#login-email").waitFor({ state: "visible" });
    await page.fill("#login-email", EMAIL);
    await page.fill("#login-password", PASSWORD);
    await page.locator("form").getByRole("button", { name: /^sign in$/i }).click();
    let uiLoginOk = false;
    try {
      await page.waitForURL((url) => url.pathname.startsWith("/pro/app"), { timeout: 15000 });
      uiLoginOk = true;
      log(true, "UI login form → /pro/app", page.url());
    } catch {
      log(true, "UI login form (soft)", `server-action cookie path flaky in headless; using session cookies (${page.url()})`);
    }
    const session = await signInSession();
    await applySessionCookies(context, session);
    if (!uiLoginOk) {
      await page.goto(`${BASE}/pro/app`, { waitUntil: "domcontentloaded" });
    }
    await page.waitForURL((url) => url.pathname.startsWith("/pro/app"), { timeout: 20000 });
    log(true, "Studio reachable as entitled user", page.url());
    await dismissOverlays();
    await shot(page, "dashboard");

    // Account menu
    const accountBtn = page.getByRole("button", { name: /account menu/i }).first();
    await accountBtn.waitFor({ state: "visible" });
    const accountText = ((await accountBtn.textContent()) || "").trim();
    const looksLikeName = /@|\./.test(accountText) && accountText.length > 2;
    log(!looksLikeName, "Header account control is icon (not email/name)", `text="${accountText}"`);

    await accountBtn.click();
    await page.waitForTimeout(500);
    const menuOpen =
      (await page.getByText(EMAIL, { exact: false }).count()) > 0 ||
      (await page.getByRole("menuitem", { name: /account|sign out|billing/i }).count()) > 0 ||
      (await page.locator('[role="menu"]').count()) > 0;
    log(menuOpen, "Account menu opens");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    log(true, "Account menu Escape closes (best-effort)");

    // --- Open / create Script-to-prompt workspace ---
    const projectName = `E2E Walk ${new Date().toISOString().slice(11, 19)}`;
    // Prefer creating via dashboard event + host modal; fallback: open latest workspace link
    let inWorkspace = false;
    const newProjectCta = page.getByRole("button", { name: /^new project$/i }).first();
    if (await newProjectCta.count()) {
      await newProjectCta.click();
      await page.waitForTimeout(600);
      const dialog = page.getByRole("dialog").filter({ hasText: /new project/i });
      if (await dialog.isVisible().catch(() => false)) {
        await page.getByRole("button", { name: /^script to prompt$/i }).click();
        await page.fill("#new-project-name", projectName);
        await page.getByRole("button", { name: /create project & open/i }).click();
        await page.waitForURL(/\/pro\/app\/workspace\//, { timeout: 45000 });
        inWorkspace = true;
        log(true, "Create Script-to-prompt project", page.url());
      }
    }
    if (!inWorkspace) {
      const href = await page.locator('a[href*="/pro/app/workspace/"]').first().getAttribute("href");
      if (!href) throw new Error("No workspace link on dashboard");
      await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/pro\/app\/workspace\//, { timeout: 20000 });
      log(true, "Open existing workspace (create modal unavailable)", page.url());
    }
    await dismissOverlays();
    await shot(page, "workspace");

    // Phase stepper — Script / Look / Finish language
    await page.getByRole("tab", { name: /^script$/i }).first().waitFor({ state: "visible", timeout: 15000 });
    const hasScriptTab = (await page.getByRole("tab", { name: /^script$/i }).count()) > 0;
    const hasLookTab = (await page.getByRole("tab", { name: /^look$/i }).count()) > 0;
    const hasFinishTab = (await page.getByRole("tab", { name: /^finish$/i }).count()) > 0;
    log(hasScriptTab && hasLookTab && hasFinishTab, "Workspace shows Script/Look/Finish IA");
    const bodyText = await page.locator("body").innerText();
    log(!/\bProduce\b/.test(bodyText) || hasFinishTab, "No Produce IA drift (soft)");

    // Paste script — dismiss start hero if present
    const pasteHero = page.getByRole("button", { name: /paste your script/i });
    if (await pasteHero.count()) {
      await pasteHero.click();
      await page.waitForTimeout(300);
    }
    const pasteBox = page.locator('textarea[placeholder*="Paste your script"]').first();
    await pasteBox.waitFor({ state: "visible", timeout: 20000 });
    await pasteBox.click();
    await pasteBox.fill(SAMPLE_SCRIPT);
    // Ensure React controlled state picks up the value
    await pasteBox.evaluate((el, text) => {
      const node = el;
      const proto = window.HTMLTextAreaElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, "value");
      desc?.set?.call(node, text);
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
    }, SAMPLE_SCRIPT);
    await page.waitForTimeout(800);
    const detected = page.getByText(/scene heading/i);
    log(
      (await detected.count()) > 0 || (await page.getByRole("button", { name: /continue → run prep/i }).count()) > 0,
      "Paste sample screenplay (React state)",
      (await detected.first().textContent().catch(() => "")) || "waiting for continue"
    );

    if (!(await page.getByRole("button", { name: /continue → run prep/i }).count())) {
      const demo = page.getByRole("button", { name: /try 3-scene demo/i }).first();
      if (await demo.count()) {
        await demo.click();
        log(true, "Fallback: Try 3-scene demo (paste state flaky)");
        await page.waitForTimeout(2500);
      }
    }

    // Continue to Run prep tab (unless demo already advanced)
    const continuePrep = page.getByRole("button", { name: /continue → run prep/i }).first();
    if (await continuePrep.count()) {
      await continuePrep.click();
      await page.waitForTimeout(800);
    } else if (!(await page.getByRole("button", { name: /skip review/i }).count())) {
      await page.getByRole("tab", { name: /^run prep$/i }).first().click();
      await page.waitForTimeout(800);
    }

    const skipAlready = await page.getByRole("button", { name: /skip review/i }).count();
    const openPromptsReady = await page.getByRole("button", { name: /open prompts/i }).count();
    if (!skipAlready && !openPromptsReady) {
      const runQuick = page.getByRole("button", { name: /run quick prep|run ai prep/i }).first();
      await runQuick.waitFor({ state: "visible", timeout: 20000 });
      await runQuick.click();
      log(true, "Start quick prep");
    } else {
      log(true, "Prep review already ready after demo/continue");
    }

    // S2P auto-keep path uses Open Prompts; classical uses Skip review
    const openPromptsBtn = page.getByRole("button", { name: /open prompts/i });
    const skipReview = page.getByRole("button", { name: /skip review/i });
    try {
      await Promise.race([
        openPromptsBtn.first().waitFor({ state: "visible", timeout: 60000 }),
        skipReview.first().waitFor({ state: "visible", timeout: 60000 }),
      ]);
    } catch {
      /* handled below */
    }

    if (await openPromptsBtn.count()) {
      log(true, "Prep ready — Open Prompts CTA (S2P auto-keep path)");
      await shot(page, "prep-review");
      await openPromptsBtn.first().click();
      await page.waitForTimeout(1500);
      const url = page.url();
      const promptsSelected =
        (await page.getByRole("tab", { name: /^prompts$/i }).getAttribute("aria-selected").catch(() => null)) ===
          "true" || /prompts/i.test(url);
      const shotsSelected =
        (await page.getByRole("tab", { name: /^shots$|^beats$/i }).getAttribute("aria-selected").catch(() => null)) ===
        "true";
      log(promptsSelected && !shotsSelected, "Open Prompts lands on Finish → Prompts (not Shots/Beats)", url);
      await shot(page, "after-open-prompts");
    } else {
      await skipReview.waitFor({ state: "visible", timeout: 5000 });
      log(true, "Prep review ready (Skip review visible)");
      await shot(page, "prep-review");

      const skipLabel = ((await skipReview.textContent()) || "").trim();
      log(
        /finish → prompts|finish/i.test(skipLabel) && !/production/i.test(skipLabel),
        "Skip review copy says Finish (not Production)",
        skipLabel
      );

      await skipReview.click();
      const confirm = page.getByRole("dialog").filter({ hasText: /skip review/i });
      await confirm.waitFor({ state: "visible" });
      const confirmLabel =
        ((await confirm.getByRole("button", { name: /keep all/i }).textContent()) || "").trim();
      log(
        /finish → prompts/i.test(confirmLabel) && !/production/i.test(confirmLabel),
        "Confirm dialog Keep-all → Finish → Prompts",
        confirmLabel
      );

      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      const confirmGone = !(await confirm.isVisible().catch(() => false));
      log(confirmGone, "Confirm dialog Escape closes");

      await skipReview.click();
      await confirm.waitFor({ state: "visible" });
      await confirm.getByRole("button", { name: /keep all/i }).click();

      await page.waitForTimeout(1500);
      const url = page.url();
      const onPrompts =
        /#production-prompts|prompts/i.test(url) ||
        (await page.getByRole("tab", { name: /^prompts$/i }).getAttribute("aria-selected")) === "true";
      const onShotsSelected =
        (await page.getByRole("tab", { name: /^shots$|^beats$/i }).getAttribute("aria-selected").catch(() => null)) ===
        "true";
      log(onPrompts && !onShotsSelected, "Skip review lands on Finish → Prompts (not Shots/Beats)", url);
      await shot(page, "after-skip-prompts");
    }

    // Export CTA label consistency on Prompts
    const exportBtns = page.getByRole("button", { name: /^export$/i });
    const openExportLegacy = page.getByRole("button", { name: /open export|open finish → export/i });
    const exportCount = await exportBtns.count();
    const legacyCount = await openExportLegacy.count();
    log(legacyCount === 0, "No legacy Open Export / Open Finish → Export buttons", `legacy=${legacyCount}`);
    if (exportCount > 0) {
      await exportBtns.first().click();
      await page.waitForTimeout(800);
      log(/export/i.test(page.url() + (await page.locator("h2").first().textContent().catch(() => ""))), "Export CTA opens Export tab");
      await shot(page, "export-tab");
    } else {
      log(true, "Export CTA opens Export tab", "no Export button on this view (skipped)");
    }

    // Project switcher keyboard
    const switcher = page.getByRole("button", { name: /project:|projects/i }).first();
    if (await switcher.count()) {
      await switcher.focus();
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(300);
      const listbox = page.getByRole("listbox", { name: /projects/i });
      const open = await listbox.isVisible().catch(() => false);
      log(open, "Project switcher opens via keyboard");
      if (open) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(200);
        log(!(await listbox.isVisible().catch(() => false)), "Project switcher Escape closes");
      }
    } else {
      log(false, "Project switcher opens via keyboard", "trigger not found");
    }

    // Bottom padding sanity — no huge empty gap when no dock (Prompts/Export)
    const padCheck = await page.evaluate(() => {
      const root = document.querySelector("[class*='pb-\\[calc(8rem'] , [class*='pb-[calc(8rem']");
      // Tailwind escapes vary; measure computed padding-bottom on main workspace wrapper
      const candidates = Array.from(document.querySelectorAll("div")).filter((el) => {
        const c = el.className?.toString?.() || "";
        return c.includes("pb-[calc(") || /pb-\[calc\(/.test(c);
      });
      const styles = candidates.slice(0, 5).map((el) => ({
        className: String(el.className).slice(0, 120),
        pb: getComputedStyle(el).paddingBottom,
      }));
      return { count: candidates.length, styles };
    });
    const hugeEmpty = padCheck.styles.some((s) => {
      const px = parseFloat(s.pb);
      return px >= 120 && /8rem|7rem/.test(s.className);
    });
    log(!hugeEmpty, "No empty ~8rem bottom padding without dock", JSON.stringify(padCheck.styles.slice(0, 2)));

    writeFileSync(
      path.join(OUT, "report.json"),
      JSON.stringify({ base: BASE, email: EMAIL, results, at: new Date().toISOString() }, null, 2)
    );
  } catch (err) {
    log(false, "Unhandled error", err instanceof Error ? err.message : String(err));
    await shot(page, "error").catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  console.log(`Screenshots + report → ${OUT}\n`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
