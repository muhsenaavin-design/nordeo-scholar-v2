// Definitive asset check: HTTP failures + genuinely broken (complete but zero-size) images.
async (page) => {
  const origin = new URL(page.url()).origin;
  const routes = ['/', '/journals', '/journals/jurnalpengmas', '/author-guide', '/about', '/contact',
    '/publication-ethics', '/books', '/privacy-policy', '/terms-of-use',
    '/news', '/news/panduan', '/news/kirim', '/news/riset-terbuka-masa-depan-penerbitan',
    '/training', '/training/daftar', '/training/program/writing'];
  const failures = [];
  page.on('response', (r) => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url().replace(origin, '')}`); });
  const broken = [];
  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 600));
    });
    // Wait for every lazy image to settle.
    await page.evaluate(async () => {
      const imgs = [...document.images];
      await Promise.all(imgs.map((i) => i.complete ? null : new Promise((res) => { i.addEventListener('load', res, { once: true }); i.addEventListener('error', res, { once: true }); setTimeout(res, 2500); })));
    });
    const bad = await page.evaluate(() => [...document.images]
      .filter((i) => i.complete && !i.naturalWidth)
      .map((i) => `${(i.currentSrc || i.src).replace(location.origin, '')} alt="${i.alt}"`));
    if (bad.length) broken.push(`${route}: ${bad.join(' | ')}`);
  }
  return JSON.stringify({ httpFailures: [...new Set(failures)], genuinelyBroken: broken }, null, 1);
}
