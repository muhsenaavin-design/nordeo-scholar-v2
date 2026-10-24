import { expect, test } from 'vitest';
import { hostSite } from './site';

test('maps ecosystem subdomains to their microsites', () => {
  expect(hostSite('training.nordeoscholar.com')).toBe('training');
  expect(hostSite('news.nordeoscholar.com')).toBe('news');
  expect(hostSite('nordeoscholar.com')).toBeNull();
  expect(hostSite('books.nordeoscholar.com')).toBeNull();
});
