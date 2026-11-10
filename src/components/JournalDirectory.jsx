import { directoryJournals, journalCategories } from '../data/journal-directory';
import { SpotlightCard } from './effects';
import { Arrow, CloseIcon, EmptyState, JournalMark, SearchIcon, SmartLink, StatusPill } from './parts';
import Carousel from './Carousel';

function categoryCount(id) {
  return id === 'all' ? directoryJournals.length : directoryJournals.filter(journal => journal.category === id).length;
}

function visitLabel(journal) {
  return journal.id === 'pengmas' ? 'Visit Jurnal Pengmas' : `Visit ${journal.short}`;
}

// Cards carry only "Visit <journal>": guidelines, templates, and articles live on each
// journal's own site, so visitors go there directly (journal traffic counts toward
// accreditation — Nordeo, Feedback 2).
function DirectoryCard({ journal, selected, onShowArticles }) {
  const external = /^https?:/i.test(journal.url);
  const hasIndexing = journal.indexing.length > 0;
  return <SpotlightCard className={`directory-card directory-card-${journal.id} ${selected ? 'is-selected' : ''}`} id={journal.id}>
    {journal.preview && <div className="directory-visual" aria-hidden="true">
      <span className="directory-browser-bar"><i /><i /><i /><b>{journal.displayUrl || 'nordeoscholar.com'}</b></span>
      <div className="directory-preview-wrap">
        <img className="directory-preview-img" src={journal.preview} alt="" width="1200" height="750" loading="lazy" decoding="async" />
        <div className="directory-visual-shade" />
        {journal.cover && <img className="directory-cover-img" src={journal.cover} alt="" width="136" height="192" loading="lazy" decoding="async" />}
      </div>
    </div>}
    <div className="directory-card-body">
      <div className="directory-card-top">
        <JournalMark id={journal.id} label={journal.short} size="sm" />
        <StatusPill tone={journal.statusTone}>{journal.status}</StatusPill>
      </div>
      <p className="directory-meta">
        <span className="directory-meta-field">{journal.categoryLabel}</span>
        {journal.eissn !== '—' ? <span className="directory-meta-issn">E-ISSN {journal.eissn}</span> : <span className="directory-meta-issn is-muted">{journal.frequency}</span>}
      </p>
      <h3>{journal.name}</h3>
      <p className="directory-description">{journal.description}</p>
      {Array.isArray(journal.topics) && journal.topics.length > 0 && <ul className="directory-topics" aria-label="Scope">
        {journal.topics.slice(0, 2).map(topic => <li key={topic}>{topic}</li>)}
        {journal.topics.length > 2 && <li className="is-more">+{journal.topics.length - 2}</li>}
      </ul>}
      <p className={`directory-indexing ${hasIndexing ? '' : 'is-fallback'}`.trim()} {...(hasIndexing ? {} : { 'aria-hidden': 'true' })}>
        <span className="directory-indexing-dot" aria-hidden="true" />
        <span>{hasIndexing ? journal.indexing.join(' · ') : `${journal.access} · ${journal.review}`}</span>
      </p>
      <div className="directory-footer">
        {onShowArticles && <button type="button" className="finder-text-button" aria-pressed={selected} onClick={() => onShowArticles(journal.id)}>
          <span className="finder-button-dot" aria-hidden="true" />
          {selected ? 'Articles below' : 'See articles'}
        </button>}
        <SmartLink href={journal.url} className="text-link directory-visit" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {visitLabel(journal)} <Arrow />{external && <span className="sr-only"> (opens in a new tab)</span>}
        </SmartLink>
      </div>
    </div>
  </SpotlightCard>;
}

function FieldList({ category, onChooseCategory }) {
  return <div className="finder-fields" role="group" aria-label="Filter journals by field">
    <span className="filter-label">Field</span>
    {journalCategories.map(item => <button key={item.id} type="button" className={`finder-field ${category === item.id ? 'is-active' : ''}`} aria-pressed={category === item.id} onClick={() => onChooseCategory(item.id)}>
      <span>{item.label}</span><span className="filter-count">{categoryCount(item.id)}</span>
    </button>)}
  </div>;
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
  onShowArticles,
  articleCount,
  onReset,
  children,
}) {
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
        <p className="finder-kicker"><span className="finder-kicker-rule" aria-hidden="true" />Peer-Reviewed Portfolio</p>
        <h2 id="journal-finder-heading">Find the journal that fits <em>your research field.</em></h2>
      </div>
      <div className="finder-head-aside">
        <p>Choose a field, compare scopes, then visit the journal to submit and read its full archive.</p>
        <div className="finder-head-stats" aria-hidden="true">
          <span><strong>04</strong> Active &amp; Upcoming Titles</span>
          <span><strong>100%</strong> Open Access</span>
          <span><strong>10.68627</strong> Crossref Prefix</span>
        </div>
      </div>
    </div>

    {side ? <div className="finder-layout">
      <div className="finder-top-deck" aria-label="Filter journals">
        <div className="finder-top-bar">
          <FieldList category={category} onChooseCategory={onChooseCategory} />
          <div className="finder-top-search">
            <SearchBox query={query} onQueryChange={onQueryChange} placeholder={searchPlaceholder} label={searchLabel} />
            <p className="finder-result" role="status" aria-live="polite">{resultLabel}</p>
          </div>
        </div>
        <div className="finder-standards-strip">
          <ul className="finder-facts">
            <li>Open access, free to read</li>
            <li>Double-blind peer review</li>
            <li>Crossref DOI · prefix 10.68627</li>
          </ul>
          <div className="finder-platforms" aria-hidden="true">
            <img src="/assets/platforms/garuda.png" alt="" width="64" height="18" loading="lazy" />
            <img src="/assets/platforms/crossref.svg" alt="" width="68" height="18" loading="lazy" />
            <img src="/assets/platforms/google-scholar.png" alt="" width="80" height="18" loading="lazy" />
          </div>
        </div>
      </div>
      <div className="finder-main">
        {noResults
          ? <EmptyState title="No results" copy="No journal or article matches your search. Try another keyword, or return to all fields and focus areas." action={<button className="button button-dark" type="button" onClick={onReset}>Reset search</button>} />
          : <>
            {noJournals
              ? journalEmpty
              : <section className="finder-cards" aria-label="Nordeo journals">
                {journals.map(journal => <DirectoryCard key={journal.id} journal={journal} selected={selectedJournal === journal.id} onShowArticles={onShowArticles} />)}
              </section>}
            {children}
          </>}
      </div>
    </div> : <>
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
            : <Carousel
              className="journal-carousel"
              label="Nordeo journals"
              prevLabel="Previous journals"
              nextLabel="More journals"
              items={journals}
              renderItem={journal => <DirectoryCard journal={journal} selected={selectedJournal === journal.id} />}
            />}
          {children}
        </>}
    </>}
  </>;
}
