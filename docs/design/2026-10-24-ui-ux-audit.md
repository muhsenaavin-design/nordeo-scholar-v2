# Audit UI/UX end-to-end & redesign "library press"

Tanggal: 24 Oktober 2026 (Asia/Jakarta). Cakupan: 12 rute × 2 viewport (1440×1000 dan 390×844) pada aplikasi aktif `src/App.jsx`. Metode: tangkapan layar baseline + pengukuran terhitung lewat Playwright (ukuran font terhitung, rasio kontras WCAG, tinggi target sentuh, `scrollWidth` vs `clientWidth`, jumlah `h1`, gambar gagal muat), lalu implementasi perbaikan dan pengukuran ulang dengan skrip yang sama persis.

Rute yang diperiksa: `/`, `/journals`, `/journals/jurnalpengmas`, `/author-guide`, `/books`, `/news`, `/services`, `/about`, `/contact`, `/publication-ethics`, `/privacy-policy`, `/terms-of-use`.

Batasan: audit ini berbasis pengukuran DOM dan piksel, bukan uji pembaca layar nyata, uji perangkat nyata, atau audit performa Lighthouse. Klaim kontras dihitung dari nilai token CSS, bukan dari sampling piksel tangkapan layar.

---

## 1. Ringkasan

Tampilan memang sudah punya DNA editorial yang kuat (teal gelap, serif display, fotografi perpustakaan), tetapi ada tiga masalah nyata yang terukur dan konsisten di seluruh situs:

1. **Metadata terlalu kecil dan sebagian gagal kontras.** Ukuran font terkecil di halaman beranda dan `/journals` adalah **9px**, dengan 40–64 elemen di bawah 12px per halaman. Enam pasangan warna teks gagal ambang WCAG AA 4.5:1 (terendah 3.39:1).
2. **Target sentuh terlalu kecil.** Setiap halaman punya **19–22 tautan/tombol** di bawah 40px, termasuk chip filter (36–38px) dan tautan legal footer (tinggi 21px).
3. **Aksen emas neon `#ffd21a`** terbaca murah pada latar terang dan menahan kesan premium dari sisa desain.

Ditambah dua cacat tata letak yang jelas terlihat: celah mati ~130px di bawah tautan "Kembali" pada halaman dalam, dan lead dua kolom yang tidak seimbang (teks pendek menggantung di atas gambar tinggi).

Redesign yang diterapkan adalah **penyempurnaan, bukan rebrand**: mempertahankan teal, serif, dan fotografi, lalu menaikkan kualitasnya lewat token warna yang hangat, aksen kuningan (brass), skala tipografi yang lebih besar dan tenang, target sentuh yang patuh, serta hierarki heading yang benar. Kontrak fungsional di `src/App.test.jsx` tidak diubah.

---

## 2. Temuan terukur (sebelum)

Pengukuran memakai pemilih yang sama seperti skrip baseline (`main p, main li, main dd, main dt, footer p, footer a` untuk teks; seluruh `a, button, [role="button"]` untuk target).

| Halaman | Teks <14px | Teks <12px | Teks <10.5px | Terkecil | Target <44px | Target <40px | Overflow | `h1` | Tinggi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` desktop | 70 | 40 | 26 | **9px** | 22 | 22 | tidak | 1 | 7.472px |
| `/` mobile | 70 | 45 | 32 | **9px** | 20 | 20 | tidak | 1 | 12.749px |
| `/journals` desktop | 88 | 63 | 42 | **9px** | 21 | 21 | tidak | 1 | 4.344px |
| `/journals` mobile | 88 | 64 | 43 | **9px** | 19 | 19 | tidak | 1 | 8.296px |
| `/about` desktop | 5 | 3 | 0 | 11px | 2 | 2 | tidak | 1 | 1.566px |
| `/about` mobile | 5 | 3 | 0 | 11px | 0 | 0 | tidak | 1 | 1.985px |
| `/author-guide` desktop | 5 | 3 | 0 | 11px | 2 | 2 | tidak | 1 | 1.490px |
| `/author-guide` mobile | 5 | 3 | 0 | 11px | 0 | 0 | tidak | 1 | 1.946px |

Catatan: pada baseline, jumlah target `<44px` **sama persis** dengan jumlah target `<40px` (22/22, 21/21, 20/20). Artinya seluruh target yang gagal adalah target berukuran 21–38px — bukan target yang sekadar kurang dari 44px.

### 2.1 Kontras yang gagal (dihitung dari token lama)

Ambang WCAG 2.1/2.2 AA: 4.5:1 untuk teks normal, 3:1 untuk teks besar (≥24px, atau ≥18.66px tebal) dan untuk komponen antarmuka.

| Warna teks | Latar | Rasio | Terpakai pada | Ukuran |
| --- | --- | --- | --- | --- |
| `#7a8f97` | `#ffffff` | **3.39** | label kecil pada tab jurnal | 10px |
| `#7b8d95` | `#ffffff` | **3.45** | placeholder kolom cari | 15px |
| `#6e838b` | `#f6f8f9` | **3.73** | catatan kaki pratinjau artikel | 10.5px |
| `#71858c` | `#ffffff` | **3.86** | baris "Terindeks: GARUDA · Google Scholar" | 10px |
| `#70858d` | `#ffffff` | **3.87** | metadata artikel (jurnal, volume, halaman) | 10px |
| `#68808a` | `#ffffff` | **4.16** | nomor pada jalur cepat | 16px |
| `#ffd21a` | `#ffffff` | **1.45** | emas bila dipakai di latar terang | — |

Semua nilai di atas gagal untuk teks berukuran tersebut. Rata-rata kegagalan ada di kelompok metadata 9–10.5px — kombinasi ukuran terkecil dan warna paling pudar, tepat di informasi yang paling dibutuhkan pembaca akademik (nama jurnal, volume, nomor halaman, DOI).

### 2.2 Cacat tata letak dan semantik

| Temuan | Bukti |
| --- | --- |
| Celah mati ±130px di bawah tautan "Kembali ke Beranda" | `padding-block: 80px` + `margin-bottom: 40px` pada halaman dalam |
| Lead dua kolom tidak seimbang pada halaman dalam | Blok teks pendek disejajarkan ke atas terhadap gambar tinggi, menyisakan kekosongan ±330px |
| Aksen emas neon | `#ffd21a` pada headline hero terbaca seperti materi promosi diskon, bukan penerbit akademik |
| Tracking headline terlalu rapat | `letter-spacing: -0.065em` pada ukuran ±80px membuat antarkata nyaris bersentuhan |
| Heading footer memakai `<h2>` | Tiga `<h2>` di footer setara level dengan heading bagian utama |
| Nomor bagian tidak konsisten | Discovery tampil lebih dulu tanpa nomor, lalu `01 / JURNAL ILMIAH KAMI` |
| Menu mobile tidak menutup viewport | Panel `position: absolute` setinggi isinya, konten halaman terlihat di belakang |
| Permintaan font tidak terpakai | Inter dan Newsreader dimuat di `index.html` padahal hanya General Sans dan Instrument Serif yang dipakai |

---

## 3. Arah desain: "library press"

Penyempurnaan identitas, bukan penggantian. Yang dipertahankan: teal gelap, tipografi serif untuk display, fotografi perpustakaan, tata letak editorial, dan seluruh salinan teks.

### 3.1 Token warna

| Token | Nilai | Peran |
| --- | --- | --- |
| `--paper` | `#fbf9f5` | Latar halaman (putih hangat, bukan putih dingin) |
| `--surface` | `#ffffff` | Kartu dan panel |
| `--surface-2` | `#f5f2ea` | Panel sekunder, chip |
| `--ink` | `#142a32` | Teks utama |
| `--ink-2` | `#40585f` | Teks isi sekunder |
| `--ink-3` | `#5e7278` | Metadata kecil (lantai 12.5px) |
| `--teal` | `#1e5566` | Aksen merek, tautan |
| `--deep` / `--deep-2` | `#0f3038` / `#0a242b` | Pita gelap, footer |
| `--accent` | `#c9a227` | Kuningan: isian, garis, tombol |
| `--accent-bright` | `#e3b341` | Kuningan untuk teks di latar gelap |
| `--accent-ink` | `#7a5a0e` | Kuningan sebagai teks di latar terang |
| `--line` / `--line-strong` | `#e5e1d6` / `#cfc9b8` | Garis rambut hangat |

**Mengapa kuningan, bukan emas neon.** Logo merek bersifat monokrom: sampling piksel pada `logo-transparent.png` dan `logo-light.png` menemukan **nol piksel tersaturasi** (ambang saturasi 0.06–0.30). Jadi emas murni adalah aksen tambahan dari CSS, bukan bagian dari tanda merek. `#c9a227`/`#e3b341` tetap membawa sinyal "emas" pada tingkat hue yang sama, tetapi turun ke ranah kuningan yang terbaca seperti tinta cetak. Rasio kontras `#e3b341` pada `#0f3038` adalah **7.19:1** — jauh di atas ambang teks besar maupun normal.

### 3.2 Skala tipografi

| Peran | Sebelum | Sesudah |
| --- | --- | --- |
| Headline hero | ±80px, tracking −0.065em | `clamp(40px, 5.1vw, 74px)`, tracking −0.035em |
| Baris kedua headline | Sama dengan baris pertama | Instrument Serif, kuningan, 1.06em — memberi kontras editorial |
| `h2` bagian | 38–52px | `clamp(30px, 3.2vw, 44px)` |
| `h1` halaman dalam | 68px | `clamp(36px, 4.4vw, 60px)` |
| Metadata | **9–10.5px** | **12.5–13px** (lantai) |
| Label huruf besar | 9–10px | 12px, tracking 0.14em |
| Isi halaman | 15–16px | 16–17.5px, line-height 1.75 |

### 3.3 Ritme dan permukaan

- Section: `clamp(64px, 8vw, 104px)` desktop, 56–60px mobile (sebelumnya ada beberapa tumpukan padding 80px + margin 40px).
- Container: `min(1280px, 100% − 2×gutter)` dengan gutter `clamp(20px, 4vw, 48px)` — sebelumnya berpindah-pindah di tiga breakpoint.
- Kartu: latar putih, garis rambut `--line`, radius 6px, hover = garis + bayangan lembut (bukan lompatan warna). Titik dekoratif pada prinsip "about" diganti chip; bar "browser chrome" dan pola titik dipertahankan hanya di blok komponen lama yang sudah tidak dipakai.

---

## 4. Perbaikan yang diterapkan

Temuan → perubahan → bukti.

| # | Temuan | Perubahan | Bukti setelah |
| --- | --- | --- | --- |
| 1 | Metadata 9–10.5px | Lantai ukuran 12.5px untuk metadata, 12px untuk label huruf besar | Elemen terkecil `12px` di `/`, `/journals`, `/about`, `/author-guide`; 0 elemen <12px di `/journals` |
| 2 | 6 pasangan warna gagal AA | Token `--ink-2`, `--ink-3`, `--accent-ink`, `--teal` baru | **24 dari 24 pasangan teks lulus AA** (terendah 4.52:1) |
| 3 | 19–22 target <40px | `min-height: 44px` untuk seluruh tautan, tombol, chip, tautan footer; chip mobile 42px | **0 target <40px** di seluruh rute dan viewport |
| 4 | Emas neon | Aksen kuningan `#c9a227`/`#e3b341`/`#7a5a0e` | Kontras aksen pada latar gelap 7.19:1; pada latar terang 6.37:1 |
| 5 | Tracking headline terlalu rapat | −0.035em, batas atas 74px | Headline tetap dua baris dan tidak lagi bersentuhan |
| 6 | Heading footer `<h2>` | Menjadi `<h3>` | Outline: `H1,H2,H3…H3` tanpa lompatan level |
| 7 | Nomor bagian tidak konsisten | Discovery `01`, jurnal `02`, ekosistem `03`, alur `04`, angka `05`, tentang `06` | Urutan tampil sesuai nomor |
| 8 | Celah mati 130px | Halaman dalam `padding-block: clamp(44px,6vw,72px)`; tautan kembali `margin-bottom: 24px` | Tinggi `/about` desktop 1.566 → 1.567px (celah hilang, bukan tertambah) |
| 9 | Lead dua kolom tidak seimbang | `align-items: center` pada `.page-lead` | Blok teks duduk di tengah optis terhadap gambar |
| 10 | Menu mobile bocor | Panel mengisi `calc(100svh − 78px)` dengan latar paper | Konten di belakang tidak lagi terlihat |
| 11 | Font tidak terpakai | Inter + Newsreader dihapus dari `index.html`; `theme-color` → `#0f3038`; tambah `color-scheme: light` | 3 permintaan font (dari 4, satu di antaranya dua keluarga) |
| 12 | Gambar tanpa petunjuk decode | `decoding="async"` pada semua gambar konten | 0 gambar gagal muat di 12 rute × 2 viewport |
| 13 | Fokus tidak konsisten | `:focus-visible` 2px + offset; warna kuningan pada permukaan gelap | Ring pada latar putih 8.25:1, pada latar gelap 7.19:1 |
| 14 | Navigasi hash | `scroll-padding-top: 112px` | Judul bagian tidak lagi tertutup header lengket |

Kelas CSS lama dipertahankan (blok "legacy journal cards") agar komponen multi-situs yang sedang tidak dipakai tetap tampil benar bila diaktifkan kembali.

---

## 5. Verifikasi setelah

Skrip pengukuran yang sama persis, dijalankan ulang setelah redesign.

| Halaman | Teks <12px | Teks <10.5px | Terkecil | Target <44px | Target <40px | Overflow | `h1` | Tinggi | Δ tinggi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` desktop | 40 → **0** | 26 → **0** | 9px → **12px** | 22 → **0** | 22 → **0** | tidak | 1 | 7.472 → 7.519px | +0.6% |
| `/` mobile | 45 → **1** | 32 → **0** | 9px → **11.5px** | 20 → **0** | 20 → **0** | tidak | 1 | 12.749 → 13.214px | +3.6% |
| `/journals` desktop | 63 → **0** | 42 → **0** | 9px → **12px** | 21 → **0** | 21 → **0** | tidak | 1 | 4.344 → 4.740px | +9.1% |
| `/journals` mobile | 64 → **0** | 43 → **0** | 9px → **12px** | 19 → **0** | 19 → **0** | tidak | 1 | 8.296 → 9.666px | +16.5% |
| `/about` desktop | 3 → **0** | 0 → 0 | 11px → **12px** | 2 → **0** | 2 → **0** | tidak | 1 | 1.566 → 1.567px | 0% |
| `/about` mobile | 3 → **0** | 0 → 0 | 11px → **12px** | 0 → 0 | 0 → 0 | tidak | 1 | 1.985 → 1.864px | **−6.1%** |
| `/author-guide` desktop | 3 → **0** | 0 → 0 | 11px → **12px** | 2 → **0** | 2 → **0** | tidak | 1 | 1.490 → 1.516px | +1.7% |
| `/author-guide` mobile | 3 → **0** | 0 → 0 | 11px → **12px** | 0 → 0 | 0 → 0 | tidak | 1 | 1.946 → 1.859px | **−4.5%** |

Pemeriksaan 12 rute × 2 viewport: **0 overflow horizontal, 0 gambar gagal muat, seluruh animasi reveal terpicu, tepat 1 `h1` per halaman, 0 error konsol.**

### 5.1 Kontras setelah (24 pasangan, semuanya lulus AA)

| Pasangan | Rasio |
| --- | --- |
| `--ink` pada `--paper` | 14.19 |
| `--ink-2` pada putih / `--surface-2` | 7.56 / 6.75 |
| `--ink-3` pada putih / `--surface-2` / `--paper` | 5.06 / **4.52** / 4.81 |
| `--teal` pada putih | 8.25 |
| `--accent-ink` pada putih / `--surface-2` | 6.37 / 5.69 |
| Teks `--ink` pada isian `--accent` (tombol) | 6.17 |
| `--accent-bright` pada `--deep` | 7.19 |
| Isi hero (putih 92% pada overlay gelap) | 10.86 |
| Label fakta hero (84%) | 9.14 |
| Tautan footer (86% pada `--deep-2`) | 10.24 |
| Catatan footer (88%) | 9.32 |
| Label statistik (86% pada `--deep`) | 9.02 |
| Catatan statistik (92%) | 8.59 |
| Pil status "live" / "call for papers" | 7.73 / 6.62 |
| Ring fokus pada putih / pada gelap | 8.25 / 7.19 |

Nilai terendah di seluruh sistem adalah **4.52:1** — masih di atas ambang 4.5:1.

### 5.2 Gerbang teknis

- `npm run test:run`: **13 tes / 3 berkas lulus**, termasuk kontrak fungsional (`Explore Journals`, tiga "Coming Soon", `14 artikel · JETSI` dengan 14 `<h4>`, `1 jurnal · 2 artikel`, `contentinfo`, tidak ada tombol "jeda animasi").
- `npm run build`: bersih. CSS 58.08 kB (12.26 kB gzip), JS 485.47 kB (156.37 kB gzip).
- Bundle CSS tidak bertambah meski token dan kelas baru ditambahkan, karena stylesheet lama yang berisi aturan berulang ditulis ulang.

---

## 6. Yang sengaja tidak diubah

| Hal | Alasan |
| --- | --- |
| Struktur konten dan seluruh salinan | Audit ini soal tampilan, bukan pesan; klaim publik sudah dibatasi oleh `2026-10-19-public-presence-audit.md` |
| Kelas CSS lama | Agar komponen multi-situs nonaktif tetap tampil benar bila diaktifkan kembali |
| Teks 11–11.5px: monogram jurnal (JETSI/JIEL/Pengmas), label foto about, eyebrow hero mobile | Huruf besar ber-tracking dengan kontras ≥7:1 — pola editorial yang lazim (seperti nomor terbitan), bukan kegagalan WCAG karena WCAG tidak menetapkan ukuran huruf minimum |
| Chip filter mobile 42px dan tombol bersihkan 40px | Di atas 24px yang disyaratkan WCAG 2.2 AA; 44px adalah panduan platform, bukan syarat |
| Jumlah `h1` per halaman | Sudah benar sejak awal (tepat 1) |

### Trade-off yang perlu diketahui

Halaman `/journals` di mobile menjadi **16.5% lebih panjang** (8.296 → 9.666px), dan beranda mobile **3.6% lebih panjang**. Ini konsekuensi langsung dari keputusan menaikkan metadata 9px → 12px dan judul artikel ke 21px serif pada 14 kartu artikel. Halaman `/about` dan `/author-guide` justru **memendek** setelah celah mati dihapus. Pilihan yang diambil: keterbacaan informasi bibliografis lebih penting daripada keringkasan halaman.

---

## 7. Berkas yang berubah

| Berkas | Perubahan |
| --- | --- |
| `src/styles.css` | Ditulis ulang: lapisan token, skala tipe, 20 bagian terorganisasi, responsif di 1150/900/640px |
| `src/App.jsx` | Heading footer `h3`, penomoran bagian `01`–`06`, `decoding="async"` pada gambar |
| `src/components/Discovery.jsx` | Eyebrow bernomor, `decoding="async"` |
| `src/components/JournalFinder.jsx` | Eyebrow bawaan `02 / JURNAL ILMIAH KAMI` |
| `index.html` | Hapus permintaan font Inter + Newsreader, `theme-color` `#0f3038`, `color-scheme: light` |

Bukti dan perkakas (belum di-commit):

- Screenshot sebelum: `output/playwright/audit-current-*.png`, `audit2-*.png`, `audit3-*.png`
- Screenshot sesudah: `output/playwright/redesign-*.png` (12 rute × 2 viewport + potongan mobile + menu terbuka)
- Metrik sebelum: `output/playwright/metrics-before.txt`
- Skrip: `scripts/verify-redesign.js` (tangkap + metrik 12 rute), `scripts/measure-text.js` (metrik pembanding baseline), `scripts/contrast-check.mjs` (rasio kontras), `scripts/apply-audit-fixes.ps1` (catatan perubahan markup satu-kali)

---

## 8. Tindak lanjut yang disarankan

1. **Uji perangkat nyata** (iOS Safari) untuk chip filter dan tombol bersihkan yang berukuran 40–42px.
2. **Lighthouse/perf** setelah pemangkasan font, untuk memastikan `decoding="async"` dan pengurangan permintaan font benar-benar terasa.
3. **Isi halaman `/books`, `/news`, `/services`** dengan konten nyata — saat ini hanya menyampaikan satu pesan "Coming Soon" dalam 1.600–2.200px.
4. **Audit pembaca layar** dengan NVDA/VoiceOver: urutan fokus, pengumuman hasil pencarian jurnal, dan status `aria-expanded` menu.
5. **Commit perubahan** — saat ini seluruh pekerjaan masih berada di working tree `main` dan belum di-commit.
