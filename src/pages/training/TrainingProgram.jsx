import { Link, useParams } from 'react-router';
import { trainingPrograms } from '../../data/training';
import { siteBase } from '../../lib/site';
import { Arrow, CheckIcon, StatusPill, useDocumentTitle } from '../../components/parts';
import { LegalPage } from '../InfoPages';
import { ProgramCard } from './TrainingHome';

export default function TrainingProgram() {
  const { id } = useParams();
  const program = trainingPrograms.find(item => item.id === id);
  const base = siteBase('training');
  useDocumentTitle(program?.title || null);
  if (!program) return <LegalPage />;
  const related = trainingPrograms.filter(item => item.id !== program.id && item.type === program.type).concat(trainingPrograms.filter(item => item.type !== program.type)).slice(0, 2);
  const facts = [['Jenis', program.type], ['Fokus', program.focus], ['Jadwal', program.dateLabel], ['Waktu', program.time], ['Durasi', program.duration], ['Format', program.mode], ['Fasilitator', program.facilitator], ['Kuota', program.seats], ['Level', program.level]];

  return <>
    <section className="container inner-page program-page" data-reveal>
      <Link to={`${base}/#jadwal`} className="back-link">Semua program</Link>
      <div className="program-lead">
        <div>
          <h1>{program.title}</h1>
          <p className="page-intro">{program.summary}</p>
          <StatusPill tone="preview">Jadwal tentatif</StatusPill>
        </div>
        <figure className="program-art"><img src={program.cover} alt={program.coverAlt} width="800" height="560" decoding="async" /></figure>
      </div>
      <div className="program-detail">
        <div>
          <h2>Yang akan Anda dapatkan</h2>
          <ul className="kit-list">{program.outcomes.map(item => <li key={item}><CheckIcon />{item}</li>)}</ul>
        </div>
        <aside className="program-facts">
          <dl>{facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
          <Link to={`${base}/daftar?program=${program.id}`} className="button button-dark">Daftar minat program ini</Link>
          <p className="field-hint">Kami kabari lewat email saat jadwal dan biaya ditetapkan.</p>
        </aside>
      </div>
    </section>
    <section className="container section-space related-programs" aria-labelledby="related-heading">
      <h2 id="related-heading">Program <em>lainnya.</em></h2>
      <div className="program-grid">{related.map(item => <ProgramCard key={item.id} program={item} base={base} />)}</div>
    </section>
  </>;
}
