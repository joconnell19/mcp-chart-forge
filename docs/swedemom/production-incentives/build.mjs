// Renders proposal.html to PDF, checks every .page for clipped content,
// and (with --preview) writes preview-N.png per page.
// Run: node build.mjs [--preview]
import puppeteer from "puppeteer-core";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(dir, "proposal.html");
const PDF = path.join(dir, "Swedemom-Production-Bonus-Proposal.pdf");
// Chrome/Chromium path: CHROME_PATH env wins, else the first one that exists.
const CHROME = process.env.CHROME_PATH || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("No Chrome found; set CHROME_PATH");

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: process.platform === "linux" ? ["--no-sandbox"] : [] });
const page = await browser.newPage();
await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(SOURCE).href, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluateHandle("document.fonts.ready");

const report = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".page")).map((p, i) => {
    const c = p.querySelector(":scope > .content") || p;
    return { page: i + 1, over: c.scrollHeight - c.clientHeight, slack: c.clientHeight - Array.from(c.children).reduce((m, el) => Math.max(m, el.getBoundingClientRect().bottom), 0) + c.getBoundingClientRect().top };
  })
);
let clean = true;
for (const r of report) {
  if (r.over > 1) clean = false;
  console.log(`${r.over > 1 ? "X" : "ok"} page ${r.page}: ${r.over > 1 ? r.over + "px clipped" : Math.round(r.slack) + "px free"}`);
}

await page.pdf({ path: PDF, format: "letter", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
console.log("wrote " + PDF);

if (process.argv.includes("--preview")) {
  const out = path.join(dir, "preview");
  fs.mkdirSync(out, { recursive: true });
  const n = report.length;
  for (let i = 0; i < n; i++) {
    await page.evaluate((idx) => {
      document.querySelectorAll(".page").forEach((p, j) => (p.style.display = j === idx ? "" : "none"));
      window.scrollTo(0, 0);
    }, i);
    await page.screenshot({ path: path.join(out, `preview-${i + 1}.png`) });
  }
  console.log(`previews: ${n}`);
}
await browser.close();
process.exit(clean ? 0 : 1);
