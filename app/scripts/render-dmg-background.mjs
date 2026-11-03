// Renders dmg/background.svg to dmg/background.png (660x470) and dmg/background@2x.png (1320x940).
// Uses the Playwright install from the website: cd web && npm ci, then: node app/scripts/render-dmg-background.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dmg = join(here, "..", "dmg");
const require = createRequire(join(here, "..", "..", "web", "package.json"));
const { chromium } = require("playwright");

const svg = readFileSync(join(dmg, "background.svg"), "utf8");
const browser = await chromium.launch();
for (const scale of [1, 2]) {
  const page = await browser.newPage({ viewport: { width: 660, height: 470 }, deviceScaleFactor: scale });
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  const out = join(dmg, scale === 1 ? "background.png" : "background@2x.png");
  await page.locator("svg").screenshot({ path: out });
  console.log("wrote", out);
}
await browser.close();
