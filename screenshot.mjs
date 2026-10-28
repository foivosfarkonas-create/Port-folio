// Takes a full-page screenshot of a URL.
// Usage: node screenshot.mjs http://localhost:3000 [label]
// Output: ./temporary screenshots/screenshot-N.png (or screenshot-N-label.png)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Puppeteer is installed outside the project, so we load it from its own folder
const require = createRequire("C:/Users/foivos/AppData/Local/Temp/puppeteer-test/package.json");
const puppeteer = require("puppeteer");

const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error("Usage: node screenshot.mjs <url> [label]");
  process.exit(1);
}

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, "temporary screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Find the next free number so earlier screenshots are never overwritten
const numbers = fs
  .readdirSync(OUT_DIR)
  .map((name) => /^screenshot-(\d+)/.exec(name))
  .filter(Boolean)
  .map((match) => Number(match[1]));
const next = numbers.length ? Math.max(...numbers) + 1 : 1;

const fileName = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outPath = path.join(OUT_DIR, fileName);

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
