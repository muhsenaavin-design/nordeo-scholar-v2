import { expect, test } from 'vitest';
import { photoSourceSet, stockPhotoCredit, upgradeEditorialPhoto } from './editorial-photos';

test('upgrades saved placeholders and credits while preserving editorial fields', () => {
  const saved = { title: 'Edited title', cover: '/assets/art/news/open-science.svg', coverAlt: 'Old art', credits: { writer: 'Author', editor: 'Editor', photo: 'Dok. Nordeo' } };
  const updated = upgradeEditorialPhoto(saved);
  expect(updated.cover).toBe('/assets/photos/research-library-1920.webp');
  expect(updated.coverAlt).not.toBe('Old art');
  expect(updated.credits).toMatchObject({ writer: 'Author', editor: 'Editor', photo: 'Ilustrasi: Yan Krukau / Pexels' });
  expect(saved.cover).toBe('/assets/art/news/open-science.svg');
});

test('keeps uploaded covers and their credits intact', () => {
  const custom = { cover: 'https://example.com/my-cover.webp', coverAlt: 'My cover', credits: { photo: 'Me' } };
  expect(upgradeEditorialPhoto(custom)).toBe(custom);
  expect(photoSourceSet(custom.cover)).toBeUndefined();
  expect(stockPhotoCredit(custom.cover)).toBeUndefined();
  expect(stockPhotoCredit('/assets/photos/conference-hall-1920.webp')).toBe('Ilustrasi: Mitchel Onwuchuruba / Pexels');
});

test('responsive variants include a real UHD candidate', () => {
  expect(photoSourceSet('/assets/photos/writing-desk-1920.webp')).toBe(
    [640, 1280, 1920, 3840].map(w => `/assets/photos/writing-desk-${w}.webp ${w}w`).join(', '));
  expect(photoSourceSet('/assets/photos/unknown-1920.webp')).toBeUndefined();
});
