# Placeholder photo audit — 2026-11-10

Scope: the active root Vite app (`src/` and `public/`), not the retired `app/` scaffold.

Replaced six generic SVG programme covers, two abstract SVG article covers, three abstract News desk illustrations, and two reused generated article images. Seven distinct photographs now serve these thirteen placements. Each photo has a UHD 3840 × 2160 WebP and 640/1280/1920 variants; image components select local responsive assets. Source JPEGs, licence links and metadata are preserved. Images are illustrative stock photography, not Nordeo event documentation.

Saved browser/Supabase content using the exact old default cover paths is upgraded at read time. Custom cover URLs and uploaded images are preserved. This does not mutate remote database records.

## Retained assets and remaining content placeholders

- Four book covers carry their actual catalogue title typography; stock photos would erase that information. These remain SVG designs.
- Existing homepage hero and ecosystem artwork is deliberately authored imagery (roughly 1600 px), retained outside the placeholder photo replacement scope. Existing JETSI screenshots, cover, founder photo and partner marks remain authentic assets.
- Academy dates, facilitators, quotas and fees are tentative and need confirmation from the Academy team. Their existing tentative labels remain.
- Six testimonials are marked sample data. They need approved real quotes, names and consent.
- News articles are editorial sample content and already carry a preview notice. New stock photos do not establish their factual publication status.
- Book catalogue publication dates, authors and production statuses require publisher confirmation; photography cannot validate them.
- JIEL has no confirmed cover asset and retains its journal identity treatment rather than a fabricated stock cover.

See `public/assets/photos/SOURCES.md` for exact source pages and licensing. Pexels permits free use and editing, but is not an unrestricted CC0/open-source licence.

## Verification

- `npm run test:run`: 61 tests passed across seven files after integrating the latest remote `main`, including saved-placeholder upgrades and preservation of custom covers/credits.
- `npm run build`: passed. Existing large-chunk warning remains.
- `scripts/check-editorial-photos.js` via Playwright CLI: 13 routes at 390 and 1440 pixels (26 cases), no broken images, News/Academy SVG placeholders, missing responsive candidates, horizontal overflow or page errors.
- All 28 WebPs decoded and matched declared sizes; seven masters are 3840 × 2160. Seven originals are at least 4000 pixels wide. Crop sheet and final Academy/News/program screenshots visually reviewed.
- `output/photos/contact-sheet.jpg` previews the selection. `output/photos/nordeo-editorial-4k.zip` contains seven UHD masters plus source/licence metadata (approximately 4.2 MB). Output artifacts are intentionally gitignored.
- The pre-existing declared Supabase dependency was missing locally; `npm install --ignore-scripts` restored it without changing package manifests or lockfile.

Implementation is local to this workspace. No deployment or remote database changes were made.
