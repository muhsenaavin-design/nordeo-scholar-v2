import { Link } from 'react-router';
import { articleTopics, directoryJournals } from '../data/journal-directory';
import { formatAuthors } from '../lib/store';
import { Arrow, JournalMark, SmartLink } from './parts';

const ALL_TOPICS = articleTopics[0];

function ArticleCard({ article, titleLevel, index = 0 }) {
  const journal = directoryJournals.find(item => item.id === article.journal);
  const Title = `h${titleLevel}`;
  const featured = index === 0;
  return <a className={`article-card ${featured ? 'is-featured' : ''}`.trim()} href={article.url} target="_blank" rel="noopener noreferrer">
    <div className="article-card-main">
      <div className="article-meta">
        <span className="article-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        {featured && <span className="article-featured-badge" aria-hidden="true">Featured Paper</span>}
        <span className={`article-journal article-journal-${article.journal}`}>{journal?.short}</span>
        <span>{article.volume}</span>
        <span>{article.year}</span>
        {article.pages && <span>pp. {article.pages}</span>}
      </div>
      <Title>{article.title}</Title>
      <p className="article-authors">{formatAuthors(article.authors)}</p>
      <p className="article-excerpt">{article.excerpt}</p>
    </div>
    <div className="article-card-aside">
      {Array.isArray(article.topics) && article.topics.length > 0 && <ul className="article-topics" aria-hidden="true">
        {article.topics.slice(0, featured ? 3 : 2).map(item => <li key={item}>{item}</li>)}
      </ul>}
      <div className="article-footer">
        <span className="article-doi-code" aria-hidden="true">{article.doi ? `doi.org/${article.doi}` : 'Open Access · Full Text'}</span>
        <span className="article-link">{article.doi ? 'DOI' : 'Read article'} <Arrow /></span>
      </div>
    </div>
  </a>;
}

export default function PublishedArticles({
  headingLevel = 3,
  showLead = false,
  journal,
  journals,
  articles,
  visibleArticles,
  searchPool,
  topic,
  topicCounts,
  onSelectJournal,
  onSelectTopic,
  limit,
  showArchiveLink,
  hasArticleFilters,
  onResetFilters,
  wrapperId,
  wrapperRef,
}) {
  const Heading = `h${headingLevel}`;
  const titleLevel = headingLevel + 1;
  const EmptyTitle = `h${titleLevel}`;
  const headingProps = headingLevel === 2 ? { id: 'published-articles-heading' } : {};

  return <div className="article-preview" id={wrapperId} ref={wrapperRef}>
    <div className="article-preview-head">
      <div>
        <p className="finder-kicker"><span className="finder-kicker-rule" aria-hidden="true" />Scholarly Archive</p>
        <Heading {...headingProps}>Published articles</Heading>
        {showLead && <p className="article-preview-lead">Peer-reviewed work from the Nordeo journals, with the full text and DOI on each journal platform.</p>}
      </div>
      <div className="article-head-meta">
        <p className="result-count">{visibleArticles.length < articles.length ? `${visibleArticles.length} of ${articles.length} articles` : `${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`} · {journal.short}</p>
      </div>
    </div>

    <div className="article-controls-deck">
      <div className="article-controls-top">
        <div className="journal-tabs" role="group" aria-label="Choose a journal">
          {journals.map(item => {
            const count = searchPool.filter(article => article.journal === item.id).length;
            return <button key={item.id} type="button" aria-pressed={journal.id === item.id} className={`journal-tab ${journal.id === item.id ? 'is-active' : ''}`} onClick={() => onSelectJournal(item.id)}>
              <JournalMark id={item.id} label={item.short} size="sm" /><span>{item.short}</span><small>{count} {count === 1 ? 'article' : 'articles'}</small>
            </button>;
          })}
        </div>
        {journal.eissn && journal.eissn !== '—' && <p className="article-journal-spec" aria-hidden="true">
          <span><strong>{journal.short}</strong> · E-ISSN {journal.eissn}</span>
          {journal.latestIssue && <span>{journal.latestIssue}</span>}
        </p>}
      </div>

      {searchPool.length > 0 && <div className="filter-row topic-row" role="group" aria-label={`Filter ${journal.short} by focus area`}>
        <span className="filter-label">Focus area</span>
        {articleTopics.map(item => {
          const count = topicCounts.get(item) || 0;
          return <button key={item} type="button" className={`filter-chip ${topic === item ? 'is-active' : ''} ${count === 0 && item !== ALL_TOPICS ? 'is-empty' : ''}`} aria-pressed={topic === item} disabled={count === 0 && item !== ALL_TOPICS} onClick={() => onSelectTopic(item)}>
            {item} <span className="filter-count">{count}</span>
          </button>;
        })}
      </div>}
    </div>

    {visibleArticles.length > 0 && <div className="article-grid">
      {visibleArticles.map((article, index) => <ArticleCard key={article.id} article={article} titleLevel={titleLevel} index={index} />)}
    </div>}

    {visibleArticles.length === 0 && <div className="article-empty">
      <div>
        <EmptyTitle>{hasArticleFilters ? 'No matching articles yet' : `${journal.short} is open for its first submissions`}</EmptyTitle>
        <p>{hasArticleFilters
          ? 'Try another focus area or keyword, or choose a different journal above.'
          : `${journal.name} has no published articles yet. Its profile, scope, and call for papers are on the journal platform.`}</p>
        <div className="article-empty-actions">
          {hasArticleFilters && <button type="button" className="text-link finder-text-button" onClick={onResetFilters}>Reset filters</button>}
          <SmartLink href={journal.url} className="text-link" {...(/^https?:/i.test(journal.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>Open the {journal.short} platform <Arrow /></SmartLink>
        </div>
      </div>
    </div>}

    {showArchiveLink && <div className="article-preview-footer">
      <p>{limit < articles.length ? `Showing ${visibleArticles.length} of ${articles.length} ${journal.short} articles.` : ''}</p>
      <Link to="/journals" className="pill-cta is-dark">All journals and articles <span className="pill-cta-icon"><Arrow /></span></Link>
    </div>}
  </div>;
}
