// Computed contrast audit: every visible text node vs its effective background.
// Semi-transparent backgrounds are composited down to the first opaque ancestor.
async (page) => {
  const origin = new URL(page.url()).origin;
  const routes = ['/', '/journals', '/journals/jurnalpengmas', '/author-guide', '/about', '/contact',
    '/publication-ethics', '/books', '/privacy-policy', '/terms-of-use',
    '/news', '/news/panduan', '/news/kirim', '/news/riset-terbuka-masa-depan-penerbitan',
    '/training', '/training/daftar', '/training/program/writing'];
  const findings = [];
  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const bad = await page.evaluate(() => {
      const parse = (c) => { const m = c.match(/[\d.]+/g); return m ? { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] } : null; };
      const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
      const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
      const WHITE = { r: 255, g: 255, b: 255, a: 1 };
      const effectiveBg = (node) => {
        const stack = [];
        let cur = node;
        let opaque = null;
        while (cur && cur.nodeType === 1) {
          const s = getComputedStyle(cur);
          if (s.backgroundImage && s.backgroundImage !== 'none') return null; // image/gradient: not measurable this way
          const c = parse(s.backgroundColor);
          if (c && c.a > 0) {
            if (c.a >= 1) { opaque = c; break; }
            stack.push(c);
          }
          cur = cur.parentElement;
        }
        let bg = opaque || WHITE;
        for (let i = stack.length - 1; i >= 0; i -= 1) bg = blend(stack[i], bg);
        return bg;
      };
      const isVisible = (n) => { let c = n; while (c && c.nodeType === 1) { const s = getComputedStyle(c); if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return false; c = c.parentElement; } const b = n.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
      const out = [];
      for (const n of document.querySelectorAll('body *')) {
        if (!isVisible(n)) continue;
        if (![...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) continue;
        const s = getComputedStyle(n);
        const fg = parse(s.color);
        if (!fg) continue;
        const bg = effectiveBg(n);
        if (!bg) continue;
        const fgc = fg.a < 1 ? blend(fg, bg) : fg;
        const r = ratio(fgc, bg);
        const px = parseFloat(s.fontSize);
        const weight = parseInt(s.fontWeight, 10) || 400;
        const large = px >= 24 || (px >= 18.66 && weight >= 700);
        const need = large ? 3 : 4.5;
        const decorative = !!n.closest('[aria-hidden="true"]');
        if (r < need) out.push({ text: (n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 34), cls: (n.className || '').toString().split(' ')[0], color: s.color, bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`, px, weight, ratio: +r.toFixed(2), need, decorative });
      }
      return out;
    });
    if (bad.length) findings.push({ route, bad });
  }
  if (!findings.length) return 'NO CONTRAST FAILURES';
  const lines = [];
  let real = 0;
  for (const f of findings) {
    const hard = f.bad.filter((b) => !b.decorative);
    real += hard.length;
    lines.push(`--- ${f.route} (${hard.length} real, ${f.bad.length - hard.length} aria-hidden) ---`);
    for (const b of f.bad.slice(0, 8)) lines.push(`    ${b.ratio} (need ${b.need}) ${b.px}px/${b.weight} ${b.color} on ${b.bg} .${b.cls}${b.decorative ? ' [aria-hidden]' : ''} "${b.text}"`);
  }
  lines.push(`TOTAL REAL FAILURES: ${real}`);
  return lines.join('\n');
}