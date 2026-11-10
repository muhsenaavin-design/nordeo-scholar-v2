import { useMemo, useRef, useState } from 'react';
import { articleTopics, directoryJournals, journalArticles } from '../data/journal-directory';
import JournalDirectory from './JournalDirectory';
import PublishedArticles from './PublishedArticles';

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
  // Split layout: the sidebar search belongs to the journal finder only, so the
  // article list below keeps its own journal tabs and focus-area filters.
  const articleSearch = split ? '' : search;

  const searchPool = useMemo(() => journalArticles.filter(article => articleMatches(article, articleSearch)), [articleSearch]);
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

  const hasArticleFilters = Boolean(articleSearch) || topic !== ALL_TOPICS;

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

  function resetArticleFilters() {
    if (split) {
      setTopic(ALL_TOPICS);
      return;
    }
    resetFilters();
  }

  const articleBlock = <PublishedArticles
    headingLevel={split ? 2 : 3}
    showLead={split}
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
    onResetFilters={resetArticleFilters}
    wrapperId={split ? undefined : 'artikel'}
    wrapperRef={split ? undefined : articleRef}
    featured={split}
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
      <section className="articles-section" id="artikel" aria-labelledby="published-articles-heading" ref={articleRef}>
        {articleBlock}
      </section>
    </>;
  }

  return <section className={`journal-finder${side ? ' is-sidebar' : ''}`} id="jurnal" aria-labelledby="journal-finder-heading">
    {directory}
  </section>;
}
