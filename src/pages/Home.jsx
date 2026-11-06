import { useState } from 'react';
import { Link } from 'react-router';
import { ecosystems, founder, principles, vision } from '../data/ecosystems';
import { contact, office } from '../config/links';
import { ecosystemHref } from '../lib/site';
import { Parallax, ScrollStatement, ScrollWords } from '../components/effects';
import { MotionNotice } from '../components/motion-preference';
import JournalFinder from '../components/JournalFinder';
import { AcademyCalendar, CompanyOverview, HeroSlideshow, NewsSpotlight, TrustAndFaq } from '../components/home-sections';
import { Arrow, SmartLink, StatusPill, useDocumentTitle } from '../components/parts';

function Hero() {
  return <section className="hero container" aria-labelledby="hero-heading">
    <div className="hero-frame">
      <HeroSlideshow notice={<MotionNotice />} />
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
            {item.status && <StatusPill tone={item.tone}>{item.status}</StatusPill>}
            <SmartLink href={item.ctaHref || ecosystemHref(item.id)} className="eco-cta" {...(item.ctaHref ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{item.cta} <Arrow /></SmartLink>
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}

function Founder() {
  return <section id="founder" className="founder-section" aria-labelledby="founder-heading">
    <div className="container founder-grid">
      <figure className="founder-card" data-reveal>
        <Parallax className="founder-photo" distance={16}>
          <picture>
            <source media="(max-width: 640px)" srcSet={founder.photoSmall} />
            <img src={founder.photo} alt={`Portrait of ${founder.name}, founder of Nordeo Scholar`} width="1247" height="1261" loading="lazy" decoding="async" />
          </picture>
        </Parallax>
        <figcaption className="founder-name"><strong>{founder.name}, {founder.degrees}</strong><span>{founder.role}</span></figcaption>
      </figure>
      <div className="founder-copy" data-reveal style={{ '--reveal-delay': '120ms' }}>
        <p className="founder-kicker">A note from our founder</p>
        <h2 id="founder-heading">Built by a researcher, <em>for researchers.</em></h2>
        <ScrollWords className="founder-statement" text="Nordeo Scholar began with a simple belief: good research deserves a clear, honest path to its readers. Today it brings journals, media & news, training, and books under one roof." />
        {founder.signature && <img className="founder-signature" src={founder.signature} alt={`Signature of ${founder.name}`} loading="lazy" decoding="async" />}
        <ul className="founder-principles" aria-label="Our core values">{principles.map(([term, detail]) => <li key={term} title={detail}>{term}</li>)}</ul>
        <div className="founder-links">
          <Link to="/about" className="button button-dark">Our story</Link>
          <Link to="/founder" className="text-link">Founder profile <Arrow /></Link>
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

// Order follows Feedback 2 (Nov 2026): company overview between Our Vision and the four
// rooms; NordeoNews and the Academy calendar as separate sections; FAQ before contact.
export default function Home() {
  useDocumentTitle(null);
  return <div lang="en">
    <Hero />
    <Vision />
    <CompanyOverview />
    <EcosystemShowcase />
    <div className="journals-section section-space container" id="journals">
      <JournalFinder limit={4} />
    </div>
    <NewsSpotlight />
    <AcademyCalendar />
    <Founder />
    <TrustAndFaq />
    <Location />
  </div>;
}
