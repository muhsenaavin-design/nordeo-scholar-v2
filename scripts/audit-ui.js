// UI/UX audit run in the browser console of the dev server (127.0.0.1:5177):
// paste the file, then `await auditRoutes()`. Loads each route in a 1440px and a 390px
// iframe, scrolls it to trigger reveals, and reports measurable problems.
const ROUTES = ['/', '/journals', '/about', '/contact', '/author-guide', '/publication-ethics', '/books', '/privacy-policy', '/news/', '/news/panduan', '/news/kirim', '/news/riset-terbuka-masa-depan-penerbitan', '/training/', '/training/program/seminar-reviewer', '/training/daftar', '/missing-page'];

function luminance(rgb) {
  const [r, g, b] = rgb.map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function parse(color) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 };
}
function background(el, win) {
  let layers = [];
  for (let n = el; n; n = n.parentElement) {
    const cs = win.getComputedStyle(n);
    if (cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('linear-gradient(180deg, rgb(244')) return null; // image/gradient: skip
    const c = parse(cs.backgroundColor);
    if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
  }
  let out = [255, 255, 255];
  for (const layer of layers.reverse()) out = out.map((v, i) => v * (1 - layer.a) + layer.rgb[i] * layer.a);
  return out;
}

function auditDoc(doc, win, width) {
  const issues = [];
  const vw = win.innerWidth;
  if (doc.documentElement.scrollWidth > vw + 1) issues.push(`overflow-x ${doc.documentElement.scrollWidth}>${vw}`);
  const h1 = doc.querySelectorAll('h1').length;
  if (h1 !== 1) issues.push(`h1 count ${h1}`);
  let last = 0;
  doc.querySelectorAll('main h1, main h2, main h3, main h4').forEach(h => {
    const level = Number(h.tagName[1]);
    if (last && level > last + 1 && h.offsetParent) issues.push(`heading skip h${last}->h${level} "${h.textContent.trim().slice(0, 40)}"`);
    last = level;
  });
  doc.querySelectorAll('img').forEach(img => { if (!img.hasAttribute('alt')) issues.push(`img no alt ${img.src.slice(-40)}`); if (img.complete && img.naturalWidth === 0) issues.push(`img broken ${img.src.slice(-40)}`); });
  doc.querySelectorAll('[data-reveal]').forEach(n => { if (n.offsetParent && win.getComputedStyle(n).opacity === '0') issues.push(`stuck reveal ${n.className}`); });
  const small = new Set(); const targets = new Set(); const contrast = new Set();
  doc.querySelectorAll('a, button, input, select, textarea, summary').forEach(el => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || win.getComputedStyle(el).visibility === 'hidden' || el.closest('[inert]')) return;
    if (el.type === 'checkbox' || el.type === 'radio') return;
    if (el.classList.contains('sr-only') || r.width < 2) return;
    const inline = el.tagName === 'A' && el.closest('p, li, dd') && !el.className;
    if (!inline && r.height < 40) targets.add(`${el.tagName.toLowerCase()}.${el.className || ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.height)}px`);
  });
  doc.querySelectorAll('main *, header *, footer *').forEach(el => {
    if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    if (!el.offsetParent && win.getComputedStyle(el).position !== 'fixed') return;
    if (el.closest('.sr-only, [aria-hidden="true"], [inert]')) return;
    const cs = win.getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    if (size < 12) small.add(`${el.tagName.toLowerCase()}.${el.className} ${size}px "${el.textContent.trim().slice(0, 20)}"`);
    const fg = parse(cs.color); const bg = background(el, win);
    if (!fg || !bg || Number(cs.opacity) < 1) return;
    const mixed = fg.rgb.map((v, i) => v * fg.a + bg[i] * (1 - fg.a));
    const L1 = luminance(mixed), L2 = luminance(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 600);
    if (ratio < (large ? 3 : 4.5)) contrast.add(`${el.tagName.toLowerCase()}.${el.className} ${ratio.toFixed(2)} "${el.textContent.trim().slice(0, 24)}"`);
  });
  return { width, issues, small: [...small].slice(0, 8), targets: [...targets].slice(0, 12), contrast: [...contrast].slice(0, 12) };
}

async function loadAndAudit(route, width) {
  const frame = document.createElement('iframe');
  frame.width = width; frame.height = 900; frame.style.border = '0';
  document.body.appendChild(frame);
  const errors = [];
  await new Promise(resolve => { frame.onload = resolve; frame.src = route; });
  frame.contentWindow.addEventListener('error', e => errors.push(e.message));
  await new Promise(r => setTimeout(r, 1200));
  const win = frame.contentWindow; const doc = frame.contentDocument;
  for (let y = 0; y < doc.documentElement.scrollHeight; y += 500) { win.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  await new Promise(r => setTimeout(r, 1300));
  const result = auditDoc(doc, win, width);
  result.errors = errors;
  frame.remove();
  return result;
}

async function auditRoutes(routes = ROUTES) {
  const report = {};
  for (const route of routes) {
    report[route] = [await loadAndAudit(route, 1440), await loadAndAudit(route, 390)];
  }
  return report;
}
