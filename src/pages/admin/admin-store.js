// Content store for the admin dashboard. Everything lives in this browser's localStorage until a
// backend exists. NordeoNews uses the same store as the public site, so an article the Owner
// approves appears on /news at once (in this browser).
import { useCallback, useEffect, useState } from 'react';
import { contact, externalLinks, office, officialSocial } from '../../config/links';
import { ecosystems, principles, vision } from '../../data/ecosystems';
import { trainingPrograms } from '../../data/training';
import { STORE, getNews, makeId, read, saveNews, write } from '../../lib/store';

const CMS_KEY = 'nordeo:admin-cms.v1';
const today = () => new Date().toISOString().slice(0, 10);

// Modules, their priority (MoSCoW) and the requirement they serve: Table 25 and Table 26 of the report.
export const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', fr: 'FR-10', primary: true },
  { id: 'pages', label: 'Halaman', icon: 'layout', fr: 'FR-11, FR-12', primary: true },
  { id: 'ecosystems', label: 'Ekosistem', icon: 'layers', fr: 'FR-13', primary: true },
  { id: 'news', label: 'NordeoNews', icon: 'news', fr: 'FR-16, FR-17', primary: true },
  { id: 'academy', label: 'Academy', icon: 'cap', fr: 'FR-07', primary: true },
  { id: 'inbox', label: 'Pesan', icon: 'mail', fr: 'FR-19', primary: true },
  { id: 'profile', label: 'Profil Perusahaan', icon: 'building', fr: 'FR-18' },
  { id: 'partnership', label: 'Kemitraan & Layanan', icon: 'handshake', fr: 'FR-20' },
  { id: 'contact', label: 'Kontak & Lokasi', icon: 'pin', fr: 'FR-15' },
  { id: 'navigation', label: 'Navigasi', icon: 'menu', fr: 'FR-14' },
  { id: 'media', label: 'Media', icon: 'image', fr: 'FR-12' },
  { id: 'users', label: 'Pengguna & Peran', icon: 'users', fr: 'FR-10, NFR-04' },
  { id: 'site', label: 'Pengaturan Situs', icon: 'globe', fr: 'NFR-07' },
];

// C = create, R = read, U = update, D = delete, A = approve, E = export. Table 26.
export const ACCESS = {
  dashboard: { owner: 'R', admin: 'R', marketing: 'R' },
  pages: { owner: 'RU', admin: 'CRUD', marketing: '' },
  ecosystems: { owner: 'R', admin: 'CRUD', marketing: '' },
  news: { owner: 'RA', admin: 'CRUD', marketing: '' },
  academy: { owner: 'R', admin: 'CRUD', marketing: 'R' },
  inbox: { owner: 'R', admin: 'R', marketing: 'RE' },
  profile: { owner: 'CRUD', admin: 'RU', marketing: '' },
  partnership: { owner: 'R', admin: 'RU', marketing: 'CRUD' },
  contact: { owner: 'R', admin: 'CRUD', marketing: 'R' },
  navigation: { owner: '', admin: 'CRUD', marketing: '' },
  media: { owner: 'R', admin: 'CRUD', marketing: 'RU' },
  users: { owner: 'CRUD', admin: 'R', marketing: '' },
  site: { owner: 'RU', admin: 'RU', marketing: '' },
};

export const ROLES = [
  { id: 'owner', label: 'Owner', person: 'Fandi Achmad', initials: 'FA' },
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

const ecosystemPlatform = { journals: 'OJS · JETSI, JIEL, JIBDI', news: 'NordeoNews', training: 'Nordeo Academy', books: 'Belum ada platform' };

function seed() {
  const reviewed = '2026-10-26';
  return {
    pages: {
      heroLine1: 'Advancing Knowledge.',
      heroLine2: 'Creating Global Impact.',
      heroCta: 'Discover the ecosystem',
      vision: `${vision.intro} ${vision.lead} ${vision.accent}`,
      about: 'Nordeo Scholar is an academic ecosystem that connects research, education, publication, and meaningful collaboration.',
      sections: [
        { id: 'hero', label: 'Hero', visible: true },
        { id: 'vision', label: 'Our Vision', visible: true },
        { id: 'ecosystems', label: 'Empat ekosistem', visible: true },
        { id: 'journals', label: 'Jurnal unggulan', visible: true },
        { id: 'news', label: 'NordeoNews terbaru', visible: true },
        { id: 'founder', label: 'Catatan founder', visible: true },
        { id: 'contact', label: 'Peta & alamat', visible: true },
      ],
      updatedAt: reviewed, reviewedAt: reviewed,
    },
    ecosystems: ecosystems.map((e) => ({
      id: e.id, title: e.title, short: e.short, description: e.description, cta: e.cta,
      link: e.ctaHref || `https://${e.domain}`, platform: ecosystemPlatform[e.id] || '', status: e.status === 'Coming Soon' ? 'soon' : 'live',
      updatedAt: reviewed, reviewedAt: reviewed,
    })),
    profile: {
      vision: `${vision.intro} ${vision.lead} ${vision.accent}`,
      mission: ['Menerbitkan karya akademik yang bermutu dan terbuka.', 'Mendampingi peneliti dari naskah sampai publikasi.', 'Menghubungkan riset dengan masyarakat dan industri.'],
      values: principles.map(([name, copy]) => `${name}: ${copy}`),
      services: ['Journals Publishing', 'Books Publishing', 'Media & News Publishing', 'Academic Training'],
      updatedAt: reviewed, reviewedAt: reviewed,
    },
    programs: trainingPrograms.map((p) => ({ id: p.id, title: p.title, type: p.type, dateLabel: p.dateLabel, mode: p.mode, facilitator: p.facilitator, link: `/training/program/${p.id}`, status: 'published' })),
    partnerships: [
      { id: 'p-journal', title: 'Kerja sama pengelolaan jurnal kampus', audience: 'Perguruan tinggi', status: 'open', contact: contact.general },
      { id: 'p-training', title: 'Pelatihan menulis artikel untuk dosen', audience: 'Fakultas & LPPM', status: 'open', contact: contact.training },
      { id: 'p-media', title: 'Liputan riset di NordeoNews', audience: 'Peneliti & lembaga', status: 'open', contact: contact.news },
    ],
    contact: {
      address: office.address, email: contact.general, whatsapp: officialSocial.whatsapp, instagram: officialSocial.instagram,
      mapLink: office.mapLink, updatedAt: reviewed,
    },
    navigation: {
      header: [
        { id: 'n1', label: 'About', href: '/about' }, { id: 'n2', label: 'Ecosystem', href: '/#ecosystem' },
        { id: 'n3', label: 'Journals', href: externalLinks.journalPortal }, { id: 'n4', label: 'Contact', href: '/contact' },
      ],
      footer: [
        { id: 'f1', label: 'Publication Ethics', href: '/publication-ethics' }, { id: 'f2', label: 'Author Guide', href: '/author-guide' },
        { id: 'f3', label: 'Privacy', href: '/privacy-policy' }, { id: 'f4', label: 'Terms of Use', href: '/terms-of-use' },
      ],
      news: [
        { id: 'w1', label: 'Latest', href: '/news/#terbaru' }, { id: 'w2', label: 'Desks', href: '/news/#rubrik' }, { id: 'w3', label: 'Publishing Guide', href: '/news/panduan' },
      ],
    },
    media: [
      { id: 'm-logo', src: '/assets/logo-transparent.png', name: 'logo-transparent.png', alt: 'Logo Nordeo Scholar Publishing', used: 'Header' },
      { id: 'm-hero', src: '/assets/hero.webp', name: 'hero.webp', alt: 'Perpustakaan klasik dengan buku terbuka', used: 'Hero' },
      { id: 'm-eco-j', src: '/assets/ecosystem-journals.webp', name: 'ecosystem-journals.webp', alt: 'Meja editor dengan naskah dan jurnal', used: 'Ekosistem' },
      { id: 'm-eco-n', src: '/assets/ecosystem-media.webp', name: 'ecosystem-media.webp', alt: 'Studio media akademik', used: 'Ekosistem' },
      { id: 'm-eco-t', src: '/assets/ecosystem-training.webp', name: 'ecosystem-training.webp', alt: 'Peneliti dalam lokakarya menulis', used: 'Ekosistem' },
      { id: 'm-eco-b', src: '/assets/ecosystem-books.webp', name: 'ecosystem-books.webp', alt: 'Buku akademik bersampul teal', used: 'Ekosistem' },
      { id: 'm-jetsi', src: '/assets/journal-jetsi-preview.webp', name: 'journal-jetsi-preview.webp', alt: 'Cuplikan halaman JETSI', used: 'Jurnal' },
      { id: 'm-jiel', src: '/assets/journal-jiel-preview.webp', name: 'journal-jiel-preview.webp', alt: 'Cuplikan halaman JIEL', used: 'Jurnal' },
    ],
    users: [
      { id: 'u-owner', name: 'Fandi Achmad', email: '[email Owner]', role: 'owner', active: true },
      { id: 'u-admin', name: '[Nama staf Admin]', email: '[email Admin]', role: 'admin', active: true },
      { id: 'u-marketing', name: '[Nama staf Marketing]', email: '[email Marketing]', role: 'marketing', active: true },
    ],
    site: { tagline: 'Academic Publishing & Research Support', accent: '#ffd218', seoTitle: 'Nordeo Scholar | Advancing Knowledge', seoDescription: 'Nordeo Scholar Publishing — Academic Publishing & Research Support.' },
    log: [],
  };
}

// News records from the public store; old items without a status count as published.
function loadNews() {
  return getNews().map((n) => ({ ...n, status: n.status || 'published' }));
}

export function useAdminData(role) {
  const [cms, setCms] = useState(() => {
    const saved = read(CMS_KEY, null);
    return saved && typeof saved === 'object' ? { ...seed(), ...saved } : seed();
  });
  const [news, setNews] = useState(loadNews);
  const [submissions, setSubmissions] = useState(() => read(STORE.newsSubmissions, []));
  const [registrations] = useState(() => read(STORE.trainingRegistrations, []));
  const [saveError, setSaveError] = useState(false);

  useEffect(() => { setSaveError(!write(CMS_KEY, cms)); }, [cms]);

  const person = ROLES.find((r) => r.id === role) || ROLES[1];
  const log = useCallback((action, target) => {
    setCms((c) => ({ ...c, log: [{ id: makeId('log'), at: new Date().toISOString(), who: person.person, role: person.label, action, target }, ...(c.log || [])].slice(0, 200) }));
  }, [person]);

  const update = useCallback((key, value, action, target) => {
    setCms((c) => ({ ...c, [key]: typeof value === 'function' ? value(c[key]) : value }));
    if (action) log(action, target);
  }, [log]);

  const commitNews = useCallback((next, action, target) => {
    setNews(next);
    if (!saveNews(next)) setSaveError(true);
    if (action) log(action, target);
  }, [log]);

  const commitSubmissions = useCallback((next) => {
    setSubmissions(next);
    write(STORE.newsSubmissions, next);
  }, []);

  return { cms, update, news, commitNews, submissions, commitSubmissions, registrations, log, saveError, today };
}

export function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [columns.map(([, label]) => esc(label)).join(','), ...rows.map((r) => columns.map(([key]) => esc(r[key])).join(','))].join('\n');
}

export function daysSince(date) {
  if (!date) return Infinity;
  return Math.floor((Date.now() - new Date(`${date}T00:00:00`).getTime()) / 86400000);
}
