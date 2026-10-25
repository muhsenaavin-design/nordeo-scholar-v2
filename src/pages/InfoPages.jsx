import { Link, useLocation } from 'react-router';
import { pages } from '../data/pages';
import { contact, officialSocial } from '../config/links';
import { ecosystems } from '../data/ecosystems';
import { ecosystemHref } from '../lib/site';
import { Arrow, SmartLink, StatusPill, useDocumentTitle } from '../components/parts';

function BackLink() {
  return <Link to="/" className="back-link">Kembali ke Beranda</Link>;
}

export function AboutPage() {
  useDocumentTitle('About Nordeo Scholar');
  return <section className="container inner-page editorial-page" data-reveal>
    <BackLink />
    <div className="page-lead">
      <div className="page-lead-copy">
        <h1>Knowledge,<br /> with purpose.</h1>
        <p className="page-intro">Nordeo Scholar adalah ekosistem akademik yang menghubungkan riset, pendidikan, publikasi, dan kolaborasi yang bermakna. Kami percaya pengetahuan tumbuh ketika ia dibagikan.</p>
      </div>
      <figure className="page-art">
        <img src="/assets/generated/hero-editorial-v1.webp" alt="Ilustrasi buku terbuka sebagai simbol berbagi pengetahuan" width="1600" height="1195" />
        <figcaption>Knowledge grows when shared.</figcaption>
      </figure>
    </div>
    <div className="about-story-grid">
      <article><h2>Menerbitkan,<br /> mendampingi, menghubungkan.</h2><p>Kami mengelola jurnal open access, menyiapkan buku dan kanal berita akademik, serta membangun program pelatihan untuk penulis dan peneliti. Setiap kanal memiliki peran, tetapi semuanya berbagi satu standar: kejelasan, integritas, dan kegunaan.</p></article>
      <div className="about-values">
        <div><span>01</span><h3>Integritas</h3><p>Proses editorial yang bisa dipertanggungjawabkan, dari review sampai arsip.</p></div>
        <div><span>02</span><h3>Transparansi</h3><p>Status, biaya, dan tahapan publikasi disampaikan tanpa samar.</p></div>
        <div><span>03</span><h3>Kolaborasi</h3><p>Penulis, editor, reviewer, dan mitra bekerja dalam satu percakapan.</p></div>
      </div>
    </div>
    <div className="information-panel about-ecosystem-panel">
      <h2>Satu ekosistem, banyak pintu masuk.</h2>
      <div className="about-ecosystem-links">
        {ecosystems.map(item => <SmartLink key={item.id} href={ecosystemHref(item.id)}><span>{item.number}</span><strong>{item.short}</strong><small>{item.menuCopy}</small></SmartLink>)}
      </div>
    </div>
  </section>;
}

export function ContactPage() {
  useDocumentTitle('Contact');
  return <section className="container inner-page reading-page" data-reveal>
    <BackLink />
    <h1>Mari<br /> terhubung.</h1>
    <p className="page-intro">Ceritakan kebutuhan publikasi, ide buku, atau rencana pelatihan Anda. Sertakan nama, institusi, dan topik yang ingin dibahas agar tim Nordeo dapat mengarahkan percakapan dengan tepat.</p>
    <div className="contact-channels">
      <a href={`mailto:${contact.news}`}><span>NordeoNews</span><strong>{contact.news}</strong><small>Kiriman berita, wawancara, dan catatan editor.</small></a>
      <a href={`mailto:${contact.books}`}><span>Books</span><strong>{contact.books}</strong><small>Proposal buku, monograf, dan bunga rampai.</small></a>
      <a href={`mailto:${contact.training}`}><span>Academy</span><strong>{contact.training}</strong><small>Seminar, konferensi, dan modul pelatihan.</small></a>
      <a href={`mailto:${contact.general}`}><span>Umum</span><strong>{contact.general}</strong><small>Kolaborasi institusi dan pertanyaan lain.</small></a>
    </div>
    <div className="information-panel contact-panel">
      <h2>Kami membaca setiap pesan.</h2>
      <p>Untuk kiriman berita, gunakan formulir digital agar gambar dan jadwal tayang tercatat lengkap. Untuk naskah jurnal, gunakan platform OJS jurnal tujuan.</p>
      <div className="contact-actions"><SmartLink href={ecosystemHref('news', '/kirim')} className="button button-dark">Kirim berita</SmartLink><Link to="/journals" className="button button-outline">Buka platform jurnal</Link></div>
      <div className="contact-social"><a href={officialSocial.instagram}>Instagram @nordeoscholar <Arrow /></a><a href={officialSocial.whatsapp}>WhatsApp Editorial <Arrow /></a></div>
    </div>
  </section>;
}

export function AuthorGuidePage() {
  useDocumentTitle('Panduan Penulis');
  return <section className="container inner-page reading-page" data-reveal>
    <BackLink />
    <h1>Panduan<br /> Penulis.</h1>
    <p className="page-intro">Siapkan langkah pertama publikasi Anda. Ketentuan lengkap mengikuti panduan pada masing-masing platform jurnal.</p>
    <ol className="guide-list">
      <li><h2>1. Pilih jurnal sesuai bidang</h2><p>Baca profil dan ruang lingkup JETSI dan JIEL. Pastikan topik serta jenis naskah Anda sesuai sebelum melanjutkan.</p><Link to="/journals" className="text-link">Temukan Jurnal <Arrow /></Link></li>
      <li><h2>2. Periksa panduan dan kebijakan</h2><p>Di platform jurnal tujuan, baca author guidelines, template naskah, etika publikasi, serta informasi biaya bila berlaku.</p><a className="text-link" href="https://docs.google.com/document/d/1UPPXBL6HIGpcgK_1i0EYkz9k15ycuM_-/export?format=docx">Template artikel JETSI <Arrow /></a></li>
      <li><h2>3. Siapkan gambar dan metadata</h2><p>Pastikan tabel, gambar, dan sitasi terbaca. Gunakan DOI atau tautan sumber yang stabil agar naskah mudah diverifikasi.</p></li>
      <li><h2>4. Ikuti alur pada platform jurnal</h2><p>Pendaftaran akun dan pengiriman naskah mengikuti sistem jurnal terkait. Website ini membantu Anda menemukan platform yang tepat.</p><Link to="/journals" className="button button-dark">Buka Platform Jurnal</Link></li>
    </ol>
    <div className="information-panel">
      <h2>Butuh pendampingan?</h2>
      <p>Program Academic Training menyediakan seminar dan modul untuk membantu menyiapkan naskah, memahami review, dan memilih jurnal yang tepat.</p>
      <SmartLink href={ecosystemHref('training')} className="button button-dark">Lihat Program Academy</SmartLink>
    </div>
  </section>;
}

export function PublicationEthicsPage() {
  useDocumentTitle('Publication Ethics');
  return <section className="container inner-page reading-page" data-reveal>
    <BackLink />
    <h1>Etika publikasi,<br /> bukan formalitas.</h1>
    <p className="page-intro">Persyaratan etika, kepenulisan, penelaahan, dan pengiriman naskah mengikuti kebijakan masing-masing jurnal. Halaman ini membantu Anda menemukan sumber kebijakan; bukan pengganti dokumen kebijakan jurnal.</p>
    <div className="ethics-grid">
      <article><h2>Kepenulisan</h2><p>Penulis yang tercantum harus berkontribusi pada konsep, pelaksanaan, atau interpretasi riset. Kontribusi teknis yang tidak substantif dicantumkan sebagai ucapan terima kasih.</p></article>
      <article><h2>Data & sitasi</h2><p>Data mentah harus tersedia bila diminta. Sitasi memakai sumber primer yang dapat diverifikasi; penggunaan alat bantu AI dijelaskan sesuai kebijakan jurnal.</p></article>
      <article><h2>Konflik kepentingan</h2><p>Afiliasi, pendanaan, dan kepentingan komersial diungkapkan di bagian yang sesuai. Reviewer menolak menilai naskah yang menimbulkan konflik.</p></article>
      <article><h2>Koreksi & retraksi</h2><p>Kesalahan yang memengaruhi temuan dikoreksi secara terbuka. Retraksi dilakukan bila integritas publikasi tidak dapat dipertahankan.</p></article>
    </div>
    <div className="information-panel">
      <h2>Kebijakan lengkap per jurnal</h2>
      <p>Dokumen etika, misconduct, koreksi, dan retraksi tersedia di platform tiap jurnal. Baca sebelum mengirim naskah.</p>
      <div className="button-row">
        <a href="https://nordeoscholar.com/journal/jetsi/publicationethics" className="button button-dark">Etika JETSI</a>
        <a href="https://nordeoscholar.com/journal/jiel/publicationethics" className="button button-outline">Etika JIEL</a>
      </div>
    </div>
  </section>;
}

export function PengmasPage() {
  useDocumentTitle('Jurnal Pengmas');
  return <section className="container inner-page reading-page" data-reveal>
    <BackLink />
    <h1>Jurnal Pengmas</h1>
    <p className="page-intro">Ruang publikasi Nordeo Scholar untuk pengabdian masyarakat, solusi lokal, dan kontribusi ilmu bagi komunitas.</p>
    <div className="information-panel">
      <div className="panel-kicker"><span className="status status-preview">Dalam pengembangan</span><span>E-ISSN —</span><span>P-ISSN —</span></div>
      <h2>Profil & panggilan naskah</h2>
      <p>Jurnal Pengmas sedang menyiapkan edisi perdananya. Fokusnya adalah artikel pengabdian yang menjelaskan konteks, partisipasi, dan bukti perubahan di komunitas — bukan sekadar laporan kegiatan.</p>
      <ul className="check-list">
        <li>Pengabdian berbasis riset dan kebutuhan mitra.</li>
        <li>Evaluasi program dengan indikator yang jelas.</li>
        <li>Refleksi jujur tentang kendala dan pembelajaran.</li>
      </ul>
      <div className="button-row"><Link to="/contact" className="button button-dark">Hubungi tim editorial</Link><SmartLink href={ecosystemHref('news', '/dari-kampus-ke-komunitas-pengabdian-terukur')} className="button button-outline">Baca catatan komunitas</SmartLink></div>
    </div>
  </section>;
}

export function LegalPage() {
  const { pathname } = useLocation();
  const [title, copy] = pages[pathname] || ['Page not found', 'Halaman yang Anda cari belum tersedia. Kembali ke beranda untuk menjelajahi Nordeo.'];
  const isNotFound = !pages[pathname];
  useDocumentTitle(isNotFound ? 'Page not found' : title);
  return <section className="container inner-page reading-page" data-reveal>
    <BackLink />
    <h1>{title}</h1>
    <p className="page-intro">{copy}</p>
    {isNotFound && <div className="information-panel"><h2>Mungkin Anda mencari ini</h2><div className="not-found-links"><Link to="/journals">Journals <Arrow /></Link><SmartLink href={ecosystemHref('news')}>NordeoNews <Arrow /></SmartLink><SmartLink href={ecosystemHref('training')}>Academy <Arrow /></SmartLink><Link to="/contact">Contact <Arrow /></Link></div></div>}
  </section>;
}

export function BooksPage() {
  useDocumentTitle('Books Publishing');
  const books = ecosystems.find(item => item.id === 'books');
  return <section lang="en" className="container inner-page editorial-page" data-reveal>
    <Link to="/" className="back-link">Back to home</Link>
    <div className="page-lead">
      <div className="page-lead-copy">
        <h1>Ideas, <em>in depth.</em></h1>
        <p className="page-intro">{books.description}</p>
        <StatusPill tone={books.tone}>{books.status}</StatusPill>
      </div>
      <figure className="page-art"><img src={books.image} alt={books.alt} width="1600" height="1195" decoding="async" /></figure>
    </div>
    <div className="information-panel">
      <h2>A new room is being prepared.</h2>
      <p>The catalogue, manuscript proposal process, and book publishing services will be announced when ready. To discuss a monograph or an edited volume early, write to our team.</p>
      <div className="button-row"><a className="button button-dark" href={`mailto:${contact.books}?subject=Book%20publishing%20enquiry`}>Discuss a book manuscript</a><Link className="button button-outline" to="/journals">Explore Journals</Link></div>
    </div>
  </section>;
}
