/**
 * PRO workspace smoke tests (no browser, no Supabase).
 * Run: node scripts/smoke-pro-workspace.mjs
 * Requires: npm run build first (uses Next compiled output is NOT used — uses tsx).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run() {
  const r = spawnSync(
    "npx",
    ["tsx", path.join(root, "scripts/smoke-pro-workspace.ts")],
    { cwd: root, stdio: "inherit", env: process.env }
  );
  process.exit(r.status ?? 1);
}

run();
