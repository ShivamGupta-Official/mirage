import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/home/pragati-meri-jaan/.gemini/antigravity-ide/brain/0f6a475e-fc29-4f97-a7b0-c55d19d78d90';

async function run() {
  console.log('Launching Chromium...');
  const browser = await puppeteer.launch({
    executablePath: '/snap/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=swiftshader'
    ]
  });

  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('[Browser Error]', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
    console.error('[Page Error]', err);
  });

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('mirage_preloader_seen', 'true');
  });

  await page.setViewport({ width: 1440, height: 900 });
  console.log('Navigating to http://localhost:3000/?debug=1...');
  await page.goto('http://localhost:3000/?debug=1', { waitUntil: 'networkidle0' });

  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 1: Page 1 — Project Hero with Woven Particles
  const page1Path = path.join(ARTIFACT_DIR, 'screenshot_page1_project_hero.png');
  await page.screenshot({ path: page1Path });
  console.log(`Saved Page 1 screenshot to ${page1Path}`);

  // Find the globe wrapper section
  const globeInfo = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section'));
    const heroSec = sections[0];
    const globeWrapper = document.querySelector('section[style*="vh"]');
    return {
      heroHeight: heroSec ? heroSec.offsetHeight : 900,
      globeWrapperTop: globeWrapper ? globeWrapper.offsetTop : 900,
      globeWrapperHeight: globeWrapper ? globeWrapper.offsetHeight : 4500,
    };
  });

  console.log('Layout info:', globeInfo);

  // Scroll to Page 2 (where globe wrapper starts: p = 0)
  await page.evaluate((y) => window.scrollTo(0, y), globeInfo.globeWrapperTop);
  await new Promise((r) => setTimeout(r, 1000));
  const page2P0 = path.join(ARTIFACT_DIR, 'screenshot_page2_globe_tip.png');
  await page.screenshot({ path: page2P0 });
  console.log(`Saved Page 2 (Globe tip) screenshot to ${page2P0}`);

  // Scroll to middle of globe animation (p = 0.55)
  const maxScroll = globeInfo.globeWrapperHeight - 900;
  const targetY = globeInfo.globeWrapperTop + 0.55 * maxScroll;
  await page.evaluate((y) => window.scrollTo(0, y), targetY);
  await new Promise((r) => setTimeout(r, 1000));
  const page2P55 = path.join(ARTIFACT_DIR, 'screenshot_page2_globe_centered.png');
  await page.screenshot({ path: page2P55 });
  console.log(`Saved Page 2 (Globe centered) screenshot to ${page2P55}`);

  // Scroll to final phase (p = 0.90) to show the Live Threat Locations Grid
  const targetY90 = globeInfo.globeWrapperTop + 0.90 * maxScroll;
  await page.evaluate((y) => window.scrollTo(0, y), targetY90);
  await new Promise((r) => setTimeout(r, 1000));
  const page2P90 = path.join(ARTIFACT_DIR, 'screenshot_page2_live_threat_locations.png');
  await page.screenshot({ path: page2P90 });
  console.log(`Saved Page 2 (Live Threat Locations) screenshot to ${page2P90}`);

  await browser.close();
  console.log('Total Console Errors:', consoleErrors.length);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
