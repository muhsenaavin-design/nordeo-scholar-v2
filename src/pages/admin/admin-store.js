// Data for the admin dashboard. Signed-in staff work on the Supabase database, so every change
// reaches the public website and the other staff at once. The demo mode keeps the same screens
// on this browser's storage for presentations, without touching the database.
import { useCallback, useEffect, useRef, useState } from 'react';
import { newsToRow, rowToNews } from '../../lib/content';
import { seedContent } from '../../lib/content-seed';
import { STORE, getNews, makeId, read, saveNews, write } from '../../lib/store';
import { supabase } from '../../lib/supabase';

const CMS_KEY = 'nordeo:admin-cms.v2';
const today = () => new Date().toISOString().slice(0, 10);

// Sidebar groups. Each module names the requirement it serves (report: Functional Requirements).
export const GROUPS = [
  { id: 'home', label: 'Ringkasan', tone: 'ink' },
  { id: 'site', label: 'Konten website', tone: 'blue' },
  { id: 'news', label: 'NordeoNews', tone: 'yellow' },
  { id: 'academy', label: 'Academy', tone: 'teal' },
  { id: 'marketing', label: 'Pemasaran', tone: 'gold' },
  { id: 'system', label: 'Sistem', tone: 'slate' },
];

export const MODULES = [
  { id: 'dashboard', group: 'home', label: 'Dashboard', icon: 'grid', fr: 'FR-10', hint: 'Tugas yang menunggu Anda dan aktivitas terbaru.' },
  { id: 'pages', group: 'site', label: 'Beranda', icon: 'layout', fr: 'FR-11, FR-12', hint: 'Judul hero dan susunan section halaman utama.' },
  { id: 'ecosystems', group: 'site', label: 'Ekosistem', icon: 'layers', fr: 'FR-02, FR-13', hint: 'Empat ekosistem Nordeo, status, dan link platformnya.' },
  { id: 'profile', group: 'site', label: 'Profil perusahaan', icon: 'building', fr: 'FR-18, FR-21', hint: 'Visi, misi, nilai, dan layanan di halaman Our Story.' },
  { id: 'contact', group: 'site', label: 'Kontak & lokasi', icon: 'pin', fr: 'FR-06, FR-15', hint: 'Alamat, email, WhatsApp, Instagram, dan peta.' },
  { id: 'navigation', group: 'site', label: 'Menu footer', icon: 'menu', fr: 'FR-14', hint: 'Tautan “For scholars” di footer website.' },
  { id: 'media', group: 'site', label: 'Media', icon: 'image', fr: 'FR-12', hint: 'Gambar dan logo beserta teks alternatifnya.' },
  { id: 'news', group: 'news', label: 'Artikel', icon: 'news', fr: 'FR-04, FR-16, FR-17, FR-24', hint: 'Tulis, tinjau, dan terbitkan artikel: Draft → In review → Published.' },
  { id: 'stories', group: 'news', label: 'Kiriman cerita', icon: 'inbox', fr: 'FR-09, FR-19', hint: 'Cerita dari pembaca lewat form “Kirim berita”.' },
  { id: 'comments', group: 'news', label: 'Komentar', icon: 'chat', fr: 'FR-16', hint: 'Setujui atau sembunyikan komentar pembaca.' },
  { id: 'academy', group: 'academy', label: 'Program & kalender', icon: 'cap', fr: 'FR-07, FR-25', hint: 'Seminar, konferensi, dan modul yang tampil di kalender Academy.' },
  { id: 'registrations', group: 'academy', label: 'Peminat program', icon: 'ticket', fr: 'FR-19', hint: 'Orang yang mendaftarkan minat lewat form Academy.' },
  { id: 'promo', group: 'marketing', label: 'Review, mitra & FAQ', icon: 'star', fr: 'FR-26', hint: 'Review asli, logo mitra, dan pertanyaan umum di beranda.' },
  { id: 'partnership', group: 'marketing', label: 'Kemitraan', icon: 'handshake', fr: 'FR-05, FR-20', hint: 'Peluang kerja sama dan layanan untuk institusi.' },
  { id: 'subscribers', group: 'marketing', label: 'Subscriber', icon: 'mail', fr: 'FR-09, FR-19', hint: 'Pelanggan newsletter NordeoNews.' },
  { id: 'users', group: 'system', label: 'Pengguna & peran', icon: 'users', fr: 'FR-10, NFR-04', hint: 'Akun dashboard, peran, dan log aktivitas.' },
  { id: 'site', group: 'system', label: 'Pengaturan situs', icon: 'globe', fr: 'FR-28, NFR-07', hint: 'Tagline serta judul dan deskripsi untuk mesin pencari.' },
];

// C = create, R = read, U = update, D = delete, A = approve, E = export (report: Access Rights Matrix).
export const ACCESS = {
  dashboard: { owner: 'R', admin: 'R', marketing: 'R' },
  pages: { owner: 'RU', admin: 'CRUD', marketing: '' },
  ecosystems: { owner: 'R', admin: 'CRUD', marketing: '' },
  profile: { owner: 'CRUD', admin: 'RU', marketing: '' },
  contact: { owner: 'R', admin: 'CRUD', marketing: 'R' },
  navigation: { owner: '', admin: 'CRUD', marketing: '' },
  media: { owner: 'R', admin: 'CRUD', marketing: 'CRU' },
  news: { owner: 'RA', admin: 'CRUD', marketing: '' },
  stories: { owner: 'R', admin: 'RU', marketing: 'R' },
  comments: { owner: 'R', admin: 'RUD', marketing: '' },
  academy: { owner: 'R', admin: 'CRUD', marketing: 'CRUD' },
  registrations: { owner: 'R', admin: 'RUE', marketing: 'RUE' },
  promo: { owner: 'R', admin: 'CRUD', marketing: 'CRUD' },
  partnership: { owner: 'R', admin: 'RU', marketing: 'CRUD' },
  subscribers: { owner: 'R', admin: 'RE', marketing: 'RDE' },
  users: { owner: 'CRUD', admin: 'R', marketing: '' },
  site: { owner: 'RU', admin: 'RU', marketing: '' },
};

export const ROLES = [
  { id: 'owner', label: 'Owner', person: 'Owner Nordeo', initials: 'OW' },
  { id: 'admin', label: 'Admin', person: 'Admin Nordeo', initials: 'AD' },
  { id: 'marketing', label: 'Marketing', person: 'Marketing Nordeo', initials: 'MK' },
];

export function can(moduleId, role, right) {
  return (ACCESS[moduleId]?.[role] || '').includes(right);
}

export const NEWS_STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  review: { label: 'In review', tone: 'gold' },
  published: { label: 'Published', tone: 'green' },
  archived: { label: 'Archived', tone: 'muted' },
};

// Which content document each module writes (database table site_content).
const CONTENT_KEYS = ['pages', 'ecosystems', 'profile', 'programs', 'partnerships', 'contact', 'navigation', 'media', 'promo', 'site'];

const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || '?';

// ---------------------------------------------------------------- shared helpers
function diffById(before, after) {
  const old = new Map(before.map((x) => [x.id, x]));
  const now = new Map(after.map((x) => [x.id, x]));
  return {
    changed: after.filter((x) => !old.has(x.id) || JSON.stringify(old.get(x.id)) !== JSON.stringify(x)),
    removed: before.filter((x) => !now.has(x.id)),
  };
}

function demoState() {
  const saved = read(CMS_KEY, null);
  const cms = saved && typeof saved === 'object' ? { ...seedContent(), ...saved } : seedContent();
  return {
    cms,
    news: getNews().map((n) => ({ ...n, status: n.status || 'published' })),
    submissions: read(STORE.newsSubmissions, []),
    registrations: read(STORE.trainingRegistrations, []),
    comments: Object.entries(read(STORE.newsComments, {})).flatMap(([story, list]) => list.map((c) => ({ ...c, slug: story, status: c.status || 'approved' }))),
    subscribers: [],
    users: ROLES.map((r) => ({ id: `u-${r.id}`, name: r.person, email: `[email ${r.label}]`, role: r.id, active: true })),
    activity: cms.log || [],
  };
}

const EMPTY = { cms: seedContent(), news: [], submissions: [], registrations: [], comments: [], subscribers: [], users: [], activity: [] };

// ---------------------------------------------------------------- remote loading
async function loadRemote() {
  const q = (query) => query.then(({ data, error }) => (error ? [] : data || []));
  const [content, news, submissions, registrations, comments, subscribers, users, log] = await Promise.all([
    q(supabase.from('site_content').select('key,value')),
    q(supabase.from('news').select('*').order('date', { ascending: false })),
    q(supabase.from('news_submissions').select('*').order('submitted_at', { ascending: false })),
    q(supabase.from('academy_registrations').select('*').order('submitted_at', { ascending: false })),
    q(supabase.from('news_comments').select('*').order('created_at', { ascending: false })),
    q(supabase.from('subscribers').select('*').order('created_at', { ascending: false })),
    q(supabase.from('profiles').select('*').order('created_at')),
    q(supabase.from('activity_log').select('*').order('at', { ascending: false }).limit(200)),
  ]);
  const seed = seedContent();
  const stored = Object.fromEntries(content.map((row) => [row.key, row.value]));
  return {
    cms: Object.fromEntries(CONTENT_KEYS.map((key) => [key, stored[key] ?? seed[key]])),
    news: news.map(rowToNews),
    submissions: submissions.map((s) => ({ ...(s.payload || {}), id: s.id, reference: s.reference, title: s.title, category: s.category, name: s.name, email: s.email, institution: s.institution, mode: s.mode, status: s.status, submittedAt: s.submitted_at })),
    registrations: registrations.map((r) => ({ ...(r.payload || {}), id: r.id, reference: r.reference, program: r.program, name: r.name, email: r.email, institution: r.institution, role: r.role, status: r.status, submittedAt: r.submitted_at })),
    comments: comments.map((c) => ({ id: c.id, slug: c.article_slug, name: c.name, email: c.email, comment: c.body, status: c.status, at: c.created_at, parentId: c.parent_id })),
    subscribers: subscribers.map((s) => ({ id: s.id, email: s.email, topics: (s.topics || []).join(', '), createdAt: s.created_at })),
    users: users.map((u) => ({ id: u.id, name: u.full_name || u.email, email: u.email, role: u.role, active: u.active })),
    activity: log.map((l) => ({ id: String(l.id), at: l.at, who: l.who, role: l.role, action: l.action, target: l.target })),
  };
}

/**
 * mode 'remote': signed in, reads and writes the database.
 * mode 'demo': this browser only; the role can be switched to show each view.
 */
export function useAdminData(role, mode = 'demo', account = null) {
  const remote = mode === 'remote' && Boolean(supabase);
  const [state, setState] = useState(() => (remote ? EMPTY : demoState()));
  const [loading, setLoading] = useState(remote);
  const [saveError, setSaveError] = useState('');
  const latest = useRef(state);
  latest.current = state;

  const refresh = useCallback(async () => {
    if (!remote) return;
    setLoading(true);
    const next = await loadRemote();
    setState(next);
    setLoading(false);
  }, [remote]);

  useEffect(() => { refresh(); }, [refresh]);

  // Demo mode persists the content documents in this browser.
  useEffect(() => {
    if (remote) return;
    if (!write(CMS_KEY, { ...state.cms, log: state.activity })) setSaveError('Penyimpanan browser penuh atau diblokir.');
  }, [remote, state.cms, state.activity]);

  const person = account?.name || ROLES.find((r) => r.id === role)?.person || 'Pengguna';
  const roleLabel = ROLES.find((r) => r.id === role)?.label || role;
  const fail = useCallback((error) => { setSaveError(error?.message ? `Gagal menyimpan: ${error.message}` : 'Gagal menyimpan ke database.'); }, []);

  const log = useCallback((action, target = '') => {
    const entry = { id: makeId('log'), at: new Date().toISOString(), who: person, role: roleLabel, action, target };
    setState((s) => ({ ...s, activity: [entry, ...s.activity].slice(0, 200) }));
    if (remote) supabase.from('activity_log').insert({ who: person, role: roleLabel, action, target }).then(({ error }) => error && fail(error));
  }, [person, roleLabel, remote, fail]);

  const update = useCallback((key, value, action, target) => {
    const next = typeof value === 'function' ? value(latest.current.cms[key]) : value;
    setState((s) => ({ ...s, cms: { ...s.cms, [key]: next } }));
    if (remote) {
      supabase.from('site_content').upsert({ key, value: next, updated_at: new Date().toISOString(), updated_by: account?.id || null })
        .then(({ error }) => { if (error) fail(error); else setSaveError(''); });
    }
    if (action) log(action, target);
  }, [remote, account, log, fail]);

  const commitNews = useCallback((next, action, target) => {
    const before = latest.current.news;
    setState((s) => ({ ...s, news: next }));
    if (remote) {
      const { changed, removed } = diffById(before, next);
      Promise.all([
        ...changed.map((item) => supabase.from('news').upsert(newsToRow(item))),
        ...removed.map((item) => supabase.from('news').delete().eq('id', item.id)),
      ]).then((results) => {
        const error = results.find((r) => r.error)?.error;
        if (error) { fail(error); refresh(); } else setSaveError('');
      });
    } else if (!saveNews(next)) setSaveError('Penyimpanan browser penuh atau diblokir.');
    if (action) log(action, target);
  }, [remote, log, fail, refresh]);

  const commitRows = useCallback((listKey, table, toRow) => (next, action, target) => {
    const before = latest.current[listKey];
    setState((s) => ({ ...s, [listKey]: next }));
    if (remote) {
      const { changed, removed } = diffById(before, next);
      Promise.all([
        ...changed.map((item) => supabase.from(table).update(toRow(item)).eq('id', item.id)),
        ...removed.map((item) => supabase.from(table).delete().eq('id', item.id)),
      ]).then((results) => {
        const error = results.find((r) => r.error)?.error;
        if (error) { fail(error); refresh(); } else setSaveError('');
      });
    } else if (listKey === 'submissions') write(STORE.newsSubmissions, next);
    else if (listKey === 'registrations') write(STORE.trainingRegistrations, next);
    if (action) log(action, target);
  }, [remote, log, fail, refresh]);

  const commitSubmissions = useCallback((next, action, target) => commitRows('submissions', 'news_submissions', (s) => ({ status: s.status }))(next, action, target), [commitRows]);
  const commitRegistrations = useCallback((next, action, target) => commitRows('registrations', 'academy_registrations', (r) => ({ status: r.status || 'baru' }))(next, action, target), [commitRows]);
  const commitComments = useCallback((next, action, target) => commitRows('comments', 'news_comments', (c) => ({ status: c.status }))(next, action, target), [commitRows]);
  const commitSubscribers = useCallback((next, action, target) => commitRows('subscribers', 'subscribers', () => ({}))(next, action, target), [commitRows]);
  const commitUsers = useCallback((next, action, target) => commitRows('users', 'profiles', (u) => ({ role: u.role, active: u.active, full_name: u.name }))(next, action, target), [commitRows]);

  // Media: the database mode stores files in the public "media" bucket.
  const uploadMedia = useCallback(async (file, dataUrl) => {
    if (!remote) return dataUrl;
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
    const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type });
    if (error) { fail(error); return null; }
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
  }, [remote, fail]);

  // Signed link to a file sent with a story (private bucket).
  const fileLink = useCallback(async (path) => {
    if (!remote || !path) return null;
    const { data, error } = await supabase.storage.from('submissions').createSignedUrl(path, 600);
    return error ? null : data.signedUrl;
  }, [remote]);

  return {
    ...state, loading, remote, saveError, today, refresh, update, log, commitNews, commitSubmissions, commitRegistrations,
    commitComments, commitSubscribers, commitUsers, uploadMedia, fileLink, person, initials: initials(person),
  };
}

export function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [columns.map(([, label]) => esc(label)).join(','), ...rows.map((r) => columns.map(([key]) => esc(r[key])).join(','))].join('\n');
}

export function daysSince(date) {
  if (!date) return Infinity;
  return Math.floor((Date.now() - new Date(`${String(date).slice(0, 10)}T00:00:00`).getTime()) / 86400000);
}
