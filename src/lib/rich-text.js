// Rich text for the news submission editor. The editor writes HTML; everything that leaves
// it (storage, the article page, pasted content) goes through sanitizeHtml(), which keeps a
// short list of tags and drops every attribute except safe links and text alignment.

const BLOCKS = new Set(['P', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE']);
const INLINE = { STRONG: 'strong', B: 'strong', EM: 'em', I: 'em', U: 'u', S: 's', STRIKE: 's', DEL: 's', A: 'a', BR: 'br' };
const ALIGN = /text-align:\s*(left|center|right|justify)/i;
const SAFE_URL = /^(https?:|mailto:)/i;
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'META', 'LINK', 'HEAD', 'TITLE', 'SVG', 'MATH', 'NOSCRIPT', 'XML']);

function cleanNode(node, doc) {
  const out = doc.createDocumentFragment();
  node.childNodes.forEach(child => {
    if (child.nodeType === 3) { out.appendChild(doc.createTextNode(child.textContent)); return; }
    if (child.nodeType !== 1 || DROP.has(child.tagName) || child.tagName.includes(':')) return;
    const inner = cleanNode(child, doc);
    let tag = BLOCKS.has(child.tagName) ? child.tagName.toLowerCase() : INLINE[child.tagName];
    if (!tag && ['DIV', 'SECTION', 'ARTICLE', 'H1'].includes(child.tagName)) tag = child.tagName === 'H1' ? 'h2' : 'p';
    if (['H4', 'H5', 'H6'].includes(child.tagName)) tag = 'h3';
    // Word pastes bold and italic as styled spans.
    if (!tag && child.tagName === 'SPAN') {
      const style = child.getAttribute('style') || '';
      let wrapped = inner;
      if (/font-weight:\s*(bold|[6-9]00)/i.test(style)) { const el = doc.createElement('strong'); el.appendChild(wrapped); wrapped = el; }
      if (/font-style:\s*italic/i.test(style)) { const el = doc.createElement('em'); el.appendChild(wrapped); wrapped = el; }
      out.appendChild(wrapped);
      return;
    }
    if (!tag) { out.appendChild(inner); return; }
    const el = doc.createElement(tag);
    if (tag === 'a') {
      const href = (child.getAttribute('href') || '').trim();
      if (!SAFE_URL.test(href)) { out.appendChild(inner); return; }
      el.setAttribute('href', href);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer nofollow');
    }
    if (BLOCKS.has(child.tagName) || tag === 'p' || tag === 'h2' || tag === 'h3') {
      const align = (child.getAttribute('style') || '').match(ALIGN)?.[1] || child.getAttribute('align');
      if (align && /^(left|center|right|justify)$/i.test(align)) el.setAttribute('style', `text-align: ${align.toLowerCase()}`);
    }
    if (tag !== 'br') el.appendChild(inner);
    out.appendChild(el);
  });
  return out;
}

export function sanitizeHtml(html) {
  if (!html || typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const target = document.implementation.createHTMLDocument('');
  const box = target.createElement('div');
  box.appendChild(cleanNode(doc.body, target));
  return box.innerHTML.replace(/<p>(\s|<br>)*<\/p>/g, '').trim();
}

// Plain text with paragraph breaks, for word counts, the AI assistant, and email summaries.
export function htmlToText(html) {
  if (!html || typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  doc.querySelectorAll('p, h2, h3, li, blockquote, div').forEach(el => el.append('\n'));
  return doc.body.textContent.replace(/\n{3,}/g, '\n\n').trim();
}

const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function textToHtml(text) {
  return String(text || '').split(/\n{2,}|\n/).map(line => line.trim()).filter(Boolean).map(line => `<p>${escape(line)}</p>`).join('');
}
