# Ecosystem build-out: Newsroom, Academy, header, typography

Tanggal: 25 Oktober 2026.

## Keputusan: satu repo, subdomain lewat hostname

News dan Academy tetap di repo ini dan dilayani sebagai subdomain dari build yang sama.

- **Kenapa tidak pisah repo:** ketiganya berbagi header, footer, token desain, font, dan komponen form. Tim kecil, tanpa backend sendiri. Pisah repo berarti menyalin design system dan menyinkronkannya manual.
- **Kenapa tetap subdomain:** `training.nordeoscholar.com` dan `news.nordeoscholar.com` memberi identitas dan URL yang bersih. `src/lib/site.js` membaca hostname: di subdomain, halaman tampil di root (`/`, `/daftar`, `/kirim`); di domain utama, tampil di `/training/…` dan `/news/…`.
- **Kapan pisah repo:** bila Academy butuh LMS, pembayaran, atau akun peserta, atau bila Newsroom pindah ke CMS dengan tim redaksi sendiri. JETSI sudah terpisah karena berjalan di OJS.

## Setup deploy (manual)

1. Vercel → Project → Domains: tambahkan `news.nordeoscholar.com` dan `training.nordeoscholar.com` ke project yang sama.
2. DNS: CNAME kedua subdomain ke `cname.vercel-dns.com`.
3. Environment variables (Production):
   - `VITE_NEWS_ORIGIN=https://news.nordeoscholar.com`
   - `VITE_TRAINING_ORIGIN=https://training.nordeoscholar.com`
   - `VITE_MAIN_ORIGIN=https://nordeoscholar.com`

   Tanpa variabel ini, tautan tetap memakai `/news` dan `/training` di domain utama.

`vercel.json` sudah me-rewrite semua path ke `index.html`, jadi tidak perlu diubah.

## Asisten draf AI (Newsroom)

`src/lib/news-ai.js`. Tanpa `VITE_NEWS_AI_ENDPOINT`, asisten berjalan dalam mode lokal: menyusun judul alternatif, lead, struktur piramida terbalik, dan cek kelengkapan dari isian penulis, tanpa model AI. Label di UI menyebutkan ini.

Untuk model sungguhan, buat fungsi serverless (kunci API tetap di server) dan set `VITE_NEWS_AI_ENDPOINT`:

- Request: `POST { task: 'news-draft', input: { type, category, title, lead, hook, keywords, body, quote, quoteSource, sourceUrl, institution } }`
- Response: `{ headlines: string[], lead: string, outline: { heading, note }[], body: string }`

## Formulir belum punya backend

Kirim berita (`/news/kirim`) dan daftar minat Academy (`/training/daftar`) memvalidasi, menyimpan ke localStorage, lalu menyiapkan email (mailto) ke `news@` / `academy@`. Gambar highlight tidak ikut di mailto; pengirim diminta melampirkannya. UI menyatakan hal ini. Langkah berikutnya: endpoint form (mis. serverless + storage) agar kiriman masuk ke redaksi tanpa email manual.

## Temuan audit section "Temukan jurnal"

| Temuan | Perubahan |
| --- | --- |
| Topik artikel memakai taksonomi buatan sendiri, tidak sama dengan ruang lingkup resmi JETSI | Topik dipetakan 1:1 ke lima bidang fokus resmi JETSI (label Indonesia) dan filternya diberi nama "Bidang fokus" |
| Copy "Dari berbagai disiplin ilmu" berlebihan untuk tiga jurnal | Diganti dengan cakupan nyata: teknologi & rekayasa, pendidikan, pengabdian |
| Crossref dan Google Scholar ditulis sebagai "Terindeks" | Diganti "Jejak terverifikasi: Terindeks GARUDA · DOI Crossref · Google Scholar" |
| Tidak ada akses ke template naskah | Kartu JETSI menautkan template .docx dan halaman submission; JIEL menautkan halaman submission |
| **Template JIEL di OJS rusak**: tautan "JIEL Article Template (Word)" berhenti di `docs.google.com/document/d/` | Belum bisa diperbaiki dari repo ini — perbaiki di pengaturan OJS JIEL, lalu tambahkan `templateUrl` di `src/data/journal-directory.js` |

## Lain-lain

- Tipografi: satu keluarga, **General Sans** (Fontshare), untuk heading dan isi. Heading memakai aksen dua-warna yang tegak, tanpa italic. Newsreader dan Instrument Serif tidak lagi dimuat.
- Section Discovery (logo GARUDA, Crossref, dll.) dan section "Your publishing journey" dihapus dari beranda atas permintaan; `LogoLoop` vendor ikut dihapus.
- Bug yang diperbaiki: teks tombol "Explore Journals" di header berwarna gelap di atas latar gelap; elemen reveal yang di-render ulang React kehilangan kelas `is-visible`; elemen yang muncul setelah route dimuat tidak teramati reveal.
- Konten Newsroom masih artikel contoh dan diberi label begitu. Program Academy berlabel "Jadwal tentatif".
- Pass "profesional": label kecil di atas judul (eyebrow), panah diagonal, ikon di dalam tombol, simbol dekoratif, dan pita loop di bawah hero dihapus. Hero menjadi kartu inset dengan sorotan JETSI dan JIEL; pita loop diganti strip angka. Badge jurnal mengikuti sampul: JETSI cyan + kuning, JIEL maroon + kuning, Pengmas hijau.

## Landing page dalam bahasa Inggris, founder, dan CTA penutup

- Landing page, header, mega menu, drawer mobile, footer, halaman Journals, Journal Finder, dan halaman Books sekarang berbahasa Inggris. Isi halaman Newsroom/Academy (artikel, panduan, formulir) dan halaman info (About, Contact, Author Guide, Ethics) masih berbahasa Indonesia.
- Section founder: Fandi Achmad, S.T., M.T. Sumber: halaman Editorial Team JETSI dan JIEL (nama, gelar, Editor-in-Chief, Telkom University) dan listing LinkedIn publik (lecturer & researcher, fokus riset). Peran founder berasal dari Nordeo; tidak ditemukan sumber publik yang menyebutkannya. Tidak ada kutipan yang diatribusikan ke beliau.
- Foto: `public/assets/team/fandi-achmad.webp` (1247×1261, kualitas 92) dan versi 640 px. Resolusi mengikuti file sumber; untuk 4K perlu file asli dari kamera.
- Form email di CTA penutup: dengan `VITE_NEWSLETTER_ENDPOINT` alamat dikirim sebagai `POST { email, source }`; tanpa itu, form menyiapkan email konfirmasi ke info@ (lihat `src/lib/subscribe.js`).
