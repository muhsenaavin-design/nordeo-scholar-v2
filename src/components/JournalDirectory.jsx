import { useState } from 'react';
import { directoryJournals, journalCategories } from '../data/journal-directory';
import { Arrow, CloseIcon, EmptyState, JournalMark, SearchIcon, SmartLink, StatusPill } from './parts';

function categoryCount(id) {
  return id === 'all' ? directoryJournals.length : directoryJournals.filter(journal => journal.category === id).length;
}

function visitLabel(journal) {
  return journal.id === 'pengmas' ? 'Visit Jurnal Pengmas' : `Visit ${journal.short}`;
}

// Cards carry only "Visit <journal>": guidelines, templates, and articles live on each
// journal's own site, so visitors go there directly (journal traffic counts toward
// accreditation — Nordeo, Feedback 2).
function DirectoryCard({ journal, selected }) {
  const external = /^https?:/i.test(journal.url);
  return <article className={`directory-card ${selected ? 'is-selected' : ''}`} id={journal.id}>
    <div className="directory-card-top">
      <JournalMark id={journal.id} label={journal.short} />
      <StatusPill tone={journal.statusTone}>{journal.status}</StatusPill>
    </div>
    <h3>{journal.name}</h3>
    <p className="directory-meta"><span>{journal.categoryLabel}</span>{journal.eissn !== '—' && <span>E-ISSN {journal.eissn}</span>}</p>
    <p className="directory-description">{journal.description}</p>
    <div className="directory-card-bottom">
      {journal.indexing.length > 0 && <p className="directory-indexing">{journal.indexing.join(' · ')}</p>}
      <div className="directory-footer">
        <SmartLink href={journal.url} className="text-link directory-visit" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {visitLabel(journal)} <Arrow />{external && <span className="sr-only"> (opens in a new tab)</span>}
        </SmartLink>
      </div>
    </div>
  </article>;
}

// Homepage "split index" (Redesign, Option A): the journal list on the left picks
// which journal the large brand-coloured panel on the right describes. With only four
// journals, this replaces the search + field chips, which each matched a single journal.
function JournalSplitIndex({ journals }) {
  const [activeId, setActiveId] = useState(journals[0]?.id);
  const active = journals.find(journal => journal.id === activeId) || journals[0];
  if (!active) return null;
  const external = /^https?:/i.test(active.url);
  const hasIssn = active.eissn && active.eissn !== '—';

  return <section className="finder-split" aria-label="Nordeo journals">
    <ol className="finder-split-list">
      {journals.map((journal, index) => <li key={journal.id}>
        <button
          type="button"
          className={`finder-split-item ${journal.id === active.id ? 'is-active' : ''}`}
          aria-pressed={journal.id === active.id}
          aria-controls="finder-split-panel"
          onClick={() => setActiveId(journal.id)}
        >
          <span className="finder-split-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <JournalMark id={journal.id} label={journal.short} />
          <span className="finder-split-copy">
            <span className="finder-split-name">{journal.name}</span>
            <span className="finder-split-sub">
              <span>{journal.categoryLabel}</span>
              <StatusPill tone={journal.statusTone}>{journal.status}</StatusPill>
            </span>
          </span>
          <span className="finder-split-arrow" aria-hidden="true"><Arrow /></span>
        </button>
      </li>)}
    </ol>

    <article className={`finder-split-panel finder-split-panel-${active.id}`} id="finder-split-panel" aria-live="polite">
      <span className="finder-split-watermark" aria-hidden="true">{active.short}</span>
      <div className="finder-split-panel-top">
        <JournalMark id={active.id} label={active.short} />
        <span className="finder-split-field">{active.categoryLabel}</span>
      </div>
      <h3>{active.name}</h3>
      <p className="finder-split-description">{active.description}</p>
      <dl className="finder-split-facts">
        <div><dt>E-ISSN</dt><dd>{hasIssn ? active.eissn : 'In process'}</dd></div>
        <div><dt>Review</dt><dd>{active.review}</dd></div>
        <div><dt>Articles</dt><dd>{active.articleCount > 0 ? active.articleCount : 'First issue soon'}</dd></div>
      </dl>
      <div className="finder-split-panel-bottom">
        <p className="finder-split-indexing">{active.indexing.length > 0 ? active.indexing.join(' · ') : active.access}</p>
        <SmartLink href={active.url} className="finder-split-visit" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {visitLabel(active)} <Arrow />{external && <span className="sr-only"> (opens in a new tab)</span>}
        </SmartLink>
      </div>
    </article>
  </section>;
}

function SearchBox({ query, onQueryChange, placeholder, label }) {
  return <div className="finder-search" role="search">
    <SearchIcon />
    <label className="sr-only" htmlFor="journal-search">{label}</label>
    <input id="journal-search" type="search" value={query} placeholder={placeholder} onChange={event => onQueryChange(event.target.value)} />
    {query && <button type="button" className="search-clear" onClick={() => onQueryChange('')}><CloseIcon /><span>Clear</span></button>}
  </div>;
}

export default function JournalDirectory({
  side,
  combined,
  query,
  onQueryChange,
  category,
  onChooseCategory,
  journals,
  selectedJournal,
  articleCount,
  onReset,
  split = false,
  children,
}) {
  if (split) {
    return <>
      <div className="finder-head" data-reveal>
        <div>
          <h2 id="journal-finder-heading">Find the journal that fits <em>your research field.</em></h2>
        </div>
        <div className="finder-head-aside">
          <p>Pick a journal, compare its scope, then visit it to submit and read the full archive.</p>
        </div>
      </div>
      <JournalSplitIndex journals={directoryJournals} />
    </>;
  }

  const countLabel = `${journals.length} ${journals.length === 1 ? 'journal' : 'journals'}`;
  const resultLabel = combined ? `${countLabel} · ${articleCount} ${articleCount === 1 ? 'article' : 'articles'}` : countLabel;
  const noResults = combined && journals.length === 0 && articleCount === 0;
  const noJournals = journals.length === 0;
  const searchPlaceholder = side ? 'Search journals or topics…' : 'Search journals, topics, or article titles…';
  const searchLabel = combined ? 'Search journals, topics, or article titles' : 'Search journals or topics';

  const journalEmpty = <EmptyState
    title={combined ? 'No journal in this field' : 'No journal matches this search'}
    copy={combined
      ? 'Matching articles are still listed below. Clear the field filter to see the matching journals.'
      : 'Try another keyword, or show all fields.'}
    action={<button className="button button-dark" type="button" onClick={onReset}>{combined ? 'Show all fields' : 'Reset search'}</button>}
  />;

  return <>
    <div className="finder-head" data-reveal>
      <div>
        <h2 id="journal-finder-heading">Find the journal that fits <em>your research field.</em></h2>
      </div>
      <div className="finder-head-aside">
        <p>Choose a field, compare scopes, then visit the journal to submit and read its full archive.</p>
      </div>
    </div>

    <div className="finder-toolbar">
      <SearchBox query={query} onQueryChange={onQueryChange} placeholder={searchPlaceholder} label={searchLabel} />
      <p className="finder-result" role="status" aria-live="polite">{resultLabel}</p>
    </div>

    <div className="filter-row" role="group" aria-label="Filter journals by field">
      <span className="filter-label">Field</span>
      {journalCategories.map(item => <button key={item.id} type="button" className={`filter-chip ${category === item.id ? 'is-active' : ''}`} aria-pressed={category === item.id} onClick={() => onChooseCategory(item.id)}>
        {item.label} <span className="filter-count">{categoryCount(item.id)}</span>
      </button>)}
    </div>

    {noResults
      ? <EmptyState title="No results" copy="No journal or article matches your search. Try another keyword, or return to all fields and focus areas." action={<button className="button button-dark" type="button" onClick={onReset}>Reset search</button>} />
      : <>
        {noJournals
          ? journalEmpty
          : <section className="finder-cards" aria-label="Nordeo journals">
            {journals.map(journal => <DirectoryCard key={journal.id} journal={journal} selected={selectedJournal === journal.id} />)}
          </section>}
        {children}
      </>}
  </>;
}
