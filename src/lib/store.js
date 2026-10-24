import { seedNews } from '../data/news';

const prefix = 'nordeo:';

export const STORE = {
  news: `${prefix}news.v1`,
  newsSubmissions: `${prefix}news-submissions.v1`,
  newsDraft: `${prefix}news-draft.v1`,
  trainingRegistrations: `${prefix}training-registrations.v1`,
  trainingStatus: `${prefix}training-status.v1`,
  adminSession: `${prefix}admin-session.v1`,
  bookProposals: `${prefix}book-proposals.v1`,
};

export function read(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(key); } catch { /* storage unavailable */ }
}

export function readSession(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeSession(key, value) {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export function clearSession(key) {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.removeItem(key); } catch { /* storage unavailable */ }
}

export function getNews() {
  const stored = read(STORE.news, null);
  return Array.isArray(stored) ? stored : seedNews;
}

export function saveNews(items) {
  return write(STORE.news, items);
}

export function publishedNews(items = getNews()) {
  return items
    .filter(item => item.status !== 'draft')
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function getNewsBySlug(slug) {
  return publishedNews().find(item => item.slug === slug);
}

export function makeId(seed = 'item') {
  const random = Math.random().toString(36).slice(2, 7);
  return `${seed}-${Date.now().toString(36)}-${random}`;
}

export function makeReference(prefixLabel = 'NRD') {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefixLabel}-${stamp}-${tail}`;
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

export function formatAuthors(authors = []) {
  if (!authors.length) return 'Nordeo Scholar';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(' & ');
  return `${authors[0]} et al.`;
}

export function formatDate(value, options = { day: 'numeric', month: 'long', year: 'numeric' }, locale = 'id-ID') {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

export function downloadFile(filename, content, type = 'application/json') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJson(filename, value) {
  downloadFile(filename, JSON.stringify(value, null, 2), 'application/json');
}

export function readImage(file, maxSize = 900) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'));
    reader.onload = () => {
      const source = String(reader.result || '');
      const image = new Image();
      image.onerror = () => resolve({ name: file.name, size: file.size, type: file.type, dataUrl: source, width: null, height: null });
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        if (typeof document === 'undefined') { resolve({ name: file.name, size: file.size, type: file.type, dataUrl: source, width: image.width, height: image.height }); return; }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) { resolve({ name: file.name, size: file.size, type: file.type, dataUrl: source, width: image.width, height: image.height }); return; }
        context.drawImage(image, 0, 0, width, height);
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: canvas.toDataURL('image/jpeg', 0.76),
          width: image.width,
          height: image.height,
        });
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}

export function humanSize(bytes = 0) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
