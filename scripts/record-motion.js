async (page) => {
  const origin = new URL(page.url()).origin;
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  await page.waitForTimeout(2400);
  for (const selector of ['#journals', '#ecosystem', '.publishing-section', '.stats-section']) {
    await page.locator(selector).evaluate(node => node.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    await page.waitForTimeout(1800);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1600);
  return 'Motion demo captured from the production build.';
}
