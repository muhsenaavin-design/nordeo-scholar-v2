import { Link } from 'react-router';
import { journals } from '../data/journals';
import JournalCard from '../components/JournalCard';
import JournalFinder from '../components/JournalFinder';
import { Arrow } from '../components/parts';

export default function Journals() {
  return <>
    <section className="container inner-page journals-intro" data-reveal>
      <p className="eyebrow">PUBLICATION PORTFOLIO</p>
      <h1>Journals for<br /> useful knowledge.</h1>
      <p className="page-intro">Dua jurnal peer-review Nordeo tersedia melalui platform jurnal: JETSI untuk teknik dan teknologi, JIEL untuk pendidikan dan pembelajaran. Keduanya open access dengan tinjauan double-blind.</p>
      <div className="journals-intro-meta">
        <div><strong>14</strong><span>Artikel JETSI dalam pratinjau</span></div>
        <div><strong>13</strong><span>Dokumen tercatat di GARUDA</span></div>
        <div><strong>02</strong><span>Jurnal aktif</span></div>
      </div>
    </section>

    <div className="container"><JournalFinder limit={20} showArchiveLink={false} /></div>

    <section className="container inner-page journal-profiles" aria-labelledby="profiles-heading">
      <div className="section-heading" data-reveal>
        <div><p className="eyebrow">PROFIL LENGKAP</p><h2 id="profiles-heading">Kenali setiap<br /> ruang publikasi.</h2></div>
        <p>Buka platform jurnal untuk membaca terbitan, mengunduh template, atau mengirim naskah. Semua tautan mengarah ke OJS resmi Nordeo.</p>
      </div>
      <div className="journal-grid journal-grid-page journal-profiles-grid">
        {journals.map((journal, index) => <JournalCard key={journal.id} journal={journal} delay={index * 90} />)}
      </div>

      <article className="journal-archive" id="pengmas">
        <div>
          <p className="eyebrow">JURNAL PENGABDIAN</p>
          <h2>Jurnal Pengmas</h2>
          <p>Ruang publikasi pengabdian masyarakat dalam ekosistem Nordeo Scholar. Profil dan informasinya tersedia di website ini.</p>
        </div>
        <Link to="/journals/jurnalpengmas" className="button button-outline">Visit Jurnal Pengmas <Arrow /></Link>
      </article>
    </section>
  </>;
}
