// Where the staff dashboard lives. The real path is a Vercel environment variable (VITE_ADMIN_PATH),
// so it is not written in this public repository. /admin shows the normal "not found" page.
// Development and tests fall back to /admin; a production build without the variable has no dashboard.
const raw = (import.meta.env.VITE_ADMIN_PATH || '').trim();
const fallback = import.meta.env.DEV || import.meta.env.MODE === 'test' ? '/admin' : '';

function clean(path) {
  if (!path) return '';
  const p = `/${path.replace(/^\/+|\/+$/g, '')}`;
  return /^\/[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(p) ? p : '';
}

export const ADMIN_BASE = clean(raw) || fallback;

export function isAdminPath(pathname) {
  return Boolean(ADMIN_BASE) && (pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`));
}

export function adminHref(id) {
  return !id || id === 'dashboard' ? ADMIN_BASE : `${ADMIN_BASE}/${id}`;
}

export function adminSegment(pathname) {
  return pathname.slice(ADMIN_BASE.length).replace(/^\/+/, '').split('/')[0] || 'dashboard';
}
