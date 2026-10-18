# Audit Referensi Visual & Animasi — Redesign Nordeo Scholar

> Sumber: kombai.com gallery, Framer Marketplace (termasuk template berbayar), Dribbble, Figma Community, ReactBits (+ Magic UI & Aceternity).
> Selaras capstone "Integrated Corporate Website — PT Nordeo Scholar Publishing" (Bab I–III).
> Tanggal: 2026-10-17

## Artefak

| Artefak | Lokasi |
|---|---|
| Mockup statis (buka di browser) | `docs/design/mockups/home.html` |
| Render desktop 1440px | `docs/design/mockups/render-home-desktop.png` (+ `preview-desktop.jpg`) |
| Render mobile 500px | `docs/design/mockups/render-home-mobile.png` (+ `preview-mobile.jpg`) |
| Screenshot referensi | `docs/design/references/*.png` (5 file) |
| Stitch project (AI mockup) | `projects/4252600342500153655` · design system `assets/11345699709251720829` |

---

## 1. Kombai Gallery — `kombai.com/gallery/web/`

- Format: galeri **section-based** (566 halaman), tiap kartu = screenshot section website nyata + label (mis. "Pricing | Resona", "About | Rune", "Features | Bastion") dan link ke situs aslinya.
- Yang diambil: pola per-section siap pakai — halaman **About** bergaya tipografi editorial (Rune), **Features** dengan diagram (Bastion).
- Cara pakai untuk Nordeo: filter mental per section — butuh "Hero", "About", "Testimonial" → langsung lihat puluhan varian nyata.
- Screenshot: `references/kombai-gallery.png`

## 2. Framer Marketplace (gratis & berbayar)

Kategori relevan: **Publishing** (Blogs, Magazines, News) dan **Services > Education**.

| Template | Harga | Relevansi untuk Nordeo | Link |
|---|---|---|---|
| Noter | Free | Grid editorial ala majalah → section **News/Media** | framer.com/marketplace/templates/noter/ |
| **Notes Journal** | $149 | **Preview sudah difetch** — serif display besar, nav kategori kecil, satu aksen warna, whitespace lega → arah "Scholarly Editorial" | notes-template.framer.website |
| MERCE des BENZ* | $49 | Majalah seni image-led → layout galeri buku/terbitan | framer.com/marketplace/templates/merce-des-benz/ |
| Willow Cinema | Free | Layout editorial sinematik | framer.com/marketplace/templates/willow-cinema/ |
| Bookshelf | — | Katalog buku → **Books Publishing** hub | framer.com/marketplace/templates/bookshelf/ |
| The Index | — | Struktur koran/indeks → arsip berita | framer.com/marketplace/templates/the-index/ |
| Reado | — | Reading/publishing | framer.com/marketplace/templates/reado/ |

**Insight utama:** Notes Journal membuktikan arah serif + whitespace + aksen tunggal = kesan kredibel tanpa terlihat murah. Cocok diadopsi untuk hero & section head Nordeo.
Screenshot: `references/framer-publishing.png`, `references/framer-notes-journal-paid.png`

## 3. Dribbble — query "academic journal website"

Shot relevan yang ditemukan (sesi login):

- **ScholarIndex Pro** (Muhammad Abdullah Siddiqui) — website jasa academic editing: biru korporat, badge layanan, trust section. Pola: klaim → layanan → bukti.
- **Aditya Septama** — landing publikasi jurnal Bahasa Indonesia (biru terang, CTA WhatsApp, kredensial dewan editor). Validasi: pasar lokal pakai pola serupa.
- **"Advancing Discovery"** (Muhammad Abdullah Siddiqui) — situs akademik dark + aksen merah; referensi untuk hero gelap Nordeo.
- **Erik Adam** — versi mobile app sejenis; referensi kartu mobile.

**Insight:** palet biru/teal mendominasi sektor publishing = palet Nordeo sudah tepat; pembeda = serif editorial + disiplin whitespace.
Screenshot: `references/dribbble-academic-journal.png`

## 4. Figma Community

Search "academic journal website" butuh login untuk render hasil (tidak bisa di-capture headless). Keyword rekomendasi saat buka manual: `academic journal website`, `university website`, `publisher landing`, `editorial website`, `web ui kit editorial`.

## 5. Animasi — ReactBits & alternatif

**ReactBits (reactbits.dev):** 217 komponen animasi React, 4 kategori (Text Animations / Animations / Components / Backgrounds). Install via shadcn CLI:
`npx shadcn@latest add @react-bits/<Nama>-TS-TW` — ada juga tier Pro (pro.reactbits.dev).

Rekomendasi per bagian Nordeo (prinsip: **restraint** — publisher akademik tidak boleh terlihat playful):

| Bagian Nordeo | Komponen ReactBits | Alasan |
|---|---|---|
| Hero background | `Gradient Waves` / `Soft Aurora` / `Dot Grid` (opacity rendah) | tekstur bergerak halus, tidak mengganggu teks |
| Headline hero | `Split Text` / `Blur Text` | entrance elegan, sekali saja |
| Statistik (artikel, ekosistem, target) | `Count Up` | angka roadmap jadi hidup |
| Roadmap indeksasi | `Animated List` / `Stepper` | milestone muncul bertahap saat scroll |
| Kartu ekosistem & jurnal | `Spotlight Card` / `Tilted Card` / `Magic Bento` | hover halus, fokus kartu |
| Logo indeksasi/partner | `Logo Loop` | marquee badge (Google Scholar, Garuda, SINTA, Scopus) |
| CTA band | `Star Border` / `Shine Border` | aksen gold di tombol |

**Hindari:** `Glitch Text`, `Hyperspeed`, `Plasma`, `Pixel Trail` — terlalu playful/ramai untuk identitas akademik.

**Alternatif (pola serupa):** Magic UI (`magic-card`, `shine-border`), Aceternity UI (`card-hover-effect`, `card-spotlight`) — bagus untuk hover kartu jurnal; bisa di-mix dengan ReactBits.
Screenshot: `references/reactbits-home.png`

## 6. Mockup & Visualisasi — Hasil

`docs/design/mockups/home.html` — mockup statis satu-file (font Literata + Inter dari Google Fonts):

1. Header sticky + CTA gold "Submit Manuscript"
2. Hero teal-navy dengan tekstur topografi halus, headline serif 2 baris, badge "JETSI Vol. 1 No. 1 — Live" mengambang
3. **Audience strip** "I am a…" (Author/Reviewer/Reader/Institution/Partner)
4. **4 kartu ekosistem** dengan badge status **Live / Coming Soon**
5. **Featured journal JETSI**: cover, metadata e-ISSN/p-ISSN/DOI/OA, badge indeksasi, CTA **"Submit via OJS platform ↗"** + hint external link
6. **Roadmap timeline 2026 → 2045** (Google Scholar → Garuda → SINTA → DOI/Crossref → Scopus)
7. Publications row (Journals / Books / Services), CTA band, footer lengkap

Render tervalidasi: desktop 1440px semua section OK; mobile 500px (breakpoint ≤640) — stack rapi, chip & badge wrap benar, `scrollWidth = 390` tanpa horizontal overflow (dicek terprogram).

**Stitch (AI mockup generator):** project "Nordeo Scholar Redesign — Mockups" + design system "Nordeo Scholar Academic" (LIGHT, Literata/Inter, teal `#24586e` + gold `#ffd21a`, ROUND_EIGHT) **sudah terbuat**. Generate screen 2× timeout di layer MCP — screen bisa di-regenerate dari UI Stitch (design system sudah tersimpan di project).

## 7. Keputusan Desain → Dasar Capstone

| Keputusan | Dasar (Bab) |
|---|---|
| Audience strip "I am a…" | Stakeholder-based user journey (II.1.4) — entry point per audiens |
| Badge Live / Coming Soon per ekosistem | Masalah #1: 3 dari 4 ekosistem belum operasional (I.1) — transparansi status |
| Metadata ISSN/DOI + badge indeksasi di kartu jurnal | Masalah #2: metadata placeholder & roadmap indeksasi (I.1) |
| Timeline roadmap 2026–2045 | Target Google Scholar → Scopus (I.1) |
| CTA "Submit via OJS ↗" dengan label external | Gateway WordPress+OJS tanpa menggantikan fungsi (II.1.2) |
| Headline serif (Literata) | Arah "Scholarly Editorial" ala university press (audit §2) |

## 8. Next Steps

1. Iterasi mockup ke-2: **Journal Profile (JETSI)** + **About/Roadmap** — pakai pola file yang sama.
2. Konversi `home.html` → komponen React di `app/` (JournalCard, EcosystemCard, IndexingBadges, RoadmapTimeline).
3. Pasang 1–2 animasi prioritas: `Soft Aurora` (hero) + `Count Up` (roadmap) via shadcn CLI.
4. Regenerate Stitch screens dari UI project `4252600342500153655`.
5. Screenshot before/after (live site vs mockup) untuk lampiran Bab III–IV.
