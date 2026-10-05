const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const deckPath = process.argv[2];
  const outDir = process.argv[3] || path.join(path.dirname(deckPath), 'preview');
  const waitMs = parseInt(process.argv[4], 10) || 400;
  fs.mkdirSync(outDir, { recursive: true });
  const fullPath = path.resolve(deckPath);
  const fileUrl = `file:///${fullPath.replace(/\\/g, '/')}`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof Reveal !== 'undefined' && Reveal.isReady());
  await page.evaluate(() => Reveal.configure({ transition: 'none' }));

  const totalSlides = await page.evaluate(() => Reveal.getTotalSlides());
  console.log(`Found ${totalSlides} slides`);

  for (let i = 0; i < totalSlides; i++) {
    await page.evaluate((idx) => Reveal.slide(idx), i);
    await page.waitForTimeout(waitMs);
    const imgPath = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: imgPath, type: 'png' });
    console.log(`  ${imgPath}`);
  }

  await browser.close();
})();
