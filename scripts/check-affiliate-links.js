const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "app", "data.ts");
const text = fs.readFileSync(dataPath, "utf8");

const entryRegex = /\{\s*rank:\s*(\d+),[\s\S]*?name:\s*"([^"]+)"[\s\S]*?link:\s*"([^"]+)"[\s\S]*?affiliateLink:\s*"([^"]*)"[\s\S]*?\},/g;

const rows = [];
let match;
while ((match = entryRegex.exec(text)) !== null) {
  rows.push({
    rank: Number(match[1]),
    name: match[2],
    link: match[3],
    affiliateLink: match[4].trim(),
  });
}

if (rows.length === 0) {
  console.log("No tools with affiliateLink fields found.");
  process.exit(0);
}

const missing = rows.filter((r) => !r.affiliateLink);
const configured = rows.filter((r) => !!r.affiliateLink);

console.log(`Affiliate links configured: ${configured.length}`);
console.log(`Affiliate links missing: ${missing.length}`);

if (missing.length > 0) {
  console.log("\nTools missing affiliate links:");
  for (const tool of missing.sort((a, b) => a.rank - b.rank)) {
    console.log(`- [${tool.rank}] ${tool.name} (${tool.link})`);
  }
}
