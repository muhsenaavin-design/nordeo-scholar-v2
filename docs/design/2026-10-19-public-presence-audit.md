# Audit publik Nordeo, JETSI, dan JIEL

Tanggal pemeriksaan: 19 Oktober 2026 (Asia/Jakarta). Mencakup sumber publik yang dapat diakses; tidak mencakup dashboard privat, analitik akun, atau dokumen legal internal. Respons HTML/API disimpan di output/research untuk menelusuri hasil pemeriksaan. Halaman resmi diambil langsung dengan HTTP karena pembaca web gagal memuat sebagian URL.

## Capaian yang dapat digunakan untuk branding

| Entitas | Temuan | Bukti dan batas klaim |
| --- | --- | --- |
| JETSI | Terdaftar di GARUDA; 13 dokumen tercatat saat pemeriksaan | https://garuda.kemdiktisaintek.go.id/journal/view/48487. Nama lengkap, penerbit PT Nordeo Scholar Publishing dan eISSN 31645208 cocok. Ini indeksasi/penelusuran, bukan peringkat akreditasi SINTA. Angka adalah snapshot, bukan penghitung langsung. |
| JETSI | Metadata DOI tersedia di Crossref | https://api.crossref.org/journals/3164-5208/works?rows=5 mengembalikan total-results 2, penerbit Nordeo Scholar Publishing, nama jurnal sesuai. DOI 10.68627/742565 dan 10.68627/742564. Crossref merupakan infrastruktur metadata DOI, bukan akreditasi mutu. |
| JETSI | Identitas eISSN 3164-5208 dapat dicocokkan lintas sumber | Tampil pada GARUDA dan metadata Crossref. https://issn.perpusnas.go.id/terbit/detail/20260726010094341 ditautkan OJS; situs ISSN berupa aplikasi JS sehingga isi sertifikat tidak diekstrak pada audit ini. |
| JETSI | Terbitan tersedia pada platform jurnal | https://nordeoscholar.com/journal/jetsi/issue/archive dan halaman utama menampilkan volume 1 tahun 2026; edisi terkini Vol. 1 No. 2 memuat 3 artikel dengan penanda in press. Tidak menyamakan artikel in press dengan terbit final. |
| JETSI/JIEL | Open access dan double-blind review disebut kebijakan penerbit | https://nordeoscholar.com/journal/jetsi dan https://nordeoscholar.com/journal/jiel/about. Kebijakan penerbit, bukan penghargaan independen atau bukti audit pelaksanaan review. |
| Nordeo | Satu akun Instagram resmi sebagai akun payung JETSI dan JIEL | https://www.instagram.com/nordeoscholar/ ditautkan situs penerbit; judul dan bio profil cocok serta menyebut kedua jurnal. |

## Status platform lainnya

| Platform | JETSI | JIEL | Perlakuan di landing |
| --- | --- | --- | --- |
| GARUDA | Profil spesifik dan dokumen terverifikasi | Tautan di OJS hanya direktori umum | Label indeks JETSI; tidak memberi badge indeks pada JIEL |
| Crossref | Metadata spesifik jurnal ditemukan | Tautan pencarian umum, belum ada rekaman spesifik yang terverifikasi | Label metadata DOI JETSI |
| Google Scholar | OJS menautkan query judul jurnal; hasil indeks tidak terverifikasi langsung | Beranda umum | Penelusuran akademik, bukan klaim terindeks |
| Dimensions | OJS menautkan query judul jurnal; rekaman spesifik belum diverifikasi | Beranda umum | Penelusuran publikasi |
| Neliti | OJS menautkan /id/journals/jetsi; akses tujuan 403 | Direktori umum | Tautan direktori yang dicantumkan jurnal; status listing belum terverifikasi |
| ResearchGate | Beranda umum, tanpa profil jurnal | Beranda umum | Jejaring akademik, bukan indeksasi |

Pencarian terarah nama/ISSN pada domain SINTA, DOAJ, Scopus, dan Clarivate tidak menemukan bukti status. API DOAJ https://doaj.org/api/search/journals/issn:3164-5208 mengembalikan total 0. Tidak ada dasar untuk menampilkan logo/peringkat akreditasi tersebut. Ketiadaan hasil penelusuran bukan putusan bahwa jurnal pasti tidak terdaftar. Tidak ditemukan penghargaan independen yang dapat diverifikasi untuk penerbit/jurnal ini.

## Audit sosial dan konsistensi identitas

- Instagram @nordeoscholar resmi ditautkan https://nordeoscholar.com/ dan bio menyebut JETSI/JIEL. Angka pengikut dan jumlah posting tidak digunakan karena berubah cepat.
- Facebook dan TikTok pada situs lama menuju beranda platform umum. Akun resmi spesifik tidak teridentifikasi. Tidak ditambahkan ke landing.
- JETSI dan JIEL menautkan WhatsApp yang sama: https://wa.me/6282232218619. Dipasang sebagai kontak editorial, bukan prestasi atau akun jurnal terpisah.
- Tidak ditemukan akun mandiri JETSI/JIEL yang dapat dicocokkan dari tautan resmi. Profil LinkedIn pendiri bersifat pribadi dan tidak diposisikan sebagai akun perusahaan.
- Hasil mesin pencari masih menyimpan URL lama /jetsi yang saat diakses langsung memberi 404. Landing menggunakan /journal/jetsi dan /journal/jiel yang merespons 200.
- Situs JIEL masih menampilkan placeholder eISSN 0000-0000 dan tautan sertifikat yang sama dengan JETSI. Jangan menyalin ISSN JETSI ke JIEL; perlu koreksi di OJS oleh pengelola.
- DOI dalam dokumen GARUDA memakai pola 10.68627/jetsi.v1i1.*, sementara dua hasil Crossref menggunakan 10.68627/74256*. Perlu rekonsiliasi metadata dan canonical DOI pada OJS; audit ini tidak mengubah situs jurnal eksternal.

## Penerapan dan aset

Latar utama diubah putih sesuai situs penerbit. Chrome kartu dan dekorasi diringankan. Logo ditempatkan setelah jurnal, dengan kategori platform terlihat dan keterangan status per jurnal. Statistik enam platform indeksasi yang tidak setara diganti dengan 13 dokumen JETSI di GARUDA, disertai tanggal snapshot.

Enam logo disalin dari aset yang sudah dipakai OJS JETSI, tanpa menggambar ulang atau mengubah warna merek. Provenance rinci di public/assets/platforms/SOURCES.md. Penempatan adalah rujukan platform, bukan endorsement atau kemitraan. Logo tetap milik pemegang mereknya.

LogoLoop menggunakan komponen React Bits asli, sumber https://github.com/DavidHDev/react-bits/tree/main/src/content/Animations/LogoLoop. Lisensi MIT + Commons Clause disertakan di public/licenses/react-bits.txt. Penggunaan di situs komersial diizinkan; komponen bukan dijual ulang terpisah. Loop bergerak dengan kecepatan 48 px/detik, tetap berjalan saat hover, dan memakai daftar statis saat reduced motion aktif.

## Verifikasi implementasi

Sembilan tes komponen lolos; production build lolos. Chromium memverifikasi loop bergerak antarsampel, jeda manual, lanjutkan, hover pause, enam logo statis saat reduced motion, tautan sosial, latar putih, dan tidak ada overflow pada 390/1440. QA landing di 360/390/768/1024/1440 serta sepuluh detail route lolos. Animasi header, klik ulang, perpindahan lintas route, dan frame blur/parallax lolos setelah integrasi. Source vendor diuji lewat Chromium, bukan simulasi layout jsdom.
