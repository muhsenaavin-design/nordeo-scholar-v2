// One record per ecosystem. Order is the order used in the header menu, the homepage
// showcase, and the footer. Copy is English: it appears on the landing page and in menus.
export const ecosystems = [
  {
    id: 'journals',
    number: '01',
    title: 'Journals Publishing',
    short: 'Journals',
    description: 'Open-access, peer-reviewed journals: JETSI for engineering and technology, JIEL for education and learning.',
    menuCopy: 'JETSI, JIEL, and Jurnal Pengmas',
    image: '/assets/generated/ecosystem-journals-v1.webp',
    alt: 'Editor’s desk with manuscripts, journals, and research instruments',
    status: 'Available',
    tone: 'live',
    domain: 'nordeoscholar.com/journals',
    cta: 'Browse the journals',
  },
  {
    id: 'news',
    number: '02',
    title: 'Media & News Publishing',
    short: 'Newsroom',
    description: 'An academic newsroom for research news, editor’s notes, and campus stories, with an open submission desk.',
    menuCopy: 'Research news and story submissions',
    image: '/assets/generated/ecosystem-media-v1.webp',
    alt: 'Academic media studio with a microphone and editing screen',
    status: 'New',
    tone: 'open',
    domain: 'news.nordeoscholar.com',
    cta: 'Enter the Newsroom',
  },
  {
    id: 'training',
    number: '03',
    title: 'Academic Training',
    short: 'Academy',
    description: 'Journal writing and publishing training, seminars, conferences, and structured modules for researchers and lecturers.',
    menuCopy: 'Journal writing, seminars, conferences',
    image: '/assets/generated/ecosystem-training-v1.webp',
    alt: 'Researchers collaborating in an academic writing workshop',
    status: 'New',
    tone: 'open',
    domain: 'training.nordeoscholar.com',
    cta: 'Enter the Academy',
  },
  {
    id: 'books',
    number: '04',
    title: 'Books Publishing',
    short: 'Books',
    description: 'Monographs, edited volumes, and academic reference books. The catalogue and proposal process are in preparation.',
    menuCopy: 'Monographs and edited volumes',
    image: '/assets/generated/ecosystem-books-v1.webp',
    alt: 'Teal-bound academic books on a reading desk',
    status: 'Coming Soon',
    tone: 'preview',
    domain: 'books.nordeoscholar.com',
    cta: 'See the plan',
  },
];

export const journalFacts = [
  ['Active peer-reviewed journals', 2, ''],
  ['Articles published in JETSI', 14, ''],
  ['JETSI records in GARUDA', 13, ''],
  ['Connected ecosystems', 4, ''],
];

// Founder profile: name and degrees from the JETSI and JIEL editorial pages; the founder
// role was supplied by Nordeo. Only name, degrees, and role are shown.
export const founder = {
  name: 'Fandi Achmad',
  degrees: 'S.T., M.T.',
  role: 'Founder, Nordeo Scholar',
  photo: '/assets/team/fandi-achmad.webp',
  photoSmall: '/assets/team/fandi-achmad-640.webp',
};

export const principles = [
  ['Integrity', 'Editorial work that can be accounted for.'],
  ['Transparency', 'Clear stages, policies, and costs.'],
  ['Collaboration', 'Authors, editors, and partners in one conversation.'],
];
