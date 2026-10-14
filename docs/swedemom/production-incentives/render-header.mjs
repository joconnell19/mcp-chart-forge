// Renders form-header.html to Swedemom-Survey-Header.png (1600x400, Google Forms header size).
import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const candidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];
const executablePath = candidates.find((p) => fs.existsSync(p));
const browser = await puppeteer.launch({ executablePath });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 400 });
await page.goto('file:///' + path.resolve('form-header.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
await page.screenshot({ path: 'Swedemom-Survey-Header.png' });
await browser.close();
console.log('ok');
