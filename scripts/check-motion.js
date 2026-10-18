async (page) => {
  const origin = new URL(page.url()).origin;
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  const sample = () => page.evaluate(() => ({
    headline: [...document.querySelectorAll('.hero-line > span')].map(n => ({ animation: getComputedStyle(n).animationName, transform: getComputedStyle(n).transform })),
    introBlur: getComputedStyle(document.querySelector('.blur-word')).filter,
    imageClip: getComputedStyle(document.querySelector('.hero-visual')).clipPath,
    imageTransform: getComputedStyle(document.querySelector('.hero-image')).transform,
  }));
  const early = await sample();
  await page.screenshot({ path: 'output/playwright/motion-hero-early.png' });
  await page.waitForTimeout(1700);
  const settled = await sample();
  await page.screenshot({ path: 'output/playwright/motion-hero-settled.png' });
  if (!early.headline.every(n => n.animation === 'type-reveal')) throw new Error('Line reveal is not applied');
  if (early.introBlur === settled.introBlur) throw new Error('Word blur reveal did not progress');
  if (early.imageClip === settled.imageClip) throw new Error('Hero image reveal did not progress');
  if (early.headline[0].transform === settled.headline[0].transform) throw new Error('Headline did not animate');
  await page.evaluate(() => window.scrollTo({ top: 420, behavior: 'instant' }));
  await page.waitForTimeout(250);
  const scrolled = await sample();
  if (scrolled.imageTransform === settled.imageTransform) throw new Error('Hero parallax did not respond to scroll');
  await page.locator('#ecosystem').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const ecosystem = await page.locator('.ecosystem-card').first().evaluate(n => ({ reveal: n.classList.contains('is-visible'), imageAnimation: getComputedStyle(n.querySelector('img')).animationName }));
  if (!ecosystem.reveal || ecosystem.imageAnimation !== 'photo-reveal') throw new Error('Ecosystem reveal is missing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin);
  const reduced = await sample();
  if (!reduced.headline.every(n => n.animation === 'none') || reduced.imageTransform !== 'none' || reduced.introBlur !== 'blur(0px)') throw new Error('Reduced motion is not respected');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  return { early, settled, scrolled, ecosystem, reduced, failures: [] };
}
