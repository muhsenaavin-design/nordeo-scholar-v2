import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { articleTopics, directoryJournals, journalArticles } from '../data/journal-directory';
import { formatAuthors } from '../lib/store';
import { Arrow, JournalMark, SearchIcon } from './parts';

const PAGE_SIZE = 8;
const ALL = 'all';
const normalize = value => String(value).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
const issues = [...new Set(journalArticles.map(article => article.volume))].sort().reverse();
const doiCount = journalArticles.filter(article => article.doi).length;

function matches(article, query) {
  if (!query) return true;
  return normalize([article.title, ...article.authors, article.excerpt, ...article.topics, article.volume].join(' ')).includes(query);
}

// Homepage "Published articles" (Nov 2026, chosen from the options canvas: Articles C).
// Every article across the Nordeo journals in one archive table with search, journal,
// focus-area, and issue filters, eight rows per page. Each row opens the article by its DOI.
export default function ArticleArchive() {
  const [query, setQuery] = useState('');
  const [journal, setJournal] = useState(ALL);
  const [topic, setTopic] = useState(ALL);
  const [issue, setIssue] = useState(ALL);
  const [page, setPage] = useState(1);
  const search = normalize(query.trim());

  const results = useMemo(() => journalArticles.filter(article =>
    (journal === ALL || article.journal === journal)
    && (topic === ALL || article.topics.includes(topic))
    && (issue === ALL || article.volume === issue)
    && matches(article, search)), [journal, topic, issue, search]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = results.slice(start, start + PAGE_SIZE);
  const filtered = Boolean(search) || journal !== ALL || topic !== ALL || issue !== ALL;

  // Every filter change starts again from the first page.
  const update = setter => value => { setter(value); setPage(1); };
  const reset = () => { setQuery(''); setJournal(ALL); setTopic(ALL); setIssue(ALL); setPage(1); };

  return <div className="archive">
    <div className="archive-head">
      <div data-reveal>
        <h2 id="published-articles-heading">Published <em>articles.</em></h2>
        <p className="article-preview-lead">Every article across the Nordeo journals in one searchable archive. Open any row to read it through its DOI.</p>
      </div>
      <dl className="archive-stats">
        <div><dt>Articles</dt><dd>{journalArticles.length}</dd></div>
        <div><dt>Issues</dt><dd>{issues.length}</dd></div>
        <div><dt>With DOI</dt><dd>{doiCount}</dd></div>
      </dl>
    </div>

    <div className="archive-toolbar">
      <div className="archive-field archive-search">
        <label htmlFor="archive-search">Search</label>
        <span className="archive-input"><SearchIcon /><input id="archive-search" type="search" value={query} placeholder="Title, author, or keyword" onChange={event => update(setQuery)(event.target.value)} /></span>
      </div>
      <div className="archive-field">
        <label htmlFor="archive-journal">Journal</label>
        <select id="archive-journal" value={journal} onChange={event => update(setJournal)(event.target.value)}>
          <option value={ALL}>All journals</option>
          {directoryJournals.map(item => {
            const count = journalArticles.filter(article => article.journal === item.id).length;
            return <option key={item.id} value={item.id} disabled={count === 0}>{item.short}{count === 0 ? ' (soon)' : ''}</option>;
          })}
        </select>
      </div>
      <div className="archive-field">
        <label htmlFor="archive-topic">Focus area</label>
        <select id="archive-topic" value={topic} onChange={event => update(setTopic)(event.target.value)}>
          <option value={ALL}>All focus areas</option>
          {articleTopics.slice(1).map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="archive-field">
        <label htmlFor="archive-issue">Issue</label>
        <select id="archive-issue" value={issue} onChange={event => update(setIssue)(event.target.value)}>
          <option value={ALL}>All issues</option>
          {issues.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
    </div>

    {rows.length > 0
      ? <div className="archive-table-wrap">
        <table className="archive-table">
          <caption className="sr-only">Published articles, newest issue first</caption>
          <thead>
            <tr><th scope="col">Article</th><th scope="col">Journal</th><th scope="col">Issue</th><th scope="col">DOI</th></tr>
          </thead>
          <tbody>
            {rows.map(article => {
              const source = directoryJournals.find(item => item.id === article.journal);
              return <tr key={article.id}>
                <td className="archive-title">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}<span className="sr-only"> (opens in a new tab)</span></a>
                  <span>{formatAuthors(article.authors)}</span>
                </td>
                <td className="archive-journal"><JournalMark id={article.journal} label={source?.short} size="sm" /><span className="sr-only">{source?.short}</span></td>
                <td className="archive-issue">{article.volume}{article.pages ? <span> · pp. {article.pages}</span> : null}</td>
                <td className="archive-doi">{article.doi ? <span>{article.doi}</span> : <span className="is-pending">DOI pending</span>}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      : <div className="article-empty">
        <div>
          <h3>No matching articles</h3>
          <p>Try another keyword, or clear the filters to see every article.</p>
          <div className="article-empty-actions"><button type="button" className="text-link finder-text-button" onClick={reset}>Clear filters</button></div>
        </div>
      </div>}

    <div className="archive-footer">
      <p role="status" aria-live="polite">{results.length ? `Showing ${start + 1}–${start + rows.length} of ${results.length} articles` : 'Showing 0 articles'}</p>
      {pages > 1 && <nav className="archive-pages" aria-label="Article pages">
        {Array.from({ length: pages }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`Page ${number}`} aria-current={number === current ? 'page' : undefined} className={number === current ? 'is-current' : ''} onClick={() => setPage(number)}>{number}</button>)}
        <button type="button" className="archive-next" disabled={current === pages} onClick={() => setPage(current + 1)}>Next <Arrow /></button>
      </nav>}
      {!filtered && <Link to="/journals" className="text-link">All journals and articles <Arrow /></Link>}
      {filtered && <button type="button" className="text-link finder-text-button" onClick={reset}>Clear filters</button>}
    </div>
  </div>;
}
