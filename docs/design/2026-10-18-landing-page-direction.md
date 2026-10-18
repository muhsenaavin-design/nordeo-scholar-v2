# Nordeo Scholar — audit dan arah landing page

Tanggal: 18 Oktober 2026. Status: rekomendasi desain, belum implementasi atau hasil uji pengguna.

## Brief yang dikonfirmasi

- Arah desain dipercayakan; pertahankan tone warna website dan identitas logo Nordeo.
- Logo perlu versi transparan dan dirapikan, tanpa mengganti bentuk identitasnya.
- Referensi utama: https://motionsites.ai/restyle, dengan ketertarikan pada keseluruhan feel.
- Bahasa campuran: headline/istilah publikasi dapat berbahasa Inggris; penjelasan dan bantuan dominan Indonesia. Satu label aksi harus konsisten sepanjang website.
- Hasil tahap ini: audit laporan, audit antarmuka, referensi, pilihan arah, struktur landing, pedoman visual/interaksi, dan kriteria evaluasi.

## 1. Audit sumber primer BAB I–III

Sumber: `C:\Users\Avin Sena\Downloads\BAB I - III DE.pdf`. Nomor berikut memakai halaman PDF yang diverifikasi; status operasional merupakan kondisi saat laporan ditulis, bukan verifikasi kondisi bisnis hari ini.

| Temuan laporan | Halaman | Implikasi desain |
|---|---|---|
| Informasi perusahaan, jurnal, berita, buku, dan layanan tersebar; hubungan platform dan navigasi belum jelas | 9–10, 28–29 | Homepage harus menjelaskan hubungan antarlayanan dan tujuan setiap tautan |
| Empat ekosistem: Journals Publishing, Books Publishing, Media & News Publishing, Academic Training | 8, 10, 14–17 | Empat pintu masuk dengan nama konsisten |
| Hanya Journals operasional; tiga lainnya Coming Soon | 10 | Status tertulis per ekosistem; CTA layanan terencana menuju penjelasan, bukan alur layanan semu |
| JETSI Vol. 1 No. 1 (2026) memiliki tujuh artikel; ISSN masih 0000-0000, sitasi belum memakai DOI | 10 | Gunakan publikasi nyata sebagai bukti; jangan tampilkan placeholder ISSN atau klaim DOI aktif |
| Google Scholar, Garuda, SINTA, hingga Scopus merupakan target roadmap 2026–2045 | 10 | Jangan membuat deretan logo seolah sudah terindeks; pisahkan target dari capaian |
| Corporate website menghubungkan platform WordPress/OJS, tidak mengganti fungsi khusus platform | 13, 16 | Jelaskan perpindahan menuju platform jurnal; jangan menjanjikan submission atau akun terintegrasi |
| Audiens mencakup penulis, reviewer, pembaca, peneliti, mahasiswa, mitra, manajemen, dan publik | 17–18 | Jalur berbasis tugas, bukan semua audiens dijadikan menu utama |
| Prototype menggambarkan homepage, perusahaan, ekosistem, publikasi, dan navigasi antarplatform | 30 | Landing harus terhubung dengan halaman detail, bukan sekadar halaman promosi |
| Prototyping iteratif dengan evaluasi struktur informasi, navigasi, antarmuka, dan umpan balik stakeholder | 22, 25, 29–31 | Buat tugas evaluasi yang bisa diamati; jangan mengklaim usability sudah terbukti |

**Kesimpulan:** kebutuhan inti adalah kejelasan informasi dan perjalanan pengguna. Tampilan premium harus membantu pengunjung menemukan jurnal, memahami layanan yang tersedia, dan menghubungi Nordeo.

## 2. Audit website yang tersedia

Workspace memuat dua implementasi: root `src/` dan `app/`. Dokumen desain terdahulu menunjuk `app/`; rekomendasi ini memakai palet teal–gold dari `app/src/index.css`. Root menggunakan hijau `#0b5d58`; tentukan target build sebelum implementasi agar perubahan masuk versi yang benar.

Temuan dari `app/src/pages/Home.jsx`:

- Hero memiliki minimum tinggi 690px desktop/620px mobile, lalu section Vision besar. Akses ekosistem muncul terlambat.
- CTA hero menuju `/about#ecosystem`, padahal homepage memiliki section `#ecosystem`. Jalur bisa dipersingkat ke section relevan di homepage.
- Empat kartu ekosistem menjelaskan layanan tanpa status ketersediaan.
- Section Publications kembali menjelaskan kategori layanan. Ganti dengan jurnal atau terbitan nyata agar tidak mengulang section ekosistem.
- Label Vision memakai 8px pada breakpoint kecil; ukuran terlalu kecil untuk informasi penting.
- Gambar About mengarah ke `/assets/about.png`, tetapi file tersebut tidak tersedia; browser menampilkan bidang teal dengan alt text.
- Logo footer memakai `brightness-0 invert` pada PNG ber-background putih; hasilnya bidang putih solid. Transparansi sumber perlu dibenahi sebelum filter/varian warna dipakai.
- Metadata, tujuan link eksternal, dan kebijakan publikasi perlu muncul dekat keputusan pengguna, tidak hanya footer.

Temuan navigasi awal: dropdown mengandalkan hover dan kontrol mobile perlu status aksesibel. Validasi keyboard, fokus, Escape, serta `aria-expanded` saat implementasi.

## 3. Pilihan arah

| Arah | Karakter | Trade-off |
|---|---|---|
| **Editorial Scholar — rekomendasi** | Teal–gold existing, ruang lega, serif selektif, sampul publikasi, garis tipis | Perlu disiplin konten dan sampul asli; paling sesuai publisher yang berkembang |
| Modern Research Network | Sans tegas, grid modular, jalur tugas dominan, diagram hubungan layanan | Sangat jelas, tetapi berisiko terasa seperti software bila semua section berupa kartu |
| Cinematic Academic | Hero gelap, fotografi besar, gerak lebih terlihat | Menarik untuk kampanye, tetapi mudah menunda akses jurnal dan menambah beban mobile |

Pilih Editorial Scholar. Ambil kejelasan navigasi dari Modern Research Network dan satu visual hero kuat dari Cinematic Academic.

## 4. Referensi dan bagian yang diadaptasi

Referensi adalah pola, bukan instruksi membeli template atau memindahkan stack ke Framer. Harga sengaja tidak dijadikan dasar keputusan.

| Referensi | Yang dipelajari untuk Nordeo | Batas adaptasi |
|---|---|---|
| [MotionSites Restyle](https://motionsites.ai/restyle) | Titik awal eksplorasi feel visual yang dipilih pengguna | Halaman merupakan alat restyle dengan pemilih gaya; bukan spesifikasi tunggal landing publisher. Jangan anggap seluruh contoh gayanya cocok |
| [Notes Journal — Framer](https://www.framer.com/marketplace/templates/notes-journal/) | Headline serif besar, whitespace, fokus membaca; cocok untuk heading dan Research & Insights | Jangan ubah homepage menjadi blog pribadi |
| [Bookshelf — Framer](https://www.framer.com/marketplace/templates/bookshelf/) | Identitas sampul dan kategori membuat konten mudah dipindai | Jangan tampilkan buku fiktif, rating, atau katalog seolah sudah tersedia |
| [Educare — Framer](https://www.framer.com/marketplace/templates/educare/) | Urutan informasi layanan, hierarki CTA, pola section institusi | Hindari copy admissions, mahasiswa, atau program belajar yang bukan layanan aktif Nordeo |
| [Edukate — Framer](https://www.framer.com/marketplace/templates/edukate/) | Hubungan homepage, profil, dan katalog; referensi jalur training mendatang | Bukan dasar membuat LMS atau katalog training aktif |
| [Springer Nature](https://www.springernature.com/gp) | Corporate gateway yang membedakan produk, penerbitan, dan kebutuhan audiens | Sederhanakan sesuai jumlah konten Nordeo; jangan salin kepadatan menu publisher besar |
| [Frontiers](https://www.frontiersin.org/) | Jalur All journals, Submit manuscript, dan bantuan penulis/reviewer dekat tugas utama | Jangan salin statistik, cakupan jurnal, janji kecepatan review, atau klaim indeks |
| [MIT Press](https://mitpress.mit.edu/) | Publikasi dan konten editorial nyata menjadi pusat presentasi | Homepage Nordeo perlu lebih ringkas; carousel bukan keharusan |

Listing Framer dan halaman publisher diperiksa melalui web. Restyle juga diperiksa langsung melalui screenshot browser: shell gelap, form di sidebar, grid thumbnail, panel rounded, dan filter ringkas. Yang relevan ialah komposisi editorial kuat dan hierarki kartu; shell alat gelap serta promo ungu tidak menjadi arah warna Nordeo. Perilaku animasi tidak diasumsikan dari screenshot.

Bukti browser: `output/playwright/restyle-desktop.png`, `output/playwright/nordeo-current-desktop.png`, dan `output/playwright/nordeo-current-mobile.png`. Screenshot website Nordeo memakai implementasi `app/`, bukan root `src/`.

## 5. Struktur landing yang disarankan

### Header

Header putih agar logo gelap terbaca tanpa kotak background. Menu: **About · Ecosystem · Journals · Insights · Contact**. CTA utama: **Explore Journals**. Tidak perlu mega-menu besar untuk empat ekosistem dengan konten terbatas. Logo kembali ke beranda.

### Hero

Desktop dua kolom: teks sekitar 55%, visual publikasi/riset sekitar 45%. Mobile: judul, penjelasan, CTA, baru visual. Visual memakai sampul asli/diagram editorial yang jelas; hindari dashboard palsu.

- Eyebrow: `NORDEO SCHOLAR PUBLISHING`
- Headline usulan: **Advancing Knowledge. Connecting Research.**
- Penjelasan: “Temukan jurnal Nordeo dan informasi pengembangan ekosistem publikasi, media, serta pelatihan akademik dalam satu pintu.”
- CTA utama: **Explore Journals** menuju portfolio jurnal.
- CTA kedua: **Jelajahi Ekosistem** menuju `#ecosystem`.

Target awal: akses layanan inti sudah terlihat pada viewport pertama perangkat umum. Tinggi hero mengikuti konten, bukan dipaksa memenuhi layar.

### Jalur cepat berdasarkan tugas

Tiga tautan ringkas: **Cari Jurnal · Panduan Penulis · Kerja Sama**. Tugas reviewer dan informasi lain tetap tersedia pada halaman jurnal/footer; hindari delapan pilihan audiens setara.

### Empat ekosistem

Empat kartu dengan urutan Journals, Books, Media & News, Academic Training. Desktop 2×2 atau empat kolom bila teks tetap lega; mobile satu kolom.

- Journals: status aktif setelah dicek ulang, CTA **Lihat Jurnal**.
- Tiga lainnya: **Coming Soon**, penjelasan singkat, CTA **Lihat Rencana** menuju halaman informasi yang benar.
- Status tidak disampaikan lewat warna saja. Jangan memakai tombol mati tanpa penjelasan.

### Featured Journals

Isi dengan jurnal nyata yang status/linknya sudah diverifikasi. JETSI diarahkan ke platform eksternal sesuai batas repository yang tercatat di README. Pengmas tetap bagian portfolio Nordeo, tetapi statusnya perlu diperiksa sebelum diberi label aktif.

Kartu: nama jurnal lengkap, bidang, bahasa/frekuensi bila terverifikasi, terbitan terbaru yang benar, **Lihat Profil**, dan **Buka Platform Jurnal** dengan ikon serta keterangan perpindahan platform. ISSN, DOI, indeks, atau open access hanya ditampilkan jika ada bukti valid.

### Publishing with clarity

Tiga langkah navigasi: **Pilih jurnal → Baca panduan → Lanjut ke platform jurnal**. Ini alur pengunjung, bukan janji proses editorial atau integrasi submission baru.

### About dan komitmen publikasi

Ringkaskan visi menjadi satu paragraf dan tiga prinsip yang bisa dijelaskan: integritas, transparansi, kolaborasi. Hubungkan ke profil perusahaan, kebijakan etika publikasi, dan kontak. Kebijakan harus tersedia dan benar sebelum dipromosikan sebagai bukti.

### Insights — kondisional

Maksimal tiga berita/artikel nyata dengan tanggal dan kategori. Jika belum ada konten yang layak, hilangkan section ini dari homepage; Media & News tetap memiliki kartu Coming Soon.

### CTA akhir dan footer

CTA: **Mari Bangun Kolaborasi Akademik** dengan aksi **Hubungi Nordeo**. Footer memuat identitas perusahaan, kontak resmi, empat ekosistem beserta status, publication ethics, privacy, dan tautan platform eksternal.

Roadmap lengkap pindah ke About/Development Roadmap. Jika ditampilkan di homepage, cukup ringkasan berlabel **Target Pengembangan**, tanpa badge indeks yang menyerupai capaian.

## 6. Sistem visual

| Peran | Warna | Asal/aturan |
|---|---|---|
| Brand utama | `#24586e` | Existing |
| Brand gelap | `#1f4b5e` | Existing |
| Hero/footer gelap | `#173d4d` | Existing |
| CTA/aksen | `#ffd21a` | Existing; gunakan teks gelap, jangan teks putih |
| Teks utama | `#17313c` | Existing |
| Paper | `#f7f8f7` | Existing; bidang konten utama |
| Border | `#dfe7ea` | Existing |
| Warm paper opsional | `#f5f1e8` | Tambahan terbatas untuk featured publication; bukan warna brand baru |

- Pertahankan Inter untuk body dan UI; uji Newsreader sebagai satu tambahan serif untuk headline editorial. Tidak perlu mengganti semua teks ke serif.
- H1 desktop sekitar 56–72px, mobile 36–44px; body 16–18px dengan line-height sekitar 1.5–1.7. Ukuran akhir mengikuti panjang copy.
- Container sekitar 1180–1240px; section gap desktop 80–112px, mobile 48–64px.
- Radius kartu sekitar 12–16px; shadow tipis hanya pada elemen yang butuh pemisahan. Gunakan garis dan whitespace sebagai pemisah utama.
- Light content mendominasi; teal gelap menjadi penanda hero/footer, gold difokuskan pada aksi dan aksen kecil.

## 7. Logo

Sumber `app/public/assets/logo.png` memiliki background putih, simbol N metalik, teks gelap, dan shadow. Rekomendasi asset terpisah, bukan overwrite sumber:

1. Bersihkan background dengan alpha yang menjaga tepi antialias dan bagian terang simbol N; cek halo di background putih, teal, dan warm paper.
2. Pangkas margin kosong secukupnya; pertahankan rasio dan ruang aman.
3. Simpan versi transparan warna asli untuk header putih. Jika footer gelap perlu versi satu warna terang, turunkan dari silhouette yang sama dan periksa keterbacaan.
4. Bila tersedia sumber SVG/PDF vector resmi, prioritaskan sumber tersebut. Jangan menebak detail logo menggunakan generasi AI.

Penghapusan background dan perubahan asset belum dilakukan pada tahap rekomendasi ini.

## 8. Motion, mobile, aksesibilitas

- Satu entrance hero; reveal ringan pada section pendukung. Konten penting dan CTA tetap terlihat bila animasi gagal atau dimatikan.
- Interaksi tombol/kartu sekitar 150–250ms; reveal sekitar 300–450ms, gerak vertikal kecil. Hormati `prefers-reduced-motion`.
- Hindari scroll hijacking, cursor custom, autoplay video berat, teks yang wajib menunggu animasi, dan marquee logo indeks.
- Mobile tidak bergantung hover. Menu dan kartu bisa dioperasikan keyboard; fokus terlihat, Escape menutup menu, fokus dikembalikan ke pemicu.
- Target sentuh minimal 44×44px; kontras teks normal minimal 4.5:1, teks besar 3:1. Uji seluruh pasangan warna/state saat implementasi.
- Caption/sumber gambar dan alt sesuai fungsi; `lang` utama Indonesia dengan penandaan bahasa pada frasa panjang Inggris bila perlu.
- Responsif diuji pada 360/390, 768, 1024, dan 1440px, termasuk zoom 200%, teks panjang, dan tanpa horizontal overflow.
- Target produksi: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; ini target pengukuran, bukan hasil saat ini. Prioritaskan gambar hero, dimensi gambar eksplisit, lazy loading di bawah fold, dan font terbatas.

## 9. Validasi end-to-end sebelum implementasi final

| Tugas evaluasi | Indikator yang diamati |
|---|---|
| Cari jurnal yang sesuai dan buka platform jurnal | Jalur selesai, tujuan link dipahami, jumlah salah klik |
| Cari panduan penulis | Informasi ditemukan tanpa harus menebak menu |
| Bedakan layanan aktif dengan rencana pengembangan | Status dikenali dan tidak disalahartikan sebagai layanan tersedia |
| Cari kontak untuk kolaborasi | Kontak resmi ditemukan dan aksinya berfungsi |
| Jelaskan fungsi Nordeo dan hubungannya dengan OJS | Pengguna memahami peran corporate gateway |

Catat waktu, keberhasilan tugas, salah klik, dan komentar stakeholder. Gunakan iterasi prototype sesuai BAB III. Jika memakai SUS atau instrumen tambahan, nyatakan sebagai tambahan rancangan evaluasi, bukan metode yang diasumsikan sudah ada di laporan.

Urutan kerja: konfirmasi target implementasi `app/` atau root; cek status konten dengan pengelola; siapkan logo transparan; wireframe desktop/mobile; satu mockup hi-fi arah Editorial Scholar; evaluasi stakeholder; baru implementasi dan pengukuran.

## 10. Koreksi terhadap dokumen desain sebelumnya

`audit-visual-references.md` dan `redesign-references.md` adalah riwayat ide, bukan bukti operasional. Usulan marquee indeks, count-up statistik, DOI/ISSN badge, dan label “Live” harus melalui verifikasi. Mockup terdahulu tidak membuktikan metadata atau status bisnis. Rekomendasi ini tidak mengubah aplikasi, menghapus file, memasang dependency, membeli template, atau menerbitkan website.
