// Starting content for the dashboard, built from the data the public site already shows, so the
// first save to the database changes nothing a visitor sees. Used to seed the database and as
// the dashboard's demo data.
import { contact, externalLinks, office, officialSocial } from '../config/links';
import { coreValues, faqs, mission, partners, testimonials } from '../data/company';
import { ecosystems, vision } from '../data/ecosystems';
import { trainingPrograms } from '../data/training';

export const HOME_SECTIONS = [
  { id: 'hero', label: 'Hero (slideshow)' },
  { id: 'about', label: 'About Nordeo' },
  { id: 'ecosystems', label: 'Empat ekosistem' },
  { id: 'journals', label: 'Pencari jurnal' },
  { id: 'news', label: 'NordeoNews populer' },
  { id: 'academy', label: 'Kalender Academy' },
  { id: 'trust', label: 'Mitra, review & FAQ' },
  { id: 'contact', label: 'Peta & alamat' },
];

const ecosystemPlatform = { journals: 'OJS · JETSI, JIEL, JIBDI', news: 'NordeoNews', training: 'Nordeo Academy', books: 'Belum ada platform' };

export function seedContent(reviewed = '2026-11-10') {
  return {
    pages: {
      heroLine1: 'Advancing Knowledge.',
      heroLine2: 'Creating Global Impact.',
      heroCta: 'Discover the ecosystem',
      sections: HOME_SECTIONS.map((section) => ({ ...section, visible: true })),
      updatedAt: reviewed, reviewedAt: reviewed,
    },
    ecosystems: ecosystems.map((e) => ({
      id: e.id, title: e.title, short: e.short, description: e.description, cta: e.cta,
      link: e.ctaHref || `/${e.id === 'training' ? 'training' : e.id}`, platform: ecosystemPlatform[e.id] || '',
      status: e.status === 'Coming Soon' ? 'soon' : 'live', updatedAt: reviewed, reviewedAt: reviewed,
    })),
    profile: {
      vision: `${vision.intro} ${vision.lead} ${vision.accent}`,
      mission: [...mission],
      values: coreValues.map((value) => `${value.title}: ${value.copy}`),
      services: ['Journals Publishing', 'Books Publishing', 'Media & News Publishing', 'Academic Training'],
      updatedAt: reviewed, reviewedAt: reviewed,
    },
    programs: trainingPrograms.map((p) => ({ id: p.id, title: p.title, titleEn: p.titleEn || '', type: p.type, date: p.date || '', dateLabel: p.dateLabel, mode: p.mode, facilitator: p.facilitator, summary: p.summary, status: 'published' })),
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
      footer: [
        { id: 'f1', label: 'Author Guide', href: '/author-guide' }, { id: 'f2', label: 'Publication Ethics', href: '/publication-ethics' },
        { id: 'f3', label: 'News Publishing Guide', href: '/news/panduan' }, { id: 'f4', label: 'About Nordeo', href: '/about' },
      ],
      journalPortal: externalLinks.journalPortal,
    },
    media: [
      { id: 'm-logo', src: '/assets/logo-transparent.png', name: 'logo-transparent.png', alt: 'Logo Nordeo Scholar Publishing', used: 'Header' },
      { id: 'm-eco-j', src: '/assets/ecosystem-journals.webp', name: 'ecosystem-journals.webp', alt: 'Meja editor dengan naskah dan jurnal', used: 'Ekosistem' },
      { id: 'm-eco-n', src: '/assets/ecosystem-media.webp', name: 'ecosystem-media.webp', alt: 'Studio media akademik', used: 'Ekosistem' },
      { id: 'm-eco-t', src: '/assets/ecosystem-training.webp', name: 'ecosystem-training.webp', alt: 'Peneliti dalam lokakarya menulis', used: 'Ekosistem' },
      { id: 'm-eco-b', src: '/assets/ecosystem-books.webp', name: 'ecosystem-books.webp', alt: 'Buku akademik bersampul teal', used: 'Ekosistem' },
    ],
    promo: {
      partners: partners.map((p) => ({ ...p, id: p.name, confirmed: false })),
      // The built-in reviews were written as samples; they stay marked so the website hides them.
      testimonials: testimonials.map((t, i) => ({ ...t, id: `review-${i + 1}` })),
      faqs: faqs.map((f, i) => ({ ...f, id: `faq-${i + 1}` })),
    },
    site: { tagline: 'Academic Publishing & Research Support', seoTitle: 'Nordeo Scholar | Advancing Knowledge', seoDescription: 'Nordeo Scholar Publishing — Academic Publishing & Research Support. Advancing Knowledge. Creating Global Impact.' },
  };
}
