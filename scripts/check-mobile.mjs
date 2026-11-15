// Design specification check: every page displays correctly at 375 px (no horizontal scrolling).
// Builds nothing itself: run `npm run build` first (with VITE_ADMIN_PATH set to "admin"), then
// `npm run check:mobile`. It serves dist/ with `vite preview`, visits every public route it can
// reach from the menus and links, plus every dashboard menu in demo mode, and fails when any page
// is wider than the screen. Use BASE_URL=https://… to check a deployed site instead.
import { chromium } from 'playwright';
import { preview } from 'vite';

const WIDTH = 375;
const ADMIN = process.env.ADMIN_PATH || '/admin';
const ADMIN_MENUS = ['', 'pages', 'pagetexts', 'journals', 'ecosystems', 'profile', 'contact', 'navigation', 'media', 'news', 'stories', 'comments',
  'academy', 'registrations', 'promo', 'partnership', 'subscribers', 'users', 'site'];
const SEEDS = ['/', '/about', '/founder', '/journals', '/books', '/contact', '/news/', '/training/', '/author-guide', '/publication-ethics', '/privacy-policy', '/terms-of-use'];

let server = null;
let base = process.env.BASE_URL;
if (!base) {
  server = await preview({ preview: { port: 4179, strictPort: true } });
  base = 'http://localhost:4179';
}

const browser = await chromium.launch(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {});
const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 812 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
const results = [];

async function check(path, demo = false) {
  const page = await ctx.newPage();
  if (demo) await page.addInitScript(() => { try { sessionStorage.setItem('nordeo-admin-demo', '1'); } catch { /* ignore */ } });
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
  }));
  results.push({ path, overflow: info.overflow });
  await page.close();
  return info.links;
}

const seen = new Set();
const queue = [...SEEDS];
while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const links = await check(path);
  for (const href of links) {
    if (!href || !href.startsWith('/') || href.startsWith('//') || href.startsWith(ADMIN)) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean || seen.has(clean) || queue.includes(clean) || /\.[a-z0-9]+$/i.test(clean)) continue;
    queue.push(clean);
  }
}
for (const menu of ADMIN_MENUS) await check(menu ? `${ADMIN}/${menu}` : ADMIN, true);

await browser.close();
if (server) await new Promise((resolve) => server.httpServer.close(resolve));

const failed = results.filter((r) => r.overflow > 0);
for (const r of results) console.log(`${r.overflow > 0 ? 'FAIL' : 'ok  '} ${r.path}${r.overflow > 0 ? ` (${r.overflow}px too wide)` : ''}`);
console.log(`\n${results.length - failed.length} of ${results.length} pages fit ${WIDTH} px.`);
process.exit(failed.length ? 1 : 0);
