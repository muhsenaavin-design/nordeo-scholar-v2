import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, test } from 'vitest';
import App from './App';

beforeEach(() => { localStorage.clear(); });

test('renders the Nordeo Scholar site header', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('banner', { name: /nordeo scholar/i })).toBeInTheDocument();
});

test('keeps JETSI as an external journal destination', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /visit jetsi/i })).toHaveAttribute('href', 'https://nordeoscholar.com/journal/jetsi');
});

test('links JIEL to its own journal platform', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /visit jiel/i })).toHaveAttribute('href', 'https://nordeoscholar.com/journal/jiel');
});

test('links Jurnal Pengmas and JIBDI to their journal paths (Feedback 2)', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getAllByRole('link', { name: /visit jurnal pengmas/i }).at(-1)).toHaveAttribute('href', 'https://nordeoscholar.com/journal/pengmas');
  expect(screen.getAllByRole('link', { name: /visit jibdi/i }).at(-1)).toHaveAttribute('href', 'https://nordeoscholar.com/journal/jibdi');
});

test('journal cards send visitors to the journal site only', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const journals = within(document.getElementById('journals'));
  expect(journals.queryByText(/submission guidelines/i)).not.toBeInTheDocument();
  expect(journals.queryByText(/manuscript template/i)).not.toBeInTheDocument();
  expect(journals.queryByRole('button', { name: /view \d+ articles|view profile/i })).not.toBeInTheDocument();
  expect(journals.getByRole('region', { name: /nordeo journals/i })).toBeInTheDocument();
});

test('article links use the DOIs registered with Crossref', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /shopee live among generation z/i })).toHaveAttribute('href', 'https://doi.org/10.68627/742989');
  for (const link of screen.getAllByRole('link').filter(item => /doi\.org/.test(item.getAttribute('href')))) {
    expect(link.getAttribute('href')).toMatch(/^https:\/\/doi\.org\/10\.68627\/\d+$/);
  }
});

test('makes journal discovery and ecosystem availability clear on the homepage', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const main = within(screen.getByRole('main'));
  expect(main.getByRole('heading', { level: 1, name: /advancing knowledge/i })).toBeInTheDocument();
  expect(main.queryByRole('link', { name: /explore journals/i })).not.toBeInTheDocument();
  expect(main.getByRole('link', { name: /discover the ecosystem/i })).toHaveAttribute('href', '/#ecosystem');
  expect(main.getAllByText(/^coming soon$/i)).toHaveLength(1);
  for (const title of ['Journals Publishing', 'Media & News Publishing', 'Academic Training', 'Books Publishing']) {
    expect(main.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
  }
  expect(main.getAllByText('NordeoNews').length).toBeGreaterThan(0);
  const browse = main.getByRole('link', { name: /browse the journals/i });
  expect(browse).toHaveAttribute('href', 'https://nordeoscholar.com/journal/');
  expect(browse).toHaveAttribute('target', '_blank');
  expect(browse).toHaveAttribute('rel', 'noopener noreferrer');
  expect(main.getByRole('link', { name: /visit jetsi/i })).toHaveAttribute('href', 'https://nordeoscholar.com/journal/jetsi');
});

test('homepage merges vision, overview, and founder note into one section before the four rooms', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const main = within(screen.getByRole('main'));
  const about = main.getByRole('heading', { level: 2, name: /about nordeo/i });
  const rooms = main.getByRole('heading', { level: 2, name: /one house of knowledge/i });
  expect(about.closest('section')).toHaveAttribute('id', 'about');
  expect(about.compareDocumentPosition(rooms) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  const section = within(about.closest('section'));
  expect(section.getByText(/journals, news, training, and books under one roof/i)).toHaveTextContent(/advance knowledge and create global impact/i);
  expect(section.getByText(/good research deserves a clear, honest path/i)).toBeInTheDocument();
  expect(section.getByRole('link', { name: /more about nordeo/i })).toHaveAttribute('href', '/about');
  expect(section.getByRole('link', { name: /meet the founder/i })).toHaveAttribute('href', '/founder');
  for (const name of [/^our vision$/i, /company overview/i, /core values/i]) expect(main.queryByRole('heading', { name })).not.toBeInTheDocument();
  expect(document.getElementById('founder')).toBeNull();
  expect(screen.queryByText(/articles published in jetsi/i)).not.toBeInTheDocument();
  expect(screen.getByRole('list', { name: /popular stories/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: /academy calendar/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: /questions, answered/i })).toBeInTheDocument();
});

test('mobile navigation exposes its state and closes with Escape', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const toggle = screen.getByRole('button', { name: /menu/i });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('header lists the ecosystems and returns from a detail page to the landing', () => {
  render(<MemoryRouter initialEntries={['/books']}><App /></MemoryRouter>);
  const nav = within(screen.getByRole('navigation', { name: /main navigation/i }));
  for (const [name, href] of [['About', '/about'], ['Journals', '/#journals'], ['NordeoNews', '/news'], ['Academy', '/training'], ['Contact', '/#contact']]) {
    expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  }
  const books = nav.getAllByRole('link', { name: /^books/i }).find(link => !/publishing/i.test(link.textContent));
  expect(books).toHaveAttribute('href', '/books');
  expect(books).toHaveTextContent(/coming soon/i);
  expect(nav.queryByRole('link', { name: /explore journals/i })).not.toBeInTheDocument();
  expect(nav.getByRole('button', { name: 'Ecosystem' })).toHaveClass('button-dark');
  fireEvent.click(nav.getByRole('link', { name: 'About', exact: true }));
  expect(screen.getByRole('heading', { level: 1, name: /empowering research/i })).toBeInTheDocument();
  expect(nav.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('keeps the homepage focused: no discovery logo wall, official social links in the footer', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.queryByRole('heading', { name: /knowledge,\s*within reach/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /lihat entri garuda/i })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /instagram @nordeoscholar/i })).toHaveAttribute('href', 'https://www.instagram.com/nordeoscholar/');
  expect(screen.queryByRole('button', { name: /jeda animasi/i })).not.toBeInTheDocument();
});

test('journal finder filters audited JETSI articles and handles the JIEL call for papers', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const search = screen.getByRole('searchbox', { name: /search journals/i });
  fireEvent.change(search, { target: { value: 'Shopee' } });
  expect(screen.getByText('1 journal · 2 articles')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /shopee/i })).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: /Clear/ }));
  fireEvent.click(screen.getByRole('button', { name: /^JIEL/ }));
  expect(screen.getByRole('heading', { name: /jiel is open for its first submissions/i })).toBeInTheDocument();
});

test('journal finder exposes every audited JETSI article on the journals page', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getByText('14 articles · JETSI')).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(14);
});

test('ecosystem dropdown lists all four ecosystems and closes with Escape', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const nav = within(screen.getByRole('navigation', { name: /main navigation/i }));
  const trigger = nav.getByRole('button', { name: 'Ecosystem' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const menu = within(document.getElementById('ecosystem-menu'));
  expect(menu.getByRole('link', { name: /journals publishing/i })).toHaveAttribute('href', '/journals');
  expect(menu.getByRole('link', { name: /media & news publishing/i })).toHaveAttribute('href', '/news');
  expect(menu.getByRole('link', { name: /academic training/i })).toHaveAttribute('href', '/training');
  expect(menu.getByRole('link', { name: /books publishing/i })).toHaveAttribute('href', '/books');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('news submission validates each step and offers the AI draft assistant', async () => {
  render(<MemoryRouter initialEntries={['/news/kirim']}><App /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: /isi langsung di sini/i }));
  expect(screen.getByRole('heading', { level: 2, name: 'Jenis & sudut' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /lanjut: isi berita/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/3 isian/);
  expect(screen.getByLabelText(/judul usulan/i)).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(screen.getByLabelText(/judul usulan/i), { target: { value: 'Riset UX e-commerce terbit di JETSI' } });
  fireEvent.change(screen.getByLabelText(/lead/i), { target: { value: 'Dua peneliti mengukur usability Shopee, Tokopedia, dan Lazada dengan SUS dan UEQ, lalu menerbitkan hasilnya di JETSI edisi terbaru.' } });
  fireEvent.change(screen.getByLabelText(/mengapa sekarang/i), { target: { value: 'Artikel baru saja terbit minggu ini.' } });
  fireEvent.click(screen.getByRole('button', { name: /lanjut: isi berita/i }));
  expect(screen.getByRole('heading', { level: 2, name: 'Isi berita' })).toBeInTheDocument();
  const editor = screen.getByRole('textbox', { name: /isi naskah/i });
  expect(editor).toHaveAttribute('contenteditable', 'true');
  const toolbar = screen.getByRole('toolbar', { name: /format teks/i });
  ['Tebal (Ctrl+B)', 'Miring (Ctrl+I)', 'Garis bawah (Ctrl+U)', 'Rata kiri-kanan (justify)', 'Daftar bernomor', 'Sisipkan tautan'].forEach(name => expect(within(toolbar).getByRole('button', { name })).toBeInTheDocument());
  expect(screen.getByLabelText('Penulis')).toBeInTheDocument();
  expect(screen.getByLabelText(/^editor/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /susun draf dengan ai/i }));
  expect(await screen.findByText('Alternatif judul', {}, { timeout: 2000 })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /pakai lead ini/i }));
  fireEvent.click(screen.getByRole('button', { name: /masukkan draf ke isi naskah/i }));
  expect(editor.querySelector('p')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /kembali/i }));
  expect(screen.getByLabelText(/judul usulan/i)).toHaveValue('Riset UX e-commerce terbit di JETSI');
});

test('news submission can go through the Word template instead', async () => {
  render(<MemoryRouter initialEntries={['/news/kirim']}><App /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: /pakai template word/i }));
  expect(screen.getByRole('heading', { level: 2, name: /kirim dengan template word/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /unduh template/i })).toHaveAttribute('href', '/templates/Nordeo-News-Submission-Form.docx');
  fireEvent.click(screen.getByRole('button', { name: /kirim ke redaksi/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/8 isian/);
  expect(screen.getByText('Unggah formulir Word yang sudah diisi.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /pakai formulir online/i }));
  expect(screen.getByRole('heading', { level: 2, name: 'Jenis & sudut' })).toBeInTheDocument();
});

test('news articles show the credit line and accept reader comments', async () => {
  render(<MemoryRouter initialEntries={['/news/riset-terbuka-masa-depan-penerbitan']}><App /></MemoryRouter>);
  expect((await screen.findByText(/penulis:/i)).closest('.article-credits')).toHaveTextContent('Penulis: Redaksi Nordeo|Editor: Redaksi NordeoNews|Foto: Dok. Nordeo Scholar');
  expect(screen.getByRole('heading', { level: 2, name: /komentar \(0\)/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /kirim komentar/i }));
  expect(screen.getByLabelText(/komentar \*/i)).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(screen.getByLabelText(/komentar \*/i), { target: { value: 'Tulisan yang jernih, terima kasih.' } });
  fireEvent.change(screen.getByLabelText(/nama \*/i), { target: { value: 'Rina' } });
  fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'rina@kampus.ac.id' } });
  fireEvent.click(screen.getByRole('button', { name: /kirim komentar/i }));
  expect(screen.getByRole('heading', { level: 2, name: /komentar \(1\)/i })).toBeInTheDocument();
  expect(screen.getByText('Tulisan yang jernih, terima kasih.')).toBeInTheDocument();
  expect(screen.queryByText('rina@kampus.ac.id')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Balas' }));
  expect(screen.getByRole('heading', { level: 3, name: /balas rina/i })).toBeInTheDocument();
});

test('homepage shows the partner logos and hides the sample reviews', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('img', { name: 'Institut Teknologi Bandung' })).toHaveAttribute('src', '/assets/partners/itb.svg');
  expect(screen.getByRole('img', { name: 'Politeknik META Industri' })).toHaveAttribute('src', '/assets/partners/politeknik-meta.webp');
  // The built-in reviews are samples written to design the section, so they stay hidden
  // until Marketing adds real, approved reviews in the dashboard.
  expect(screen.queryByRole('heading', { level: 2, name: /trusted by the people/i })).not.toBeInTheDocument();
});

test('academy lists placeholder programs and records interest for a chosen program', async () => {
  render(<MemoryRouter initialEntries={['/training/']}><App /></MemoryRouter>);
  expect(screen.getByRole('banner', { name: /nordeo academy/i })).toBeInTheDocument();
  expect(await screen.findByRole('heading', { level: 1, name: /menulis, meneliti/i })).toBeInTheDocument();
  fireEvent.click(within(screen.getByRole('group', { name: /filter jenis program/i })).getByRole('button', { name: 'Konferensi' }));
  expect(screen.getByRole('status')).toHaveTextContent('2 program');
  expect(screen.getAllByText(/jadwal tentatif/i).length).toBeGreaterThan(0);
});

test('academy registration preselects the program and confirms with a reference', async () => {
  render(<MemoryRouter initialEntries={['/training/daftar?program=seminar-reviewer']}><App /></MemoryRouter>);
  expect(await screen.findByLabelText('Program')).toHaveValue('seminar-reviewer');
  fireEvent.click(screen.getByRole('button', { name: /daftarkan minat/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/4 isian/);
  fireEvent.change(screen.getByLabelText('Nama lengkap'), { target: { value: 'Ayu Lestari' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ayu@kampus.ac.id' } });
  fireEvent.change(screen.getByLabelText(/institusi/i), { target: { value: 'Universitas Contoh' } });
  fireEvent.click(screen.getByLabelText(/setuju dihubungi/i));
  fireEvent.click(screen.getByRole('button', { name: /daftarkan minat/i }));
  expect(await screen.findByRole('heading', { level: 1, name: /terima kasih, ayu/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /kirim ke academy@nordeoscholar.com/i }).getAttribute('href')).toMatch(/^mailto:academy@nordeoscholar\.com/);
});

test('NordeoNews guide publishes the step-by-step workflow and audited references', async () => {
  render(<MemoryRouter initialEntries={['/news/panduan']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { level: 1, name: /dari kabar riset/i })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(expect.arrayContaining(['Cek kecocokan kanal', 'Isi formulir & jadwal', 'Tayang & arsip']));
  expect(screen.getByRole('link', { name: /eurekalert! \(aaas\)/i })).toHaveAttribute('href', 'https://www.eurekalert.org/releaseguidelines');
});

test('homepage closes with the office address and map', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument();
  const location = within(document.getElementById('contact'));
  expect(location.getByText(/G-Land Arcadia Buah Batu, Jl\. Cikoneng, Bojongsoang 40288, Bandung, Indonesia\./)).toBeInTheDocument();
  expect(location.getByTitle(/map showing nordeo scholar publishing/i).getAttribute('src')).toMatch(/^https:\/\/www\.google\.com\/maps\?q=G-Land/);
  expect(location.getByRole('link', { name: /admin@nordeoscholar\.com/ })).toHaveAttribute('href', 'mailto:admin@nordeoscholar.com');
});

test('founder profile links to the Scopus, Google Scholar, SINTA, and ORCID profiles', () => {
  render(<MemoryRouter initialEntries={['/founder']}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1, name: /fandi achmad/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /on scopus/i })).toHaveAttribute('href', 'https://www.scopus.com/authid/detail.uri?authorId=58139295200');
  expect(screen.getByRole('link', { name: /on google scholar/i }).getAttribute('href')).toMatch(/user=jYKJgjwAAAAJ/);
  expect(screen.getByRole('link', { name: /on sinta/i })).toHaveAttribute('href', 'https://sinta.kemdiktisaintek.go.id/authors/profile/6856625');
  expect(screen.getByRole('link', { name: /on orcid/i })).toHaveAttribute('href', 'https://orcid.org/0000-0001-9599-1369');
});

test('our story page carries the full company profile: overview, vision, mission, and core values', () => {
  render(<MemoryRouter initialEntries={['/about']}><App /></MemoryRouter>);
  expect(screen.getByText(/we collaborate with researchers, students, educational institutions/i)).toBeInTheDocument();
  expect(screen.getByText(/to become a trusted academic publishing and research services company/i)).toBeInTheDocument();
  for (const value of ['Integrity', 'Excellence', 'Innovation', 'Collaboration', 'Knowledge Sharing', 'Professionalism']) {
    expect(screen.getByRole('heading', { level: 3, name: value })).toBeInTheDocument();
  }
  expect(screen.getByRole('heading', { level: 2, name: /how nordeo grew/i })).toBeInTheDocument();
  expect(screen.getByText(/upholding publication ethics and scientific integrity/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Core values' })).toBeInTheDocument();
});

test('NordeoNews brands the news microsite and filters stories by the new rubrics', async () => {
  render(<MemoryRouter initialEntries={['/news/']}><App /></MemoryRouter>);
  expect(await screen.findByRole('link', { name: 'NordeoNews home' })).toBeInTheDocument();
  const tabs = within(await screen.findByRole('group', { name: /filter rubrik/i }));
  expect(tabs.getAllByRole('button').map(node => node.textContent)).toEqual(['Semua', 'Berita', 'Pendidikan', 'Bisnis', 'Teknologi', 'Lifestyle', 'Opini']);
  expect(tabs.getByRole('button', { name: 'Semua' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('region', { name: /cerita lainnya/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 3, name: 'Terbaru' })).toBeInTheDocument();
  fireEvent.click(tabs.getByRole('button', { name: 'Opini' }));
  expect(screen.getByRole('status')).toHaveTextContent('2 cerita');
  fireEvent.click(tabs.getByRole('button', { name: 'Bisnis' }));
  expect(screen.getByRole('heading', { name: /belum ada cerita bisnis/i })).toBeInTheDocument();
});

test('hero slides carry their own copy and the running segment pauses the slideshow', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const slides = within(screen.getByRole('group', { name: 'Slides' }));
  const first = slides.getByRole('button', { name: /nordeo scholar: pause slideshow/i });
  expect(first).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(first);
  expect(slides.getByRole('button', { name: /nordeo scholar: resume slideshow/i })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(slides.getByRole('button', { name: /show journals/i }));
  expect(within(document.querySelector('.hero')).getByRole('link', { name: /browse the journals/i })).toHaveAttribute('href', '/#journals');
  expect(screen.getByRole('heading', { level: 1, name: /advancing knowledge/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /^pause$/i })).not.toBeInTheDocument();
});

test('journal status badges use the clarified labels', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const journals = within(document.getElementById('journals'));
  expect(journals.getByText('Open for submissions')).toHaveClass('status-live');
  expect(journals.queryByText('Accepting submissions')).not.toBeInTheDocument();
  expect(journals.getAllByText('Call for papers')[0]).toHaveClass('status-open');
});

test('academy lists upcoming programmes as an agenda with a month-calendar toggle', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const academy = within(document.getElementById('academy'));
  expect(academy.getByRole('list', { name: /upcoming programmes/i })).toBeInTheDocument();
  const toggle = academy.getByRole('button', { name: /view month calendar/i });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  expect(academy.getByRole('button', { name: /hide month calendar/i })).toHaveAttribute('aria-expanded', 'true');
});
