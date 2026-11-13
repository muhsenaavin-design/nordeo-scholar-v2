import { describe, expect, test } from 'vitest';
import { ADMIN_BASE, adminHref, adminSegment, isAdminPath } from './admin-path';
import { nextLock } from '../pages/admin/AdminApp';

describe('admin path', () => {
  test('tests and development use /admin when no secret path is set', () => {
    expect(ADMIN_BASE).toBe('/admin');
  });
  test('matches only the admin base and its children', () => {
    expect(isAdminPath('/admin')).toBe(true);
    expect(isAdminPath('/admin/news')).toBe(true);
    expect(isAdminPath('/administrasi')).toBe(false);
    expect(isAdminPath('/news')).toBe(false);
  });
  test('builds and reads module links', () => {
    expect(adminHref('dashboard')).toBe('/admin');
    expect(adminHref('media')).toBe('/admin/media');
    expect(adminSegment('/admin')).toBe('dashboard');
    expect(adminSegment('/admin/media/')).toBe('media');
  });
});

describe('login cooldown', () => {
  test('no wait before the fifth failure', () => {
    let lock = { fails: 0, until: 0 };
    for (let i = 0; i < 4; i += 1) lock = nextLock(lock, 1000);
    expect(lock).toEqual({ fails: 4, until: 0 });
  });
  test('one minute at five failures, doubling, capped at 15 minutes', () => {
    expect(nextLock({ fails: 4, until: 0 }, 0).until).toBe(60_000);
    expect(nextLock({ fails: 5, until: 0 }, 0).until).toBe(120_000);
    expect(nextLock({ fails: 20, until: 0 }, 0).until).toBe(15 * 60_000);
  });
});
