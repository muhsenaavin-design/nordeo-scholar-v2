export const SITES = {
  main: {
    key: 'main',
    name: 'Nordeo Scholar',
    label: 'Nordeo Scholar Publishing',
    path: '',
    host: 'nordeoscholar.com',
  },
  books: {
    key: 'books',
    name: 'Nordeo Books',
    label: 'Books Publishing',
    path: '/books',
    host: 'books.nordeoscholar.com',
    eyebrow: 'BOOKS PUBLISHING',
    tagline: 'Ideas, in depth.',
    nav: [
      { label: 'Katalog', hash: 'katalog' },
      { label: 'Proses', hash: 'proses' },
      { label: 'Untuk Penulis', hash: 'penulis' },
    ],
    cta: { label: 'Ajukan proposal', href: 'mailto:books@nordeoscholar.com?subject=Proposal%20buku%20Nordeo' },
  },
  news: {
    key: 'news',
    name: 'Nordeo Newsroom',
    label: 'Media & News Publishing',
    path: '/news',
    host: 'news.nordeoscholar.com',
    eyebrow: 'MEDIA & NEWS PUBLISHING',
    tagline: 'Knowledge, in conversation.',
    nav: [
      { label: 'Terbaru', hash: 'terbaru' },
      { label: 'Ruang Redaksi', hash: 'redaksi' },
      { label: 'Kit Submission', hash: 'submission-kit' },
      { label: 'Kirim berita', path: '/submit' },
    ],
    cta: { label: 'Kirim berita', path: '/submit' },
  },
  training: {
    key: 'training',
    name: 'Nordeo Academy',
    label: 'Academic Training',
    path: '/training',
    host: 'training.nordeoscholar.com',
    eyebrow: 'ACADEMIC TRAINING',
    tagline: 'Learning, together.',
    nav: [
      { label: 'Program', hash: 'program' },
      { label: 'Jalur Publikasi', hash: 'jalur' },
      { label: 'Pendaftaran', hash: 'daftar' },
    ],
    cta: { label: 'Daftar program', hash: 'daftar' },
  },
};

const origins = {
  books: import.meta.env.VITE_BOOKS_ORIGIN || '',
  news: import.meta.env.VITE_NEWS_ORIGIN || '',
  training: import.meta.env.VITE_TRAINING_ORIGIN || '',
};

const mainOrigin = import.meta.env.VITE_MAIN_ORIGIN || 'https://nordeoscholar.com';

export function getHostname() {
  return typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase();
}

export function hostSite(hostname = getHostname()) {
  const label = hostname.split('.')[0];
  return ['books', 'news', 'training'].includes(label) ? label : null;
}

export function currentSiteKey() {
  return hostSite() || 'main';
}

export function isSubdomainSite(key) {
  return key !== 'main' && key !== 'admin' && hostSite() === key;
}

export function resolveSite(pathname) {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin';
  const hosted = hostSite();
  if (hosted) return hosted;
  if (pathname === '/books' || pathname.startsWith('/books/')) return 'books';
  if (pathname === '/news' || pathname.startsWith('/news/')) return 'news';
  if (pathname === '/training' || pathname.startsWith('/training/')) return 'training';
  if (pathname === '/services' || pathname.startsWith('/services/')) return 'training';
  return 'main';
}

export function siteBase(key) {
  if (!key || key === 'main' || key === 'admin') return '';
  if (isSubdomainSite(key)) return '';
  return SITES[key].path;
}

export function siteHome(key) {
  if (key === 'main') return '/';
  return `${siteBase(key)}/`;
}

export function ecosystemHref(key, path = '') {
  if (key === 'main') return mainHref(path);
  if (key === 'journals') return path || '/journals';
  const site = SITES[key];
  if (!site) return path || '/';
  if (isSubdomainSite(key) || currentSiteKey() === key) return `${siteBase(key)}${path}` || '/';
  if (currentSiteKey() !== 'main') return `${mainOrigin}${site.path}${path}`;
  const origin = origins[key];
  return origin ? `${origin.replace(/\/$/, '')}${path}` : `${site.path}${path}`;
}

export function mainHref(path = '/') {
  if (currentSiteKey() !== 'main') return `${mainOrigin}${path === '/' ? '' : path}`;
  return path;
}

export function micrositeNavHref(siteKey, item) {
  const base = siteBase(siteKey);
  if (item.path) return item.path === '/' ? `${base}/` : `${base}${item.path}`;
  return `${base}/#${item.hash}`;
}

export function ecosystemLabel(key) {
  if (key === 'journals') return 'Journals';
  return SITES[key]?.label || key;
}
