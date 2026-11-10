// Stock imagery is illustrative, never documentation of a Nordeo event.
const photos = {
  'research-library': ['Pembaca belajar dengan buku dan laptop di perpustakaan', 'Yan Krukau'],
  'writing-desk': ['Buku catatan terbuka dan pena di samping laptop', 'Negative Space'],
  'peer-discussion': ['Kelompok berdiskusi dan mencatat di meja kerja bersama', 'Startup Stock Photos'],
  'conference-hall': ['Audiens menghadiri acara di auditorium besar', 'Mitchel Onwuchuruba'],
  'research-presentation': ['Pemateri menjelaskan gagasan di papan tulis dalam diskusi kelompok', 'Felicity Tai'],
  'evidence-review': ['Dua orang meninjau grafik dan data pada dokumen cetak', 'Yan Krukau'],
  'community-study': ['Mahasiswa berdiskusi dengan buku dan laptop di perpustakaan', 'Ludovic Delot'],
};

const replacements = {
  '/assets/art/news/open-science.svg': 'research-library',
  '/assets/art/news/evidence-table.svg': 'evidence-review',
  '/assets/art/news/community.svg': 'community-study',
  '/assets/generated/ecosystem-training-v1.webp': 'community-study',
  '/assets/generated/hero-editorial-v1.webp': 'writing-desk',
  '/assets/art/training/seminar-draft.svg': 'writing-desk',
  '/assets/art/training/seminar-review.svg': 'peer-discussion',
  '/assets/art/training/conference-2026.svg': 'conference-hall',
  '/assets/art/training/conference-poster.svg': 'research-presentation',
  '/assets/art/training/module-scopus.svg': 'research-library',
  '/assets/art/training/module-ethics.svg': 'evidence-review',
};

export function editorialPhoto(name) {
  const [coverAlt, author] = photos[name];
  return { cover: `/assets/photos/${name}-1920.webp`, coverAlt, photoCredit: `Ilustrasi: ${author} / Pexels` };
}

// Update only known shipped placeholders; uploaded or editor-selected photos stay intact.
export function upgradeEditorialPhoto(record) {
  const name = replacements[record.cover];
  if (!name) return record;
  const { photoCredit, ...photo } = editorialPhoto(name);
  return { ...record, ...photo, ...(record.credits ? { credits: { ...record.credits, photo: photoCredit } } : {}) };
}

export function photoSourceSet(src) {
  const name = /^\/assets\/photos\/(.+)-1920\.webp$/.exec(src || '')?.[1];
  if (!photos[name]) return undefined;
  return [640, 1280, 1920, 3840].map(width => `/assets/photos/${name}-${width}.webp ${width}w`).join(', ');
}

export function stockPhotoCredit(src) {
  const name = /^\/assets\/photos\/(.+)-1920\.webp$/.exec(src || '')?.[1];
  return photos[name] ? editorialPhoto(name).photoCredit : undefined;
}
