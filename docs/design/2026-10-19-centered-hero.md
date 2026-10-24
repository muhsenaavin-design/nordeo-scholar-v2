# Centered hero

User clarified that “Hall of Fame” meant **centered hero section**, then authorized reviewing Framer references and implementing the chosen layout and animation directly. Final heading remains “Advancing knowledge. Connecting research.” No video or carousel was added.

## Implementation

- Replaced the split hero with a full-width generated library image and centered heading, description and journal actions.
- Used Nordeo's existing General Sans / Instrument Serif pairing, teal shading and gold accents. Moved existing journal/ecosystem facts into a restrained bottom rail.
- Staggered heading entrances and a subtle scroll-linked image translation/scale use existing CSS and Motion infrastructure. Reduced image travel from 70px to 24px and maximum scale from 1.16 to 1.1. All hero motion respects the existing reduced-motion preference.
- Retained the sticky navigation and existing destinations. No new dependencies.

## References reviewed

- [BookstoreStudio](https://www.framer.com/marketplace/templates/bookstorestudio/): editorial typography, spacing and publishing context.
- [Shifted](https://www.framer.com/marketplace/templates/shifted/): imagery as an integral editorial element. Its more expressive editorial direction was not used wholesale.
- [Framer scroll transforms](https://www.framer.com/academy/lessons/scroll-transforms): restrained scroll-linked position and scale with reduced-motion checks.

These are visual references; no paid template code or artwork was imported.

## Generated asset

Built-in imagegen output: `public/assets/generated/hero-library-v2.webp` (1672 × 940, 238304 bytes). Converted the generated PNG to WebP with quality 88 for delivery. Original PNG remains in the imagegen output directory.

Final generation prompt:

> Generate a new wide landscape hero background image for Nordeo Scholar academic publisher website, 16:9 composition. Use case: stylized-concept. Asset type: full bleed website hero background for a Hall of Fame editorial layout. Scene: a monumental yet inviting academic library, soaring shelves, elegant symmetrical arches receding into depth, one beautiful open book on a stone reading plinth positioned in right half, a few delicate pages suspended above the book, warm golden daylight streaming in from tall windows. Refined editorial 3D illustration, tactile paper and wood, cinematic realism with a subtle dreamlike quality, deep teal shadows, warm ivory stone and antique gold highlights. Wide architectural vista filling the frame edge to edge. Composition: left third darker, uncluttered and calm to support white HTML headline; architectural and open book details strongest center and right. Sophisticated academic institution, quiet dignity, no trophies, no people, no fake award portraits. No text, no letters, no logos, no watermarks. Finished production background artwork, not a screenshot or mockup. Save the generated image as a local file and provide its local file path if supported.

The image was generated before the terminology correction; the final centered layout uses the same artwork with an adjusted overlay.

## Verification

- `npm run build`: passed.
- `npm run test:run`: 3 files / 11 tests passed.
- Playwright checks at 360, 390, 768 and 1440px: no horizontal overflow; heading centered within 0.01px; image loaded and covers hero.
- Confirmed scroll transform changes, reduced-motion heading/image transforms are disabled, and journal CTA reaches `/journals`.
- Visually inspected desktop and mobile screenshots: `output/playwright/centered-hero-1440.png` and `output/playwright/centered-hero-390.png`.
- `git diff --check`: passed.

Initial centered hero subsequently deployed to production at https://nordeo-scholar-v2.vercel.app/.

## Follow-up: original website copy and upright fonts

User supplied the original website screenshot and requested matching its heading and removing italic typography throughout the deployed website. The hero now uses “Academic Publishing & Research Support”, “Advancing Knowledge.”, and “Creating Global Impact.” with the exact supplied English company description. The main heading uses General Sans throughout, with yellow emphasis on the second line. All CSS italic styles and italic font requests were removed; semantic emphasis elements render upright. Page metadata now matches the revised message.

Verification: build and 11 existing tests pass. Browser checks at 360, 390, 768 and 1440px confirm the exact heading, subtitle, upright text and no horizontal overflow. Journals, About, Contact and Books also have no computed italic/oblique elements. Desktop/mobile screenshots: `output/playwright/upright-hero-1440.png` and `output/playwright/upright-hero-390.png`.
