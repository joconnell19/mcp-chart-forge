const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const deckPath = process.argv[2] || 'decks/swedemom/2026-03-31-board-meeting-q1/deck.html';
  const outputPdf = process.argv[3] || deckPath.replace('.html', '.pdf');
  const fullPath = path.resolve(deckPath);
  const fileUrl = `file:///${fullPath.replace(/\\/g, '/')}`;

  console.log(`Opening: ${fileUrl}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Wait for Reveal to initialize
  await page.waitForFunction(() => typeof Reveal !== 'undefined' && Reveal.isReady());

  // Get total slide count
  const totalSlides = await page.evaluate(() => Reveal.getTotalSlides());
  console.log(`Found ${totalSlides} slides`);

  const screenshotPaths = [];

  for (let i = 0; i < totalSlides; i++) {
    await page.evaluate((idx) => Reveal.slide(idx), i);
    await page.waitForTimeout(500); // let animations/charts render

    const imgPath = path.resolve(`_slide_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: imgPath, type: 'png' });
    screenshotPaths.push(imgPath);
    console.log(`  Captured slide ${i + 1}/${totalSlides}`);
  }

  await browser.close();

  // Combine PNGs into PDF using built-in sharp or canvas
  // Use a simple approach: create an HTML file with all images and print to PDF
  const imagesHtml = screenshotPaths.map(p =>
    `<div style="page-break-after:always;margin:0;padding:0;"><img src="file:///${p.replace(/\\/g, '/')}" style="width:100%;height:100%;object-fit:contain;display:block;"></div>`
  ).join('\n');

  const tempHtml = path.resolve('_export_temp.html');
  fs.writeFileSync(tempHtml, `<!DOCTYPE html><html><head><style>@page{size:1920px 1080px;margin:0;}body{margin:0;padding:0;}div{width:1920px;height:1080px;overflow:hidden;}</style></head><body>${imagesHtml}</body></html>`);

  const browser2 = await chromium.launch();
  const page2 = await browser2.newPage();
  await page2.goto(`file:///${tempHtml.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
  await page2.pdf({
    path: path.resolve(outputPdf),
    width: '1920px',
    height: '1080px',
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    printBackground: true,
  });
  await browser2.close();

  // Cleanup temp files
  screenshotPaths.forEach(p => fs.unlinkSync(p));
  fs.unlinkSync(tempHtml);

  console.log(`\nPDF saved to: ${path.resolve(outputPdf)}`);
})();
