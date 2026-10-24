// Verify the redesign: capture every route at 1440 + 390 and measure the
// accessibility/layout regressions the audit flagged, plus the new baseline.
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
  const report = { routes: [], problems: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') report.problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => report.problems.push(`pageerror: ${error.message}`));

  async function triggerReveals() {
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      const step = Math.round(window.innerHeight * 0.7);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolve) => setTimeout(resolve, 250));
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
  }

  for (const [name, route] of routes) {
    for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      await triggerReveals();
      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const style = getComputedStyle;
        const textNodes = [...document.querySelectorAll('main p, main li, main dd, main dt, main a, main span, footer p, footer a')]
          .filter((node) => (node.textContent || '').trim() && !node.querySelector('p, li, a, span, div'));
        const sizes = textNodes.map((node) => ({
          size: parseFloat(style(node).fontSize),
          color: style(node).color,
          text: (node.textContent || '').trim().slice(0, 50),
        }));
        const small = sizes.filter((item) => item.size < 12);
        const mid = sizes.filter((item) => item.size < 14);
        const targets = [...document.querySelectorAll('a, button, input, [role="button"]')]
          .filter((node) => node.offsetParent !== null)
          .map((node) => {
            const box = node.getBoundingClientRect();
            return { text: (node.textContent || node.getAttribute('aria-label') || '').trim().slice(0, 40), w: Math.round(box.width), h: Math.round(box.height) };
          });
        const smallTargets = targets.filter((target) => target.h < 40);
        const images = [...document.images];
        const revealed = document.querySelectorAll('[data-reveal]').length;
        const revealedVisible = document.querySelectorAll('[data-reveal].is-visible').length;
        const bodyStyles = style(document.body);
        const heroHeading = document.querySelector('.hero h1, .inner-page h1');
        return {
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
          overflow: root.scrollWidth > root.clientWidth + 1,
          bodyHeight: document.body.scrollHeight,
          h1Count: document.querySelectorAll('h1').length,
          headings: [...document.querySelectorAll('h1,h2,h3,h4')].map((n) => n.tagName).join(','),
          tinyTextCount: small.length,
          tinyText: small.slice(0, 10),
          under14Count: mid.length,
          smallTargetCount: smallTargets.length,
          smallTargets: smallTargets.slice(0, 10),
          brokenImages: images.filter((image) => !image.naturalWidth).map((image) => image.currentSrc || image.src),
          revealing: `${revealedVisible}/${revealed}`,
          fg: bodyStyles.color,
          bg: bodyStyles.backgroundColor,
          font: bodyStyles.fontFamily.split(',')[0],
          h1Color: heroHeading ? style(heroHeading).color : null,
          h1Font: heroHeading ? style(heroHeading).fontFamily.split(',')[0] : null,
        };
      });
      report.routes.push({ name, route, viewport: label, width, ...metrics });
      await page.screenshot({ path: `output/playwright/redesign-${name}-${label}.png`, fullPage: true });
      if (metrics.overflow) report.problems.push(`overflow: ${name}/${label} ${metrics.scrollWidth}>${metrics.clientWidth}`);
      if (metrics.tinyTextCount) report.problems.push(`tiny-text: ${name}/${label} x${metrics.tinyTextCount}`);
      if (metrics.brokenImages.length) report.problems.push(`broken-img: ${name}/${label} ${metrics.brokenImages.join(' ')}`);
    }
  }

  // Detail shots for visual review.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'output/playwright/redesign-hero-1440.png' });
  await page.screenshot({ path: 'output/playwright/redesign-header-1440.png', clip: { x: 0, y: 0, width: 1440, height: 200 } });
  await page.goto(origin + '/about', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'output/playwright/redesign-about-top-1440.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /menu/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'output/playwright/redesign-nav-open-390.png' });
  return JSON.stringify(report, null, 1);
}
