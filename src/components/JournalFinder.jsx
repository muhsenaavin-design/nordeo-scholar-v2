import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { articleTopics, directoryJournals, journalArticles, journalCategories } from '../data/journal-directory';
import { formatAuthors } from '../lib/store';
import { Arrow, CloseIcon, DownloadIcon, EmptyState, JournalMark, SearchIcon, SmartLink, StatusPill } from './parts';

const ALL_TOPICS = articleTopics[0];
const normalize = value => String(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

function categoryCount(id) {
  return id === 'all' ? directoryJournals.length : directoryJournals.filter(journal => journal.category === id).length;
}

function articleMatches(article, query) {
  if (!query) return true;
  return normalize([article.title, ...article.authors, article.excerpt, ...article.topics, article.volume].join(' ')).includes(query);
}

function journalMatches(journal, query) {
  if (!query) return true;
  const profile = normalize([journal.short, journal.name, journal.description, journal.categoryLabel, ...journal.topics].join(' '));
  if (profile.includes(query)) return true;
  return journalArticles.some(article => article.journal === journal.id && articleMatches(article, query));
}

function totalArticles(journalId) {
  return journalArticles.filter(article => article.journal === journalId).length;
}

function visitLabel(journal) {
  return journal.id === 'pengmas' ? 'Visit Jurnal Pengmas' : `Visit ${journal.short}`;
}

function DirectoryCard({ journal, selected, matchedArticles, searching, onArticles }) {
  const count = searching ? matchedArticles : totalArticles(journal.id);
  const external = /^https?:/i.test(journal.url);
  return <article className={`directory-card ${selected ? 'is-selected' : ''}`} id={journal.id}>
    <div className="directory-card-top">
      <JournalMark id={journal.id} label={journal.short} />
      <StatusPill tone={journal.statusTone}>{journal.status}</StatusPill>
    </div>
    <h3>{journal.name}</h3>
    <p className="directory-meta"><span>{journal.categoryLabel}</span>{journal.eissn !== '—' && <span>E-ISSN {journal.eissn}</span>}</p>
    <p className="directory-description">{journal.description}</p>
    {(journal.templateUrl || journal.guidelinesUrl) && <div className="directory-resources">
      {journal.templateUrl && <a href={journal.templateUrl} target="_blank" rel="noopener noreferrer"><DownloadIcon /> Manuscript template (.docx)</a>}
      {journal.guidelinesUrl && <a href={journal.guidelinesUrl} target="_blank" rel="noopener noreferrer">Submission guidelines <Arrow size={14} /></a>}
    </div>}
    <div className="directory-footer">
      <button type="button" className="finder-text-button" onClick={() => onArticles(journal.id)}>
        {count ? `View ${count} ${count === 1 ? 'article' : 'articles'}` : 'View profile'} <Arrow />
      </button>
      <SmartLink href={journal.url} className="text-link" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {visitLabel(journal)} <Arrow />
      </SmartLink>
    </div>
    {journal.indexing.length > 0 && <p className="directory-indexing">{journal.indexing.join(' · ')}</p>}
  </article>;
}

function ArticleCard({ article }) {
  const journal = directoryJournals.find(item => item.id === article.journal);
  return <a className="article-card" href={article.url} target="_blank" rel="noopener noreferrer">
    <div className="article-meta">
      <span className={`article-journal article-journal-${article.journal}`}>{journal?.short}</span>
      <span>{article.volume}</span>
      <span>{article.year}</span>
      {article.pages && <span>pp. {article.pages}</span>}
    </div>
    <h4>{article.title}</h4>
    <p className="article-authors">{formatAuthors(article.authors)}</p>
    <p className="article-excerpt">{article.excerpt}</p>
    <div className="article-footer">
      <span className="article-link">{article.doi ? 'DOI' : 'Read article'} <Arrow /></span>
    </div>
  </a>;
}

export default function JournalFinder({ limit = 6, showArchiveLink = true }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedJournal, setSelectedJournal] = useState('jetsi');
  const [topic, setTopic] = useState(ALL_TOPICS);
  const articleRef = useRef(null);
  const search = useMemo(() => normalize(query.trim()), [query]);

  const searchPool = useMemo(() => journalArticles.filter(article => articleMatches(article, search)), [search]);
  const filteredJournals = useMemo(
    () => directoryJournals.filter(journal => (category === 'all' || journal.category === category) && journalMatches(journal, search)),
    [category, search],
  );

  const activeJournal = directoryJournals.find(journal => journal.id === selectedJournal) || directoryJournals[0];
  const searchJournalPool = useMemo(() => searchPool.filter(article => article.journal === selectedJournal), [searchPool, selectedJournal]);
  const articles = useMemo(
    () => searchJournalPool.filter(article => topic === ALL_TOPICS || article.topics.includes(topic)),
    [searchJournalPool, topic],
  );
  const visibleArticles = articles.slice(0, limit);
  const topicCounts = useMemo(() => {
    const counts = new Map([[ALL_TOPICS, searchJournalPool.length]]);
    articleTopics.slice(1).forEach(item => counts.set(item, searchJournalPool.filter(article => article.topics.includes(item)).length));
    return counts;
  }, [searchJournalPool]);

  const hasArticleFilters = Boolean(search) || topic !== ALL_TOPICS;
  const scrollBehavior = typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth';

  function showArticles(id) {
    setSelectedJournal(id);
    setTopic(ALL_TOPICS);
    requestAnimationFrame(() => articleRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'start' }));
  }

  function chooseCategory(id) {
    setCategory(id);
    if (!search && id !== 'all') {
      const first = directoryJournals.find(journal => journal.category === id);
      if (first) {
        setSelectedJournal(first.id);
        setTopic(ALL_TOPICS);
      }
    }
  }

  function resetFilters() {
    setQuery('');
    setCategory('all');
    setTopic(ALL_TOPICS);
  }

  return <section className="journal-finder" id="jurnal" aria-labelledby="journal-finder-heading">
    <div className="finder-head" data-reveal>
      <div>
        <h2 id="journal-finder-heading">Find the journal that fits <em>your research field.</em></h2>
      </div>
      <div className="finder-head-aside">
        <p>Choose a field, compare scopes, download the template, then read what has been published.</p>
      </div>
    </div>

    <div className="finder-toolbar">
      <div className="finder-search" role="search">
        <SearchIcon />
        <label className="sr-only" htmlFor="journal-search">Search journals, topics, or article titles</label>
        <input id="journal-search" type="search" value={query} placeholder="Search journals, topics, or article titles…" onChange={event => setQuery(event.target.value)} />
        {query && <button type="button" className="search-clear" onClick={() => setQuery('')}><CloseIcon /><span>Clear</span></button>}
      </div>
      <p className="finder-result" role="status" aria-live="polite">{filteredJournals.length} {filteredJournals.length === 1 ? 'journal' : 'journals'} · {searchPool.length} {searchPool.length === 1 ? 'article' : 'articles'}</p>
    </div>

    <div className="filter-row" role="group" aria-label="Filter journals by field">
      <span className="filter-label">Field</span>
      {journalCategories.map(item => <button key={item.id} type="button" className={`filter-chip ${category === item.id ? 'is-active' : ''}`} aria-pressed={category === item.id} onClick={() => chooseCategory(item.id)}>
        {item.label} <span className="filter-count">{categoryCount(item.id)}</span>
      </button>)}
    </div>

    {filteredJournals.length === 0 && searchPool.length === 0
      ? <EmptyState title="No results" copy="No journal or article matches your search. Try another keyword, or return to all fields and focus areas." action={<button className="button button-dark" type="button" onClick={resetFilters}>Reset search</button>} />
      : <>
        {filteredJournals.length > 0 && <div className="directory-grid">
          {filteredJournals.map(journal => <DirectoryCard
            key={journal.id}
            journal={journal}
            selected={selectedJournal === journal.id}
            searching={Boolean(search)}
            matchedArticles={searchPool.filter(article => article.journal === journal.id).length}
            onArticles={showArticles}
          />)}
        </div>}
        {filteredJournals.length === 0 && <EmptyState title="No journal in this field" copy="Matching articles are still listed below. Clear the field filter to see the matching journals." action={<button className="button button-dark" type="button" onClick={resetFilters}>Show all fields</button>} />}

        <div className="article-preview" id="artikel" ref={articleRef}>
          <div className="article-preview-head">
            <div>
              <h3>Published articles</h3>
            </div>
            <p className="result-count">{visibleArticles.length < articles.length ? `${visibleArticles.length} of ${articles.length} articles` : `${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`} · {activeJournal.short}</p>
          </div>

          <div className="journal-tabs" role="group" aria-label="Choose a journal">
            {directoryJournals.map(journal => {
              const count = searchPool.filter(article => article.journal === journal.id).length;
              return <button key={journal.id} type="button" aria-pressed={selectedJournal === journal.id} className={`journal-tab ${selectedJournal === journal.id ? 'is-active' : ''}`} onClick={() => { setSelectedJournal(journal.id); setTopic(ALL_TOPICS); }}>
                <JournalMark id={journal.id} label={journal.short} size="sm" /><span>{journal.short}</span><small>{count} {count === 1 ? 'article' : 'articles'}</small>
              </button>;
            })}
          </div>

          {searchJournalPool.length > 0 && <div className="filter-row topic-row" role="group" aria-label={`Filter ${activeJournal.short} by focus area`}>
            <span className="filter-label">Focus area</span>
            {articleTopics.map(item => {
              const count = topicCounts.get(item) || 0;
              return <button key={item} type="button" className={`filter-chip ${topic === item ? 'is-active' : ''} ${count === 0 && item !== ALL_TOPICS ? 'is-empty' : ''}`} aria-pressed={topic === item} disabled={count === 0 && item !== ALL_TOPICS} onClick={() => setTopic(item)}>
                {item} <span className="filter-count">{count}</span>
              </button>;
            })}
          </div>}

          {visibleArticles.length > 0 && <div className="article-grid">
            {visibleArticles.map(article => <ArticleCard key={article.id} article={article} />)}
          </div>}

          {visibleArticles.length === 0 && <div className="article-empty">
            <div>
              <h4>{hasArticleFilters ? 'No matching articles yet' : `${activeJournal.short} is open for its first submissions`}</h4>
              <p>{hasArticleFilters
                ? 'Try another focus area or keyword, or choose a different journal above.'
                : `${activeJournal.name} has no published articles yet. Its profile, scope, and call for papers are on the journal platform.`}</p>
              <div className="article-empty-actions">
                {hasArticleFilters && <button type="button" className="text-link finder-text-button" onClick={() => { setQuery(''); setTopic(ALL_TOPICS); }}>Reset filters</button>}
                <SmartLink href={activeJournal.url} className="text-link" {...(/^https?:/i.test(activeJournal.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>Open the {activeJournal.short} platform <Arrow /></SmartLink>
              </div>
            </div>
          </div>}

          {showArchiveLink && <div className="article-preview-footer">
            <p>{limit < articles.length ? `Showing ${visibleArticles.length} of ${articles.length} ${activeJournal.short} articles.` : ''}</p>
            <Link to="/journals" className="text-link">All journals and articles <Arrow /></Link>
          </div>}
        </div>
      </>}
  </section>;
}
