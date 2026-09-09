import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test } from 'vitest';
import App from './App';

test('renders the Nordeo Scholar site header', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('banner', { name: /nordeo scholar/i })).toBeInTheDocument();
});

test('keeps JETSI as an external journal destination', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /visit jetsi/i })).toHaveAttribute('href', 'https://nordeoscholar.com/jetsi');
});

test('keeps Jurnal Pengmas inside Nordeo', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getAllByRole('link', { name: /visit jurnal pengmas/i }).at(-1)).toHaveAttribute('href', '/journals/jurnalpengmas');
});
