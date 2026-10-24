// Nordeo Academy content. Every program below is a placeholder until the Academy team
// confirms dates, facilitators, and fees — the UI labels them "Jadwal tentatif".
export const trainingTracks = [
  {
    id: 'writing',
    number: '01',
    title: 'Penulisan & Publikasi Jurnal',
    label: 'Program inti',
    copy: 'Dari pertanyaan riset sampai paket submission: struktur IMRaD, argumen, sitasi, memilih jurnal, dan merespons reviewer.',
    filter: 'Modul Pelatihan',
  },
  {
    id: 'seminar',
    number: '02',
    title: 'Seminar',
    label: '90–180 menit',
    copy: 'Sesi singkat yang fokus pada satu keterampilan, dibawakan editor dan reviewer jurnal.',
    filter: 'Seminar',
  },
  {
    id: 'conference',
    number: '03',
    title: 'Konferensi',
    label: '1–2 hari',
    copy: 'Ruang presentasi riset, workshop, dan diskusi lintas disiplin bersama editor dan mitra akademik.',
    filter: 'Konferensi',
  },
  {
    id: 'module',
    number: '04',
    title: 'Modul Pelatihan',
    label: '3–4 pekan',
    copy: 'Kelas kohort dengan latihan, umpan balik naskah, dan pendampingan sampai naskah siap dikirim.',
    filter: 'Modul Pelatihan',
  },
];

// English labels for the landing page and menus.
export const programTypeEn = { Seminar: 'Seminar', Konferensi: 'Conference', 'Modul Pelatihan': 'Training module' };
export const dateLabelEn = { 'November 2026': 'November 2026', 'Desember 2026': 'December 2026', 'Tanggal menyusul': 'Date to be announced', 'Kohort berikutnya': 'Next cohort' };

export const programTypes = ['Semua', 'Seminar', 'Konferensi', 'Modul Pelatihan'];

export const trainingPrograms = [
  {
    id: 'seminar-draft-submission',
    titleEn: 'From Draft to Submission',
    type: 'Seminar',
    title: 'Dari Draf ke Submission',
    summary: 'Menyusun artikel jurnal yang layak review: struktur, argumen, dan cara membaca panduan penulis.',
    dateLabel: 'November 2026',
    time: 'Jam menyusul',
    duration: '3 jam',
    mode: 'Online',
    facilitator: 'Tim Editorial Nordeo',
    seats: 'Kuota menyusul',
    level: 'Dasar–menengah',
    focus: 'Penulisan & submission',
    cover: '/assets/art/training/seminar-draft.svg',
    coverAlt: 'Ilustrasi tangga menuju submission',
    outcomes: ['Memetakan struktur IMRaD pada draf Anda sendiri', 'Membaca author guidelines dan template jurnal tujuan', 'Menyusun daftar periksa sebelum submit'],
  },
  {
    id: 'seminar-reviewer',
    titleEn: 'Responding to Reviewers Without Losing Your Argument',
    type: 'Seminar',
    title: 'Merespons Reviewer Tanpa Kehilangan Argumen',
    summary: 'Membaca catatan review, memilah permintaan substantif, dan menulis surat respons yang membuat naskah lebih kuat.',
    dateLabel: 'Desember 2026',
    time: 'Jam menyusul',
    duration: '90 menit',
    mode: 'Online',
    facilitator: 'Reviewer tamu Nordeo',
    seats: 'Kuota menyusul',
    level: 'Menengah',
    focus: 'Revisi & respons',
    cover: '/assets/art/training/seminar-review.svg',
    coverAlt: 'Ilustrasi gelombang respons reviewer',
    outcomes: ['Mengelompokkan komentar mayor dan minor', 'Menulis response letter poin demi poin', 'Menolak saran dengan argumen yang sopan dan berbasis bukti'],
  },
  {
    id: 'conference-writing-2026',
    titleEn: 'Nordeo Academic Writing Conference',
    type: 'Konferensi',
    title: 'Nordeo Academic Writing Conference',
    summary: 'Konferensi tentang penulisan akademik, publikasi terbuka, dan masa depan jurnal di Indonesia.',
    dateLabel: 'Tanggal menyusul',
    time: 'Dua hari',
    duration: '2 hari',
    mode: 'Hybrid',
    facilitator: 'Editor jurnal & mitra akademik',
    seats: 'Kuota menyusul',
    level: 'Semua level',
    focus: 'Konferensi tahunan',
    cover: '/assets/art/training/conference-2026.svg',
    coverAlt: 'Ilustrasi lengkungan konferensi akademik',
    outcomes: ['Sesi pleno tentang integritas dan akses terbuka', 'Workshop paralel penulisan dan metodologi', 'Sesi presentasi makalah peserta'],
  },
  {
    id: 'conference-poster',
    titleEn: 'Academic Posters & Presentations',
    type: 'Konferensi',
    title: 'Poster & Presentasi Akademik',
    summary: 'Workshop konferensi untuk merancang poster yang terbaca dan menyampaikan riset dalam waktu singkat.',
    dateLabel: 'Tanggal menyusul',
    time: 'Setengah hari',
    duration: '3 jam',
    mode: 'On-site',
    facilitator: 'Tim komunikasi Nordeo',
    seats: 'Kuota menyusul',
    level: 'Dasar',
    focus: 'Komunikasi riset',
    cover: '/assets/art/training/conference-poster.svg',
    coverAlt: 'Ilustrasi bintang presentasi akademik',
    outcomes: ['Hierarki visual poster akademik', 'Menyusun presentasi 7 menit', 'Menjawab pertanyaan audiens'],
  },
  {
    id: 'module-publishing-path',
    titleEn: 'Journal Publishing Module: From Draft to Submission',
    type: 'Modul Pelatihan',
    title: 'Modul Publikasi Jurnal: Dari Draf ke Submission',
    summary: 'Empat pekan pendampingan untuk membawa satu draf dari kerangka argumen sampai paket submission yang lengkap.',
    dateLabel: 'Kohort berikutnya',
    time: 'Kelas malam',
    duration: '4 pekan',
    mode: 'Online cohort',
    facilitator: 'Editor Nordeo',
    seats: 'Kuota terbatas',
    level: 'Menengah',
    focus: 'Pendampingan naskah',
    cover: '/assets/art/training/module-scopus.svg',
    coverAlt: 'Ilustrasi grid modul publikasi',
    outcomes: ['Satu draf utuh yang sudah dibaca editor', 'Pemilihan jurnal yang sesuai ruang lingkup', 'Paket submission: naskah, cover letter, metadata'],
  },
  {
    id: 'module-ethics',
    titleEn: 'Publication Ethics & Academic Integrity',
    type: 'Modul Pelatihan',
    title: 'Etika Publikasi & Integritas Akademik',
    summary: 'Kepenulisan, sitasi, konflik kepentingan, dan penggunaan AI dalam naskah secara bertanggung jawab.',
    dateLabel: 'Kohort berikutnya',
    time: 'Kelas sore',
    duration: '3 pekan',
    mode: 'Online cohort',
    facilitator: 'Editor etika & reviewer',
    seats: 'Kuota terbatas',
    level: 'Semua level',
    focus: 'Etika & integritas',
    cover: '/assets/art/training/module-ethics.svg',
    coverAlt: 'Ilustrasi lingkaran integritas akademik',
    outcomes: ['Mengenali plagiarisme, duplikasi, dan salami slicing', 'Menulis pernyataan penggunaan AI', 'Mengenali jurnal predator'],
  },
];

// Core curriculum of the journal writing track.
export const writingModules = [
  { code: 'M1', title: 'Pertanyaan & kebaruan riset', copy: 'Merumuskan celah riset dan klaim kontribusi yang bisa diuji.' },
  { code: 'M2', title: 'Struktur IMRaD', copy: 'Pendahuluan, metode, hasil, dan diskusi yang saling menjawab.' },
  { code: 'M3', title: 'Literatur & sitasi', copy: 'Peta pustaka, manajer referensi, dan gaya sitasi APA.' },
  { code: 'M4', title: 'Memilih jurnal', copy: 'Membaca ruang lingkup, indeksasi, dan menghindari jurnal predator.' },
  { code: 'M5', title: 'Submission di OJS', copy: 'Template, metadata, cover letter, dan unggah naskah.' },
  { code: 'M6', title: 'Review & revisi', copy: 'Membaca catatan reviewer dan menulis response letter.' },
];

export const publicationPath = [
  { number: '01', title: 'Pilih persoalan', copy: 'Mulai dari pertanyaan yang cukup tajam, bukan topik yang terlalu luas.' },
  { number: '02', title: 'Bangun argumen', copy: 'Susun klaim, bukti, dan batas kesimpulan. Pustaka bekerja untuk argumen.' },
  { number: '03', title: 'Tulis & uji', copy: 'Tulis draf utuh, minta pembacaan kritis, lalu potong yang tidak bekerja.' },
  { number: '04', title: 'Submit & respons', copy: 'Ikuti template jurnal tujuan dan tanggapi review dengan catatan perubahan yang jelas.' },
];

export const trainingFaq = [
  { question: 'Apakah jadwal di halaman ini sudah final?', answer: 'Belum. Seminar, konferensi, dan modul yang tampil adalah rencana program. Daftar minat untuk mendapat kabar pertama saat tanggal, fasilitator, dan biaya ditetapkan.' },
  { question: 'Apakah program ini untuk penulis pemula?', answer: 'Seminar dan workshop dasar terbuka untuk peserta yang belum pernah mengirim naskah. Modul menengah lebih cocok bila Anda sudah memiliki draf awal.' },
  { question: 'Apakah bisa diadakan untuk kampus atau lembaga kami?', answer: 'Bisa. Kami menyusun pelatihan in-house sesuai kebutuhan fakultas, LPPM, atau komunitas riset. Hubungi tim Academy melalui email.' },
  { question: 'Apakah sertifikat tersedia?', answer: 'Peserta yang menyelesaikan seminar dan modul akan menerima sertifikat partisipasi digital dari Nordeo Scholar.' },
];

export const participantRoles = ['Mahasiswa', 'Dosen', 'Peneliti', 'Praktisi', 'Pengelola jurnal'];
export const manuscriptStages = ['Belum ada draf', 'Draf awal', 'Siap submit', 'Sedang direview'];
