#!/usr/bin/env node
/**
 * Generate 10 soft-launch invite codes + links.
 * Usage: node scripts/generate-pro-invite-codes.mjs [baseUrl]
 * Example: node scripts/generate-pro-invite-codes.mjs https://35mmai.com
 */
import { randomBytes } from "node:crypto";

const count = 10;
const base = (process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3001").replace(
  /\/$/,
  ""
);

const codes = Array.from({ length: count }, (_, i) => {
  const suffix = randomBytes(4).toString("hex");
  return `f${String(i + 1).padStart(2, "0")}-${suffix}`;
});

console.log("# Paste into .env.local / Vercel:");
console.log("PRO_INVITE_ONLY=1");
console.log(`PRO_INVITE_CODES=${codes.join(",")}`);
console.log("");
console.log("# Send one link per filmmaker:");
for (const code of codes) {
  console.log(`${base}/pro/invite/${code}`);
}
