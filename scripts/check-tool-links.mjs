/**
 * Validates catalog URLs the same way the app does (see app/page.tsx toAbsoluteToolUrl + getToolHref).
 * Run: node scripts/check-tool-links.mjs
 * Optional: node scripts/check-tool-links.mjs --fetch  (HEAD request; needs network)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toAbsoluteToolUrl(raw) {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

function effectiveHref(link, affiliateLink) {
  return (
    toAbsoluteToolUrl(affiliateLink) ??
    toAbsoluteToolUrl(link) ??
    null
  );
}

const dataPath = path.join(__dirname, "..", "app", "data.ts");
const text = fs.readFileSync(dataPath, "utf8");
const start = text.indexOf("export const allTools = [");
const end = text.indexOf("\n];", start);
if (start === -1 || end === -1) {
  console.error("Could not find allTools array in app/data.ts");
  process.exit(1);
}
const body = text.slice(start, end);

const toolRe =
  /\{\s*rank:\s*(\d+),\s*\n\s*name:\s*"([^"]+)"[\s\S]*?\n\s*link:\s*"([^"]+)"([\s\S]*?)\n\s*\},/g;

const tools = [];
let m;
while ((m = toolRe.exec(body)) !== null) {
  const [, rank, name, link, tail] = m;
  const multilineAff = tail.match(/affiliateLink:\s*\n\s*"([^"]*)"/);
  const inlineAff = tail.match(/affiliateLink:\s*"([^"]*)"/);
  const affiliateLink = multilineAff?.[1] ?? inlineAff?.[1] ?? undefined;
  const href = effectiveHref(link, affiliateLink);
  tools.push({
    rank: Number(rank),
    name,
    link,
    affiliateLink: affiliateLink ?? "",
    href,
    ok: Boolean(href),
  });
}

tools.sort((a, b) => a.rank - b.rank);

const bad = tools.filter((t) => !t.ok);
console.log(`Tools parsed: ${tools.length}`);
if (bad.length) {
  console.error("\nInvalid or unresolvable URLs (would become \"#\" in UI):");
  for (const t of bad) {
    console.error(`  [${t.rank}] ${t.name} link="${t.link}" affiliate="${t.affiliateLink}"`);
  }
  process.exit(1);
}

console.log("All catalog link + affiliateLink values resolve to absolute https URLs.");

const doFetch = process.argv.includes("--fetch");
if (!doFetch) {
  console.log("Tip: run with --fetch to HEAD-check each resolved URL (slower; some hosts block HEAD).");
  process.exit(0);
}

async function headCheck(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": "35mm-catalog-link-check/1.0" },
    });
    clearTimeout(t);
    return { url, status: res.status, ok: res.ok || res.status === 405 || res.status === 403 };
  } catch (e) {
    clearTimeout(t);
    return { url, error: e.cause?.message || e.message, ok: false };
  }
}

const unique = [...new Set(tools.map((t) => t.href))];
console.log(`\nHEAD-checking ${unique.length} unique URLs...\n`);
const results = [];
for (const url of unique) {
  results.push(await headCheck(url));
}
const failed = results.filter((r) => !r.ok);
for (const r of results) {
  if (r.ok) console.log(`OK ${r.status ?? "?"} ${r.url}`);
  else console.log(`FAIL ${r.url} ${r.error || `HTTP ${r.status}`}`);
}
if (failed.length) {
  console.error(`\n${failed.length} URL(s) failed HEAD check (may still work in browser).`);
  process.exit(2);
}
console.log("\nAll HEAD checks passed or returned acceptable status.");
