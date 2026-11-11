import { useMemo, useRef, useState } from 'react';
import { articleTopics, directoryJournals, journalArticles } from '../data/journal-directory';
import JournalDirectory from './JournalDirectory';
import PublishedArticles from './PublishedArticles';
import ArticleArchive from './ArticleArchive';

const ALL_TOPICS = articleTopics[0];
const normalize = value => String(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

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

export default function JournalFinder({ limit = 6, showArchiveLink = true, layout = 'carousel' }) {
  const split = layout === 'split';
  const side = split || layout === 'sidebar';
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

  function selectJournal(id) {
    setSelectedJournal(id);
    setTopic(ALL_TOPICS);
  }

  function showArticles(id) {
    selectJournal(id);
    articleRef.current?.scrollIntoView({ behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth', block: 'start' });
  }

  function resetFilters() {
    setQuery('');
    setCategory('all');
    setTopic(ALL_TOPICS);
  }

  const articleBlock = <PublishedArticles
    journal={activeJournal}
    journals={directoryJournals}
    articles={articles}
    visibleArticles={visibleArticles}
    searchPool={searchPool}
    topic={topic}
    topicCounts={topicCounts}
    onSelectJournal={selectJournal}
    onSelectTopic={setTopic}
    limit={limit}
    showArchiveLink={showArchiveLink}
    hasArticleFilters={hasArticleFilters}
    onResetFilters={resetFilters}
    wrapperId="artikel"
    wrapperRef={articleRef}
  />;

  const directory = <JournalDirectory
    split={split}
    side={side}
    combined={!split}
    query={query}
    onQueryChange={setQuery}
    category={category}
    onChooseCategory={chooseCategory}
    journals={filteredJournals}
    selectedJournal={selectedJournal}
    onShowArticles={showArticles}
    articleCount={searchPool.length}
    onReset={resetFilters}
  >{split ? null : articleBlock}</JournalDirectory>;

  if (split) {
    return <>
      <section className="journal-finder is-sidebar" id="jurnal" aria-labelledby="journal-finder-heading">
        {directory}
      </section>
      <section className="articles-section" id="artikel" aria-labelledby="published-articles-heading">
        <ArticleArchive />
      </section>
    </>;
  }

  return <section className={`journal-finder${side ? ' is-sidebar' : ''}`} id="jurnal" aria-labelledby="journal-finder-heading">
    {directory}
  </section>;
}
