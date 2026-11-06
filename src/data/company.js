import { contact } from '../config/links';

// Company copy supplied by Nordeo in "[Nordeo Scholar Publishing] Profil Perusahaan"
// (first edition, Sep 2026, and the Feedback 2 deck, Nov 2026). Keep the wording as given.
export const companyOverview = {
  name: 'PT Nordeo Scholar Publishing',
  tagline: 'Empowering Research. Advancing Knowledge.',
  nameCalling: 'Your Trusted Academic Publishing Partner',
  paragraphs: [
    'PT Nordeo Scholar Publishing is an academic publishing and research support company dedicated to advancing scientific knowledge through scholarly publishing, research consulting, academic training, and knowledge dissemination.',
    'We collaborate with researchers, students, educational institutions, and organizations to produce high-quality scientific publications while upholding the highest standards of publication ethics, integrity, and innovation.',
  ],
};

export const coreValues = [
  { title: 'Integrity', copy: 'We uphold honesty, transparency, and publication ethics in every research and publishing process.' },
  { title: 'Excellence', copy: 'We strive for excellence by delivering high-quality academic publications and professional services.' },
  { title: 'Innovation', copy: 'We continuously develop innovative solutions to support research, publishing, and scientific communication.' },
  { title: 'Collaboration', copy: 'We build strong partnerships with researchers, universities, institutions, and industry to create greater impact.' },
  { title: 'Knowledge Sharing', copy: 'We believe knowledge should be accessible and shared to foster education, research, and societal development.' },
  { title: 'Professionalism', copy: 'We are committed to providing reliable, responsive, and accountable services to every client and partner.' },
];

export const mission = [
  'Supporting quality scientific publications.',
  'Improving access to knowledge.',
  'Providing professional academic consulting services.',
  'Developing a research and innovation ecosystem.',
  'Upholding publication ethics and scientific integrity.',
];

// "Our Story" chapters. Built only from facts in the company profile and the journal
// platforms; Nordeo can replace or extend them with the history from its own deck.
export const storyChapters = [
  {
    label: 'The idea',
    title: 'A home for research that deserves readers',
    copy: 'Based in Bandung, Nordeo Scholar Publishing was founded to support researchers, students, academics, educational institutions, and the public in producing and disseminating quality scholarly work.',
  },
  {
    label: 'First journal',
    title: 'JETSI opens its first issues',
    copy: 'The Journal of Engineering Technology and Science Integration published Volume 1, Numbers 1 and 2 in 2026, peer reviewed and open access.',
  },
  {
    label: 'DOI',
    title: 'Articles registered with Crossref',
    copy: 'Nordeo became a Crossref member, so every published JETSI article carries a persistent DOI under the 10.68627 prefix.',
  },
  {
    label: 'More journals',
    title: 'JIEL, JIBDI, and Jurnal Pengmas',
    copy: 'Education and learning, business and digital innovation, and community service each received a journal of their own.',
  },
  {
    label: 'One ecosystem',
    title: 'Journals, news, training, and books',
    copy: 'NordeoNews, the Nordeo Academy, and Nordeo Books joined the journals so that research can be written, published, and shared in one place.',
  },
];

// Founder profile. Name, degrees, and affiliation follow the editorial-team pages of
// JETSI, JIEL, and JIBDI; the profile links are the ones those pages publish.
export const founderProfile = {
  title: 'Founder & Chief Executive Officer',
  affiliation: 'Telkom University, Indonesia',
  bio: [
    'Fandi Achmad founded PT Nordeo Scholar Publishing and leads it as Chief Executive Officer. He is an academic at Telkom University, Indonesia.',
    'He serves as Editor-in-Chief of JETSI, JIEL, and JIBDI, guiding their editorial standards, peer review, and publication ethics.',
  ],
  roles: [
    { journal: 'jetsi', label: 'Editor-in-Chief, JETSI', href: 'https://nordeoscholar.com/journal/jetsi/about/editorialTeam' },
    { journal: 'jiel', label: 'Editor-in-Chief, JIEL', href: 'https://nordeoscholar.com/journal/jiel/about/editorialTeam' },
    { journal: 'jibdi', label: 'Editor-in-Chief, JIBDI', href: 'https://nordeoscholar.com/journal/jibdi/about/editorialTeam' },
  ],
  profiles: [
    { id: 'scopus', label: 'Scopus', detail: 'Author ID 58139295200', href: 'https://www.scopus.com/authid/detail.uri?authorId=58139295200' },
    { id: 'scholar', label: 'Google Scholar', detail: 'Citations and publications', href: 'https://scholar.google.co.id/citations?user=jYKJgjwAAAAJ&hl=id' },
    { id: 'sinta', label: 'SINTA', detail: 'SINTA ID 6856625', href: 'https://sinta.kemdiktisaintek.go.id/authors/profile/6856625' },
    { id: 'orcid', label: 'ORCID', detail: 'ORCID 0000-0001-9599-1369', href: 'https://orcid.org/0000-0001-9599-1369' },
  ],
};

// Logo strip. These are the services the journals are registered with today. Add partner
// institutions to `partners` (name + logo path) once Nordeo confirms them and their consent.
export const indexingServices = [
  { name: 'Crossref', note: 'DOI registration' },
  { name: 'Google Scholar', note: 'Indexed' },
  { name: 'GARUDA', note: 'Indexed' },
  { name: 'Open Journal Systems', note: 'Journal platform' },
  { name: 'Open Access', note: 'Free to read' },
  { name: 'Double-blind review', note: 'Peer review' },
];

// Logos: ITB from Indonesian Wikipedia (Indonesian government work, public domain);
// Politeknik META Industri from the header of politeknikmeta.ac.id.
export const partners = [
  { name: 'Institut Teknologi Bandung', logo: '/assets/partners/itb.svg', scale: 1.3 },
  { name: 'Politeknik META Industri', logo: '/assets/partners/politeknik-meta.webp' },
];

// PLACEHOLDER REVIEWS (Nov 2026). Written as samples at Nordeo's request so the section can
// be designed; they are not quotes from real people. Replace each one with a real, approved
// quote before relying on it: { quote, name, role, service, rating, photo? }.
export const testimonials = [
  { quote: 'The review comments were specific and fair. I knew exactly what to fix, and the revised paper is far stronger than the one I sent.', name: 'JETSI author', role: 'Lecturer, industrial engineering', service: 'Journals', rating: 5 },
  { quote: 'Every email got a reply within days. For a first submission, that calm communication mattered more than I expected.', name: 'JIEL author', role: 'Master’s student, education', service: 'Journals', rating: 5 },
  { quote: 'The writing clinic took us from a messy draft to a manuscript we were confident enough to submit.', name: 'Academy participant', role: 'Lecturer, business faculty', service: 'Academy', rating: 5 },
  { quote: 'Our community service report became a story people actually read. The editors kept our facts and made them clearer.', name: 'NordeoNews contributor', role: 'Public relations, university', service: 'NordeoNews', rating: 5 },
  { quote: 'Clear author guidelines, a working template, and a DOI on publication. Everything a young journal should get right.', name: 'JIBDI author', role: 'Researcher, digital business', service: 'Journals', rating: 5 },
  { quote: 'The seminar was practical from start to finish: real examples, real reviewer comments, no filler.', name: 'Academy participant', role: 'Doctoral candidate', service: 'Academy', rating: 5 },
];

export const faqs = [
  {
    q: 'How do I submit a manuscript?',
    a: 'Choose the journal that fits your field, then register and submit on that journal’s own platform. Each journal lists its author guidelines and template there.',
  },
  {
    q: 'Are Nordeo journals peer reviewed and open access?',
    a: 'Yes. Every Nordeo journal is open access, and manuscripts pass an editorial screening followed by double-blind peer review.',
  },
  {
    q: 'Do published articles receive a DOI?',
    a: 'Yes. Nordeo is a Crossref member, and published JETSI articles are registered with DOIs under the 10.68627 prefix.',
  },
  {
    q: 'Which fields do the journals cover?',
    a: 'JETSI covers engineering, technology, and science; JIEL covers education and learning; JIBDI covers business and digital innovation; Jurnal Pengmas covers community service.',
  },
  {
    q: 'How can I join an Academy seminar or class?',
    a: 'Open the Academy calendar, pick a programme, and register your interest. The Academy team confirms the final date and facilitator by email.',
  },
  {
    q: 'Can my institution work with Nordeo to start or manage a journal?',
    a: `Yes. Nordeo works with universities, research institutions, professional associations, and editors to establish and manage scholarly journals. Write to ${contact.general}.`,
  },
];
