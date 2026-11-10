export const bookCatalog = [
  {
    id: 'quiet-method',
    title: 'The Quiet Method',
    subtitle: 'Riset yang bertumbuh tanpa kebisingan',
    author: 'N. Prameswari',
    category: 'Monograf',
    year: '2027',
    status: 'Dalam produksi',
    cover: '/assets/art/books/quiet-method.svg',
    coverAlt: 'Sampul buku The Quiet Method berwarna teal dengan orbit keemasan',
    description: 'Sebuah pembacaan tentang metode riset yang mengutamakan ketekunan, catatan lapangan, dan kejujuran terhadap ketidakpastian.',
    pages: '± 240 halaman',
  },
  {
    id: 'evidence-story',
    title: 'Evidence & Story',
    subtitle: 'Menulis ilmu untuk pembaca yang sibuk',
    author: 'R. Hartono',
    category: 'Bunga rampai',
    year: '2027',
    status: 'Penyuntingan',
    cover: '/assets/art/books/evidence-story.svg',
    coverAlt: 'Sampul buku Evidence & Story berwarna krem dengan grid dan aksen rust',
    description: 'Kumpulan esai tentang jarak antara data dan cerita, serta cara menjembatani keduanya tanpa kehilangan presisi.',
    pages: '± 208 halaman',
  },
  {
    id: 'publishing-purpose',
    title: 'Publishing with Purpose',
    subtitle: 'Panduan praktis untuk penulis akademik',
    author: 'A. Sena',
    category: 'Panduan praktik',
    year: '2026',
    status: 'Siap terbit',
    cover: '/assets/art/books/publishing-purpose.svg',
    coverAlt: 'Sampul buku Publishing with Purpose berwarna rust dengan lengkungan',
    description: 'Dari memilih jurnal sampai menjawab reviewer: kerangka kerja yang dapat dipakai untuk publikasi pertama maupun berikutnya.',
    pages: '± 176 halaman',
  },
  {
    id: 'local-knowledge',
    title: 'Local Knowledge, Global Reach',
    subtitle: 'Riset kawasan dalam percakapan dunia',
    author: 'Nordeo Editorial',
    category: 'Bunga rampai',
    year: '2027',
    status: 'Penilaian proposal',
    cover: '/assets/art/books/local-knowledge.svg',
    coverAlt: 'Sampul buku Local Knowledge, Global Reach berwarna hijau dengan garis gelombang',
    description: 'Bunga rampai tentang bagaimana pengetahuan lokal masuk ke percakapan global tanpa kehilangan konteksnya.',
    pages: '± 320 halaman',
  },
];

export const bookTypes = [
  { title: 'Monograf', copy: 'Satu argumen panjang yang dikembangkan secara utuh, ideal untuk hasil disertasi atau riset bertahun-tahun.' },
  { title: 'Bunga rampai', copy: 'Kumpulan tulisan yang disunting untuk saling berbicara, dengan pengantar yang menyatukan perspektif.' },
  { title: 'Panduan praktik', copy: 'Buku kerja untuk praktisi dan mahasiswa: ringkas, aplikatif, dan tetap berpijak pada bukti.' },
  { title: 'Referensi', copy: 'Rujukan yang disusun sistematis untuk digunakan berulang oleh peneliti dan pengajar.' },
];

export const bookProcess = [
  { number: '01', title: 'Proposal', copy: 'Kirim ringkasan gagasan, target pembaca, daftar bab, dan contoh tulisan.' },
  { number: '02', title: 'Tinjauan', copy: 'Editor dan pembaca ahli menilai kebaruan, kelayakan, dan kesesuaian dengan seri.' },
  { number: '03', title: 'Penyuntingan', copy: 'Naskah masuk penyuntingan substantif, penyelarasan bahasa, dan verifikasi sitasi.' },
  { number: '04', title: 'Desain', copy: 'Sampul, tata letak, dan format baca disiapkan untuk cetak maupun digital.' },
  { number: '05', title: 'Terbit', copy: 'Buku didistribusikan, diarsipkan, dan diperkenalkan melalui kanal Nordeo.' },
];

// English copy for the Books page on the main (English) site: the four book types and the
// path from proposal to publication, translated from bookTypes and bookProcess above.
export const bookServicesEn = [
  { title: 'Monographs', copy: 'One long argument developed in full, ideal for a dissertation or years of research.' },
  { title: 'Edited volumes', copy: 'Chapters edited to speak to one another, with an introduction that ties the perspectives together.' },
  { title: 'Practice guides', copy: 'Workbooks for practitioners and students: concise, applicable, and grounded in evidence.' },
  { title: 'Reference works', copy: 'Systematically organised references for researchers and teachers to use again and again.' },
];

export const bookProcessEn = [
  { number: '01', title: 'Proposal', copy: 'Send a summary of the idea, the intended readers, a chapter list, and a writing sample.' },
  { number: '02', title: 'Review', copy: 'Editors and expert readers assess novelty, feasibility, and fit.' },
  { number: '03', title: 'Editing', copy: 'Substantive editing, language polishing, and citation checks.' },
  { number: '04', title: 'Design', copy: 'Cover and layout prepared for print and digital editions.' },
  { number: '05', title: 'Publication', copy: 'Distributed, archived, and introduced through Nordeo channels.' },
];
