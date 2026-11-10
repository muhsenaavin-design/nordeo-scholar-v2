async (page) => {
  const origin = new URL(page.url()).origin;
  const routes = ['/', '/news', '/news/riset-terbuka-masa-depan-penerbitan', '/news/bukti-di-meja-keputusan',
    '/news/dari-kampus-ke-komunitas-pengabdian-terukur', '/news/catatan-editor-konteks-lokal', '/training',
    ...['seminar-draft-submission', 'seminar-reviewer', 'conference-writing-2026', 'conference-poster', 'module-publishing-path', 'module-ethics'].map(id => `/training/program/${id}`)];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const results = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      const state = await page.evaluate(async () => {
        const images = [...document.images];
        images.forEach(img => { img.loading = 'eager'; });
        await Promise.all(images.map(img => img.decode().catch(() => {})));
        const photos = images.filter(img => img.src.includes('/assets/photos/'));
        return {
          broken: images.filter(img => !img.naturalWidth).map(img => img.src),
          placeholders: images.filter(img => /\/art\/(news|training)\//.test(img.src)).map(img => img.src),
          missingResponsive: photos.filter(img => !img.srcset.includes('3840w')).map(img => img.src),
          photoCount: photos.length,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          selected: [...new Set(photos.map(img => img.currentSrc.split('/').pop()))],
        };
      });
      if (state.broken.length || state.placeholders.length || state.missingResponsive.length || state.overflow || !state.photoCount) {
        throw new Error(JSON.stringify({ width, route, ...state }));
      }
      if (route === '/news' || route === '/training' || route.endsWith('/conference-writing-2026')) {
        await page.screenshot({ path: `output/playwright/photos-${route.split('/').pop()}-${width}.png`, fullPage: true });
      }
      results.push({ width, route, photos: state.photoCount, selected: state.selected });
    }
  }
  if (errors.length) throw new Error(JSON.stringify(errors));
  return { routesChecked: results.length, errors, results };
}
