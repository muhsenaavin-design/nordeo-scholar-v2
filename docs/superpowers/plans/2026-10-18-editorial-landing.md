# Editorial Scholar implementation plan

**Goal:** implement approved `docs/design/2026-10-18-landing-page-direction.md` in the root application served by `npm run dev`.

**Architecture:** retain React, react-router and Tailwind already installed. Update root UI, preserve routes and external JETSI boundary. Keep `app/` reference implementation unchanged. Work in place because uncommitted content is the reviewed source; preserve existing user changes.

**Ownership:** UI specialist owns `src/App.jsx`, `src/styles.css`, optional homepage component and `index.html`. Parent owns assets, `src/App.test.jsx`, `src/data/pages.js`, verification and documentation.

- [ ] Run baseline `npm run test:run`; add homepage availability/discovery and menu-state behavior checks, observe expected failures.
- [ ] Derive transparent original-color and light logo from original PNG without overwriting source; resize assets to WebP. Inspect against light/dark backgrounds.
- [ ] Implement editorial split hero, early ecosystem gateway, real journal feature, task navigation, compact about and collaboration. Three future ecosystems remain Coming Soon; no unverified indexing or statistics.
- [ ] Implement accessible header/mobile menu, skip link, visible focus, reduced motion, and consistent footer. Keep JETSI external and Pengmas internal.
- [ ] Update future ecosystem detail copy; expose working official contact destination from existing project sources.
- [ ] Run `npm run test:run` and `npm run build`. Browser-check 390px and 1440px plus 360/768/1024px overflow, menu Escape, links, image loading and reduced motion. Save screenshots under `output/playwright/`.
- [ ] Review final diff for spec compliance and defects, correct findings, record verified results. No publish or commit requested.
