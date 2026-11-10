# Desain — Pemisahan "Journal Finder" dan "Published Articles" di Homepage

> Tanggal: 2026-11-10
> Status: disetujui arahnya; menunggu review spec sebelum implementasi.
> Audit referensi: `docs/design/2026-11-10-journal-finder-reference-audit.md`

## 1. Tujuan

Di homepage, bagian **"Find the journal that fits your research field."** harus menjadi section sendiri, terpisah dari daftar **"Published articles"**. Keduanya tetap ada di homepage, tetapi tidak lagi berbagi satu `<section>` dan satu heading.

## 2. Non-tujuan

- Halaman `/journals` **tidak berubah** — tetap satu blok gabungan seperti sekarang.
- Tidak menambah item baru di "Susunan section beranda" dashboard. Section jurnal dan artikel tetap satu entri: "Pencari jurnal".
- Tidak mengubah data jurnal/artikel, tidak menambah dependency, tidak mengubah palet atau tipografi.
- Tidak menambah sorting, filter A–Z, hero search, atau dark mode.

## 3. Struktur halaman (homepage)

```
<div class="journals-section section-space container" id="journals">
  <section id="jurnal" aria-labelledby="journal-finder-heading">
    h2 "Find the journal that fits your research field."
    lead di kanan
    sidebar: search · Field · status "4 journals" · fakta jurnal
    grid 2×2 kartu jurnal
  </section>
</div>

<div class="articles-section section-space container" id="articles">
  <section id="artikel" aria-labelledby="published-articles-heading">
    h2 "Published articles"
    lead satu baris
    tab jurnal · focus area chips
    grid artikel (4 di homepage)
    footer: "Showing 4 of 14 …" + "All journals and articles →"
  </section>
</div>
```

- Pemisah visual (keputusan user): **hairline `var(--line)` + jarak**. Jarak total antara blok tetap sekitar satu `section-space`, bukan dua kali.
- Anchor `#artikel` dipindah ke `<section>` artikel (sebelumnya di `<div class="article-preview">`). Anchor `#jurnal` dan `#journals` tetap.
- Tidak ada `id` ganda: `#journal-search` hanya dipakai satu kali per halaman.

## 4. Perilaku

| Aksi | Sebelum | Sesudah (homepage) |
|---|---|---|
| Ketik di search sidebar | Menyaring jurnal **dan** artikel | Menyaring **jurnal saja** |
| Klik "See articles" di kartu | Pilih jurnal + scroll ke artikel | Sama (state `selectedJournal` dibagi) |
| Klik tab jurnal | Ganti jurnal artikel | Sama |
| Klik focus area | Saring artikel | Sama |
| Reset / kosongkan hasil | Satu empty state gabungan | Empty state per section |

- Status hasil di sidebar menjadi **"4 journals"** (tanpa hitungan artikel). Hitungan artikel pindah ke section artikel.
- Search jurnal tetap mencocokkan profil jurnal **dan** judul artikel di dalamnya (perilaku sekarang dipertahankan), supaya "Shopee" tetap menemukan JETSI.
- `/journals` tetap: search menyaring jurnal + artikel, status "4 journals · 14 articles".

## 5. Komponen

File saat ini: `src/components/JournalFinder.jsx` (±300 baris, dua cabang markup yang hampir identik).

Rencana:

1. `src/components/JournalDirectory.jsx` — heading, sidebar, kartu jurnal. Props: query, category, hasil, `selectedJournal`, `onShowArticles`, `showArticleCount` (false di homepage).
2. `src/components/PublishedArticles.jsx` — heading `h2`, tab jurnal, focus area, grid, empty state, footer. Props: articles, topic, selectedJournal, handlers, limit, `showArchiveLink`.
3. `src/components/JournalFinder.jsx` — komposisi. Menyimpan state bersama (`query`, `category`, `selectedJournal`, `topic`, ref), lalu merender:
   - `layout="split"` (homepage): dua `<section>` bersaudara.
   - default (kombinasi, `/journals`): satu `<section>` seperti sekarang.
4. Hapus cabang markup duplikat yang tidak terpakai (`side &&` di dalam cabang non-side).

`src/pages/Home.jsx`: entri `SECTIONS.journals` menjadi dua `<div>` pembungkus (journals-section + articles-section) yang merender satu `JournalFinder layout="split"`.

## 6. Gaya

- Section artikel memakai `section-space` dan hairline atas. Tidak ada kartu pembungkus section.
- Grid artikel homepage: 2 kolom di desktop (sama seperti sekarang), 1 kolom di mobile. Karena container kini selebar halaman, batasi lebar teks di dalam kartu (judul/abstrak maksimum ±62ch) agar baris tidak terlalu panjang.
- Kartu artikel tetap teks tanpa foto.
- Tidak ada kicker label, penomoran section, atau ornamen baru.

## 7. Aksesibilitas

- Dua `h2` dengan `aria-labelledby` masing-masing section.
- Urutan heading tidak melompat (h2 → h3 kartu → h4 judul artikel).
- `PublishedArticles` menerima prop level heading:
  - homepage (`split`): heading section `h2`, judul kartu `h3`.
  - `/journals` (kombinasi): heading blok `h3`, judul kartu `h4` seperti sekarang — tampilan `/journals` tidak berubah.
- Scroll dari "See articles" menghormati `prefers-reduced-motion` (perilaku sekarang).
- `role="status"` hanya di satu tempat per section.

## 8. Tes

Perbarui `src/App.test.jsx`:

1. Test journal finder homepage (baris 118–127):
   - Setelah search "Shopee": status berbunyi **"1 journal"** (bukan "1 journal · 2 articles").
   - Artikel tidak ikut tersaring oleh search.
2. Tambah test: homepage punya dua section terpisah —
   - `h2` "Find the journal that fits…" dan `h2` "Published articles".
   - Section artikel berada di luar section jurnal.
3. Test `/journals` (baris 129–133) tetap: "14 articles · JETSI", 14 `h4`.

Jalankan `npm run test:run` sebelum selesai.

## 9. Risiko

- **Hitungan berubah** → tes lama gagal; sudah dicakup poin 8.
- **Duplicate ID** kalau sidebar dan section artikel sama-sama memakai `id="journal-search"` → hanya sidebar yang memakainya.
- **Anchor lama** `#artikel` → dipindah ke section baru, nilainya tetap.
- **Spasi ganda** antara dua section → atur padding artikel agar total jarak ± satu `section-space`.
- **Dashboard** tetap satu entri; tidak ada migrasi data konten.

## 10. Kriteria selesai

- [ ] Homepage: judul "Find the journal…" dan "Published articles" masing-masing punya `<section>` + `<h2>` sendiri.
- [ ] Search sidebar tidak lagi menyaring artikel di homepage.
- [ ] "See articles" tetap memilih jurnal dan scroll ke section artikel.
- [ ] `/journals` tampil dan berperilaku sama seperti sebelum perubahan.
- [ ] Hairline + jarak memisahkan dua section tanpa spasi ganda.
- [ ] `npm run test:run` hijau.
- [ ] Tidak ada dependency baru.
