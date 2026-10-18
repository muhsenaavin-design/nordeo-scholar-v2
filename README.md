# Nordeo Scholar

React + Tailwind CSS website for the Nordeo Scholar ecosystem.

The active application is the root `src/` with assets in `public/`. The separate `app/` directory is an older design reference; root commands do not serve it.

## Run locally

```bash
npm install
npm run dev
```

`npm run test:run` runs the UI checks and `npm run build` produces the production site.

`py -3 scripts/prepare-assets.py` regenerates transparent logos and optimized WebP images from the preserved originals (requires Pillow).

For browser checks, start `npm run dev -- --host 127.0.0.1 --port 5177`, then:

```bash
npx --package @playwright/cli playwright-cli -s=nordeo-redesign open http://127.0.0.1:5177
npx --package @playwright/cli playwright-cli -s=nordeo-redesign run-code --filename scripts/check-landing.js
```

## Journal boundary

Nordeo owns the journal portfolio and **Jurnal Pengmas**. JETSI lives in its own repository and is linked as an external journal destination from `/journals`.
