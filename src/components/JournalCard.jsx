import { SpotlightCard } from './effects';
import { Arrow, StatusPill } from './parts';

export default function JournalCard({ journal, delay = 0 }) {
  return <SpotlightCard id={journal.id} className="journal-card" data-reveal style={{ '--reveal-delay': `${delay}ms` }}>
    <div className="journal-frame">
      <span className="frame-bar" aria-hidden="true"><i /><i /><i /><b>{journal.display}</b></span>
      <img src={journal.preview} alt={journal.previewAlt} width="1200" height="900" loading="lazy" />
      {journal.cover && <img className="journal-cover" src={journal.cover} alt={journal.coverAlt} width="180" height="255" loading="lazy" />}
    </div>
    <div className="journal-card-body">
      <div className="journal-card-top"><p className="journal-badge" lang="en">{journal.short}</p><StatusPill tone="live">Open access</StatusPill></div>
      <p className="card-category" lang="en">{journal.field}</p>
      <h3 lang="en">{journal.name}</h3>
      <p className="journal-summary">{journal.summary}</p>
      <ul className="chip-list">{journal.scope.map(item => <li key={item} lang="en">{item}</li>)}</ul>
      <dl className="journal-facts">{journal.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {journal.indexing.length > 0 && <p className="journal-indexing">Terindeks: {journal.indexing.join(' · ')}</p>}
      <div className="journal-actions">
        <a className="button button-gold" href={journal.url}>Visit {journal.short} <Arrow diagonal /></a>
        <span className="journal-note">Terbuka di platform jurnal (OJS).</span>
      </div>
    </div>
  </SpotlightCard>;
}
