// Capture mobile menu open + header/hero closeups for audit evidence.
async (page) => {
  const origin = new URL(page.url()).origin;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'output/playwright/audit-nav-closed-390.png' });
  await page.getByRole('button', { name: /menu/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'output/playwright/audit-nav-open-390.png' });
  const openState = await page.evaluate(() => ({
    bodyOverflow: getComputedStyle(document.body).overflow,
    navHeight: document.querySelector('#primary-navigation')?.getBoundingClientRect().height,
    viewport: innerHeight,
    scrollLocked: getComputedStyle(document.body).overflow === 'hidden' || getComputedStyle(document.documentElement).overflow === 'hidden',
  }));
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'output/playwright/audit-header-1440.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.goto(origin + '/about', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'output/playwright/audit-about-top-1440.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
  return JSON.stringify(openState);
}
