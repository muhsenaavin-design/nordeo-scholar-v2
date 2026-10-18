// Open a development or production preview first, then run this file with Playwright CLI.
async (page) => {
  const origin = new URL(page.url()).origin;
  const failures = [];
  const results = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  const homeLinks = await page.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  if (homeLinks.some(href => !href || href === '#')) failures.push('Homepage contains an empty action');
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const state = await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = 'eager'; });
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
      return {
        viewport: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter(image => !image.naturalWidth).map(image => image.src),
        generatedImages: document.querySelectorAll('img[src^="/assets/generated/"]').length,
        ecosystemColumns: getComputedStyle(document.querySelector('.ecosystem-grid')).gridTemplateColumns.split(' ').length,
        h1: document.querySelector('h1')?.innerText.replace(/\s+/g, ' '),
        readingSizes: [...document.querySelectorAll('.hero-description, .journal-summary, .ecosystem-card-copy > p:not(.card-category), .publishing-steps p')].map(node => parseFloat(getComputedStyle(node).fontSize)),
      };
    });
    if (state.pageWidth > width || state.brokenImages.length || !/advancing knowledge/i.test(state.h1)) failures.push(JSON.stringify(state));
    if (state.readingSizes.some(size => size < 16)) failures.push(`Reading copy below 16px at ${width}px`);
    if (state.generatedImages !== 5) failures.push(`Expected five generated assets at ${width}px`);
    if (state.ecosystemColumns !== (width <= 640 ? 1 : 2)) failures.push(`Unexpected ecosystem columns at ${width}px`);
    results.push(state);
    if (width === 390 || width === 1440) {
      await page.evaluate(async () => {
        const step = Math.max(320, Math.round(window.innerHeight * 0.75));
        for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 90)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(900);
      await page.screenshot({ path: `output/playwright/nordeo-redesign-${width}.png`, fullPage: true });
    }
  }
  const inactiveReveals = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => !el.classList.contains('is-visible')).length);
  if (inactiveReveals) failures.push(`Reveal elements never activated after scroll: ${inactiveReveals}`);
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: /menu/i });
  await menu.click();
  if (await menu.getAttribute('aria-expanded') !== 'true') failures.push('Menu did not open');
  await page.keyboard.press('Escape');
  if (await menu.getAttribute('aria-expanded') !== 'false' || !await menu.evaluate(node => document.activeElement === node)) failures.push('Menu did not close and restore focus');
  await menu.click();
  await page.getByRole('navigation').getByRole('link', { name: /explore journals/i }).click();
  if (!page.url().endsWith('/journals')) failures.push('Journal navigation failed');
  if (await menu.getAttribute('aria-expanded') !== 'false') failures.push('Menu remained open after navigation');
  if (await page.getByRole('link', { name: /visit jetsi/i }).getAttribute('href') !== 'https://nordeoscholar.com/journal/jetsi') failures.push('JETSI is not external');
  if (await page.getByRole('link', { name: /visit jiel/i }).getAttribute('href') !== 'https://nordeoscholar.com/journal/jiel') failures.push('JIEL is not external');
  if (await page.getByRole('link', { name: /visit jurnal pengmas/i }).getAttribute('href') !== '/journals/jurnalpengmas') failures.push('Pengmas route changed');
  for (const route of ['/books', '/services', '/news', '/contact', '/publication-ethics', '/privacy-policy', '/terms-of-use', '/author-guide', '/about', '/journals/jurnalpengmas']) {
    await page.goto(origin + route);
    if (!await page.locator('main h1').textContent()) failures.push(`Missing heading: ${route}`);
    if (!/Nordeo Scholar/.test(await page.title())) failures.push(`Missing route title: ${route}`);
    const brokenDetailImages = await page.locator('main img').evaluateAll(async images => {
      await Promise.all(images.map(image => image.decode().catch(() => {})));
      return images.filter(image => !image.naturalWidth).map(image => image.src);
    });
    if (brokenDetailImages.length) failures.push(`Broken detail imagery: ${route}`);
    if (['/books', '/services', '/news'].includes(route) && !/coming soon/i.test(await page.locator('main').textContent())) failures.push(`Missing future status: ${route}`);
    if (route === '/contact' && !await page.locator('a[href="mailto:info@nordeoscholar.com"]').count()) failures.push('Contact email is not actionable');
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > width) failures.push(`Overflow ${route}: ${scrollWidth}px at ${width}px`);
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin);
  const motion = await page.locator('h1').evaluate(node => ({ opacity: getComputedStyle(node).opacity, animation: getComputedStyle(node).animationName }));
  if (motion.opacity !== '1' || motion.animation !== 'none') failures.push('Headline not immediately visible with reduced motion');
  const counts = await page.locator('.count-up').allTextContents();
  if (JSON.stringify(counts) !== JSON.stringify(['02', '05', '13', '02×'])) failures.push(`Reduced-motion counts incorrect: ${counts}`);
  const statsHidden = await page.locator('.stats-grid dd').evaluateAll(nodes => nodes.some(node => node.getAttribute('aria-hidden') === 'true'));
  if (statsHidden) failures.push('Statistic values are hidden from assistive technology');
  await page.goto(origin + '/page-that-does-not-exist');
  if (!/page not found/i.test(await page.locator('main h1').textContent())) failures.push('Unknown route fallback missing');
  await page.getByRole('main').getByRole('link', { name: 'Kembali ke Beranda' }).last().click();
  if (new URL(page.url()).pathname !== '/') failures.push('Unknown route recovery failed');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  if (failures.length) throw new Error(failures.join('\n'));
  return { results, reducedMotion: motion, failures };
}
