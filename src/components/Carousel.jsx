import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useAnimationPreference } from './motion-preference';
import { Arrow } from './parts';

// Generic horizontal slider on a native scroll-snap track, so touch, trackpad, and keyboard
// focus work without the arrows; the arrows step one slide at a time. Same mechanics as the
// NordeoNews story carousel, reused for the journal cards.
export default function Carousel({ items, renderItem, getKey = item => item.id, label, className = '', prevLabel = 'Previous', nextLabel = 'Next' }) {
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
    const track = trackRef.current;
    if (!track) return undefined;
    track.scrollLeft = 0;
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, items]);

  const step = direction => {
    const track = trackRef.current;
    const slide = track?.firstElementChild;
    if (!slide) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: reduced ? 'auto' : 'smooth' });
  };

  return <div className={`story-carousel ${className}`.trim()} role="region" aria-roledescription="carousel" aria-label={label} data-static={edges.start && edges.end}>
    <ul className="carousel-track" id={trackId} ref={trackRef} onScroll={measure}>
      {items.map((item, index) => <li key={getKey(item)} className="carousel-slide" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}`}>{renderItem(item, index)}</li>)}
    </ul>
    <button type="button" className="carousel-arrow is-prev" aria-controls={trackId} aria-label={prevLabel} disabled={edges.start} onClick={() => step(-1)}><Arrow /></button>
    <button type="button" className="carousel-arrow is-next" aria-controls={trackId} aria-label={nextLabel} disabled={edges.end} onClick={() => step(1)}><Arrow /></button>
  </div>;
}
