# Referensi Redesign — Nordeo Scholar Publishing

> Dokumen arah desain untuk redesign **nordeoscholar.com** → integrated corporate website (React + Tailwind).
> Selaras dengan Capstone "Designing an Integrated Information System for PT Nordeo Scholar Publishing" (Bab I–III).
> Terakhir diperbarui: 2026-10-17

---

## 1. Tujuan Desain (dari Capstone)

Website baru bukan sekadar company profile — ini **central digital gateway** yang:

| Capstone requirement | Implikasi desain |
|---|---|
| Integrasi 4 ekosistem: Journals, Books, Media & News, Academic Training | Setiap ekosistem punya "pintu masuk" jelas dari homepage; status platform transparan (Live / Coming Soon) |
| Connect WordPress + OJS **tanpa menggantikan** fungsi masing-masing | Website = lapisan informasi + navigasi; link keluar ke OJS (JETSI, Pengmas) diberi label jelas "external journal platform" |
| Information Architecture: organization, labeling, navigation, search systems (Rosenfeld et al.) | Sitemap eksplisit, mega-menu per ekosistem, breadcrumb, pencarian |
| Stakeholder-based user journey (authors, reviewers, readers, partners, management) | Entry point per audiens: For Authors / For Institutions / For Readers / Collaborators |
| Human-Centered Design (ISO 9241-210) + Prototyping iteratif (Pressman & Maxim) | Desain harus mudah dievaluasi stakeholder per iterasi → komponen modular, mudah di-flip |
| Roadmap indeksasi (Google Scholar → Garuda → SINTA → Scopus, 2026–2045) | Komponen metadata: ISSN/e-ISSN, DOI, badge indeksasi, timeline roadmap |

**Masalah yang harus dijawab desain:** 3 dari 4 ekosistem belum operasional, metadata jurnal masih placeholder → desain harus menangani "Coming Soon" secara elegan dan menampilkan metadata yang ada dengan jujur.

---

## 2. Benchmark — Situs Referensi

### 2.1 Academic Publishers (kredibilitas & struktur)

| Situs | Yang layak diadopsi |
|---|---|
| [elsevier.com](https://www.elsevier.com) | IA gateway multi-produk: Solutions per audiens; navigasi korporat + produk jelas dipisah |
| [springernature.com](https://www.springernature.com) | Struktur "brand di bawah satu induk" — paling mirip Nordeo × JETSI/Pengmas |
| [tandfonline.com](https://www.tandfonline.com) | Journal card lengkap: cover, scope, ISSN, indexing, submission CTA |
| [emeraldpublishing.com](https://www.emeraldpublishing.com) | Halaman "Publish with us" — journey penulis dari submit → review → publish |
| [frontiersin.org](https://www.frontiersin.org) | Grid jurnal yang clean; filter per bidang; tipografi sans modern |
| [mdpi.com](https://www.mdpi.com) | Kecepatan akses metadata jurnal; badge indexing; daftar journal per subject |
| [degruyter.com](https://www.degruyter.com) | Kombinasi jurnal + buku dalam satu portal — pola untuk Books Publishing |
| [global.oup.com](https://global.oup.com) / [cambridge.org/core](https://www.cambridge.org/core) / [mitpress.mit.edu](https://mitpress.mit.edu) | Gaya "university press": serif editorial, tenang, akademis — referensi visual, bukan struktur |

### 2.2 Ekosistem Indonesia (konteks lokal & indeksasi)

| Situs | Yang layak diadopsi |
|---|---|
| [sinta.kemdikbud.go.id](https://sinta.kemdikbud.go.id) | Badge akreditasi SINTA (S1–S6) — nanti ditampilkan di kartu jurnal Nordeo |
| [garuda.kemdikbud.go.id](https://garuda.kemdikbud.go.id) | Pola metadata artikel: penulis, afiliasi, DOI, abstrak |
| [neliti.com](https://www.neliti.com) | Portal agregator jurnal Indonesia — model "gateway ke banyak jurnal" |
| [doaj.org](https://doaj.org) | Syarat & badge open access — relevan untuk roadmap indeksasi |
| [scholar.google.com](https://scholar.google.com) | Target indeksasi pertama di roadmap — tampilkan sebagai badge "Indexed in" |

> Contoh pola halaman jurnal berbasis **OJS** (Public Knowledge Project): portal jurnal universitas (UGM, Unpad, dll) yang sudah pakai OJS. Yang diadopsi: struktur `About → Editorial Team → Archives → Submissions → Author Guidelines` agar konsisten saat user pindah dari nordeoscholar.com ke OJS.

### 2.3 Struktur & Komponen Gateway (pola halaman)

- **Mega-menu 4 ekosistem** — pola yang dipakai Elsevier/Springer: kolom per ekosistem, isi link + status.
- **Audience entry strip** — "I am a… Author / Reviewer / Reader / Institution / Partner" (pola Emerald & Elsevier).
- **Journal profile card** — mirip Frontiers/MDPI: cover, scope, ISSN/e-ISSN, indexing badges, link "Submit to OJS".
- **Book catalog card** — mirip De Gruyter: cover, kategori, ISBN, tahun.
- **Roadmap timeline** (khas capstone) — visualisasi target indeksasi 2026–2045.
- **Ethics & policy pages** — standar semua publisher (publication ethics, peer review process, OA policy).

---

## 3. Arah Visual — 3 Opsi

### Opsi A — "Scholarly Editorial" ⭐ *rekomendasi*
Serif display untuk headline + sans untuk body. Kesan university press: kredibel, dewasa, cocok untuk badan penerbitan akademik.

- **Font:** headline `Fraunces` / `Newsreader` / `Source Serif 4`; body `Inter`.
- **Warna:** pertahankan palet existing (teal-navy `#24586e` → `#173d4d` + gold `#ffd21a` sebagai aksen).
- **Kapan menang:** evaluasi stakeholder yang menilai "kredibilitas & formalitas" — sesuai identitas "scholar".

### Opsi B — "Modern Academic Platform"
Full sans, card-driven, lebih ringan. Kesan tech-forward seperti Frontiers/MDPI.

- **Font:** `Inter` / `Manrope` semua.
- **Warna:** teal lebih cerah, putih dominan, border halus.
- **Risiko:** terasa generic; sulit dibedakan dari startup.

### Opsi C — "Institutional Gateway"
Struktur korporat multi-brand (ala Elsevier). Fokus IA & wayfinding, visual netral.

- **Paling kuat untuk:** struktur navigasi — **pakai IA-nya, jangan visualnya.**

**Rekomendasi final: A + B hybrid, dengan IA dari C.**
Gunakan palet & token existing di `app/src/index.css` (`--color-nordeo*`, `--color-gold`), tambahkan **serif display** (`Fraunces` via Google Fonts) hanya untuk H1/H2 besar — body tetap Inter. Ini pembeda visual paling murah dengan dampak paling besar.

---

## 4. Information Architecture (usulan sitemap)

```
/                         Home — gateway: hero, 4 ekosistem, audience strip, featured journal, CTA
/about                    About: profil PT, visi-misi, business ecosystem overview, roadmap indeksasi
/journals                 Journals Publishing hub: JETSI (external → OJS), Jurnal Pengmas
  /journals/jetsi         Profil JETSI: scope, ISSN, indexing, "Visit OJS platform" (external)
  /journals/jurnalpengmas Profil Pengmas: sama + link internal/external sesuai status
/books                    Books Publishing: katalog, status, CTA "Submit your book"
/news                     Media & News: grid berita, kategori (Research, Education, Innovation, Events)
/services                 Academic Training & Research Services: training, consulting, editing
/community-service        Community Service (opsional, jika dipisah dari services)
/academic-events          Academic Events (opsional)
/collaboration            Partnership & Collaboration: jenis kerja sama, form
/contact                  Kontak: form, email, telepon, sosial media
/policies                 Privacy · Terms · Publication Ethics
```

**Komponen IA wajib:**
1. **Mega-menu** per ekosistem (Journals / Books / Media / Training) + kolom "For Authors / For Institutions".
2. **Status badge per ekosistem:** `Live` · `Coming Soon` (jujur, rapi, bukan dummy).
3. **Breadcrumb** di semua halaman detail.
4. **Search** (mulai dari client-side filter konten statis; jangan over-engineer).

---

## 5. User Journey — Contoh Pemetaan (untuk Bab III evaluasi)

| Stakeholder | Entry point | Alur | Success metric |
|---|---|---|---|
| **Author (JETSI)** | Home → Journals → JETSI | Baca scope & author guidelines → klik "Submit via OJS" (external, labeled) | Berhasil masuk OJS tanpa bingung |
| **Institution (Training)** | Home → Services | Lihat program training → form inquiry | Mengirim inquiry |
| **Reader** | Home/News → Journal | Jelajah artikel/berita → menuju OJS untuk full text | Menemukan konten dalam ≤3 klik |
| **Partner** | Home → Collaboration | Baca skema kemitraan → kontak | Mengisi form kontak |

> Setiap journey dipakai sebagai skenario uji di tahap **Prototype Evaluation** — cocok dengan metodologi capstone.

---

## 6. Token & Fondasi Teknis (kondisi repo saat ini)

Repo punya **dua varian**: `app/` (paling baru — pakai ini) dan `src/` root (versi lama, single-file). **`app/` adalah kanonik**; `src/` root sebaiknya diarahkan ulang/arsip agar tidak drift.

Token existing di `app/src/index.css` (Tailwind 4 `@theme`) — sudah bagus, cukup ditambah:

```css
@theme {
  /* existing: nordeo, nordeo-dark, nordeo-deep, nordeo-soft, gold, ink, muted, paper, line */
  --font-display: "Fraunces", Georgia, serif;   /* BARU: untuk headline besar */
}
```

Checklist polish:
- [ ] `font-display` untuk H1/H2 hero & section besar
- [ ] Badge indeksasi (Google Scholar, Garuda, SINTA, Scopus) — komponen kecil reusable
- [ ] Card jurnal: cover, scope 2 baris, ISSN, badges, CTA external
- [ ] Status "Coming Soon" yang rapi (Books/Media/Training) dengan desain non-dummy
- [ ] Timeline roadmap indeksasi di `/about`
- [ ] Focus states & kontras WCAG AA (`#667984` di atas putih = 4.6:1, aman)
- [ ] Mobile nav (sudah ada) + tes di 360px

---

## 7. Checklist Evaluasi Prototype (Nielsen + IA)

1. **Visibility of system status** — user tahu ekosistem mana live / coming soon.
2. **Match with real world** — istilah akademik benar (manuscript, peer review, indexing).
3. **Consistency** — JETSI & Pengmas pakai pola halaman yang sama.
4. **Recognition over recall** — label "OJS platform" eksplisit saat link keluar.
5. **Breadcrumb & back-path** jelas di semua halaman detail.
6. **3-click rule** — konten utama tercapai dalam ≤3 klik dari home.
7. **Mobile 360–428px** tanpa horizontal scroll.
8. **Kontras & focus states** untuk WCAG AA.

---

## 8. Langkah Setelah Dokumen Ini

1. Pilih arah visual (rekomendasi: **A+B hybrid**) — konfirmasi tipe display font.
2. Bangun **komponen inti** di `app/`: JournalCard, EcosystemCard (dengan status), IndexingBadges, RoadmapTimeline.
3. Susun ulang **homepage** jadi gateway: hero → audience strip → 4 ekosistem (status) → featured publications → roadmap teaser → CTA.
4. Siapkan 2 skenario uji user journey (Author & Institution) untuk iterasi evaluasi capstone.
5. Screenshot before/after untuk lampiran Bab III–IV.
