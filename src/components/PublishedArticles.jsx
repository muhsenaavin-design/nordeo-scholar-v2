import { Link } from 'react-router';
import { articleTopics, directoryJournals } from '../data/journal-directory';
import { formatAuthors } from '../lib/store';
import { Arrow, JournalMark, SmartLink } from './parts';

const ALL_TOPICS = articleTopics[0];

function ArticleCard({ article, titleLevel }) {
  const journal = directoryJournals.find(item => item.id === article.journal);
  const Title = `h${titleLevel}`;
  return <a className="article-card" href={article.url} target="_blank" rel="noopener noreferrer">
    <div className="article-meta">
      <span className={`article-journal article-journal-${article.journal}`}>{journal?.short}</span>
      <span>{article.volume}</span>
      <span>{article.year}</span>
      {article.pages && <span>pp. {article.pages}</span>}
    </div>
    <Title>{article.title}</Title>
    <p className="article-authors">{formatAuthors(article.authors)}</p>
    <p className="article-excerpt">{article.excerpt}</p>
    <div className="article-footer">
      <span className="article-link">{article.doi ? 'DOI' : 'Read article'} <Arrow /></span>
    </div>
  </a>;
}

export default function PublishedArticles({
  headingLevel = 3,
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

  const journalTabs = <div className="journal-tabs" role="group" aria-label="Choose a journal">
    {journals.map(item => {
      const count = searchPool.filter(article => article.journal === item.id).length;
      return <button key={item.id} type="button" aria-pressed={journal.id === item.id} className={`journal-tab ${journal.id === item.id ? 'is-active' : ''}`} onClick={() => onSelectJournal(item.id)}>
        <JournalMark id={item.id} label={item.short} size="sm" /><span>{item.short}</span><small>{`${count} ${count === 1 ? 'article' : 'articles'}`}</small>
      </button>;
    })}
  </div>;

  return <div className="article-preview" id={wrapperId} ref={wrapperRef}>
    <div className="article-preview-head">
      <div>
        <Heading {...headingProps}>Published articles</Heading>
      </div>
      <p className="result-count">{visibleArticles.length < articles.length ? `${visibleArticles.length} of ${articles.length} articles` : `${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`} · {journal.short}</p>
    </div>

    {journalTabs}

    {searchPool.length > 0 && <div className="filter-row topic-row" role="group" aria-label={`Filter ${journal.short} by focus area`}>
      <span className="filter-label">Focus area</span>
      {articleTopics.map(item => {
        const count = topicCounts.get(item) || 0;
        return <button key={item} type="button" className={`filter-chip ${topic === item ? 'is-active' : ''} ${count === 0 && item !== ALL_TOPICS ? 'is-empty' : ''}`} aria-pressed={topic === item} disabled={count === 0 && item !== ALL_TOPICS} onClick={() => onSelectTopic(item)}>
          {item} <span className="filter-count">{count}</span>
        </button>;
      })}
    </div>}

    {visibleArticles.length > 0 && <div className="article-grid">
      {visibleArticles.map(article => <ArticleCard key={article.id} article={article} titleLevel={titleLevel} />)}
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
      <Link to="/journals" className="text-link">All journals and articles <Arrow /></Link>
    </div>}
  </div>;
}
