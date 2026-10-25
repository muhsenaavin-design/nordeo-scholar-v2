import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { formatDate, getNewsBySlug, publishedNews } from '../../lib/store';
import { siteBase } from '../../lib/site';
import { SideStory } from '../../components/NewsCard';
import { Arrow, useDocumentTitle } from '../../components/parts';
import { LegalPage } from '../InfoPages';

function Block({ block }) {
  if (block.type === 'h2') return <h2>{block.text}</h2>;
  if (block.type === 'quote') return <blockquote><p>{block.text}</p></blockquote>;
  if (block.type === 'list') return <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
  return <p>{block.text}</p>;
}

export default function NewsArticle() {
  const { slug } = useParams();
  const story = getNewsBySlug(slug);
  const base = siteBase('news');
  const [copied, setCopied] = useState(false);
  useDocumentTitle(story?.title || null);
  if (!story) return <LegalPage />;
  const related = publishedNews().filter(item => item.id !== story.id && item.category === story.category).concat(publishedNews().filter(item => item.id !== story.id && item.category !== story.category)).slice(0, 3);
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  };

  return <article className="news-article">
    <header className="container article-header">
      <Link to={`${base}/`} className="back-link">Kembali ke NordeoNews</Link>
      <h1>{story.title}</h1>
      <p className="article-dek">{story.dek}</p>
      <div className="article-byline">
        <span className="byline-category">{story.category}</span>
        <span><strong>{story.author}</strong>{story.authorRole}</span>
        <span>{formatDate(story.date)}</span>
        <span>{story.readTime} baca</span>
        <button type="button" className="text-link finder-text-button" onClick={copy}>{copied ? 'Tautan disalin' : 'Salin tautan'}</button>
      </div>
    </header>
    <figure className="article-cover container"><img src={story.cover} alt={story.coverAlt} width="1600" height="1000" decoding="async" /></figure>
    <div className="container article-layout">
      <div className="article-body">{story.body.map((block, index) => <Block key={index} block={block} />)}</div>
      <aside className="article-aside">
        <h2 className="side-heading">Baca juga</h2>
        {related.map(item => <SideStory key={item.id} story={item} base={base} />)}
        <div className="aside-cta"><strong>Punya kabar riset?</strong><p>Kirim ke redaksi lewat formulir lima langkah.</p><Link to={`${base}/kirim`} className="text-link">Kirim berita <Arrow /></Link></div>
      </aside>
    </div>
  </article>;
}
