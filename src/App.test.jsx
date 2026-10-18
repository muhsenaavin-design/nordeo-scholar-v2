import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test } from 'vitest';
import App from './App';

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
