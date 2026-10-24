import { useState } from 'react';
import { Link } from 'react-router';
import { editorialDesks, newsCategories, newsSteps } from '../../data/news';
import { publishedNews } from '../../lib/store';
import { siteBase } from '../../lib/site';
import NewsCard, { SideStory } from '../../components/NewsCard';
import { Arrow, useDocumentTitle } from '../../components/parts';

export default function NewsHome() {
  useDocumentTitle('Newsroom');
  const base = siteBase('news');
  const stories = publishedNews();
  const featured = stories.find(story => story.featured) || stories[0];
  const others = stories.filter(story => story.id !== featured.id);
  const [category, setCategory] = useState('Semua');
  const used = newsCategories.filter(item => stories.some(story => story.category === item));
  const filtered = category === 'Semua' ? others : stories.filter(story => story.category === category);

  return <>
    <section className="news-masthead container" aria-labelledby="news-heading">
      <h1 id="news-heading" lang="en">Knowledge, <em>in conversation.</em></h1>
      <div className="masthead-foot">
        <p className="page-intro">Kabar riset, catatan editor, dan cerita kampus — ditulis untuk dibaca publik, disunting dengan standar akademik.</p>
        <div className="button-row">
          <Link to={`${base}/kirim`} className="button button-dark">Kirim berita</Link>
          <Link to={`${base}/panduan`} className="button button-outline">Panduan publikasi</Link>
        </div>
      </div>
    </section>

    <section className="news-lead container" id="terbaru" aria-labelledby="lead-heading">
      <h2 id="lead-heading" className="sr-only">Laporan utama</h2>
      <NewsCard story={featured} base={base} featured />
      <div className="news-side">
        <h2 className="side-heading">Terbaru</h2>
        {others.slice(0, 3).map(story => <SideStory key={story.id} story={story} base={base} />)}
      </div>
    </section>

    <section className="news-latest container section-space" aria-labelledby="latest-heading">
      <div className="section-heading" data-reveal>
        <div><h2 id="latest-heading">Semua <em>cerita.</em></h2></div>
        <div className="filter-row" role="group" aria-label="Filter rubrik">
          {['Semua', ...used].map(item => <button key={item} type="button" className={`filter-chip ${category === item ? 'is-active' : ''}`} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </div>
      <p className="sr-only" role="status">{filtered.length} cerita</p>
      <div className="story-grid">{filtered.map(story => <NewsCard key={story.id} story={story} base={base} />)}</div>
      <p className="sample-note">Artikel yang tampil saat ini adalah konten contoh redaksi untuk pratinjau tata letak Newsroom.</p>
    </section>

    <section className="news-desks container" id="rubrik" aria-labelledby="desks-heading">
      <div className="section-heading" data-reveal><div><h2 id="desks-heading">Tiga meja, <em>satu standar.</em></h2></div><p>Setiap rubrik punya pembaca yang berbeda, tetapi diperiksa dengan cara yang sama: sumber jelas, kutipan disetujui, gambar berlisensi.</p></div>
      <div className="desk-grid">{editorialDesks.map((desk, index) => <article key={desk.title} className="desk-card" data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}>
        <img src={desk.image} alt={desk.alt} width="800" height="500" loading="lazy" decoding="async" />
        <h3>{desk.title}</h3><p>{desk.copy}</p>
      </article>)}</div>
    </section>

    <section className="contribute-band" aria-labelledby="contribute-heading">
      <div className="container contribute-inner">
        <div data-reveal>
          <h2 id="contribute-heading">Punya kabar riset? <em>Kirim ke redaksi.</em></h2>
          <p>Enam langkah dari bahan mentah sampai tayang. Isi formulir, tentukan jadwal tayang, unggah gambar highlight, dan biarkan asisten draf membantu merapikan struktur.</p>
          <div className="button-row"><Link to={`${base}/kirim`} className="button button-gold">Mulai kirim berita</Link><Link to={`${base}/panduan`} className="text-link">Baca panduan lengkap <Arrow /></Link></div>
        </div>
        <ol className="contribute-steps">{newsSteps.map(step => <li key={step.number} data-reveal><span>{step.number}</span><strong>{step.title}</strong><small>{step.duration}</small></li>)}</ol>
      </div>
    </section>
  </>;
}
