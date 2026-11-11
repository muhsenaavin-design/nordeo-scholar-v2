import { directoryJournals, journalArticles, journalCategories } from '../data/journal-directory';
import { Arrow, CloseIcon, EmptyState, JournalMark, SearchIcon, SmartLink, StatusPill } from './parts';
import Carousel from './Carousel';
import JournalCover from './JournalCover';

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

// Homepage "journal shelf" (Nov 2026, fourth pass): each journal leads with a cover in its own
// colours, then the same fixed rows (status, name, scope, two facts, Visit) so the Visit buttons
// line up across cards. Visit is still the only action, since journal-site visits count toward
// accreditation (Feedback 2). The rail scrolls sideways as the portfolio grows.
function ShelfCard({ journal }) {
  const external = /^https?:/i.test(journal.url);
  const eissn = journal.eissn === '—' ? 'Not yet assigned' : journal.eissn;
  return <article className={`shelf-card shelf-card-${journal.id}`} id={journal.id}>
    <JournalCover journal={journal} />
    <div className="shelf-card-body">
      <StatusPill tone={journal.statusTone}>{journal.status}</StatusPill>
      <h3>{journal.name}</h3>
      <p className="shelf-card-scope">{journal.description}</p>
      <dl className="shelf-card-facts">
        <div><dt>E-ISSN</dt><dd>{eissn}</dd></div>
        <div><dt>Review</dt><dd>{journal.review.replace(' review', '')}</dd></div>
      </dl>
      <p className="shelf-card-index">{journal.indexing.length ? journal.indexing.join(' · ') : 'Open access · indexing after first issue'}</p>
      <SmartLink href={journal.url} className="shelf-card-visit" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {visitLabel(journal)} <Arrow />{external && <span className="sr-only"> (opens in a new tab)</span>}
      </SmartLink>
    </div>
  </article>;
}

function JournalCardRail({ journals }) {
  return <Carousel
    className="journal-carousel journal-shelf"
    label="Nordeo journals"
    items={journals}
    prevLabel="Previous journals"
    nextLabel="More journals"
    renderItem={journal => <ShelfCard journal={journal} />}
  />;
}

function ShelfStats() {
  const stats = [
    [directoryJournals.length, 'peer-reviewed journals'],
    [journalArticles.length, 'articles published so far'],
    ['100%', 'open access, free to read'],
    ['Double-blind', 'peer review on every manuscript'],
  ];
  return <dl className="shelf-stats" data-reveal>
    {stats.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl>;
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
          <p>Four journals, each with its own scope and platform. Visit a journal to read, submit, and follow its guidelines.</p>
        </div>
      </div>
      <ShelfStats />
      <JournalCardRail journals={directoryJournals} />
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
