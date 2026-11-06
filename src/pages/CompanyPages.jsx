import { Link } from 'react-router';
import { companyOverview, coreValues, founderProfile, mission, storyChapters } from '../data/company';
import { ecosystems, founder, vision } from '../data/ecosystems';
import { ecosystemHref } from '../lib/site';
import { Arrow, JournalMark, SmartLink, useDocumentTitle } from '../components/parts';

const pad = number => String(number).padStart(2, '0');

function BackLink() {
  return <Link to="/" className="back-link">Back to home</Link>;
}

// "Our story" — opened from the founder's note (Feedback 2). Pattern: a numbered
// milestone rail that reads left to right, followed by vision, mission, and values.
export function StoryPage() {
  useDocumentTitle('Our Story');
  return <div lang="en" className="company-page">
    <section className="container inner-page story-hero" data-reveal>
      <BackLink />
      <div className="page-lead">
        <div className="page-lead-copy">
          <p className="vision-label">Our Story</p>
          <h1>Empowering research. <em>Advancing knowledge.</em></h1>
          {companyOverview.paragraphs.map(text => <p key={text.slice(0, 24)} className="page-intro">{text}</p>)}
        </div>
        <figure className="page-art">
          <img src="/assets/generated/hero-editorial-v1.webp" alt="An open book on a reading desk, a symbol of shared knowledge" width="1600" height="1195" />
          <figcaption>{companyOverview.nameCalling}</figcaption>
        </figure>
      </div>
    </section>

    <section className="container story-timeline-section" aria-labelledby="story-timeline-heading">
      <h2 id="story-timeline-heading" className="story-section-title" data-reveal>How Nordeo grew</h2>
      <ol className="story-timeline">
        {storyChapters.map((chapter, i) => <li key={chapter.title} data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
          <span className="story-dot" aria-hidden="true" />
          <p className="story-step">{pad(i + 1)} · {chapter.label}</p>
          <h3>{chapter.title}</h3>
          <p>{chapter.copy}</p>
        </li>)}
      </ol>
    </section>

    <section className="container story-pillars" aria-label="Vision and mission">
      <article data-reveal>
        <p className="vision-label">Our Vision</p>
        <p className="story-vision">{vision.intro} {vision.lead} <mark>{vision.accent}</mark></p>
      </article>
      <article data-reveal style={{ '--reveal-delay': '100ms' }}>
        <p className="vision-label">Our Mission</p>
        <ol className="story-mission">{mission.map((item, i) => <li key={item}><span>{pad(i + 1)}</span>{item}</li>)}</ol>
      </article>
    </section>

    <section className="values-band story-values" aria-labelledby="story-values-heading">
      <div className="container">
        <div className="values-head" data-reveal><h2 id="story-values-heading">Core values</h2><p>{companyOverview.tagline}</p></div>
        <ol className="values-grid">
          {coreValues.map((value, i) => <li key={value.title} data-reveal style={{ '--reveal-delay': `${i * 70}ms` }}><span className="value-number">{pad(i + 1)}</span><h3>{value.title}</h3><p>{value.copy}</p></li>)}
        </ol>
      </div>
    </section>

    <section className="container story-next" aria-labelledby="story-next-heading">
      <div className="information-panel about-ecosystem-panel" data-reveal>
        <h2 id="story-next-heading">One ecosystem, four ways in.</h2>
        <div className="about-ecosystem-links">
          {ecosystems.map(item => <SmartLink key={item.id} href={ecosystemHref(item.id)}><span>{item.number}</span><strong>{item.short}</strong><small>{item.menuCopy}</small></SmartLink>)}
        </div>
        <div className="button-row"><Link to="/founder" className="button button-dark">Meet the founder</Link><Link to="/#contact" className="text-link">Visit us in Bandung <Arrow /></Link></div>
      </div>
    </section>
  </div>;
}

const profileMarks = {
  scopus: <span className="profile-mark profile-mark-scopus">Scopus</span>,
  scholar: <span className="profile-mark profile-mark-scholar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 1 9.5l11 6.5 9-5.3V17h2V9.5L12 3Z" fill="currentColor" /><path d="M5.5 13.3v3.6C7 18.8 9.4 20 12 20s5-1.2 6.5-3.1v-3.6L12 17.2l-6.5-3.9Z" fill="currentColor" opacity=".7" /></svg>Google Scholar</span>,
  sinta: <span className="profile-mark profile-mark-sinta">SINTA</span>,
  orcid: <span className="profile-mark profile-mark-orcid"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#a6ce39" /><path d="M7.2 6.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-.75 3.2h1.5v7.6h-1.5V9.8Zm3.6 0h3.1c2.6 0 4.1 1.7 4.1 3.8 0 2.2-1.6 3.8-4.1 3.8h-3.1V9.8Zm1.5 1.35v4.9h1.5c1.8 0 2.6-1.1 2.6-2.45 0-1.4-.85-2.45-2.6-2.45h-1.5Z" fill="#fff" /></svg>ORCID</span>,
};

// Founder profile — opened from the founder's note (Feedback 2: "siapa FDC, beberapa logo:
// Scopus, Google Scholar, Sinta"). Pattern: portrait card beside a bio, then profile cards.
export function FounderPage() {
  useDocumentTitle(`${founder.name} — Founder`);
  return <div lang="en" className="company-page">
    <section className="container inner-page founder-page" aria-labelledby="founder-page-heading">
      <BackLink />
      <div className="founder-page-grid">
        <figure className="founder-card" data-reveal>
          <div className="founder-photo">
            <picture>
              <source media="(max-width: 640px)" srcSet={founder.photoSmall} />
              <img src={founder.photo} alt={`Portrait of ${founder.name}`} width="1247" height="1261" decoding="async" />
            </picture>
          </div>
          <figcaption className="founder-name"><strong>{founder.name}, {founder.degrees}</strong><span>{founderProfile.affiliation}</span></figcaption>
        </figure>
        <div className="founder-page-copy" data-reveal style={{ '--reveal-delay': '100ms' }}>
          <p className="vision-label">Founder Profile</p>
          <h1 id="founder-page-heading">{founder.name}, <em>{founder.degrees}</em></h1>
          <p className="founder-page-role">{founderProfile.title}, PT Nordeo Scholar Publishing</p>
          <div className="founder-page-bio">{founderProfile.bio.map(text => <p key={text.slice(0, 24)}>{text}</p>)}</div>
          <blockquote className="founder-page-quote">Good research deserves a clear, honest path to its readers.</blockquote>

          <h2 className="founder-page-subhead">Editorial roles</h2>
          <ul className="founder-roles">
            {founderProfile.roles.map(role => <li key={role.journal}><a href={role.href} target="_blank" rel="noopener noreferrer"><JournalMark id={role.journal} size="sm" /><span>{role.label}</span><Arrow /><span className="sr-only"> (opens in a new tab)</span></a></li>)}
          </ul>

          <h2 className="founder-page-subhead">Academic profiles</h2>
          <ul className="profile-cards">
            {founderProfile.profiles.map(profile => <li key={profile.id}><a href={profile.href} target="_blank" rel="noopener noreferrer">
              {profileMarks[profile.id]}
              <small>{profile.detail}</small>
              <span className="profile-open">View profile <Arrow /></span>
              <span className="sr-only"> on {profile.label} (opens in a new tab)</span>
            </a></li>)}
          </ul>
          <div className="button-row"><Link to="/about" className="button button-dark">Our story</Link><Link to="/publication-ethics" className="text-link">Publication ethics <Arrow /></Link></div>
        </div>
      </div>
    </section>
  </div>;
}
