import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';
import App from './App';

// The vendor marquee needs real layout measurements; scripts/check-discovery.js tests it in Chromium.
vi.mock('./components/vendor/LogoLoop', () => ({ default: ({ logos }) => <div>{logos.map(logo => <a key={logo.href} href={logo.href} aria-label={logo.ariaLabel}>{logo.node}</a>)}</div> }));

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
  expect(main.getByRole('link', { name: /explore journals/i })).toHaveAttribute('href', '/journals');
  expect(main.getAllByText(/^coming soon$/i)).toHaveLength(3);
  expect(main.getByRole('link', { name: /visit jetsi/i })).toHaveAttribute('href', 'https://nordeoscholar.com/journal/jetsi');
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
  const nav = within(screen.getByRole('navigation', { name: /navigasi utama/i }));
  for (const name of ['About', 'Ecosystem', 'Journals', 'Contact']) {
    expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', `/#${name.toLowerCase()}`);
  }
  expect(nav.getByRole('link', { name: /explore journals/i })).toHaveAttribute('href', '/journals');
  fireEvent.click(nav.getByRole('link', { name: 'About', exact: true }));
  expect(screen.getByRole('heading', { level: 1, name: /advancing knowledge/i })).toBeInTheDocument();
  expect(nav.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'location');
});

test('separates verified journal indexing from discovery resources and links official social accounts', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /lihat entri garuda/i })).toHaveAttribute('href', 'https://garuda.kemdiktisaintek.go.id/journal/view/48487');
  expect(screen.getByRole('link', { name: /instagram @nordeoscholar/i })).toHaveAttribute('href', 'https://www.instagram.com/nordeoscholar/');
  expect(screen.queryByText(/platform indeksasi/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/status indeksasi berbeda/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Data GARUDA: 19 Oktober 2026/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /jeda animasi/i })).not.toBeInTheDocument();
  expect(within(screen.getByRole('contentinfo')).queryByRole('button', { name: /animasi/i })).not.toBeInTheDocument();
});

test('journal finder filters audited JETSI articles and handles the JIEL call for papers', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const search = screen.getByRole('searchbox', { name: /cari nama jurnal/i });
  fireEvent.change(search, { target: { value: 'Shopee' } });
  expect(screen.getByText('1 jurnal · 2 artikel')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /shopee/i })).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: /Hapus/ }));
  fireEvent.click(screen.getByRole('button', { name: /^JIEL/ }));
  expect(screen.getByRole('heading', { name: /jiel membuka ruang untuk naskah pertama/i })).toBeInTheDocument();
});

test('journal finder exposes every audited JETSI article on the journals page', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getByText('14 artikel · JETSI')).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(14);
});
