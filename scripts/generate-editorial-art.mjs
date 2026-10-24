import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const palettes = {
  deep: { bg: '#123742', bg2: '#1d5564', ink: '#fbf8ef', soft: '#b9d2d4', accent: '#f2c94c' },
  cream: { bg: '#f3ede0', bg2: '#e7dcc7', ink: '#243137', soft: '#6d756f', accent: '#a94f36' },
  rust: { bg: '#8f4a37', bg2: '#6e3527', ink: '#fbf3e6', soft: '#e7c7b4', accent: '#f2c94c' },
  green: { bg: '#244a3e', bg2: '#396b56', ink: '#f7f2e6', soft: '#b9d1bf', accent: '#e6bc5c' },
  slate: { bg: '#24313c', bg2: '#3a4b58', ink: '#f4f1e8', soft: '#b8c6cc', accent: '#e3b44f' },
  paper: { bg: '#fbf8f0', bg2: '#efe7d4', ink: '#1d3b43', soft: '#77847f', accent: '#c07a4d' },
};

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function grain(id) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>`;
}

function motif(kind, palette, width, height) {
  const { ink, soft, accent } = palette;
  const cx = width * 0.7;
  const cy = height * 0.42;
  if (kind === 'orbits') {
    return `<g fill="none" stroke="${soft}" stroke-width="1.2" opacity=".7">
      ${Array.from({ length: 7 }, (_, index) => `<ellipse cx="${cx}" cy="${cy}" rx="${140 + index * 74}" ry="${52 + index * 29}" transform="rotate(${-18 + index * 3} ${cx} ${cy})"/>`).join('')}
    </g><circle cx="${cx}" cy="${cy}" r="13" fill="${accent}"/><circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="${accent}" stroke-width="1"/>`;
  }
  if (kind === 'grid') {
    const lines = Array.from({ length: 12 }, (_, index) => {
      const x = width * 0.52 + index * 54;
      return `<line x1="${x}" y1="${height * 0.16}" x2="${x}" y2="${height * 0.84}"/>`;
    }).join('');
    return `<g stroke="${soft}" stroke-width="1" opacity=".38">${lines}</g>
      <g fill="${accent}">${Array.from({ length: 5 }, (_, index) => `<rect x="${width * 0.56 + index * 86}" y="${height * 0.58 - index * 46}" width="34" height="${88 + index * 46}" opacity="${0.35 + index * 0.12}"/>`).join('')}</g>`;
  }
  if (kind === 'arches') {
    return `<g fill="none" stroke="${soft}" stroke-width="1.2" opacity=".55">
      ${Array.from({ length: 6 }, (_, index) => `<path d="M ${width * 0.48 + index * 58} ${height} V ${height * 0.52 - index * 22} A ${92 + index * 6} ${92 + index * 6} 0 0 1 ${width * 0.48 + index * 58 + (184 + index * 12)} ${height * 0.52 - index * 22} V ${height}"/>`).join('')}
    </g><circle cx="${width * 0.72}" cy="${height * 0.3}" r="72" fill="${accent}" opacity=".9"/>`;
  }
  if (kind === 'waves') {
    return `<g fill="none" stroke="${soft}" stroke-width="1.2" opacity=".55">
      ${Array.from({ length: 9 }, (_, index) => `<path d="M ${width * 0.38} ${height * 0.3 + index * 46} C ${width * 0.52} ${height * 0.18 + index * 46}, ${width * 0.7} ${height * 0.42 + index * 46}, ${width * 0.96} ${height * 0.26 + index * 46}"/>`).join('')}
    </g><circle cx="${width * 0.54}" cy="${height * 0.6}" r="9" fill="${accent}"/>`;
  }
  if (kind === 'steps') {
    return `<g fill="none" stroke="${soft}" stroke-width="1.1" opacity=".7">
      ${Array.from({ length: 8 }, (_, index) => `<path d="M ${width * 0.42 + index * 62} ${height * 0.84} V ${height * 0.7 - index * 38} H ${width * 0.48 + index * 62}"/>`).join('')}
    </g><rect x="${width * 0.4}" y="${height * 0.84}" width="${width * 0.42}" height="2" fill="${accent}"/>`;
  }
  if (kind === 'constellation') {
    const dots = [[.42,.62],[.5,.44],[.58,.55],[.66,.3],[.73,.5],[.81,.36],[.88,.58],[.61,.72],[.76,.7]];
    return `<g fill="${accent}">${dots.map(([x,y], index) => `<circle cx="${width * x}" cy="${height * y}" r="${index % 3 === 0 ? 7 : 4}"/>`).join('')}</g>
      <g stroke="${soft}" stroke-width="1" opacity=".5">${dots.slice(0, -1).map(([x,y], index) => { const [nx,ny] = dots[index + 1]; return `<line x1="${width * x}" y1="${height * y}" x2="${width * nx}" y2="${height * ny}"/>`; }).join('')}</g>`;
  }
  return `<circle cx="${width * 0.72}" cy="${height * 0.42}" r="${height * 0.3}" fill="none" stroke="${ink}" stroke-opacity=".28"/>`;
}

function editorialSvg({ width, height, palette, motif: motifKind, label, title, meta, mark }) {
  const p = palettes[palette];
  const titleLines = Array.isArray(title) ? title : [title];
  const titleSize = width > height ? Math.round(width * 0.062) : Math.round(width * 0.082);
  const titleStart = height * (width > height ? 0.68 : 0.56);
  const lineHeight = titleSize * 1.04;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="${p.bg2}"/></linearGradient>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="${p.bg}" stop-opacity="0"/><stop offset="1" stop-color="${p.bg}" stop-opacity=".9"/></linearGradient>
    ${grain('grain')}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  ${motif(motifKind, p, width, height)}
  <rect width="${width}" height="${height}" fill="url(#veil)"/>
  <rect width="${width}" height="${height}" filter="url(#grain)" opacity=".07" fill="${p.ink}"/>
  <g font-family="Manrope, Arial, sans-serif" fill="${p.soft}">
    <text x="${width * 0.075}" y="${height * 0.105}" font-size="${Math.round(width * 0.0145)}" letter-spacing="${width * 0.0035}" font-weight="600">${escapeXml(label)}</text>
    <text x="${width * 0.075}" y="${height * 0.145}" font-size="${Math.round(width * 0.012)}" opacity=".8">${escapeXml(mark || 'NORDEO SCHOLAR')}</text>
  </g>
  <g font-family="Fraunces, Georgia, serif" fill="${p.ink}">
    ${titleLines.map((line, index) => `<text x="${width * 0.075}" y="${titleStart + index * lineHeight}" font-size="${titleSize}" letter-spacing="${-titleSize * 0.02}">${escapeXml(line)}</text>`).join('')}
  </g>
  <line x1="${width * 0.075}" y1="${height * 0.885}" x2="${width * 0.925}" y2="${height * 0.885}" stroke="${p.ink}" stroke-opacity=".22"/>
  <g font-family="Manrope, Arial, sans-serif" fill="${p.soft}">
    <text x="${width * 0.075}" y="${height * 0.93}" font-size="${Math.round(width * 0.0125)}">${escapeXml(meta)}</text>
    <text x="${width * 0.925}" y="${height * 0.93}" text-anchor="end" font-size="${Math.round(width * 0.0125)}" fill="${p.accent}">NORDEO</text>
  </g>
</svg>`;
}

const news = [
  { file: 'open-science', palette: 'deep', motif: 'orbits', label: 'OPEN SCIENCE', title: ['Knowledge,', 'in the open.'], meta: 'Research notes · 22 Oktober 2026' },
  { file: 'jetsi-vol2', palette: 'slate', motif: 'grid', label: 'JOURNAL NOTE', title: ['Engineering for', 'what comes next.'], meta: 'JETSI · Vol. 1 No. 2 · 2026' },
  { file: 'writing-craft', palette: 'cream', motif: 'circles', label: 'THE CRAFT', title: ['Writing for readers,', 'not for indexes.'], meta: 'Editorial · 12 Oktober 2026' },
  { file: 'community', palette: 'green', motif: 'arches', label: 'COMMUNITY', title: ['Research that', 'returns home.'], meta: 'Pengabdian · 7 Oktober 2026' },
  { file: 'evidence-table', palette: 'rust', motif: 'steps', label: 'POLICY BRIEF', title: ['Evidence at the', 'decision table.'], meta: 'Kebijakan · 1 Oktober 2026' },
  { file: 'editors-note', palette: 'paper', motif: 'constellation', label: "EDITOR'S NOTE", title: ['Why context', 'still matters.'], meta: 'From the desk · 24 Oktober 2026' },
];

const training = [
  { file: 'seminar-draft', palette: 'deep', motif: 'steps', label: 'SEMINAR · 2 SESI', title: ['From draft', 'to submission.'], meta: 'Penulisan artikel jurnal', mark: 'NORDEO ACADEMY' },
  { file: 'conference-2026', palette: 'slate', motif: 'arches', label: 'CONFERENCE · 2026', title: ['Academic Writing', 'Conference.'], meta: 'Hybrid · 18–19 November 2026', mark: 'NORDEO ACADEMY' },
  { file: 'module-scopus', palette: 'rust', motif: 'grid', label: 'MODUL · 4 PEKAN', title: ['Publishing with', 'confidence.'], meta: 'Dari draf ke submission', mark: 'NORDEO ACADEMY' },
  { file: 'module-ethics', palette: 'green', motif: 'circles', label: 'MODUL · 3 PEKAN', title: ['Integrity in', 'every line.'], meta: 'Etika dan kepenulisan', mark: 'NORDEO ACADEMY' },
  { file: 'seminar-review', palette: 'cream', motif: 'waves', label: 'SEMINAR · 90 MENIT', title: ['Reading a review', 'like an editor.'], meta: 'Merespons catatan reviewer', mark: 'NORDEO ACADEMY' },
  { file: 'conference-poster', palette: 'paper', motif: 'constellation', label: 'CONFERENCE · WORKSHOP', title: ['Research,', 'made visible.'], meta: 'Poster dan presentasi akademik', mark: 'NORDEO ACADEMY' },
];

const books = [
  { file: 'quiet-method', palette: 'deep', motif: 'orbits', label: 'MONOGRAPH · 2027', title: ['The Quiet', 'Method'], meta: 'N. Prameswari', mark: 'NORDEO BOOKS' },
  { file: 'evidence-story', palette: 'paper', motif: 'grid', label: 'ESSAY COLLECTION · 2027', title: ['Evidence', '& Story'], meta: 'R. Hartono', mark: 'NORDEO BOOKS' },
  { file: 'publishing-purpose', palette: 'rust', motif: 'arches', label: 'PRACTITIONER GUIDE · 2026', title: ['Publishing', 'with Purpose'], meta: 'A. Sena', mark: 'NORDEO BOOKS' },
  { file: 'local-knowledge', palette: 'green', motif: 'waves', label: 'EDITED VOLUME · 2027', title: ['Local Knowledge,', 'Global Reach'], meta: 'Nordeo Editorial', mark: 'NORDEO BOOKS' },
];

function writeAll(folder, items, width, height, options = {}) {
  const dir = join(root, 'public', 'assets', 'art', folder);
  mkdirSync(dir, { recursive: true });
  for (const item of items) {
    const svg = editorialSvg({ width, height, ...item, ...options });
    writeFileSync(join(dir, `${item.file}.svg`), svg, 'utf8');
  }
  return items.length;
}

const counts = {
  news: writeAll('news', news, 1600, 1000),
  training: writeAll('training', training, 1600, 1000),
  books: writeAll('books', books, 900, 1200),
};

console.log(`Generated ${counts.news} news covers, ${counts.training} training covers, ${counts.books} book covers.`);
