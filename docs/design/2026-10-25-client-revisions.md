# Client revisions: landing and NordeoNews

## Landing (`/`)
- Hero keeps one action, "Discover the ecosystem", as a `#FFD218` pill (`.button-yellow`). The header "Explore Journals" CTA is unchanged.
- The metrics row is replaced by **Our Vision** (`Vision` in `src/pages/Home.jsx`, copy in `src/data/ecosystems.js`).
- Ecosystem card 1 CTA opens `https://nordeoscholar.com/journal/` in a new tab (`ctaHref`); menus and footer still go to `/journals`. Card 2 rail reads "Media & News"; its heading stays "Media & News Publishing".
- Pulse column title: "NordeoNews".
- Newsletter block replaced by the office address and a Google Maps embed (`Location`, address in `src/config/links.js`). It keeps `id="contact"`, so the header Contact link still lands there.

## Our Vision motion: reference audit
References checked: Framer Marketplace components [Animated Text Reveal](https://www.framer.com/marketplace/components/animated-text-reveal/), [Scroll Blur Reveal (Fogtype)](https://www.framer.com/marketplace/components/fogtype/), [Lumo Highlighter](https://www.framer.com/marketplace/components/lumo-highlighter/); Motion UI [Scroll Word Reveal](https://motion.dev/ui/components/scroll-word-reveal); Dribbble [mission/vision section](https://dribbble.com/search/mission-and-vision-section) and [mission statement](https://dribbble.com/tags/mission-statement) shots.

Common pattern: a large statement whose words move from dim (opacity ~0.15, often blurred) to full, in reading order, scrubbed by scroll; Framer versions usually pin the section over a 300–400vh runway.

Layout options were compared on a Design canvas (A–G; layouts plus Redesignee-inspired redesigns). A real-sunlight photo backdrop for F was tried and rejected by the client as too busy; the section is now clean on the paper background.

Built (`ScrollStatement` in `src/components/effects.jsx`):
- Centered on the plain paper background; the "Our Vision" label is a 16px pill.
- Copy unchanged, design changed: a quiet intro tier, then a large tier; "and creates global impact." gets a solid `#FFD218` highlight (yellow text on the light band would fail contrast) that sweeps in after the words.
- Words: scroll-scrubbed reveal, opacity 0.15 → 1, blur 6px → 0. **No pinning**, so the ecosystem showcase is not delayed.
- One accessible sentence (`sr-only`), visual words `aria-hidden`; reduced motion renders the finished state.

## NordeoNews (`/news`)
- Header wordmark is `NordeoNewsBrand` (`src/components/NordeoNewsBrand.jsx`); swap its text for the official logo `<img>` when ready.
- Rubrics: Semua, Berita, Pendidikan, Bisnis, Teknologi, Lifestyle, Opini. Sample stories were re-filed under these; Bisnis and Lifestyle show an empty state until stories exist. The submission form uses the same list.
- "Semua cerita" is now the portal: category tabs → 3-card scroll-snap slider with arrow buttons (2 cards on tablet, 1 with a peek on mobile) → lead story + "Terbaru" headline list. The former lead section above it was folded in to avoid showing the same featured story twice; the `#terbaru` anchor moved with it.
