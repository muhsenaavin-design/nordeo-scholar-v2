# Landing verification and handoff — 19 October 2026

Active app: root `src/`, served at `http://127.0.0.1:5177/`. `app/` remains reference material.

On resuming, commit `5b2100a` already contained a later revision by the user and CommandCodeBot: JETSI/JIEL previews, journal facts, real images, statistics and motion. These changes were preserved. This continuation enlarged essential reading text to 16px across breakpoints, raised status labels to 12px, shortened the ethics CTA, allowed panel buttons to wrap, and extended browser checks to inner-page overflow and computed reading sizes.

Verified against the current source:

- `npm run test:run`: 6 passed.
- `npm run build`: passed.
- `git diff --check`: passed; Git reports only line-ending normalization notices.
- `scripts/check-landing.js`: no failures at homepage widths 360, 390, 768, 1024, 1440px; no broken images or horizontal overflow; sampled essential reading text 16px throughout.
- Mobile menu opens, exposes state, closes with Escape and restores focus; journal navigation closes the menu.
- JETSI/JIEL links match current configured external URLs; Pengmas remains internal. These checks assert destinations, not remote availability.
- Ten detail pages checked at 360/390px for overflow, with Coming Soon status and actionable email where relevant.
- Reduced-motion headline remains visible without CSS animation. Scroll reveal activates after scrolling.
- Desktop and mobile screenshots visually reviewed: `output/playwright/nordeo-redesign-1440.png` and `output/playwright/nordeo-redesign-390.png`.

Content boundary: journal/indexing/statistics claims from `5b2100a` were not independently revalidated here; the web reader could not access the publisher endpoints. Do not treat UI verification as proof of these claims. The earlier PDF describes an older state of the publisher. Review current publisher records before publication.

No deployment or commit made in this continuation. Local preview server left running for user review. Shared `brain` executable was unavailable at the installed skill paths; this file records the handoff locally.
