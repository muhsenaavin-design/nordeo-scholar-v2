// Focused re-check after the refinement pass: overflow guards + mobile slice review.
async (page) => {
  const origin = new URL(page.url()).origin;
  const out = { checks: [], problems: [] };
  page.on('pageerror', (error) => out.problems.push(`pageerror: ${error.message}`));

  const routes = [['home', '/'], ['journals', '/journals'], ['about', '/about'], ['contact', '/contact']];
  for (const [name, route] of routes) {
    for (const [label, width] of [['desktop', 1440], ['mobile', 390]]) {
      await page.setViewportSize({ width, height: label === 'desktop' ? 1000 : 844 });
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const m = await page.evaluate(() => {
        const root = document.documentElement;
        const nodes = [...document.querySelectorAll('main p, main li, main dd, main dt, main a, main span, footer p, footer a')]
          .filter((n) => (n.textContent || '').trim() && !n.querySelector('p, li, a, span, div'));
        const tiny = nodes.filter((n) => parseFloat(getComputedStyle(n).fontSize) < 12)
          .map((n) => `${getComputedStyle(n).fontSize}px ${(n.textContent || '').trim().slice(0, 28)}`);
        const targets = [...document.querySelectorAll('a, button, input, [role="button"]')]
          .filter((n) => n.offsetParent !== null)
          .map((n) => Math.round(n.getBoundingClientRect().height));
        return {
          overflow: root.scrollWidth > root.clientWidth + 1,
          tinyCount: tiny.length,
          tiny: [...new Set(tiny)].slice(0, 6),
          shortTargets: targets.filter((h) => h < 40).length,
          bodyHeight: document.body.scrollHeight,
        };
      });
      out.checks.push({ name, viewport: label, ...m });
      if (m.overflow) out.problems.push(`OVERFLOW ${name}/${label}`);
    }
  }

  // Mobile slices for visual review.
  async function slices(name, route, offsets) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      const step = 500;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });
    let index = 0;
    for (const offset of offsets) {
      await page.evaluate((y) => window.scrollTo(0, y), offset);
      await page.waitForTimeout(350);
      await page.screenshot({ path: `output/playwright/redesign-${name}-390-slice${index}.png` });
      index += 1;
    }
  }
  await slices('home', '/', [760, 1900, 3400, 5200]);
  await slices('journals', '/journals', [560, 1500, 4200]);

  // Desktop inner page lead + mobile menu.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + '/about', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'output/playwright/redesign-about-lead-1440.png' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /menu/i }).click();
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'output/playwright/redesign-nav-full-390.png' });
  return JSON.stringify(out, null, 1);
}
