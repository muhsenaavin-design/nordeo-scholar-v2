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

test('keeps Jurnal Pengmas inside Nordeo', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getAllByRole('link', { name: /visit jurnal pengmas/i }).at(-1)).toHaveAttribute('href', '/journals/jurnalpengmas');
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
  expect(main.getByText('Media & News')).toBeInTheDocument();
  const browse = main.getByRole('link', { name: /browse the journals/i });
  expect(browse).toHaveAttribute('href', 'https://nordeoscholar.com/journal/');
  expect(browse).toHaveAttribute('target', '_blank');
  expect(browse).toHaveAttribute('rel', 'noopener noreferrer');
  expect(main.getByRole('link', { name: /visit jetsi/i })).toHaveAttribute('href', 'https://nordeoscholar.com/journal/jetsi');
});

test('homepage states the vision in place of the metrics row', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 2, name: 'Our Vision' })).toBeInTheDocument();
  expect(screen.getByText(/to become a trusted academic publishing and research services company/i)).toBeInTheDocument();
  expect(screen.queryByText(/articles published in jetsi/i)).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 3, name: 'NordeoNews' })).toBeInTheDocument();
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

test('header sections return from a detail page to the landing while keeping the catalog CTA', () => {
  render(<MemoryRouter initialEntries={['/books']}><App /></MemoryRouter>);
  const nav = within(screen.getByRole('navigation', { name: /main navigation/i }));
  for (const name of ['About', 'Journals', 'Contact']) {
    expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', `/#${name.toLowerCase()}`);
  }
  expect(nav.getByRole('link', { name: /explore journals/i })).toHaveAttribute('href', '/journals');
  fireEvent.click(nav.getByRole('link', { name: 'About', exact: true }));
  expect(screen.getByRole('heading', { level: 1, name: /advancing knowledge/i })).toBeInTheDocument();
  expect(nav.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'location');
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
  expect(await screen.findByRole('heading', { level: 2, name: 'Jenis & sudut' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /lanjut: isi berita/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/3 isian/);
  expect(screen.getByLabelText(/judul usulan/i)).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(screen.getByLabelText(/judul usulan/i), { target: { value: 'Riset UX e-commerce terbit di JETSI' } });
  fireEvent.change(screen.getByLabelText(/lead/i), { target: { value: 'Dua peneliti mengukur usability Shopee, Tokopedia, dan Lazada dengan SUS dan UEQ, lalu menerbitkan hasilnya di JETSI edisi terbaru.' } });
  fireEvent.change(screen.getByLabelText(/mengapa sekarang/i), { target: { value: 'Artikel baru saja terbit minggu ini.' } });
  fireEvent.click(screen.getByRole('button', { name: /lanjut: isi berita/i }));
  expect(screen.getByRole('heading', { level: 2, name: 'Isi berita' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /susun draf dengan ai/i }));
  expect(await screen.findByText('Alternatif judul', {}, { timeout: 2000 })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /pakai lead ini/i }));
  fireEvent.click(screen.getByRole('button', { name: /kembali/i }));
  expect(screen.getByLabelText(/judul usulan/i)).toHaveValue('Riset UX e-commerce terbit di JETSI');
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
  expect(screen.getByRole('heading', { level: 1, name: /terima kasih, ayu/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /kirim ke academy@nordeoscholar.com/i }).getAttribute('href')).toMatch(/^mailto:academy@nordeoscholar\.com/);
});

test('NordeoNews guide publishes the step-by-step workflow and audited references', async () => {
  render(<MemoryRouter initialEntries={['/news/panduan']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { level: 1, name: /dari kabar riset/i })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(expect.arrayContaining(['Cek kecocokan kanal', 'Isi formulir & jadwal', 'Tayang & arsip']));
  expect(screen.getByRole('link', { name: /eurekalert! \(aaas\)/i })).toHaveAttribute('href', 'https://www.eurekalert.org/releaseguidelines');
});

test('homepage introduces the founder and closes with the office address and map', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 2, name: /built by a researcher/i })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /fandi achmad, founder of nordeo scholar/i })).toHaveAttribute('src', '/assets/team/fandi-achmad.webp');
  expect(screen.getByText('Integrity')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument();
  const location = within(document.getElementById('contact'));
  expect(location.getByText(/G-Land Arcadia Buah Batu, Jl\. Cikoneng, Bojongsoang 40288, Bandung, Indonesia\./)).toBeInTheDocument();
  expect(location.getByTitle(/map showing nordeo scholar publishing/i).getAttribute('src')).toMatch(/^https:\/\/www\.google\.com\/maps\?q=G-Land/);
});

test('NordeoNews brands the news microsite and filters stories by the new rubrics', async () => {
  render(<MemoryRouter initialEntries={['/news/']}><App /></MemoryRouter>);
  expect(await screen.findByRole('link', { name: 'NordeoNews home' })).toBeInTheDocument();
  const tabs = within(await screen.findByRole('group', { name: /filter rubrik/i }));
  expect(tabs.getAllByRole('button').map(node => node.textContent)).toEqual(['Semua', 'Berita', 'Pendidikan', 'Bisnis', 'Teknologi', 'Lifestyle', 'Opini']);
  expect(tabs.getByRole('button', { name: 'Semua' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('region', { name: /cerita pilihan/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 3, name: 'Terbaru' })).toBeInTheDocument();
  fireEvent.click(tabs.getByRole('button', { name: 'Opini' }));
  expect(screen.getByRole('status')).toHaveTextContent('2 cerita');
  fireEvent.click(tabs.getByRole('button', { name: 'Bisnis' }));
  expect(screen.getByRole('heading', { name: /belum ada cerita bisnis/i })).toBeInTheDocument();
});
