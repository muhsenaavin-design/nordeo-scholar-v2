// Long page texts that the dashboard (menu Halaman) can replace. Each block keeps its built-in
// text as the default; once the Admin saves a version, it is stored in the "pages" content under
// texts[id] as sanitised HTML and shown instead.
import { companyOverview, founderProfile } from '../data/company';
import { ecosystems } from '../data/ecosystems';
import { pages } from '../data/pages';
import { useContent } from './content';

const p = (text) => `<p>${text}</p>`;
const books = ecosystems.find((e) => e.id === 'books');

export const PAGE_TEXTS = [
  { id: 'story', label: 'Our Story: ringkasan perusahaan', route: '/about', defaultHtml: companyOverview.paragraphs.map(p).join('') },
  { id: 'founder', label: 'Founder: biografi', route: '/founder', defaultHtml: founderProfile.bio.map(p).join('') },
  { id: 'books', label: 'Books: deskripsi layanan', route: '/books', defaultHtml: p(books?.description || '') },
  {
    id: 'authorGuide', label: 'Panduan Penulis', route: '/author-guide',
    defaultHtml: [
      p('Siapkan langkah pertama publikasi Anda. Ketentuan lengkap mengikuti panduan pada masing-masing platform jurnal.'),
      '<h2>1. Pilih jurnal sesuai bidang</h2>', p('Baca profil dan ruang lingkup jurnal Nordeo. Pastikan topik serta jenis naskah Anda sesuai sebelum melanjutkan.'),
      '<h2>2. Periksa panduan dan kebijakan</h2>', p('Di platform jurnal tujuan, baca author guidelines, template naskah, etika publikasi, serta informasi biaya bila berlaku.'),
      '<h2>3. Siapkan gambar dan metadata</h2>', p('Pastikan tabel, gambar, dan sitasi terbaca. Gunakan DOI atau tautan sumber yang stabil agar naskah mudah diverifikasi.'),
      '<h2>4. Ikuti alur pada platform jurnal</h2>', p('Pendaftaran akun dan pengiriman naskah mengikuti sistem jurnal terkait. Website ini membantu Anda menemukan platform yang tepat.'),
    ].join(''),
  },
  {
    id: 'ethics', label: 'Etika Publikasi', route: '/publication-ethics',
    defaultHtml: [
      p(pages['/publication-ethics'][1]),
      '<h2>Kepenulisan</h2>', p('Penulis yang tercantum harus berkontribusi pada konsep, pelaksanaan, atau interpretasi riset.'),
      '<h2>Data &amp; sitasi</h2>', p('Data mentah harus tersedia bila diminta. Sitasi memakai sumber primer yang dapat diverifikasi.'),
      '<h2>Konflik kepentingan</h2>', p('Afiliasi, pendanaan, dan kepentingan komersial diungkapkan di bagian yang sesuai.'),
      '<h2>Koreksi &amp; retraksi</h2>', p('Kesalahan yang memengaruhi temuan dikoreksi secara terbuka. Retraksi dilakukan bila integritas publikasi tidak dapat dipertahankan.'),
    ].join(''),
  },
  { id: 'pengmas', label: 'Jurnal Pengmas: profil', route: '/journals/jurnalpengmas', defaultHtml: p('Ruang publikasi Nordeo Scholar untuk pengabdian masyarakat, solusi lokal, dan kontribusi ilmu bagi komunitas.') },
  { id: 'privacy', label: 'Kebijakan Privasi', route: '/privacy-policy', defaultHtml: p(pages['/privacy-policy'][1]) },
  { id: 'terms', label: 'Ketentuan Penggunaan', route: '/terms-of-use', defaultHtml: p(pages['/terms-of-use'][1]) },
];

/** The saved HTML of a page text, or null when the built-in text should be shown. */
export function usePageText(id) {
  const content = useContent('pages', null);
  const html = content?.texts?.[id];
  return typeof html === 'string' && html.replace(/<[^>]+>/g, '').trim() ? html : null;
}
