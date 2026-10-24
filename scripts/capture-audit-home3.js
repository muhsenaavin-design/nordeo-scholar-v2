// Capture home with reveals truly activated (bypass scroll-behavior: smooth).
async (page) => {
  const origin = new URL(page.url()).origin;
  const out = [];
  for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; });
      const step = Math.max(250, Math.round(window.innerHeight * 0.6));
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 140));
      }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.scrollTo(0, 0);
      await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
    });
    await page.waitForTimeout(1000);
    out.push(await page.evaluate(() => ({
      viewport: innerWidth,
      height: document.body.scrollHeight,
      hiddenReveals: [...document.querySelectorAll('[data-reveal]')].filter((node) => !node.classList.contains('is-visible')).length,
      totalReveals: document.querySelectorAll('[data-reveal]').length,
      loaded: [...document.images].filter((image) => image.naturalWidth > 0).length,
      totalImages: document.images.length,
      sections: [...document.querySelectorAll('main > section, main > div, main > article')].map((node) => ({
        cls: String(node.className).slice(0, 60),
        top: Math.round(node.getBoundingClientRect().top + window.scrollY),
        h: Math.round(node.getBoundingClientRect().height),
      })),
    })));
    await page.screenshot({ path: `output/playwright/audit3-home-${label}.png`, fullPage: true });
  }
  return JSON.stringify(out, null, 1);
}
