# Audit UI/UX end-to-end — Nordeo Scholar multi-situs

Tanggal: 28 Oktober 2026 (Asia/Jakarta). Cakupan: **17 rute × 2 viewport** (1440×1000 dan 390×844) pada tiga situs yang dilayani dari satu build.

Audit sebelumnya, [`2026-10-24-ui-ux-audit.md`](./2026-10-24-ui-ux-audit.md), menangani aplikasi satu-situs (12 rute): kontras metadata yang gagal, teks 9px, target sentuh 21–38px, dan aksen emas neon. Dokumen ini memverifikasi ulang seluruh aplikasi setelah strukturnya berkembang menjadi multi-situs, dan menutup sisa temuan pada rute yang dibangun setelah sistem token mendarat.

## 1. Cakupan rute

| Situs | Rute diperiksa |
| --- | --- |
| Utama (`nordeoscholar.com`) | `/`, `/journals`, `/journals/jurnalpengmas`, `/author-guide`, `/about`, `/contact`, `/publication-ethics`, `/books`, `/privacy-policy`, `/terms-of-use` |
| NordeoNews (`news.*`, lokal `/news`) | `/news`, `/news/panduan`, `/news/kirim`, `/news/riset-terbuka-masa-depan-penerbitan` |
| Nordeo Academy (`training.*`, lokal `/training`) | `/training`, `/training/daftar`, `/training/program/writing` |

## 2. Metode

Pengukuran DOM terhitung lewat Playwright, bukan penilaian visual saja. Perkakas ada di `scripts/`:

| Skrip | Fungsi |
| --- | --- |
| `capture-e2e.js` | 34 tangkapan (17 rute × 2 viewport) + metrik overflow, teks <12px, target sentuh, `h1`, gambar |
| `audit-targets.js` | target sentuh dengan **uji visibilitas ketat** (menyaring `visibility:hidden`, `opacity:0`, dan leluhur tersembunyi) |
| `audit-contrast.js` | rasio kontras per simpul teks, dengan komposit latar semi-transparan sampai leluhur opaque pertama |
| `check-assets.js` | kegagalan HTTP (status ≥400) + gambar yang benar-benar gagal decode, setelah lazy-load diselesaikan |
| `check-classes.mjs` | daftar kelas yang dipakai komponen tetapi tidak punya CSS |

Ambang yang dipakai: WCAG 2.2 AA — kontras 4.5:1 untuk teks normal dan 3:1 untuk teks besar; target sentuh minimum 24px (SC 2.5.8). Standar internal desain ini lebih ketat: 44px untuk seluruh target yang dikendalikan penulis, lantai tipografi 12px.

## 3. Hasil terukur

Seluruh angka di bawah ini adalah hasil **setelah** perbaikan di §5.

| Dimensi | Hasil | Ambang |
| --- | --- | --- |
| Overflow horizontal | **0** dari 34 kombinasi | 0 |
| Teks di bawah 12px | **0** | 0 |
| Target di bawah 24px | **0** | 0 (WCAG 2.2 AA) |
| Target di bawah 40px tanpa label | **0** | 0 |
| Target di bawah 44px | **0** (+1 checkbox native berlabel) | 0 |
| `h1` per halaman | **1** di 17 rute | tepat 1 |
| Kegagalan HTTP | **0** | 0 |
| Gambar rusak | **0** | 0 |
| Kontras gagal (teks nyata) | **0** di 17 rute | 0 |

## 4. Tiga temuan yang ditarik kembali

Pengukuran pertama menghasilkan tiga "cacat" yang setelah diperiksa ternyata artefak metode, bukan cacat produk. Saya catat supaya angka di §3 tidak disalahpahami sebagai perbaikan atas hal yang tidak pernah rusak.

| Temuan sementara | Penyebab sebenarnya | Kesimpulan |
| --- | --- | --- |
| "Gambar rusak di `/news`": `hero-editorial-v1.webp` | Berkas sehat — WebP valid, 72.980 byte, HTTP 200, `image/webp`. `naturalWidth` 0 karena `loading="lazy"` dan belum masuk viewport; browser bahkan tidak pernah meminta berkasnya (`network: []`). Setelah lazy-load diselesaikan: 0 gambar rusak. | **Positif palsu** |
| "Target 13px (radio), 20px (checkbox), 25px (label)" | Kontrol form asli berukuran sesuai user agent dan terasosiasi `<label>`; elemen 25px adalah teks label, bukan target. | **Bukan cacat** — pengecualian *User Agent Control* (SC 2.5.8) |
| "Tautan footer 43px: *Ecosystem overview*, *Submit a story*, *Join the Academy*" | Berada di dalam mega menu yang tertutup (`visibility: hidden`). Filter `offsetParent !== null` tidak menyaring elemen tersembunyi, jadi item dropdown ikut terhitung. | **Positif palsu** |

Pelajaran metodologi: `offsetParent` bukan uji visibilitas yang memadai, dan `naturalWidth === 0` bukan bukti gambar rusak selama lazy-load belum selesai. Kedua skrip sekarang memakai uji yang benar (`audit-targets.js`, `check-assets.js`).

## 5. Perbaikan yang diterapkan

Enam baris di dua berkas. Tidak ada perubahan desain struktural — hanya ukuran target dan nilai warna minimum agar lolos ambang.

| Berkas | Sebelum | Sesudah | Dampak |
| --- | --- | --- | --- |
| `ecosystem.css` `.directory-resources a` | `min-height: 40px` | `44px` | Tautan "Manuscript template (.docx)" dan "Submission guidelines" di `/` dan `/journals` |
| `ecosystem.css` `.carousel-arrow` (≤640px) | `40×40px` | `44×44px` | Panah carousel di `/news` versi mobile |
| `styles.css` `.filter-chip` (≤640px) | `min-height: 42px` | `44px` | Chip filter di `/` dan `/journals` versi mobile |
| `ecosystem.css` `.journal-mark-jetsi` | `#0b7f91` | `#09616f` | Kontras huruf JETSI **3.31 → 5.00** |
| `ecosystem.css` `.article-journal-jetsi` | `#0b7f91` | `#0a6b7a` | Nama jurnal pada meta artikel di atas kertas `#fbf9f5`: **4.48 → 5.88** |

Dua perbaikan terakhir menyentuh `ecosystem.css` yang ditulis di alur kerja lain. Nilainya hanya dinaikkan ke ambang kontras dengan hue yang sama (teal JETSI tetap teal JETSI) — bukan perubahan bahasa visual.

Catatan: `.journal-mark-jiel` (`#fdd535` pada `#7a0c0c` = 7.82) dan `.journal-mark-pengmas` (`#f2df9b` pada `#2f6b45` = 4.77) sudah lolos dan tidak diubah.

## 6. Yang sengaja diterima (bukan cacat)

| Hal | Alasan |
| --- | --- |
| Checkbox native 20×20 di `/training/daftar` | Ukuran ditentukan user agent dan tidak diubah penulis, serta terasosiasi label — pengecualian *User Agent Control* pada SC 2.5.8 |
| `.final-wordmark` "NORDEO" 338px, kontras 1.15 | `aria-hidden="true"` dan merupakan teks merek dekoratif — pengecualian logo/merek pada WCAG 1.4.3 |
| Monogram jurnal 11px (JETSI/JIEL/Pengmas) | Huruf besar ber-tracking dengan kontras ≥5.0; pola editorial, bukan metadata |
| Latar bergambar/gradien (hero berfoto, panel gelap) | Tidak terukur dengan komposit warna; kontras panel gelap sudah diverifikasi terpisah di audit 24 Okt (terendah 7.19:1) |

## 7. Utang teknis yang ditemukan (bukan UI, tidak diubah)

1. **`src/pages/Books.jsx` adalah kode mati.** Microsite Books lengkap (hero, katalog, spread editorial, proses penerbitan, CTA penulis) memakai **31 kelas tanpa CSS** dan **tidak dirutekan oleh siapa pun**; `/books` justru memakai `BooksPage` dari `pages/InfoPages.jsx`. Pilihan: tulis CSS-nya lalu rutekan, atau hapus.
2. **12 kelas dipakai tanpa CSS** di luar Books, kebanyakan hook lingkup halaman: `news-article`, `program-page`, `register-page`, `guide-steps-section`, `academy-hero-inner`, `ecosystem-section`, `pulse-agenda`, `about-ecosystem-panel`, `faq`, `main-header`, `journal-card-top`, `blur-text`, `marquee-track`.
3. **Bundel JS 509,16 kB (162,63 kB gzip)** melewati ambang peringatan Vite 500 kB. Semua rute diimpor eager di `App.jsx` — tiga situs ada di bundel yang sama, padahal satu kunjungan hanya memakai satu situs. Kandidat kuat untuk code-splitting per situs.
4. **CSS 121,18 kB (24,35 kB gzip)** dari dua berkas (`styles.css` + `ecosystem.css`).

## 8. Verifikasi

- `npm run test:run`: **22 tes / 4 berkas lulus**, termasuk kontrak fungsional (`Explore Journals`, tiga "Coming Soon", `14 artikel · JETSI`, `1 jurnal · 2 artikel`, `contentinfo`).
- `npm run build`: bersih.
- Bukti visual: `output/playwright/e2e-<rute>-<viewport>.png` (34 tangkapan) dan `output/playwright/check-jetsi-mark-1440.png`.

## 9. Batas audit

- Tidak diuji dengan pembaca layar nyata (NVDA/VoiceOver), perangkat fisik, atau Lighthouse.
- Kontras dihitung dari `getComputedStyle`; simpul dengan latar berupa gambar atau gradien dilewati karena tidak terukur dengan cara ini.
- Aplikasi hanya punya mode terang (`color-scheme: light`); mode gelap di luar cakupan.
- Uji dilakukan pada dev server lokal (Vite), bukan bundel produksi.

## 10. Tindak lanjut yang disarankan, berurutan

1. Putuskan nasib `src/pages/Books.jsx` (rutekan + tulis CSS, atau hapus) — ini 31 kelas dan satu halaman penuh yang tidak terpakai.
2. Code-split per situs (`news`, `training`, `main`) untuk memangkas 509 kB menjadi tiga bundel yang lebih kecil.
3. Uji perangkat nyata untuk chip filter dan panah carousel yang kini 44px.
4. Audit pembaca layar: urutan fokus, pengumuman hasil filter jurnal, dan status `aria-expanded` menu.