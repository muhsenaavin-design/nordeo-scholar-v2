// Capture current-state screenshots + baseline metrics for the UI/UX audit.
// Run inside a Playwright CLI session already open on the dev server origin.
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
  const report = { routes: [], consoleErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => report.consoleErrors.push(`pageerror: ${error.message}`));

  for (const [name, route] of routes) {
    for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const textNodes = [...document.querySelectorAll('main p, main li, main dd, main dt, footer p, footer a')];
        const computed = textNodes.map((node) => ({
          tag: node.tagName.toLowerCase(),
          text: (node.textContent || '').trim().slice(0, 60),
          size: parseFloat(getComputedStyle(node).fontSize),
          lineHeight: parseFloat(getComputedStyle(node).lineHeight),
          color: getComputedStyle(node).color,
        }));
        const smallText = computed.filter((item) => item.size < 14);
        const tinyText = computed.filter((item) => item.size < 12);
        const tapTargets = [...document.querySelectorAll('a, button, [role="button"]')]
          .filter((node) => node.offsetParent !== null)
          .map((node) => {
            const box = node.getBoundingClientRect();
            return {
              text: (node.textContent || node.getAttribute('aria-label') || '').trim().slice(0, 40),
              w: Math.round(box.width),
              h: Math.round(box.height),
            };
          });
        const smallTargets = tapTargets.filter((target) => target.h < 44 || target.w < 44);
        const images = [...document.images].map((image) => ({
          src: image.currentSrc || image.src,
          natural: image.naturalWidth,
          rendered: Math.round(image.getBoundingClientRect().width),
        }));
        const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((node) => ({ tag: node.tagName, text: (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70) }));
        return {
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
          bodyHeight: document.body.scrollHeight,
          h1Count: document.querySelectorAll('h1').length,
          headings,
          smallTextCount: smallText.length,
          tinyTextCount: tinyText.length,
          tinyText: tinyText.slice(0, 12),
          smallTargetCount: smallTargets.length,
          smallTargets: smallTargets.slice(0, 14),
          brokenImages: images.filter((image) => !image.natural),
          underSizedImages: images.filter((image) => image.natural && image.natural < image.rendered * 1.4).slice(0, 5),
          horizontalOverflow: root.scrollWidth > root.clientWidth + 1,
          title: document.title,
        };
      });
      report.routes.push({ name, route, viewport: label, width, ...metrics });
      await page.screenshot({
        path: `output/playwright/audit-current-${name}-${label}.png`,
        fullPage: true,
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  return JSON.stringify(report, null, 2);
}
