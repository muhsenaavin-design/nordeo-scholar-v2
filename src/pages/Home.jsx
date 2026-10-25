import { useState } from 'react';
import { Link } from 'react-router';
import { ecosystems, founder, principles, vision } from '../data/ecosystems';
import { dateLabelEn, programTypeEn, trainingPrograms } from '../data/training';
import { newsCategoryEn } from '../data/news';
import { contact, office } from '../config/links';
import { ecosystemHref } from '../lib/site';
import { formatDate, publishedNews } from '../lib/store';
import { BlurText, HeroImage, Parallax, ScrollStatement, ScrollWords } from '../components/effects';
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
        <p className="hero-description"><BlurText text="An academic publishing and research support company: peer-reviewed journals, media & news, training, and books in one ecosystem." /></p>
        <div className="hero-actions">
          <Link to="/#ecosystem" className="button button-yellow">Discover the ecosystem</Link>
        </div>
      </div>
    </div>
  </section>;
}

function Vision() {
  return <section className="vision" aria-labelledby="vision-heading">
    <div className="container vision-inner" data-reveal>
      <h2 id="vision-heading" className="vision-label">Our Vision</h2>
      <ScrollStatement className="vision-statement" {...vision} />
    </div>
  </section>;
}

function EcosystemShowcase() {
  const [active, setActive] = useState(ecosystems[0].id);
  return <section className="ecosystem-section section-space container" id="ecosystem" aria-labelledby="ecosystem-heading">
    <div className="section-heading" data-reveal>
      <h2 id="ecosystem-heading">Four rooms, <em>one house of knowledge.</em></h2>
      <p>Journals for research, NordeoNews for stories, an Academy for skills, and Books for longer ideas.</p>
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
            <SmartLink href={item.ctaHref || ecosystemHref(item.id)} className="eco-cta" {...(item.ctaHref ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{item.cta} <Arrow /></SmartLink>
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
      <p>The latest from NordeoNews and the Academy calendar.</p>
    </div>
    <div className="pulse-grid">
      <div className="pulse-column" data-reveal>
        <div className="pulse-head"><h3>NordeoNews</h3><SmartLink href={ecosystemHref('news')} className="text-link">All stories <Arrow /></SmartLink></div>
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
        <ScrollWords className="founder-statement" text="Nordeo Scholar began with a simple belief: good research deserves a clear, honest path to its readers. Today it brings journals, media & news, training, and books under one roof." />
        <dl className="founder-principles">{principles.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
        <div className="founder-links">
          <Link to="/about" className="button button-light">Our story</Link>
          <Link to="/publication-ethics" className="text-link">Publication ethics <Arrow /></Link>
        </div>
      </div>
    </div>
  </section>;
}

function Location() {
  return <section id="contact" className="final-cta location-section" aria-labelledby="location-heading">
    <div className="container final-grid location-grid">
      <div className="final-copy" data-reveal>
        <img className="final-mark" src="/assets/logo-mark.webp" alt="Nordeo" width="627" height="407" loading="lazy" decoding="async" />
        <h2 id="location-heading">Visit us <em>in Bandung.</em></h2>
        <address className="location-address">
          <strong>{office.name}</strong>
          <span>{office.address}</span>
        </address>
        <div className="final-links">
          <a href={office.mapLink} className="text-link" target="_blank" rel="noopener noreferrer">Get directions <Arrow /><span className="sr-only"> (opens in a new tab)</span></a>
          <a href={`mailto:${contact.general}`} className="text-link">{contact.general} <Arrow /></a>
          <Link to="/contact" className="text-link">Contact the team <Arrow /></Link>
        </div>
      </div>
      <div className="location-map" data-reveal style={{ '--reveal-delay': '120ms' }}>
        <iframe src={office.mapEmbed} title={`Map showing ${office.name}, ${office.address}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    </div>
    <p className="final-wordmark" aria-hidden="true">NORDEO</p>
  </section>;
}

export default function Home() {
  useDocumentTitle(null);
  return <div lang="en">
    <Hero />
    <Vision />
    <EcosystemShowcase />
    <div className="journals-section section-space container" id="journals">
      <JournalFinder limit={4} />
    </div>
    <EcosystemPulse />
    <Founder />
    <Location />
  </div>;
}
