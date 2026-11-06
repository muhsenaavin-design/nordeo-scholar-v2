// Strictly-visible tap-target audit: excludes hidden dropdown items and lazy offscreen content.
async (page) => {
  const origin = new URL(page.url()).origin;
  const routes = ['/', '/journals', '/about', '/contact', '/books',
    '/news', '/news/panduan', '/news/kirim', '/news/riset-terbuka-masa-depan-penerbitan',
    '/training', '/training/daftar', '/training/program/writing'];
  const out = [];
  for (const route of routes) {
    for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const m = await page.evaluate(() => {
        const style = getComputedStyle;
        const reallyVisible = (n) => {
          let cur = n;
          while (cur && cur.nodeType === 1) {
            const s = style(cur);
            if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return false;
            cur = cur.parentElement;
          }
          const b = n.getBoundingClientRect();
          return b.width > 0 && b.height > 0;
        };
        const nodes = [...document.querySelectorAll('a, button, input, select, textarea, [role="button"]')]
          .filter(reallyVisible)
          .map((n) => {
            const b = n.getBoundingClientRect();
            return {
              tag: n.tagName.toLowerCase(),
              type: n.getAttribute('type') || '',
              cls: (n.className || '').toString().split(' ').slice(0, 2).join('.'),
              h: Math.round(b.height), w: Math.round(b.width),
              // does the control have an associated label for a bigger hit area?
              labelled: !!(n.id && document.querySelector(`label[for="${CSS.escape(n.id)}"]`)) || !!n.closest('label'),
              text: (n.textContent || n.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 34),
            };
          });
        return {
          under44: nodes.filter((t) => t.h < 44),
          under40: nodes.filter((t) => t.h < 40 && !t.labelled),
          under24: nodes.filter((t) => t.h < 24 && !t.labelled),
        };
      });
      out.push({ route, viewport: label, ...m });
    }
  }
  const lines = [];
  for (const r of out) {
    lines.push(`${r.route} @ ${r.viewport}: <24=${r.under24.length} <40(nolabel)=${r.under40.length} <44=${r.under44.length}`);
    for (const t of r.under24) lines.push(`      ${t.h}px ${t.tag}${t.type ? '[' + t.type + ']' : ''}.${t.cls} "${t.text}"`);
    const seen = new Set();
    for (const t of r.under40.filter((x) => !r.under24.includes(x))) lines.push(`      ${t.h}px ${t.tag}${t.type ? '[' + t.type + ']' : ''}.${t.cls} "${t.text}"`);
  }
  return lines.join('\n');
}
