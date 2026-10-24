import { Link } from 'react-router';
import { newsReferences, newsStandards, newsSteps, newsTypes } from '../../data/news';
import { contact, newsTemplate } from '../../config/links';
import { siteBase } from '../../lib/site';
import { Arrow, CheckIcon, DownloadIcon, useDocumentTitle } from '../../components/parts';

const kit = [
  'Judul usulan dan lead 35–60 kata',
  'Isi naskah 400–900 kata',
  'Satu kutipan narasumber yang sudah disetujui',
  'DOI atau tautan sumber yang bisa diverifikasi',
  'Gambar highlight 16:9 dengan kredit, keterangan, dan alt text',
  'Tanggal tayang yang diusulkan (dan embargo bila ada)',
  'Nama, institusi, dan email pengirim',
];

export default function NewsGuide() {
  useDocumentTitle('Panduan Publikasi Berita');
  const base = siteBase('news');
  return <>
    <section className="container inner-page guide-hero" data-reveal>
      <Link to={`${base}/`} className="back-link">Kembali ke Newsroom</Link>
      <h1>Dari kabar riset <em>sampai tayang.</em></h1>
      <p className="page-intro">Cara mempublikasikan berita di Nordeo Newsroom, langkah demi langkah. Disusun dari praktik redaksi The Conversation, EurekAlert! (AAAS), dan newsroom universitas.</p>
      <div className="button-row">
        <Link to={`${base}/kirim`} className="button button-dark">Mulai kirim berita</Link>
        <a href={newsTemplate} className="button button-outline" download><DownloadIcon /> Formulir kelengkapan (.docx)</a>
      </div>
    </section>

    <section className="container guide-steps-section" aria-labelledby="guide-steps-heading">
      <h2 id="guide-steps-heading" className="sr-only">Langkah publikasi</h2>
      <ol className="timeline">
        {newsSteps.map((step, index) => <li key={step.number} data-reveal style={{ '--reveal-delay': `${index * 60}ms` }}>
          <span className="timeline-number">{step.number}</span>
          <div><h3>{step.title}</h3><p>{step.copy}</p></div>
          <span className="timeline-duration">{step.duration}</span>
        </li>)}
      </ol>
    </section>

    <section className="container section-space guide-grid" aria-labelledby="standards-heading">
      <div data-reveal>
        <h2 id="standards-heading">Yang kami <em>periksa.</em></h2>
        <dl className="standards-list">{newsStandards.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
      </div>
      <aside className="kit-card" data-reveal style={{ '--reveal-delay': '120ms' }}>
        <h3>Siapkan sebelum mengisi formulir</h3>
        <ul className="kit-list">{kit.map(item => <li key={item}><CheckIcon />{item}</li>)}</ul>
        <p className="kit-types"><strong>Jenis kiriman:</strong> {newsTypes.map(type => type.label).join(' · ')}</p>
        <Link to={`${base}/kirim`} className="button button-gold">Isi formulir</Link>
        <p className="field-hint">Pertanyaan? Tulis ke <a href={`mailto:${contact.news}`}>{contact.news}</a>.</p>
      </aside>
    </section>

    <section className="container references-section" aria-labelledby="references-heading">
      <div className="section-heading" data-reveal><div><h2 id="references-heading">Belajar dari <em>redaksi lain.</em></h2></div><p>Panduan ini mengadaptasi praktik publik dari kanal-kanal berikut. Diperiksa 25 Oktober 2026; kebijakan sumber dapat berubah.</p></div>
      <ul className="reference-list">{newsReferences.map(reference => <li key={reference.href} data-reveal>
        <a href={reference.href} target="_blank" rel="noopener noreferrer"><strong>{reference.name}</strong><Arrow size={16} /></a>
        <p>{reference.takeaway}</p>
      </li>)}</ul>
    </section>
  </>;
}
