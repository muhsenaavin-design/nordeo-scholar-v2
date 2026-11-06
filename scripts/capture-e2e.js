// End-to-end capture across all current routes (main + news + training microsites).
async (page) => {
  const origin = new URL(page.url()).origin;
  const routes = [
    ['home', '/'],
    ['journals', '/journals'],
    ['pengmas', '/journals/jurnalpengmas'],
    ['author-guide', '/author-guide'],
    ['about', '/about'],
    ['contact', '/contact'],
    ['publication-ethics', '/publication-ethics'],
    ['books', '/books'],
    ['privacy-policy', '/privacy-policy'],
    ['terms-of-use', '/terms-of-use'],
    ['news-home', '/news'],
    ['news-guide', '/news/panduan'],
    ['news-submit', '/news/kirim'],
    ['news-article', '/news/riset-terbuka-masa-depan-penerbitan'],
    ['training-home', '/training'],
    ['training-register', '/training/daftar'],
    ['training-program', '/training/program/writing'],
  ];
  const out = [];
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console ${m.text().slice(0, 120)}`); });
  page.on('pageerror', (e) => problems.push(`pageerror ${e.message.slice(0, 120)}`));

  for (const [name, route] of routes) {
    for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(350);
      await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
      });
      const m = await page.evaluate(() => {
        const root = document.documentElement;
        const style = getComputedStyle;
        const all = [...document.querySelectorAll('body *')];
        const visible = all.filter((n) => n.offsetParent !== null || style(n).position === 'fixed');
        // Times New Roman = nothing styled this element.
        const unstyled = visible.filter((n) => /Times New Roman/i.test(style(n).fontFamily) && !['SCRIPT', 'STYLE'].includes(n.tagName));
        const textNodes = [...document.querySelectorAll('main p, main li, main dd, main dt, main a, main span, footer p, footer a, section p, section li, section a, section span')]
          .filter((n) => (n.textContent || '').trim() && !n.querySelector('p, li, a, span, div'));
        const tiny = textNodes.filter((n) => parseFloat(style(n).fontSize) < 12);
        const targets = [...document.querySelectorAll('a, button, input, select, [role="button"]')]
          .filter((n) => n.offsetParent !== null)
          .map((n) => Math.round(n.getBoundingClientRect().height));
        return {
          overflow: root.scrollWidth > root.clientWidth + 1,
          bodyHeight: document.body.scrollHeight,
          h1: document.querySelectorAll('h1').length,
          unstyledCount: unstyled.length,
          unstyledSample: [...new Set(unstyled.map((n) => n.tagName.toLowerCase() + '.' + (n.className || '').toString().split(' ')[0]))].slice(0, 6),
          tinyCount: tiny.length,
          tinySample: [...new Set(tiny.map((n) => `${parseFloat(style(n).fontSize)}px ${(n.textContent || '').trim().slice(0, 24)}`))].slice(0, 5),
          targetsUnder40: targets.filter((h) => h < 40).length,
          targetsUnder44: targets.filter((h) => h < 44).length,
          brokenImages: [...document.images].filter((i) => !i.naturalWidth).length,
        };
      });
      out.push({ name, viewport: label, ...m });
      if (m.overflow) problems.push(`OVERFLOW ${name}/${label}`);
      if (m.unstyledCount > 3) problems.push(`UNSTYLED ${name}/${label} x${m.unstyledCount}`);
      if (m.brokenImages) problems.push(`BROKEN-IMG ${name}/${label} x${m.brokenImages}`);
      await page.screenshot({ path: `output/playwright/e2e-${name}-${label}.png`, fullPage: true });
    }
  }

  const lines = out.map((r) => [
    `${r.name}/${r.viewport}`,
    `unstyled=${r.unstyledCount}${r.unstyledCount ? '(' + r.unstyledSample.join(',') + ')' : ''}`,
    `tiny=${r.tinyCount}`,
    `t<44=${r.targetsUnder44}`,
    `t<40=${r.targetsUnder40}`,
    `ovf=${r.overflow}`,
    `h1=${r.h1}`,
    `img=${r.brokenImages}`,
    `h=${r.bodyHeight}`,
  ].join(' '));
  return { lines, problems, tiny: out.filter((r) => r.tinyCount).map((r) => ({ r: `${r.name}/${r.viewport}`, s: r.tinySample })) };
}
