import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { articleTopics, directoryJournals, journalArticles, journalAudit, journalCategories } from '../data/journal-directory';
import { formatAuthors } from '../lib/store';
import { Arrow, CloseIcon, EmptyState, SearchIcon, SmartLink, StatusPill } from './parts';

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
      <span className="journal-mark" aria-hidden="true">{journal.short}</span>
      <StatusPill tone={journal.statusTone}>{journal.status}</StatusPill>
    </div>
    <p className="directory-category">{journal.categoryLabel}</p>
    <h3>{journal.name}</h3>
    <p className="directory-meta"><span>E-ISSN {journal.eissn}</span><span>P-ISSN {journal.pissn}</span></p>
    <p className="directory-description">{journal.description}</p>
    <ul className="directory-topics" aria-label={`Topik ${journal.short}`}>
      {journal.topics.slice(0, 3).map(topic => <li key={topic}>{topic}</li>)}
    </ul>
    {selected && <p className="directory-state">Sedang ditampilkan di pratinjau</p>}
    <div className="directory-footer">
      <button type="button" className="finder-text-button" onClick={() => onArticles(journal.id)}>
        {count ? `Lihat ${count} artikel` : 'Lihat profil'} <Arrow />
      </button>
      <SmartLink href={journal.url} className="text-link" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {visitLabel(journal)} <Arrow diagonal />
      </SmartLink>
    </div>
    {journal.indexing.length > 0 && <p className="directory-indexing">Terindeks: {journal.indexing.join(' · ')}</p>}
  </article>;
}

function ArticleCard({ article }) {
  const journal = directoryJournals.find(item => item.id === article.journal);
  return <a className="article-card" href={article.url} target="_blank" rel="noopener noreferrer">
    <div className="article-meta">
      <span className="article-journal">{journal?.short}</span>
      <span>{article.volume}</span>
      <span>{article.year}</span>
      {article.pages && <span>hlm. {article.pages}</span>}
    </div>
    <h4>{article.title}</h4>
    <p className="article-authors">{formatAuthors(article.authors)}</p>
    <p className="article-excerpt">{article.excerpt}</p>
    <div className="article-footer">
      <ul className="article-topics">{article.topics.slice(0, 2).map(topic => <li key={topic}>{topic}</li>)}</ul>
      <span className="article-link">{article.doi ? 'DOI' : 'Buka artikel'} <Arrow diagonal /></span>
    </div>
  </a>;
}

export default function JournalFinder({ limit = 6, showArchiveLink = true, eyebrow = '01 / JURNAL ILMIAH KAMI' }) {
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
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="journal-finder-heading">Temukan jurnal yang sesuai dengan <em>bidang penelitian</em> Anda.</h2>
      </div>
      <div className="finder-head-aside">
        <p>Dari berbagai disiplin ilmu. Pilih jurnal, telusuri topik, lalu buka pratinjau artikel yang sudah terbit.</p>
        <p className="finder-audit"><span aria-hidden="true" />Data JETSI diaudit {journalAudit.checkedAt} · {journalArticles.length} artikel OJS · verifikasi GARUDA &amp; Crossref</p>
      </div>
    </div>

    <div className="finder-toolbar">
      <div className="finder-search" role="search">
        <SearchIcon />
        <label className="sr-only" htmlFor="journal-search">Cari nama jurnal, topik, atau judul artikel</label>
        <input id="journal-search" type="search" value={query} placeholder="Cari nama jurnal, topik, atau judul artikel..." onChange={event => setQuery(event.target.value)} />
        {query && <button type="button" className="search-clear" onClick={() => setQuery('')}><CloseIcon /><span>Hapus</span></button>}
      </div>
      <p className="finder-result" role="status" aria-live="polite">{filteredJournals.length} jurnal · {searchPool.length} artikel</p>
    </div>

    <div className="filter-row" role="group" aria-label="Filter bidang jurnal">
      <span className="filter-label">Bidang</span>
      {journalCategories.map(item => <button key={item.id} type="button" className={`filter-chip ${category === item.id ? 'is-active' : ''}`} aria-pressed={category === item.id} onClick={() => chooseCategory(item.id)}>
        {item.label} <span className="filter-count">{categoryCount(item.id)}</span>
      </button>)}
    </div>

    {filteredJournals.length === 0 && searchPool.length === 0
      ? <EmptyState title="Tidak ada hasil" copy="Tidak ada jurnal atau artikel yang cocok dengan pencarian Anda. Coba kata kunci lain, atau kembali ke seluruh bidang dan topik." action={<button className="button button-dark" type="button" onClick={resetFilters}>Reset pencarian</button>} />
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
        {filteredJournals.length === 0 && <EmptyState title="Jurnal tidak ditemukan di bidang ini" copy="Artikel yang cocok tetap ditampilkan di bawah. Kembalikan filter bidang untuk melihat jurnal yang sesuai." action={<button className="button button-dark" type="button" onClick={resetFilters}>Lihat semua bidang</button>} />}

        <div className="article-preview" id="artikel" ref={articleRef}>
          <div className="article-preview-head">
            <div>
              <p className="eyebrow">PRATINJAU ARTIKEL</p>
              <h3>Jelajahi isi jurnal</h3>
            </div>
            <p className="result-count">{visibleArticles.length < articles.length ? `${visibleArticles.length} dari ${articles.length} artikel` : `${articles.length} artikel`} · {activeJournal.short}</p>
          </div>

          <div className="journal-tabs" role="group" aria-label="Pilih jurnal untuk pratinjau">
            {directoryJournals.map(journal => {
              const count = searchPool.filter(article => article.journal === journal.id).length;
              return <button key={journal.id} type="button" aria-pressed={selectedJournal === journal.id} className={`journal-tab ${selectedJournal === journal.id ? 'is-active' : ''}`} onClick={() => { setSelectedJournal(journal.id); setTopic(ALL_TOPICS); }}>
                <span>{journal.short}</span><small>{count} artikel</small>
              </button>;
            })}
          </div>

          {searchJournalPool.length > 0 && <div className="filter-row topic-row" role="group" aria-label={`Filter topik ${activeJournal.short}`}>
            <span className="filter-label">Topik</span>
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
            <p className="article-empty-mark" aria-hidden="true">↳</p>
            <div>
              <h4>{hasArticleFilters ? 'Belum ada artikel yang cocok' : `${activeJournal.short} membuka ruang untuk naskah pertama`}</h4>
              <p>{hasArticleFilters
                ? 'Coba topik atau kata kunci lain, atau pilih jurnal berbeda di atas. Semua artikel yang tampil berasal dari data terbitan yang sudah diaudit.'
                : `${activeJournal.name} belum memiliki artikel terbit. Profil, ruang lingkup, dan panggilan naskah tetap dapat dijelajahi di platform jurnal.`}</p>
              <div className="article-empty-actions">
                {hasArticleFilters && <button type="button" className="text-link finder-text-button" onClick={() => { setQuery(''); setTopic(ALL_TOPICS); }}>Reset filter <Arrow /></button>}
                <SmartLink href={activeJournal.url} className="text-link" {...(/^https?:/i.test(activeJournal.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>Buka platform {activeJournal.short} <Arrow diagonal /></SmartLink>
              </div>
            </div>
          </div>}

          <div className="article-preview-footer">
            <p>{limit < articles.length
              ? `Menampilkan ${visibleArticles.length} dari ${articles.length} artikel ${activeJournal.short}. Sumber data: OJS, GARUDA, dan Crossref.`
              : hasArticleFilters
                ? `${articles.length} artikel cocok dengan filter aktif. Sumber data: OJS, GARUDA, dan Crossref.`
                : journalAudit.notes}</p>
            {showArchiveLink && <Link to="/journals" className="text-link">Lihat direktori lengkap <Arrow /></Link>}
          </div>
        </div>
      </>}
  </section>;
}
