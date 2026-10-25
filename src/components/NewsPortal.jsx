import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatDate } from '../lib/store';
import { useAnimationPreference } from './motion-preference';
import { Arrow } from './parts';

// Horizontal story slider. The track is a native scroll-snap list, so touch, trackpad,
// and keyboard focus all work without the arrows; the arrows step one card at a time.
export function StoryCarousel({ stories, base = '/news', label = 'Cerita pilihan' }) {
  const trackRef = useRef(null);
  const trackId = useId();
  const { reduced } = useAnimationPreference();
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setEdges({ start: track.scrollLeft <= 2, end: track.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, [measure, stories]);

  const step = direction => {
    const track = trackRef.current;
    const slide = track?.firstElementChild;
    if (!slide) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: reduced ? 'auto' : 'smooth' });
  };

  return <div className="story-carousel" role="region" aria-roledescription="carousel" aria-label={label} data-static={edges.start && edges.end}>
    <ul className="carousel-track" id={trackId} ref={trackRef} onScroll={measure}>
      {stories.map(story => <li key={story.id} className="carousel-slide">
        <Link className="carousel-card" to={`${base}/${story.slug}`}>
          <figure className="carousel-cover">
            <img src={story.cover} alt={story.coverAlt} width="1600" height="1000" loading="lazy" decoding="async" />
            <span className="story-category">{story.category}</span>
          </figure>
          <p className="story-meta"><span>{formatDate(story.date)}</span><span>{story.readTime}</span></p>
          <h3>{story.title}</h3>
        </Link>
      </li>)}
    </ul>
    <button type="button" className="carousel-arrow is-prev" aria-controls={trackId} aria-label="Cerita sebelumnya" disabled={edges.start} onClick={() => step(-1)}><Arrow /></button>
    <button type="button" className="carousel-arrow is-next" aria-controls={trackId} aria-label="Cerita berikutnya" disabled={edges.end} onClick={() => step(1)}><Arrow /></button>
  </div>;
}

export function HeadlineList({ stories, base = '/news' }) {
  return <ol className="headline-list">
    {stories.map(story => <li key={story.id}>
      <Link to={`${base}/${story.slug}`}>
        <span className="story-meta"><span>{story.category}</span><span>{formatDate(story.date, { day: 'numeric', month: 'short' })}</span></span>
        <strong>{story.title}</strong>
      </Link>
    </li>)}
  </ol>;
}
