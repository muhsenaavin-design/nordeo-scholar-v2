// Baseline-compatible metrics: same selector set as the pre-redesign capture,
// so the before/after numbers are directly comparable.
async (page) => {
  const origin = new URL(page.url()).origin;
  const routes = [['home', '/'], ['journals', '/journals'], ['about', '/about'], ['author-guide', '/author-guide']];
  const out = [];
  for (const [name, route] of routes) {
    for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600);
      await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
      });
      const m = await page.evaluate(() => {
        const root = document.documentElement;
        // Identical to the pre-redesign baseline capture.
        const nodes = [...document.querySelectorAll('main p, main li, main dd, main dt, footer p, footer a')];
        const items = nodes.map((n) => ({
          size: parseFloat(getComputedStyle(n).fontSize),
          color: getComputedStyle(n).color,
          text: (n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 34),
        }));
        const distinct = (list) => [...new Map(list.map((i) => [i.size + '|' + i.color + '|' + i.text, i])).values()];
        const targets = [...document.querySelectorAll('a, button, [role="button"]')]
          .filter((n) => n.offsetParent !== null)
          .map((n) => Math.round(n.getBoundingClientRect().height));
        return {
          counted: items.length,
          under14: items.filter((i) => i.size < 14).length,
          under12: items.filter((i) => i.size < 12).length,
          under10_5: items.filter((i) => i.size < 10.5).length,
          smallest: Math.min(...items.map((i) => i.size)),
          worstSample: distinct(items.filter((i) => i.size <= 10.5)).slice(0, 6),
          sub12Sample: distinct(items.filter((i) => i.size < 12)).slice(0, 8),
          targetsUnder44: targets.filter((h) => h < 44).length,
          targetsUnder40: targets.filter((h) => h < 40).length,
          overflow: root.scrollWidth > root.clientWidth + 1,
          h1: document.querySelectorAll('h1').length,
          bodyHeight: document.body.scrollHeight,
        };
      });
      out.push({ name, viewport: label, ...m });
    }
  }
  return out.map((r) => [
    `${r.name}/${r.viewport}`,
    `under14=${r.under14}`,
    `under12=${r.under12}`,
    `under10.5=${r.under10_5}`,
    `smallest=${r.smallest}px`,
    `targets<44=${r.targetsUnder44}`,
    `targets<40=${r.targetsUnder40}`,
    `overflow=${r.overflow}`,
    `h1=${r.h1}`,
    `height=${r.bodyHeight}`,
  ].join(' ')).join(' || ');
}
