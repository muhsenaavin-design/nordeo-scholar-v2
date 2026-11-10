import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, test } from 'vitest';
import App from '../../App';
import { MODULES } from './admin-store';

// Without a database the dashboard opens in demo mode, as the Admin role.
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

const open = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

test.each(MODULES.map((m) => [m.id, m.label]))('admin menu %s renders its screen', async (id, label) => {
  open(id === 'dashboard' ? '/admin' : `/admin/${id}`);
  expect(await screen.findByRole('heading', { level: 1, name: id === 'dashboard' ? /selamat/i : label })).toBeInTheDocument();
  expect(screen.queryByText(/tidak punya akses/i)).not.toBeInTheDocument();
});

test('dashboard puts the waiting tasks first', async () => {
  open('/admin');
  const headings = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent);
  expect(headings.indexOf('Perlu tindakan')).toBeLessThan(headings.indexOf('Empat ekosistem'));
});

test('articles are shown as a board with one column per status', async () => {
  open('/admin/news');
  for (const label of ['Draft', 'In review', 'Published', 'Archived']) {
    expect(await screen.findByRole('region', { name: new RegExp(label, 'i') })).toBeInTheDocument();
  }
});

test('homepage sections reorder with the move buttons', async () => {
  open('/admin/pages');
  const down = await screen.findByRole('button', { name: 'Turunkan Hero (slideshow)' });
  fireEvent.click(down);
  const map = screen.getByLabelText('Pratinjau urutan beranda');
  const blocks = [...map.querySelectorAll('.adm-pagemap__block')].map((n) => n.textContent);
  expect(blocks.slice(0, 2)).toEqual(['About Nordeo', 'Hero (slideshow)']);
});

test('company profile is split into Visi, Misi, Nilai, and Layanan tabs', async () => {
  open('/admin/profile');
  const tabs = within(await screen.findByRole('tablist', { name: 'Bagian profil' }));
  expect(tabs.getAllByRole('tab').map((t) => t.textContent.replace(/\d+$/, ''))).toEqual(['Visi', 'Misi', 'Nilai', 'Layanan']);
  fireEvent.click(tabs.getByRole('tab', { name: /misi/i }));
  expect(screen.getAllByRole('textbox', { name: 'Isi' }).length).toBeGreaterThan(0);
});

test('the access matrix highlights the chosen role and explains a module', async () => {
  open('/admin/users');
  const roles = within(await screen.findByRole('tablist', { name: 'Peran' }));
  fireEvent.click(roles.getByRole('tab', { name: 'Marketing' }));
  expect(roles.getByRole('tab', { name: 'Marketing' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.click(within(document.querySelector('.adm-matrix')).getByRole('button', { name: 'Menu footer' }));
  expect(screen.getByRole('heading', { level: 2, name: 'Menu footer' })).toBeInTheDocument();
});

test('site settings preview the Google result as the title is typed', async () => {
  open('/admin/site');
  const title = await screen.findByLabelText('Judul di Google');
  fireEvent.change(title, { target: { value: 'Nordeo Scholar | Uji pratinjau' } });
  expect(screen.getByText('Nordeo Scholar | Uji pratinjau', { selector: '.adm-serp__title' })).toBeInTheDocument();
});
