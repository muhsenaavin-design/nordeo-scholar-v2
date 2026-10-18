async (page) => {
  const origin = new URL(page.url()).origin;
  const results = [];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, width] of [['/about', 1440], ['/contact', 390], ['/books', 1440], ['/privacy-policy', 390]]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin + route);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('main img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await page.screenshot({ path: `output/playwright/final-${route.slice(1)}-${width}.png`, fullPage: true });
    const state = await page.evaluate(() => ({ width: innerWidth, pageWidth: document.documentElement.scrollWidth, focused: document.activeElement?.id, title: document.title }));
    if (state.pageWidth > width) throw new Error(`Overflow: ${route}`);
    results.push({ route, ...state });
  }
  await page.goto(origin);
  await page.getByRole('main').getByRole('link', { name: /jelajahi ekosistem/i }).click();
  await page.getByRole('link', { name: /lihat rencana/i }).first().click();
  if (!page.url().endsWith('/books')) throw new Error('Ecosystem entry failed');
  await page.getByRole('link', { name: /diskusikan kolaborasi/i }).click();
  if (!page.url().endsWith('/contact')) throw new Error('Planned service to contact failed');
  const mail = page.getByRole('main').getByRole('link', { name: /info@nordeoscholar.com/i });
  if (await mail.getAttribute('href') !== 'mailto:info@nordeoscholar.com') throw new Error('Contact action failed');
  if (await page.evaluate(() => document.activeElement?.id) !== 'main-content') throw new Error('Route focus not restored to main');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  return { results, userJourney: 'Homepage → Books → Contact → email action verified; no email sent' };
}
