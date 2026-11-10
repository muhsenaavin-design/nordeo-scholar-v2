# Audit Referensi Template — Pemisahan "Journal Finder" & "Published Articles"

> Tanggal: 2026-11-10
> Konteks: permintaan memisahkan section **"Find the journal that fits your research field."** dari blok **"Published articles"** di homepage.
> Batasan: perubahan hanya untuk homepage. Halaman `/journals` tetap satu blok gabungan.

---

## 1. Kondisi Nordeo saat ini (bukti)

| Artefak | Lokasi |
|---|---|
| Section jurnal (heading + filter + kartu) | `docs/design/references/audit-current-journals-head.png` |
| Blok artikel di dalam section yang sama | `docs/design/references/audit-current-articles.png` |

Yang sudah kuat dan **jangan diubah**:

- Palet paper `#fbf9f5`, kartu putih, hairline `#e5e1d6`, satu aksen kuning `#ffd218`.
- Kartu artikel **tanpa foto stok** — judul, penulis, volume, DOI. Ini justru yang bikin terasa kredibel.
- Sidebar filter sudah rapi: search, Field dengan hitungan, status hasil, fakta jurnal.
- Tipografi: General Sans untuk display dan body (`--serif` = `--sans`). Jadi **bukan** arah serif lagi.

Yang jadi masalah (alasan permintaan ini):

- Satu `<section id="jurnal">` memuat dua pekerjaan berbeda: *memilih jurnal* dan *membaca artikel*.
- Heading artikel hanya `h3` di dalam section jurnal, jadi hierarki halaman ambigu.
- Search di sidebar ikut menyaring artikel, padahal secara mental model search itu milik pencari jurnal.
- Di dashboard admin, keduanya satu item "Pencari jurnal" — tidak bisa diatur terpisah.

---

## 2. Kriteria "fit" untuk Nordeo

Referensi dinilai dengan 6 kriteria, bukan selera:

1. **Sans, bukan serif** — token display Nordeo sekarang General Sans.
2. **Paper + teal + satu aksen** — bukan dark mode, bukan neon.
3. **Volume kecil** — hanya 4 jurnal dan 14 artikel. Filter berat dan sorting tidak sepadan.
4. **Kredibilitas akademik** — metadata (E-ISSN, indeksasi, DOI) lebih penting daripada foto.
5. **Pemisahan section jelas** — heading sendiri, jarak sendiri, tidak menempel section lain.
6. **Murah diimplementasi** — React + CSS yang sudah ada, tanpa library baru.

---

## 3. Referensi yang diaudit

Semua template di bawah **hanya referensi visual/pola**; tidak ada aset yang disalin.

| # | Referensi | Jenis / harga | Pola yang diambil | Fit | Catatan |
|---|---|---|---|---|---|
| 1 | **Frontiers — All journals** (frontiersin.org/journals) | Penerbit nyata | Blok daftar jurnal (search + filter A–Z + kartu) **terpisah** dari blok artikel "Most viewed" di bawahnya | ⭐⭐⭐⭐⭐ | Struktur paling dekat dengan kebutuhan. Skala 228 jurnal tidak relevan untuk Nordeo |
| 2 | **Notes Journal** — Bryn Taylor | Framer, $149 (berbayar) | Jarak antar blok lega, garis hairline sebagai pemisah, pill kategori berwarna, ritme editorial tenang | ⭐⭐⭐⭐ | Serif besar tidak dipakai Nordeo; ambil ritme & pemisahnya saja |
| 3 | **Monograph** — Bryn Taylor | Framer, $149 (berbayar) | Baris pill kategori (`All / Design systems / …`) di atas grid, search di header, grid 3 kolom | ⭐⭐⭐⭐ | Dark mode tidak cocok; pola filter ringkas cocok untuk artikel |
| 4 | **Publica** — Andrei Alba | Framer, $59 (berbayar) | Koran: section band, "Latest" rail, halaman arsip terpisah, count + metadata di setiap kartu | ⭐⭐⭐ | Terlalu padat & image-heavy untuk Nordeo; ambil ide pemisahan section + baris hitungan |
| 5 | **Listora** — Divya Darpan | Framer, $129 (berbayar) | Panel filter (kategori, reset, hitungan), baris "Showing 30 places…", state filter aktif | ⭐⭐⭐ | Kulit travel/neon tidak cocok; mekanik filter boleh dicontek secukupnya |
| 6 | **The Index** — Fabricatr | Framer, $59 (berbayar) | Paper + satu aksen gelap, penomoran section `01 / 06`, tipografi tenang | ⭐⭐⭐½ | Vibe private club; penomoran bertabrakan dengan aturan "no kicker labels" di site |
| 7 | **Faculty** — Sasha Mozdir | Framer, **gratis** | Kartu program pendidikan, layout editorial, CMS program | ⭐⭐⭐ | Dark mode; berguna kalau nanti Academy butuh pola kartu |
| 8 | **Reado / Noter / Presslora / Bookshelf** | Framer, gratis | Blog & katalog penerbitan | — | Baru dicek dari listing marketplace, belum diaudit visual. Alternatif gratis kalau butuh pembanding cepat |

### Keterbatasan audit

- Webflow template gallery dirender via JS, tidak bisa diambil sebagai teks; tidak ada template Webflow yang dinilai visual di sesi ini.
- Taylor & Francis menolak akses (HTTP 403), jadi benchmark-nya memakai Frontiers + pola yang sudah tercatat di `redesign-references.md`.
- Harga template bisa berubah; angka di atas adalah harga listing saat audit.

---

## 4. Kesimpulan audit

**Struktur:** ikuti **Frontiers** — daftar jurnal dan daftar artikel adalah dua blok bersaudara, masing-masing punya heading, bukan satu heading yang menaungi keduanya.

**Ritme visual:** ikuti **Notes Journal** — pemisah cukup hairline + jarak besar. Tidak perlu kotak, background gelap, atau kartu pembungkus section.

**Ergonomi filter:** ambil **Listora versi mini** — hitungan hasil, tombol reset, state aktif yang jelas. **Tidak perlu** sort dropdown, filter lokasi/harga/rating, atau panel filter bertingkat.

**Yang justru harus dihindari:**

- Search hero besar di atas section (Listora) — Nordeo sudah punya sidebar yang lebih tenang.
- Grid koran multi-kolom + foto besar (Publica) — akan menyaingi NordeoNews.
- Serif display (Notes Journal, The Index) — token Nordeo sudah sans.
- Dark mode (Monograph, Faculty, Listora) — palet Nordeo paper/teal.
- Filter A–Z (Frontiers) — hanya 4 jurnal.
- Penomoran section ala The Index — bertabrakan dengan "professional pass" yang membuang kicker.

---

## 5. Rekomendasi desain untuk pemisahan

### Section 1 — Journal finder

- `h2`: "Find the journal that fits *your research field.*" (tetap).
- Lead satu baris di kanan (tetap).
- Sidebar: search + Field + fakta jurnal. Status hasil menjadi **"4 journals"** saja (tidak lagi menghitung artikel).
- Grid kartu 2×2 (tetap). Tombol "See articles" berubah jadi anchor ke section artikel **sambil memilih jurnal itu**.
- Tidak ada tab artikel, tidak ada focus-area chips di section ini.

### Section 2 — Published articles

- Section sendiri dengan `h2` "Published articles" + lead satu baris.
- Baris kontrol: tab jurnal (JETSI / JIEL / JIBDI / Pengmas) + focus-area chips, seperti sekarang.
- Grid 2 kolom di homepage (4 artikel), kartu teks tanpa foto (tetap).
- Footer: "Showing 4 of 14 JETSI articles." + link "All journals and articles →".
- Pemisah visual: hairline + `section-space` (opsi A, rekomendasi) atau band `--surface-2` (opsi B).

### Perilaku yang berubah (perlu persetujuan)

- Search sidebar **hanya** menyaring jurnal. Artikel disaring lewat tab jurnal + focus area.
- Anchor `#artikel` tetap ada supaya link lama tidak rusak.

---

## 6. Catatan implementasi (setelah desain disetujui)

- Pecah `src/components/JournalFinder.jsx` menjadi `JournalDirectory` + `PublishedArticles`, dengan wrapper kecil untuk state bersama (`selectedJournal`, `articleRef`).
- `/journals` tetap memakai komposisi gabungan seperti sekarang.
- `src/pages/Home.jsx`: satu entry `journals` di `SECTIONS` merender dua `<section>`.
- Tes yang perlu diperbarui: `src/App.test.jsx` baris 118–133 (hitungan "1 journal · 2 articles" berubah).
- Tidak ada dependency baru.
