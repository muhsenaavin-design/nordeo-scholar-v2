// Multi-site routing. News and Academy are microsites served from the same build:
// on news.* / training.* hosts they live at the root, elsewhere under /news and /training.
export const SITES = {
  main: {
    key: 'main',
    name: 'Nordeo Scholar',
    label: 'Nordeo Scholar Publishing',
    path: '',
    host: 'nordeoscholar.com',
  },
  news: {
    key: 'news',
    name: 'NordeoNews',
    fullName: 'NordeoNews',
    label: 'Media & News Publishing',
    path: '/news',
    host: 'news.nordeoscholar.com',
    nav: [
      { label: 'Latest', hash: 'terbaru' },
      { label: 'Desks', hash: 'rubrik' },
      { label: 'Publishing Guide', path: '/panduan' },
    ],
    cta: { label: 'Submit a story', path: '/kirim' },
  },
  training: {
    key: 'training',
    name: 'Academy',
    fullName: 'Nordeo Academy',
    label: 'Academic Training',
    path: '/training',
    host: 'training.nordeoscholar.com',
    nav: [
      { label: 'Programs', hash: 'program' },
      { label: 'Schedule', hash: 'jadwal' },
      { label: 'Curriculum', hash: 'kurikulum' },
      { label: 'FAQ', hash: 'faq' },
    ],
    cta: { label: 'Register interest', path: '/daftar' },
  },
};

const MICROSITES = ['news', 'training'];

const origins = {
  news: import.meta.env.VITE_NEWS_ORIGIN || '',
  training: import.meta.env.VITE_TRAINING_ORIGIN || '',
};

const mainOrigin = import.meta.env.VITE_MAIN_ORIGIN || 'https://nordeoscholar.com';

export function getHostname() {
  return typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase();
}

export function hostSite(hostname = getHostname()) {
  const label = hostname.split('.')[0];
  return MICROSITES.includes(label) ? label : null;
}

export function currentSiteKey() {
  return hostSite() || 'main';
}

export function isSubdomainSite(key) {
  return MICROSITES.includes(key) && hostSite() === key;
}

export function resolveSite(pathname) {
  const hosted = hostSite();
  if (hosted) return hosted;
  if (pathname === '/news' || pathname.startsWith('/news/')) return 'news';
  if (pathname === '/training' || pathname.startsWith('/training/')) return 'training';
  return 'main';
}

export function siteBase(key) {
  if (!MICROSITES.includes(key) || isSubdomainSite(key)) return '';
  return SITES[key].path;
}

export function siteHome(key) {
  if (key === 'main') return '/';
  return `${siteBase(key)}/`;
}

// Link to a page inside an ecosystem from wherever the visitor is now.
export function ecosystemHref(key, path = '') {
  if (key === 'journals') return mainHref(path || '/journals');
  if (key === 'books') return mainHref('/books');
  if (key === 'main') return mainHref(path || '/');
  const site = SITES[key];
  if (!site) return path || '/';
  if (currentSiteKey() === key) return `${siteBase(key)}${path}` || '/';
  if (currentSiteKey() !== 'main') return `${mainOrigin}${site.path}${path}`;
  const origin = origins[key];
  return origin ? `${origin.replace(/\/$/, '')}${path || '/'}` : `${site.path}${path}`;
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
