import { chromium } from 'playwright';

const BASE   = 'http://localhost:3000';
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: MOBILE,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' });
const page = await ctx.newPage();

// Silence console noise
page.on('console', () => {});
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));

async function go(url, name) {
  await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 20000 });
  await page.screenshot({ path: `./screenshots/m-${name}.png`, fullPage: false });
  console.log(`✓ ${name}`);
}

async function goScroll(url, name, scrollY = 600) {
  await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 20000 });
  await page.screenshot({ path: `./screenshots/m-${name}-top.png`, fullPage: false });
  await page.evaluate(y => window.scrollBy(0, y), scrollY);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `./screenshots/m-${name}-mid.png`, fullPage: false });
  console.log(`✓ ${name}-top + mid`);
}

// Gather real slugs
await page.goto(BASE + '/blog', { waitUntil: 'networkidle' });
const blogSlug = (await page.$$eval('a[href^="/blog/"]', els =>
  [...new Set(els.map(e => e.getAttribute('href')))].filter(h => h && h !== '/blog' && !h.endsWith('/blog'))
))[0];

await page.goto(BASE + '/garden', { waitUntil: 'networkidle' });
const gardenSlug = (await page.$$eval('a[href^="/garden/"]', els =>
  [...new Set(els.map(e => e.getAttribute('href')))].filter(h => h && h.split('/').length >= 4)
))[0];

await page.goto(BASE + '/projects', { waitUntil: 'networkidle' });
const projSlug = (await page.$$eval('a[href^="/projects/"]', els =>
  [...new Set(els.map(e => e.getAttribute('href')))].filter(h => h && h !== '/projects')
))[0];

console.log(`Slugs → blog:${blogSlug} garden:${gardenSlug} project:${projSlug}\n`);

import { mkdirSync } from 'fs';
mkdirSync('./screenshots', { recursive: true });

await go('/', 'home');
await go('/blog', 'blog-index');
if (blogSlug)    await goScroll(blogSlug,    'blog-post');
await go('/garden', 'garden-index');
if (gardenSlug)  await goScroll(gardenSlug,  'garden-note');
await go('/projects', 'projects-index');
if (projSlug)    await goScroll(projSlug,    'project-post');

await browser.close();
console.log('\nDone. Screenshots in ./screenshots/');
