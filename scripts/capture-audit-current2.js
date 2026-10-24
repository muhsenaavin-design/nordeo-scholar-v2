// Re-capture current state with scroll-triggered reveals activated and images decoded.
async (page) => {
  const origin = new URL(page.url()).origin;
  const routes = [
    ['home', '/'],
    ['journals', '/journals'],
    ['pengmas', '/journals/jurnalpengmas'],
    ['author-guide', '/author-guide'],
    ['books', '/books'],
    ['news', '/news'],
    ['services', '/services'],
    ['about', '/about'],
    ['contact', '/contact'],
    ['publication-ethics', '/publication-ethics'],
    ['privacy-policy', '/privacy-policy'],
    ['terms-of-use', '/terms-of-use'],
  ];
  const summary = [];
  for (const [name, route] of routes) {
    for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; });
        const step = Math.max(280, Math.round(window.innerHeight * 0.7));
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
      });
      await page.waitForTimeout(900);
      const info = await page.evaluate(() => {
        const hidden = [...document.querySelectorAll('[data-reveal]')].filter((node) => !node.classList.contains('is-visible'));
        return {
          route: location.pathname,
          hiddenReveals: hidden.length,
          height: document.body.scrollHeight,
          imagesLoaded: [...document.images].filter((image) => image.naturalWidth > 0).length,
          imagesTotal: document.images.length,
        };
      });
      summary.push({ name, label, ...info });
      await page.screenshot({ path: `output/playwright/audit2-${name}-${label}.png`, fullPage: true });
      if (label === 'desktop' || name === 'journals') {
        const sections = await page.evaluate(() => [...document.querySelectorAll('main > section, main > div, main > article, footer')]
          .map((node, index) => ({ index, tag: node.tagName, cls: node.className, top: Math.round(node.getBoundingClientRect().top + window.scrollY), h: Math.round(node.getBoundingClientRect().height) })));
        summary[summary.length - 1].sections = sections;
      }
    }
  }
  return JSON.stringify(summary, null, 1);
}
