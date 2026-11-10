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

// Homepage "featured + ranked list" (Redesign, Option A): the newest article leads as a
// large card, the next ones follow as a numbered list with their DOI on the right.
function FeaturedArticle({ article, titleLevel }) {
  const journal = directoryJournals.find(item => item.id === article.journal);
  const Title = `h${titleLevel}`;
  return <a className="article-featured" href={article.url} target="_blank" rel="noopener noreferrer">
    <div className="article-featured-art" aria-hidden="true">
      <svg viewBox="0 0 400 160" preserveAspectRatio="none"><path d="M0 120 C80 60 160 140 240 70 S360 40 400 60" /><path d="M0 140 C90 90 170 150 250 95 S360 70 400 85" /></svg>
      <span className="article-featured-badge">Latest issue</span>
    </div>
    <div className="article-featured-body">
      <div className="article-featured-meta">
        <span>{journal?.short}</span><span>{article.volume}</span><span>{article.year}</span>
        {article.pages && <span>pp. {article.pages}</span>}
      </div>
      <Title>{article.title}</Title>
      <p className="article-featured-authors">{formatAuthors(article.authors)}</p>
      <p className="article-featured-excerpt">{article.excerpt}</p>
      <div className="article-featured-footer">
        {article.doi && <span className="article-doi">doi:{article.doi}</span>}
        <span className="article-featured-read">Read article <Arrow /></span>
      </div>
    </div>
  </a>;
}

function RankedArticle({ article, rank, titleLevel }) {
  const journal = directoryJournals.find(item => item.id === article.journal);
  const Title = `h${titleLevel}`;
  return <li>
    <a className="article-ranked" href={article.url} target="_blank" rel="noopener noreferrer">
      <span className="article-ranked-rank" aria-hidden="true">{String(rank).padStart(2, '0')}</span>
      <span className="article-ranked-copy">
        <span className="article-ranked-meta">{journal?.short} · {article.volume}{article.pages ? ` · pp. ${article.pages}` : ''}</span>
        <Title>{article.title}</Title>
        <span className="article-ranked-authors">{formatAuthors(article.authors)}</span>
      </span>
      <span className="article-ranked-doi">{article.doi ? 'DOI' : 'Read'} <Arrow /></span>
    </a>
  </li>;
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
  featured = false,
}) {
  const Heading = `h${headingLevel}`;
  const titleLevel = headingLevel + 1;
  const EmptyTitle = `h${titleLevel}`;
  const headingProps = headingLevel === 2 ? { id: 'published-articles-heading' } : {};

  // In the featured layout, journals without published articles are shown as "Soon"
  // and cannot be picked, so the switcher never leads to an empty list.
  const journalTabs = <div className={`journal-tabs${featured ? ' journal-switch' : ''}`} role="group" aria-label="Choose a journal">
    {journals.map(item => {
      const count = searchPool.filter(article => article.journal === item.id).length;
      const soon = featured && count === 0 && journal.id !== item.id;
      return <button key={item.id} type="button" aria-pressed={journal.id === item.id} disabled={soon} className={`journal-tab ${journal.id === item.id ? 'is-active' : ''} ${soon ? 'is-soon' : ''}`} onClick={() => onSelectJournal(item.id)}>
        <JournalMark id={item.id} label={item.short} size="sm" /><span>{item.short}</span><small>{soon ? 'Soon' : `${count} ${count === 1 ? 'article' : 'articles'}`}</small>
      </button>;
    })}
  </div>;

  const [lead, ...rest] = visibleArticles;

  return <div className={`article-preview${featured ? ' is-featured-layout' : ''}`} id={wrapperId} ref={wrapperRef}>
    <div className="article-preview-head">
      <div>
        <Heading {...headingProps}>Published articles</Heading>
        {showLead && <p className="article-preview-lead">Peer-reviewed work from the Nordeo journals, with the full text and DOI on each journal platform.</p>}
      </div>
      {featured
        ? journalTabs
        : <p className="result-count">{visibleArticles.length < articles.length ? `${visibleArticles.length} of ${articles.length} articles` : `${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`} · {journal.short}</p>}
    </div>

    {!featured && journalTabs}

    {searchPool.length > 0 && <div className="filter-row topic-row" role="group" aria-label={`Filter ${journal.short} by focus area`}>
      <span className="filter-label">Focus area</span>
      {articleTopics.map(item => {
        const count = topicCounts.get(item) || 0;
        return <button key={item} type="button" className={`filter-chip ${topic === item ? 'is-active' : ''} ${count === 0 && item !== ALL_TOPICS ? 'is-empty' : ''}`} aria-pressed={topic === item} disabled={count === 0 && item !== ALL_TOPICS} onClick={() => onSelectTopic(item)}>
          {item} <span className="filter-count">{count}</span>
        </button>;
      })}
    </div>}

    {visibleArticles.length > 0 && (featured
      ? <div className="article-spotlight">
        <FeaturedArticle article={lead} titleLevel={titleLevel} />
        {rest.length > 0 && <ol className="article-ranked-list">
          {rest.map((article, index) => <RankedArticle key={article.id} article={article} rank={index + 2} titleLevel={titleLevel} />)}
        </ol>}
      </div>
      : <div className="article-grid">
        {visibleArticles.map(article => <ArticleCard key={article.id} article={article} titleLevel={titleLevel} />)}
      </div>)}

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
