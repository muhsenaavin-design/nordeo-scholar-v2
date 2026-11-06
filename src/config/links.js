export const externalLinks = {
  jetsi: 'https://nordeoscholar.com/journal/jetsi',
  jiel: 'https://nordeoscholar.com/journal/jiel',
  jibdi: 'https://nordeoscholar.com/journal/jibdi',
  // Temporary path chosen by Nordeo (Feedback 2); the OJS journal is not live there yet.
  pengmas: 'https://nordeoscholar.com/journal/pengmas',
  journalPortal: 'https://nordeoscholar.com/journal/',
};

const officeQuery = 'G-Land Arcadia Buah Batu, Jl. Cikoneng, Bojongsoang, Bandung 40288';

export const office = {
  name: 'Nordeo Scholar Publishing',
  address: 'G-Land Arcadia Buah Batu, Jl. Cikoneng, Bojongsoang 40288, Bandung, Indonesia.',
  mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(officeQuery)}&output=embed`,
  mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeQuery)}`,
};

export const officialSocial = {
  instagram: 'https://www.instagram.com/nordeoscholar/',
  whatsapp: 'https://wa.me/6282232218619',
};

export const newsTemplate = '/templates/Nordeo-News-Submission-Form.docx';

export const contact = {
  general: 'admin@nordeoscholar.com',
  news: 'news@nordeoscholar.com',
  books: 'books@nordeoscholar.com',
  training: 'academy@nordeoscholar.com',
};
