# Editorial Scholar — implementation

Goal: apply the approved reference combination and five generated assets to the existing React landing page.

- [x] Update src/App.jsx hero to use generated hero with unobstructed central sculpture, small caption and original logo preserved. Replace four ecosystem image paths with generated siblings; describe them as illustrations in alt text.
- [x] Keep publication previews, metadata, links, and all current dirty edits. Place the featured journal section before the ecosystem and keep section numbers sequential.
- [x] Refine src/styles.css: ivory hero background, rectangular editorial image, subtle gold frame detail, desktop ecosystem 2x2/mobile 1 column, restrained reveals. Retain minimum reading sizes, visible focus and reduced-motion support.
- [x] Run npm run test:run, npm run build, git diff --check; use scripts/check-landing.js against local Vite and inspect 1440/390 screenshots. Check all generated images load and are used.

Architecture: existing App and stylesheet, existing Motion effects and assets. No new packages, routes, data claims or external publishing actions.

Validation: six Vitest tests passed; Vite production build passed; browser widths 360/390/768/1024/1440 passed image decoding, overflow, reading-size and generated-image/grid checks. Ten detail routes passed at 360/390. Mobile menu, focus restoration, external journal links and reduced motion passed.

Reference verification: Vellum live browser exposed 1000ms fade/translate animations, cubic-bezier(0.22, 1, 0.36, 1), translateY 12–16px. Adaptation uses the measured easing and 16px/1000ms entrance; hero visual 1200ms. Overall pixel identity with every source template has not been established: this is a content- and brand-adapted composition.

Screenshots: output/playwright/nordeo-editorial-hero-1440.png and nordeo-redesign-1440.png / nordeo-redesign-390.png. Original data claims were preserved, not independently business-verified. Existing uncommitted changes preserved. No commit or deployment.

Final font matching: live Vellum h1 measured General Sans 500 at 68px; emphasis Instrument Serif 400. Added official hosted font stylesheets in index.html and used the matching families in src/styles.css. Browser verified General Sans 400/500/600 and Instrument Serif normal/italic loaded. All five-width browser checks rerun and passed after font change.
