import { useState } from 'react';
import { Link } from 'react-router';
import { ecosystems, founder, journalFacts, principles } from '../data/ecosystems';
import { dateLabelEn, programTypeEn, trainingPrograms } from '../data/training';
import { newsCategoryEn } from '../data/news';
import { ecosystemHref } from '../lib/site';
import { formatDate, publishedNews } from '../lib/store';
import { subscribe } from '../lib/subscribe';
import { isEmail } from '../components/forms';
import { BlurText, CountUp, HeroImage, Magnet, Parallax, ScrollWords } from '../components/effects';
import { MotionNotice } from '../components/motion-preference';
import JournalFinder from '../components/JournalFinder';
import { Arrow, SmartLink, StatusPill, useDocumentTitle } from '../components/parts';

function Hero() {
  return <section className="hero container" aria-labelledby="hero-heading">
    <div className="hero-frame">
      <div className="hero-visual">
        <HeroImage src="/assets/generated/hero-library-v2.webp" alt="A grand teal library with open books in golden light" width="1672" height="940" />
      </div>
      <div className="hero-copy">
        <MotionNotice />
        <h1 id="hero-heading"><span className="line-mask"><span>Advancing Knowledge.</span></span>{' '}<span className="line-mask"><span className="hero-heading-accent">Creating Global Impact.</span></span></h1>
        <p className="hero-description"><BlurText text="An academic publishing and research support company: peer-reviewed journals, a newsroom, training, and books in one ecosystem." /></p>
        <div className="hero-actions">
          <Magnet><Link to="/journals" className="button button-light">Explore Journals</Link></Magnet>
          <Link to="/#ecosystem" className="button button-ghost">Discover the ecosystem</Link>
        </div>
      </div>
    </div>
  </section>;
}

function Metrics() {
  return <section className="metrics container" aria-label="Nordeo in numbers">
    <dl className="metrics-grid">{journalFacts.map(([label, value, suffix]) => <div key={label}>
      <dd><span className="sr-only">{value}{suffix}</span><span aria-hidden="true"><CountUp value={value} suffix={suffix} /></span></dd>
      <dt>{label}</dt>
    </div>)}</dl>
  </section>;
}

function EcosystemShowcase() {
  const [active, setActive] = useState(ecosystems[0].id);
  return <section className="ecosystem-section section-space container" id="ecosystem" aria-labelledby="ecosystem-heading">
    <div className="section-heading" data-reveal>
      <h2 id="ecosystem-heading">Four rooms, <em>one house of knowledge.</em></h2>
      <p>Journals for research, a Newsroom for stories, an Academy for skills, and Books for longer ideas.</p>
    </div>
    <div className="eco-panels">
      {ecosystems.map((item, index) => <article key={item.id} className={`eco-panel eco-${item.id}`} data-active={active === item.id} onPointerEnter={() => setActive(item.id)} onFocusCapture={() => setActive(item.id)} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}>
        <img src={item.image} alt={item.alt} width="1600" height="1195" loading="lazy" decoding="async" />
        <div className="eco-panel-shade" aria-hidden="true" />
        <div className="eco-panel-rail" aria-hidden="true"><strong>{item.short}</strong></div>
        <div className="eco-panel-body">
          <h3>{item.title}</h3>
          <p className="eco-description">{item.description}</p>
          <div className="eco-panel-foot">
            <StatusPill tone={item.tone}>{item.status}</StatusPill>
            <SmartLink href={ecosystemHref(item.id)} className="eco-cta">{item.cta} <Arrow /></SmartLink>
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}

function EcosystemPulse() {
  const stories = publishedNews().slice(0, 3);
  const programs = trainingPrograms.filter(program => program.type !== 'Modul Pelatihan').slice(0, 3);
  return <section className="pulse-section section-space container" aria-labelledby="pulse-heading">
    <div className="section-heading" data-reveal>
      <h2 id="pulse-heading">What’s moving <em>across Nordeo.</em></h2>
      <p>The latest from the Newsroom and the Academy calendar.</p>
    </div>
    <div className="pulse-grid">
      <div className="pulse-column" data-reveal>
        <div className="pulse-head"><h3>Newsroom</h3><SmartLink href={ecosystemHref('news')} className="text-link">All stories <Arrow /></SmartLink></div>
        <ol className="pulse-list">
          {stories.map(story => <li key={story.id}><SmartLink href={ecosystemHref('news', `/${story.slug}`)}>
            <img src={story.cover} alt="" width="160" height="110" loading="lazy" decoding="async" />
            <span><small>{newsCategoryEn[story.category] || story.category} · {formatDate(story.date, { day: 'numeric', month: 'short', year: 'numeric' }, 'en-GB')}</small><strong>{story.titleEn || story.title}</strong></span>
          </SmartLink></li>)}
        </ol>
        <SmartLink href={ecosystemHref('news', '/kirim')} className="button button-outline">Submit your story</SmartLink>
      </div>
      <div className="pulse-column pulse-dark" data-reveal style={{ '--reveal-delay': '120ms' }}>
        <div className="pulse-head"><h3>Academy</h3><SmartLink href={ecosystemHref('training', '/#jadwal')} className="text-link">All programs <Arrow /></SmartLink></div>
        <ol className="pulse-list pulse-agenda">
          {programs.map(program => <li key={program.id}><SmartLink href={ecosystemHref('training', `/program/${program.id}`)}>
            <span className="agenda-date">{programTypeEn[program.type] || program.type}</span>
            <span><small>{dateLabelEn[program.dateLabel] || program.dateLabel} · {program.mode}</small><strong>{program.titleEn || program.title}</strong></span>
          </SmartLink></li>)}
        </ol>
        <p className="pulse-note">Tentative schedule. Dates and facilitators will be announced.</p>
        <SmartLink href={ecosystemHref('training', '/daftar')} className="button button-gold">Register interest</SmartLink>
      </div>
    </div>
  </section>;
}

function Founder() {
  return <section id="about" className="founder-section" aria-labelledby="founder-heading">
    <figure className="founder-media" data-reveal>
      <Parallax className="founder-photo" distance={24}>
        <picture>
          <source media="(max-width: 640px)" srcSet={founder.photoSmall} />
          <img src={founder.photo} alt={`Portrait of ${founder.name}, founder of Nordeo Scholar`} width="1247" height="1261" loading="lazy" decoding="async" />
        </picture>
      </Parallax>
      <figcaption className="founder-name"><strong>{founder.name}, {founder.degrees}</strong><span>{founder.role}</span></figcaption>
    </figure>
    <div className="container founder-inner">
      <div className="founder-copy" data-reveal>
        <h2 id="founder-heading">Built by a researcher, <em>for researchers.</em></h2>
        <ScrollWords className="founder-statement" text="Nordeo Scholar began with a simple belief: good research deserves a clear, honest path to its readers. Today it brings journals, a newsroom, training, and books under one roof." />
        <dl className="founder-principles">{principles.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
        <div className="founder-links">
          <Link to="/about" className="button button-light">Our story</Link>
          <Link to="/publication-ethics" className="text-link">Publication ethics <Arrow /></Link>
        </div>
      </div>
    </div>
  </section>;
}

const interestOptions = ['Calls for papers', 'Academy programs', 'Newsroom highlights'];

function FinalCta() {
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState(interestOptions.slice(0, 2));
  const [state, setState] = useState({ status: 'idle', message: '', href: '' });
  const toggle = topic => setInterests(current => current.includes(topic) ? current.filter(item => item !== topic) : [...current, topic]);
  const submit = async event => {
    event.preventDefault();
    if (!isEmail(email)) { setState({ status: 'error', message: 'Enter a valid email address.', href: '' }); return; }
    setState({ status: 'loading', message: '', href: '' });
    try {
      const result = await subscribe(email.trim(), interests);
      setState(result.mode === 'remote'
        ? { status: 'done', message: 'You’re on the list. Watch your inbox for the next update.', href: '' }
        : { status: 'confirm', message: 'Almost there: send the prepared email to confirm your subscription.', href: result.href });
    } catch (error) {
      setState({ status: 'error', message: error.message, href: '' });
    }
  };
  const invalid = state.status === 'error';
  return <section id="contact" className="final-cta" aria-labelledby="final-heading">
    <div className="container final-grid">
      <div className="final-copy" data-reveal>
        <img className="final-mark" src="/assets/logo-mark.webp" alt="Nordeo" width="627" height="407" loading="lazy" decoding="async" />
        <h2 id="final-heading">Stay close to <em>new research.</em></h2>
        <p className="final-lead">Choose what you want to hear about. We write when a journal opens a call, the Academy sets a date, or the Newsroom publishes something worth your time.</p>
        <div className="final-links">
          <Link to="/journals" className="text-link">Submit a manuscript <Arrow /></Link>
          <Link to="/contact" className="text-link">Contact the team <Arrow /></Link>
        </div>
      </div>
      <form className="subscribe-panel" noValidate onSubmit={submit} data-reveal style={{ '--reveal-delay': '120ms' }}>
        <div className="subscribe-field">
          <label htmlFor="subscribe-email">Email address</label>
          <input id="subscribe-email" type="email" autoComplete="email" placeholder="you@university.ac.id" value={email} onChange={event => setEmail(event.target.value)} aria-invalid={invalid ? 'true' : undefined} aria-describedby="subscribe-status" />
        </div>
        <fieldset className="subscribe-topics">
          <legend>Keep me posted on</legend>
          {interestOptions.map(topic => <label key={topic}><input type="checkbox" checked={interests.includes(topic)} onChange={() => toggle(topic)} />{topic}</label>)}
        </fieldset>
        <button type="submit" className="button button-dark" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Subscribing…' : 'Subscribe'}</button>
        <p id="subscribe-status" className={`subscribe-status is-${state.status}`} aria-live="polite">
          {state.message}{state.href && <> <a href={state.href}>Open email</a></>}
        </p>
      </form>
    </div>
    <p className="final-wordmark" aria-hidden="true">NORDEO</p>
  </section>;
}

export default function Home() {
  useDocumentTitle(null);
  return <div lang="en">
    <Hero />
    <Metrics />
    <EcosystemShowcase />
    <div className="journals-section section-space container" id="journals">
      <JournalFinder limit={4} />
    </div>
    <EcosystemPulse />
    <Founder />
    <FinalCta />
  </div>;
}
