import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ecosystems, founder } from '../data/ecosystems';
import { faqs, indexingServices, partners, testimonials } from '../data/company';
import { newsCategoryEn } from '../data/news';
import { programTypeEn, trainingPrograms } from '../data/training';
import { contact } from '../config/links';
import { ecosystemHref } from '../lib/site';
import { formatDate, popularNews, publishedNews } from '../lib/store';
import { BlurText, ScrollWords } from './effects';
import { useAnimationPreference } from './motion-preference';
import { Arrow, SmartLink } from './parts';

const pad = number => String(number).padStart(2, '0');

/* ── Hero slideshow (option A of the UX audit, Nov 2026) ─────────────────────
   Pattern: full-bleed crossfade with a slow zoom, a labelled rail along the bottom whose
   active segment fills as the slide runs, and side arrows. Each slide carries its own
   kicker, headline, and button, so the rail labels lead somewhere. There is no pause
   button: clicking the running segment pauses or resumes. The slideshow also stops while
   the pointer or focus is on it, while the tab is hidden, and under reduced motion. The
   fill animation drives the timing, so pausing it pauses the slideshow too. */
const heroSlides = [
  { id: 'nordeo', label: 'Nordeo Scholar', kicker: 'Nordeo Scholar Publishing', lead: 'Advancing Knowledge.', accent: 'Creating Global Impact.', copy: 'An academic publishing and research support company: peer-reviewed journals, media & news, training, and books in one ecosystem.', cta: 'Discover the ecosystem', href: () => '/#ecosystem', src: '/assets/generated/hero-library-v2.webp', width: 1672, height: 940 },
  { id: 'journals', label: 'Journals', kicker: 'Journals', lead: 'Peer-reviewed,', accent: 'open access.', copy: 'JETSI, JIEL, JIBDI, and Jurnal Pengmas: open-access journals with double-blind review.', cta: 'Browse the journals', href: () => '/#journals' },
  { id: 'news', label: 'NordeoNews', kicker: 'NordeoNews', lead: 'Research news,', accent: 'written to be read.', copy: 'Research news, editor’s notes, and campus stories, with an open submission desk.', cta: 'Enter NordeoNews', href: () => ecosystemHref('news') },
  { id: 'training', label: 'Academy', kicker: 'Academy', lead: 'From first draft', accent: 'to submission.', copy: 'Seminars, conferences, and training modules for researchers and lecturers.', cta: 'See the Academy calendar', href: () => '/#academy' },
  { id: 'books', label: 'Books', kicker: 'Books · Coming soon', lead: 'Longer ideas,', accent: 'coming soon.', copy: 'Monographs, edited volumes, and academic reference books.', cta: 'See the plan', href: () => ecosystemHref('books') },
].map(slide => {
  const eco = ecosystems.find(item => item.id === slide.id);
  return eco ? { ...slide, src: eco.image, width: 1600, height: 1195 } : slide;
});

export function HeroSlideshow({ notice = null }) {
  const { reduced } = useAnimationPreference();
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [paused, setPaused] = useState(false);
  const count = heroSlides.length;
  const go = next => setIndex((next + count) % count);
  const running = !reduced && !held && !hidden && !paused;

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const railClick = i => {
    if (i === index) { if (!reduced) setPaused(value => !value); return; }
    go(i);
    setPaused(false);
  };

  return <div className="hero-slides" data-running={running} onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)} onFocusCapture={() => setHeld(true)} onBlurCapture={() => setHeld(false)}>
    <div className="hero-visual" aria-hidden="true">
      {heroSlides.map((slide, i) => <img key={slide.id} className={`hero-image ${i === index ? 'is-active' : ''}`} src={slide.src} alt="" width={slide.width} height={slide.height} decoding="async" {...(i === 0 ? { fetchPriority: 'high' } : { loading: 'lazy' })} />)}
    </div>
    <div className="hero-copy">
      {notice}
      <div className="hero-slide-copies">
        {heroSlides.map((slide, i) => {
          const active = i === index;
          const first = i === 0;
          // Slide 1 keeps its h1 in the accessibility tree even while another slide shows.
          const offstage = !active && !first;
          return <div key={slide.id} className={`hero-slide-copy ${active ? 'is-active' : ''} ${first ? 'is-first' : ''}`.trim()} aria-hidden={offstage || undefined} inert={offstage || undefined}>
            <p className="hero-kicker">{slide.kicker}</p>
            {first
              ? <h1 id="hero-heading" className="hero-slide-title"><span className="line-mask"><span>{slide.lead}</span></span>{' '}<span className="line-mask"><span className="hero-heading-accent">{slide.accent}</span></span></h1>
              : <p className="hero-slide-title"><span>{slide.lead}</span> <span className="hero-heading-accent">{slide.accent}</span></p>}
            <p className="hero-description">{first ? <BlurText text={slide.copy} /> : slide.copy}</p>
            <div className="hero-actions"><SmartLink href={slide.href()} className="button button-yellow" tabIndex={active ? undefined : -1}>{slide.cta}</SmartLink></div>
          </div>;
        })}
      </div>
    </div>
    <button type="button" className="hero-arrow is-prev" aria-label="Previous slide" onClick={() => go(index - 1)}><Arrow /></button>
    <button type="button" className="hero-arrow is-next" aria-label="Next slide" onClick={() => go(index + 1)}><Arrow /></button>
    <div className="hero-rail">
      <div className="hero-rail-items" role="group" aria-label="Slides">
        {heroSlides.map((slide, i) => {
          const active = i === index;
          const label = active ? `${slide.label}: ${paused ? 'resume' : 'pause'} slideshow` : `Show ${slide.label}`;
          return <button key={slide.id} type="button" className="hero-rail-item" aria-current={active ? 'true' : undefined} aria-pressed={active && !reduced ? paused : undefined} aria-label={label} onClick={() => railClick(i)}>
            <span className="hero-rail-label" aria-hidden="true">{slide.label}</span>
            <span className="hero-rail-track" aria-hidden="true">
              {active && <span key={index} className="hero-rail-fill" onAnimationEnd={() => go(index + 1)} />}
            </span>
          </button>;
        })}
      </div>
    </div>
  </div>;
}

/* ── About Nordeo: one short manifesto between the hero and the four rooms ─────
   Option A of the About audit (Nov 2026), after Vertix Advisory and Cavell Partners:
   a small label, one centred statement whose words fill from grey to ink as it scrolls
   (closing line in teal), the founder's line, and two pill links. Our Vision, the company
   overview, and the founder's note used to be three stacked sections; the full profile
   lives on /about and /founder. Reduced motion shows the finished statement. */
export function CompanyOverview() {
  return <section id="about" className="home-about container" aria-labelledby="home-about-heading">
    <h2 id="home-about-heading" className="home-about-label" data-reveal>About Nordeo</h2>
    <ScrollWords
      className="home-about-statement"
      text="Nordeo Scholar brings journals, news, training, and books under one roof, so research can"
      accent="advance knowledge and create global impact."
    />
    <figure className="home-about-quote" data-reveal>
      <img src={founder.photoSmall} alt="" width="40" height="40" loading="lazy" decoding="async" />
      <blockquote>“Good research deserves a clear, honest path to its readers.”</blockquote>
      <figcaption><strong>{founder.name}</strong> Founder &amp; CEO</figcaption>
    </figure>
    <div className="home-about-links" data-reveal style={{ '--reveal-delay': '80ms' }}>
      <Link to="/about" className="pill-cta is-dark">More about Nordeo <span className="pill-cta-icon"><Arrow /></span></Link>
      <Link to="/founder" className="pill-cta">Meet the founder <span className="pill-cta-icon"><Arrow /></span></Link>
    </div>
  </section>;
}

/* ── NordeoNews: lead story + popular ranking (full width) ────────────────────
   Pattern: an editorial lead beside a numbered "most read" list. The order comes from
   popularNews(): pinned by editors first, then by views. */
export function NewsSpotlight() {
  const stories = popularNews(publishedNews()).slice(0, 5);
  if (!stories.length) return null;
  const [lead, ...rest] = stories;
  const href = story => ecosystemHref('news', `/${story.slug}`);
  const meta = story => `${newsCategoryEn[story.category] || story.category} · ${formatDate(story.date, { day: 'numeric', month: 'short', year: 'numeric' }, 'en-GB')}`;
  return <section className="nn-section section-space container" aria-labelledby="nn-heading">
    <div className="section-heading" data-reveal>
      <h2 id="nn-heading">What’s moving <em>across Nordeo.</em></h2>
      <p>Popular stories from NordeoNews.</p>
    </div>
    <div className="nn-grid">
      <article className="nn-lead" data-reveal>
        <SmartLink href={href(lead)} className="nn-lead-link">
          <figure className="nn-lead-cover"><img src={lead.cover} alt={lead.coverAlt || ''} width="1600" height="1000" loading="lazy" decoding="async" /><span className="nn-rank-badge">01</span></figure>
          <p className="nn-meta">{meta(lead)}</p>
          <h3>{lead.titleEn || lead.title}</h3>
          {lead.dekEn && <p className="nn-dek">{lead.dekEn}</p>}
        </SmartLink>
      </article>
      <div className="nn-popular" data-reveal style={{ '--reveal-delay': '120ms' }}>
        <div className="nn-popular-head">
          <h3><span className="nn-brand">NordeoNews</span> Popular stories</h3>
          <SmartLink href={ecosystemHref('news')} className="text-link">All stories <Arrow /></SmartLink>
        </div>
        <ol className="nn-list">
          {rest.map((story, i) => <li key={story.id}><SmartLink href={href(story)}>
            <span className="nn-rank">{pad(i + 2)}</span>
            <span className="nn-item"><small>{meta(story)}</small><strong>{story.titleEn || story.title}</strong></span>
            <Arrow />
          </SmartLink></li>)}
        </ol>
        <SmartLink href={ecosystemHref('news', '/kirim')} className="button button-outline">Submit your story</SmartLink>
      </div>
    </div>
  </section>;
}

/* ── Academy calendar (new section under NordeoNews) ──────────────────────────
   Pattern: month grid with event days marked, beside a panel that lists the selected
   day's events. Programmes without a confirmed day are listed under "Date to be announced". */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const parseDay = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const isoDay = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const monthLabel = date => date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const longDay = iso => parseDay(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function monthCells(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
}

export function AcademyCalendar() {
  const today = isoDay(new Date());
  const dated = useMemo(() => trainingPrograms.filter(program => program.date).sort((a, b) => a.date.localeCompare(b.date)), []);
  const undated = trainingPrograms.filter(program => !program.date);
  const firstUpcoming = dated.find(program => program.date >= today) || dated[0];
  const [month, setMonth] = useState(() => { const start = parseDay(firstUpcoming?.date || today); return new Date(start.getFullYear(), start.getMonth(), 1); });
  const [selected, setSelected] = useState(firstUpcoming?.date || null);
  // Phones get the agenda first; the month grid opens from a button (UX audit, Nov 2026).
  const [gridOpen, setGridOpen] = useState(false);
  const upcoming = dated.filter(program => program.date >= today);
  const byDay = useMemo(() => dated.reduce((map, program) => map.set(program.date, [...(map.get(program.date) || []), program]), new Map()), [dated]);
  const shift = step => setMonth(current => new Date(current.getFullYear(), current.getMonth() + step, 1));
  const inMonth = dated.filter(program => { const day = parseDay(program.date); return day.getFullYear() === month.getFullYear() && day.getMonth() === month.getMonth(); });
  const panel = selected && byDay.get(selected) && parseDay(selected).getMonth() === month.getMonth() ? byDay.get(selected) : inMonth;
  const programHref = program => ecosystemHref('training', `/program/${program.id}`);

  return <section id="academy" className="academy-section section-space" aria-labelledby="academy-heading">
    <div className="container">
      <div className="section-heading" data-reveal>
        <h2 id="academy-heading">Academy <em>calendar.</em></h2>
        <div className="section-heading-aside">
          <p>Seminars, conferences, and classes from the Nordeo Academy.</p>
          <SmartLink href={ecosystemHref('training', '/#jadwal')} className="text-link">All programs <Arrow /></SmartLink>
        </div>
      </div>
      <div className="academy-grid" data-grid={gridOpen ? 'open' : 'closed'}>
        {upcoming.length > 0 && <ol className="cal-agenda" aria-label="Upcoming programmes">
          {upcoming.map(program => {
            const day = parseDay(program.date);
            return <li key={program.id}><SmartLink href={programHref(program)}>
              <span className="cal-agenda-date"><b>{day.getDate()}</b><small>{day.toLocaleDateString('en-GB', { month: 'short' })}</small></span>
              <span className="cal-agenda-body">
                <span className="cal-event-type">{programTypeEn[program.type] || program.type} · Tentative</span>
                <strong>{program.titleEn || program.title}</strong>
                <small>{day.toLocaleDateString('en-GB', { weekday: 'long' })} · {program.mode}</small>
              </span>
            </SmartLink></li>;
          })}
        </ol>}
        <button type="button" className="cal-toggle" aria-expanded={gridOpen} aria-controls="academy-month" onClick={() => setGridOpen(value => !value)}>{gridOpen ? 'Hide month calendar' : 'View month calendar'}</button>
        <div className="cal" id="academy-month" data-reveal>
          <div className="cal-head">
            <button type="button" className="cal-nav" aria-label="Previous month" onClick={() => shift(-1)}><Arrow /></button>
            <h3 aria-live="polite">{monthLabel(month)}</h3>
            <button type="button" className="cal-nav is-next" aria-label="Next month" onClick={() => shift(1)}><Arrow /></button>
          </div>
          <table className="cal-table">
            <thead><tr>{WEEKDAYS.map(day => <th key={day} scope="col" abbr={day}>{day.slice(0, 2)}</th>)}</tr></thead>
            <tbody>
              {monthCells(month).map((week, row) => <tr key={row}>{week.map((day, col) => {
                if (!day) return <td key={col} />;
                const iso = isoDay(day);
                const events = byDay.get(iso);
                const flags = `${iso === today ? ' is-today' : ''}${iso === selected ? ' is-selected' : ''}`;
                return <td key={col}>{events
                  ? <button type="button" className={`cal-day has-event${flags}`} aria-pressed={iso === selected} aria-label={`${longDay(iso)}, ${events.length} ${events.length === 1 ? 'programme' : 'programmes'}`} onClick={() => setSelected(iso)}>{day.getDate()}{events.length > 1 && <span className="cal-count">{events.length}</span>}</button>
                  : <span className={`cal-day${flags}`}>{day.getDate()}</span>}</td>;
              })}</tr>)}
            </tbody>
          </table>
          <p className="cal-legend"><span className="cal-key is-event" /> Programme <span className="cal-key is-today" /> Today</p>
        </div>
        <div className="cal-panel" data-reveal style={{ '--reveal-delay': '120ms' }}>
          <p className="cal-panel-label">{panel === inMonth ? `In ${monthLabel(month)}` : longDay(selected)}</p>
          {panel.length ? <ol className="cal-events">
            {panel.map(program => <li key={program.id}><SmartLink href={programHref(program)}>
              <span className="cal-event-type">{programTypeEn[program.type] || program.type}</span>
              <strong>{program.titleEn || program.title}</strong>
              <small>{longDay(program.date)} · {program.mode} · <span className="cal-tentative">Tentative</span></small>
            </SmartLink></li>)}
          </ol> : <p className="cal-empty">No programme is scheduled this month yet.</p>}
          {undated.length > 0 && <div className="cal-tba">
            <p className="cal-panel-label">Date to be announced</p>
            <ul>{undated.map(program => <li key={program.id}><SmartLink href={programHref(program)}><span>{programTypeEn[program.type] || program.type}</span>{program.titleEn || program.title}</SmartLink></li>)}</ul>
          </div>}
          <SmartLink href={ecosystemHref('training', '/daftar')} className="button button-gold">Register interest</SmartLink>
        </div>
      </div>
    </div>
  </section>;
}

/* ── Logo strip, testimonials, and FAQ (new, before Contact) ───────────────── */
function LogoTicker({ items, label }) {
  const { reduced } = useAnimationPreference();
  const row = list => list.map(item => <li key={item.name}>{item.logo ? <img src={item.logo} alt={item.name} height="40" loading="lazy" decoding="async" /> : <span className="ticker-word">{item.name}</span>}{item.note && <small>{item.note}</small>}</li>);
  return <div className="ticker" data-static={reduced}>
    <p className="ticker-label">{label}</p>
    <div className="ticker-window">
      <ul className="ticker-track">{row(items)}</ul>
      {!reduced && <ul className="ticker-track" aria-hidden="true">{row(items)}</ul>}
    </div>
  </div>;
}

function TestimonialReel() {
  const [index, setIndex] = useState(0);
  const item = testimonials[index];
  const go = step => setIndex(current => (current + step + testimonials.length) % testimonials.length);
  return <div className="reel container">
    <div className="reel-aside">
      <h3>What authors say</h3>
      {testimonials.length > 1 && <div className="reel-nav">
        <button type="button" className="cal-nav" aria-label="Previous testimonial" onClick={() => go(-1)}><Arrow /></button>
        <button type="button" className="cal-nav is-next" aria-label="Next testimonial" onClick={() => go(1)}><Arrow /></button>
      </div>}
    </div>
    <figure className="reel-quote" aria-live="polite">
      <blockquote>“{item.quote}”</blockquote>
      <figcaption>{item.photo && <img src={item.photo} alt="" width="56" height="56" loading="lazy" />}<span><strong>{item.name}</strong>{[item.role, item.institution].filter(Boolean).join(', ')}</span></figcaption>
    </figure>
  </div>;
}

export function TrustAndFaq() {
  return <section className="trust-section section-space" aria-labelledby="faq-heading">
    {partners.length > 0 && <LogoTicker items={partners} label="Our partners" />}
    <LogoTicker items={indexingServices} label="Registered and indexed with" />
    {testimonials.length > 0 && <TestimonialReel />}
    <div className="container faq-grid">
      <div className="faq-aside" data-reveal>
        <h2 id="faq-heading">Questions, <em>answered.</em></h2>
        <p>Still unsure? Write to the team and we will point you to the right journal, desk, or class.</p>
        <a className="button button-dark" href={`mailto:${contact.general}`}>{contact.general}</a>
      </div>
      <div className="qa-list" data-reveal style={{ '--reveal-delay': '120ms' }}>
        {faqs.map((item, i) => <details key={item.q} className="faq-item" open={i === 0}>
          <summary><span>{item.q}</span><span className="faq-icon" aria-hidden="true" /></summary>
          <p>{item.a}</p>
        </details>)}
      </div>
    </div>
  </section>;
}
