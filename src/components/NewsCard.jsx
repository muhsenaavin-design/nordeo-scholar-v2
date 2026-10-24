import { Link } from 'react-router';
import { formatDate } from '../lib/store';
import { Arrow } from './parts';

export default function NewsCard({ story, base = '/news', featured = false }) {
  return <article className={`story-card ${featured ? 'story-featured' : ''}`}>
    <Link className="story-card-link" to={`${base}/${story.slug}`}>
      <figure className="story-cover">
        <img src={story.cover} alt={story.coverAlt} width="1600" height="1000" loading={featured ? 'eager' : 'lazy'} />
        <span className="story-category">{story.category}</span>
        {featured && <span className="story-featured-label">Laporan utama</span>}
      </figure>
      <div className="story-body">
        <p className="story-meta"><span>{formatDate(story.date)}</span><span>{story.readTime}</span></p>
        <h3>{story.title}</h3>
        <p className="story-dek">{story.dek}</p>
        <span className="story-read">Baca cerita <Arrow /></span>
      </div>
    </Link>
  </article>;
}

export function SideStory({ story, base = '/news' }) {
  return <Link className="side-story" to={`${base}/${story.slug}`}>
    <img src={story.cover} alt={story.coverAlt} width="1600" height="1000" loading="lazy" />
    <div>
      <p className="story-meta"><span>{story.category}</span><span>{formatDate(story.date, { day: 'numeric', month: 'short' })}</span></p>
      <h3>{story.title}</h3>
    </div>
  </Link>;
}
