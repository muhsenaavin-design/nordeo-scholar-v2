# Nordeo Editorial Scholar — final delivery

Date: 19 October 2026 (Asia/Jakarta).

## Delivered

- Editorial homepage combining the selected reference patterns with original Nordeo logo and teal–gold colors; five generated illustrative images integrated. Actual journal previews and data retained.
- About, Contact, Collaboration and planned ecosystem pages use the same editorial image treatment. Text-only policy pages retain a full-width reading column.
- Planned ecosystem pages provide journal discovery and collaboration contact actions. Route titles update; client navigation moves keyboard focus to main. Unknown routes provide a return-home action.
- Reduced-motion CountUp now renders the final value when the preference changes or the value updates. Regression test confirmed failure before the fix and passes afterward. Statistic values remain available to assistive technology as static text.
- Privacy text reflects both Google Fonts and Fontshare. Test files are isolated to prevent hook mocks leaking between suites.

## Verification

- Seven tests passed across two files; production build passed; git diff --check passed (line-ending notices only).
- Browser QA ran against the built site at http://127.0.0.1:5180, not the development server.
- Home widths 360, 390, 768, 1024 and 1440: no overflow or broken images, all five generated images loaded, one/two ecosystem columns as designed, sampled reading copy at least 16px.
- Ten detail routes at 360/390: headings, service statuses, contact action and images checked. Menu open/close, Escape/focus restoration, journal link destinations, reduced motion, final statistic values and unknown-route recovery passed.
- Actual click journey passed: home ecosystem anchor → Books → collaboration contact → email link destination. No email sent.
- Visual review: final-about-1440.png, final-contact-390.png, final-books-1440.png, final-privacy-policy-390.png, nordeo-redesign-1440.png and nordeo-redesign-390.png under output/playwright/.

## Artifacts and boundaries

- Production ZIP: output/releases/nordeo-editorial-2026-10-19.zip (22 files; integrity verified). Contains built site, static assets, Vercel SPA rewrite and deployment notes.
- Source changes remain uncommitted. Existing unrelated edits were preserved. No public deployment or external messages performed.
- Journal indexing/business claims were preserved from existing content; this UI verification does not independently substantiate those claims.
- Exact pixel identity with all source templates is not claimed. Matching font families and measured Vellum animation easing were verified earlier; composition is adapted to Nordeo content.
- Font delivery depends on Google Fonts and Fontshare; CSS fallback families remain configured.

## Handoff

Root src/ and public/ are active; app/ remains legacy. Production preview is running on port 5180. Repeat npm run test:run and npm run build after code changes. Open the chosen origin in Playwright CLI before running scripts/check-landing.js; scripts/capture-editorial-pages.js verifies the additional service-to-contact journey and captures supporting pages. Shared brain CLI was unavailable at the skill's listed installation paths, so this file records the handoff.

## Motion refinement after user review

User found the initial entrance/fade too subtle. Replaced the hero headline entrance with three staggered masked line reveals; added hero image clip reveal, caption/label stagger, scroll-linked HeroImage translation/scale and section-title/image reveals. Existing reduced-motion support remains active. The illustration itself is still a raster asset; page elements and the image layer move.

Production browser scripts/check-motion.js confirmed frame-to-frame headline/clip changes, image transform changing with scroll, ecosystem image reveal and disabled movement under reduced motion. Full five-width landing QA rerun passed; 7 unit tests and production build passed. Fixed transient mobile overflow from the entering edge label by clipping the hero visual container.

A browser recording is available at output/playwright/nordeo-motion-demo.webm. ZIP refreshed with latest build.

## React Bits motion and header navigation

See 2026-10-19-react-bits-motion.md. Added local BlurText and Magnet patterns, sticky header, animated section scrolling/arrival, active links, repeat click replay and cross-route landing anchors. Header Journals targets the homepage section; Explore Journals retains /journals. Eight tests plus production browser navigation, motion and full landing checks passed. Build and release ZIP refreshed.

## White refresh, public presence and indexing audit

See 2026-10-19-public-presence-audit.md for evidence and limitations. Original six platform logo images copied locally from OJS; actual React Bits LogoLoop vendored with its license. New discovery section distinguishes GARUDA indexing, Crossref DOI metadata and other search/network resources. Replaced unsupported six-index statistic with 13 JETSI documents in GARUDA (dated snapshot). JIEL eISSN deferred to its platform; indexing not claimed. Official Instagram and editorial WhatsApp added. White page and restrained card styling applied. Nine unit tests and production Chromium checks passed; build and ZIP refreshed. External OJS/social accounts were not changed.

## Motion visibility fix on preview 5180

User confirmed the affected URL is 127.0.0.1:5180, so the legacy server is not established as the cause. Inspection found Windows MinAnimate=0; the isolated Playwright browser reported prefers-reduced-motion=false, so the real user browser preference could not be established. Previous tests explicitly selected no-preference and moved the pointer outside the logo row. Two reproducible behaviors explain why motion can appear absent: the application replaces logos with a static list for reduced motion, and the vendor marquee pauses on hover/focus.

Added an explicit site motion preference shared by CSS, Motion effects and the React Bits engine. Default continues to follow system settings. Users can enable animation via hero notice, Putar logo, or ?motion=full; preference is stored locally and restored on reload. Explicit full motion works even while the browser still reports reduced motion. Vendor adapted only to accept the explicit reducedMotion override; license retained. Removed logo hover pause and drag pause; keyboard focus/manual pause remain. Moved the discovery/logo section before journal cards so it appears earlier.

Eleven unit tests and production build passed. scripts/check-motion-preference.js proved system-reduced initial state, explicit activation, actual loop transform changes under reduced motion, CSS entrance animation activation, persistence across reload, continuous hover motion and URL override. The Windows Computer Use tool was stopped in the preceding turn because it could not verify browser URL; no bypass or Windows settings change was attempted.

After the preference fix, full Chromium landing QA at five widths and ten detail routes passed. Discovery loop/continuous hover, header navigation/replay/cross-route, hero frame animation and parallax checks passed. ZIP refreshed. Full-motion review URL: http://127.0.0.1:5180/?motion=full. Full-motion recording: output/playwright/nordeo-full-motion.webm.

## Logo loop tempo

At user request, removed the pause/resume button in the logo strip and slowed the React Bits loop from 64 to 48 px/second. Also removed the footer's Kurangi animasi/Aktifkan animasi control. The reduced-motion Putar logo activation remains.
