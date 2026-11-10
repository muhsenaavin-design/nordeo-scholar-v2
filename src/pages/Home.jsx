import { Fragment, useState } from 'react';
import { Link } from 'react-router';
import { ecosystems as defaultEcosystems } from '../data/ecosystems';
import { useContent } from '../lib/content';
import { contact, office } from '../config/links';
import { ecosystemHref } from '../lib/site';
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

// Titles, descriptions, buttons, and status come from the dashboard (Ekosistem); images stay in the site.
function useEcosystems() {
  const records = useContent('ecosystems', null);
  if (!Array.isArray(records)) return defaultEcosystems;
  return records.filter(record => record.status !== 'hidden').map(record => {
    const base = defaultEcosystems.find(item => item.id === record.id) || defaultEcosystems[0];
    const soon = record.status === 'soon';
    return { ...base, id: record.id, title: record.title || base.title, short: record.short || base.short, description: record.description || base.description, cta: record.cta || base.cta,
      ctaHref: record.link && /^https?:/.test(record.link) ? record.link : base.ctaHref, status: soon ? 'Coming Soon' : base.status === 'Coming Soon' ? '' : base.status, tone: soon ? 'preview' : base.tone };
  });
}

function EcosystemShowcase() {
  const ecosystems = useEcosystems();
  const [active, setActive] = useState(ecosystems[0]?.id);
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

function Location() {
  const reach = useContent('contact', null);
  const address = reach?.address || office.address;
  const mapLink = reach?.mapLink || office.mapLink;
  const email = reach?.email || contact.general;
  return <section id="contact" className="final-cta location-section" aria-labelledby="location-heading">
    <div className="container final-grid location-grid">
      <div className="final-copy" data-reveal>
        <img className="final-mark" src="/assets/logo-mark.webp" alt="Nordeo" width="627" height="407" loading="lazy" decoding="async" />
        <h2 id="location-heading">Visit us <em>in Bandung.</em></h2>
        <address className="location-address">
          <strong>{office.name}</strong>
          <span>{address}</span>
        </address>
        <div className="final-links">
          <a href={mapLink} className="text-link" target="_blank" rel="noopener noreferrer">Get directions <Arrow /><span className="sr-only"> (opens in a new tab)</span></a>
          <a href={`mailto:${email}`} className="text-link">{email} <Arrow /></a>
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

// Order follows Feedback 2 (Nov 2026), with Our Vision, the company overview, and the
// founder's note merged into one short About section so the four rooms sit near the hero.
const SECTIONS = {
  hero: () => <Hero />,
  about: () => <CompanyOverview />,
  ecosystems: () => <EcosystemShowcase />,
  journals: () => <div className="journals-section section-space container" id="journals"><JournalFinder limit={4} layout="split" /></div>,
  news: () => <NewsSpotlight />,
  academy: () => <AcademyCalendar />,
  trust: () => <TrustAndFaq />,
  contact: () => <Location />,
};

export default function Home() {
  useDocumentTitle(null);
  // Order and visibility come from the dashboard (Halaman > Susunan section beranda).
  const pages = useContent('pages', null);
  const order = Array.isArray(pages?.sections) && pages.sections.every(section => SECTIONS[section.id]) ? pages.sections : Object.keys(SECTIONS).map(id => ({ id, visible: true }));
  return <div lang="en">
    {order.filter(section => section.visible !== false).map(section => <Fragment key={section.id}>{SECTIONS[section.id]()}</Fragment>)}
  </div>;
}
