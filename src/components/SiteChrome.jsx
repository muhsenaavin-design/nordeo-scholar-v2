import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ecosystems } from '../data/ecosystems';
import { SITES, ecosystemHref, mainHref, micrositeNavHref, siteBase, siteHome } from '../lib/site';
import { contact, officialSocial } from '../config/links';
import { Arrow, SmartLink, StatusPill } from './parts';
import NordeoNewsBrand from './NordeoNewsBrand';

function Chevron() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" className="chevron" fill="none"><path d="m3.5 6 4.5 4 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MenuToggle({ open, onClick, controls, toggleRef }) {
  return <button className="menu-toggle" ref={toggleRef} type="button" aria-expanded={open} aria-controls={controls} onClick={onClick}>
    <span>{open ? 'Close' : 'Menu'}</span><span className={`menu-lines ${open ? 'is-open' : ''}`} aria-hidden="true"><i /><i /></span>
  </button>;
}

function useEscape(active, onEscape) {
  useEffect(() => {
    if (!active) return;
    const onKey = event => { if (event.key === 'Escape') onEscape(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, onEscape]);
}

// Mega menu listing the four ecosystems. Opens on click or keyboard; on a mouse it also
// opens on hover. The preview column follows whichever item is hovered or focused.
export function EcosystemMenu({ current = 'main', label = 'Ecosystem' }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(ecosystems.find(item => item.id === current)?.id || ecosystems[0].id);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const hoverTimer = useRef(0);
  const hoverOpenedAt = useRef(0);
  const { pathname, hash } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const onPointer = event => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    const onKey = event => { if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const hover = next => event => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (next) hoverOpenedAt.current = Date.now();
      setOpen(next);
    }, next ? 90 : 220);
  };
  const toggle = () => {
    // A click that lands right after hover opened the panel should not close it again.
    if (open && Date.now() - hoverOpenedAt.current < 400) return;
    setOpen(value => !value);
  };
  const active = ecosystems.find(item => item.id === preview) || ecosystems[0];

  return <div className="nav-dropdown" ref={wrapRef} onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
    <button ref={buttonRef} type="button" className={`nav-trigger ${open ? 'is-open' : ''}`} aria-expanded={open} aria-controls="ecosystem-menu" onClick={toggle}>
      {label} <Chevron />
    </button>
    <div className={`mega-menu ${open ? 'is-open' : ''}`} id="ecosystem-menu" inert={!open}>
      <div className="mega-inner">
        <div className="mega-list">
          <ul>
            {ecosystems.map((item, index) => <li key={item.id} style={{ '--i': index }}>
              <SmartLink href={ecosystemHref(item.id)} className={`mega-item ${preview === item.id ? 'is-previewed' : ''}`} aria-current={current === item.id ? 'true' : undefined} onPointerEnter={() => setPreview(item.id)} onFocus={() => setPreview(item.id)} onClick={() => setOpen(false)}>
                <span className="mega-copy"><strong>{item.title}</strong><small>{item.menuCopy}</small></span>
                {item.status && <StatusPill tone={item.tone}>{item.status}</StatusPill>}
              </SmartLink>
            </li>)}
          </ul>
        </div>
        <div className="mega-preview" aria-hidden="true">
          {ecosystems.map(item => <img key={item.id} src={item.image} alt="" width="1600" height="1195" loading="lazy" decoding="async" className={item.id === active.id ? 'is-shown' : undefined} />)}
          <div className="mega-preview-copy">
            <strong>{active.short}</strong>
            <small>{active.menuCopy}</small>
          </div>
        </div>
      </div>
      <div className="mega-footer">
        <SmartLink href={mainHref('/#ecosystem')} onClick={() => setOpen(false)}>Ecosystem overview <Arrow size={16} /></SmartLink>
        <div>
          <SmartLink href={ecosystemHref('news', '/kirim')} onClick={() => setOpen(false)}>Submit a story <Arrow size={16} /></SmartLink>
          <SmartLink href={ecosystemHref('training', '/daftar')} onClick={() => setOpen(false)}>Join the Academy <Arrow size={16} /></SmartLink>
        </div>
      </div>
    </div>
  </div>;
}

function MobileEcosystems({ current }) {
  return <div className="mobile-ecosystem">
    <p className="mobile-label">Ecosystem</p>
    {ecosystems.map(item => <SmartLink key={item.id} href={ecosystemHref(item.id)} className="mobile-ecosystem-link" aria-current={current === item.id ? 'true' : undefined}>
      <strong>{item.title}</strong>{item.status && <StatusPill tone={item.tone}>{item.status}</StatusPill>}
    </SmartLink>)}
  </div>;
}

export function MainHeader({ onReplaySection }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const { pathname, hash } = useLocation();

  useEffect(() => { setMenuOpen(false); }, [pathname, hash]);
  useEscape(menuOpen, () => { setMenuOpen(false); toggleRef.current?.focus(); });

  const sectionLink = label => {
    const id = label.toLowerCase();
    const active = pathname === '/' && hash === `#${id}`;
    return <Link key={label} to={`/#${id}`} className={active ? 'active' : undefined} aria-current={active ? 'location' : undefined} onClick={event => {
      if (active && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onReplaySection?.(); }
    }}>{label}</Link>;
  };

  return <header lang="en" aria-label="Nordeo Scholar" className="site-header main-header">
    <div className="container header-inner">
      <Link to="/" className="brand" aria-label="Nordeo Scholar home"><img src="/assets/logo-transparent.png" width="220" height="60" alt="Nordeo Scholar Publishing" decoding="async" /></Link>
      <MenuToggle open={menuOpen} toggleRef={toggleRef} controls="primary-navigation" onClick={() => setMenuOpen(value => !value)} />
      <nav id="primary-navigation" aria-label="Main navigation" className={`primary-navigation ${menuOpen ? 'is-open' : ''}`}>
        {sectionLink('About')}
        <EcosystemMenu />
        {sectionLink('Journals')}
        {sectionLink('Contact')}
        <Link className="button button-small button-dark" to="/journals">Explore Journals</Link>
        <MobileEcosystems current="main" />
      </nav>
    </div>
  </header>;
}

export function MicroHeader({ siteKey }) {
  const site = SITES[siteKey];
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const { pathname, hash } = useLocation();
  const base = siteBase(siteKey);

  useEffect(() => { setMenuOpen(false); }, [pathname, hash]);
  useEscape(menuOpen, () => { setMenuOpen(false); toggleRef.current?.focus(); });

  const isActive = item => item.path ? pathname === `${base}${item.path}` : (pathname === `${base}/` || pathname === base || pathname === '/') && hash === `#${item.hash}`;
  const cta = micrositeNavHref(siteKey, site.cta);

  return <header lang="en" aria-label={site.fullName} className={`site-header micro-header site-${siteKey}`}>
    <div className="container header-inner">
      <Link to={siteHome(siteKey)} className="micro-brand" aria-label={`${site.fullName} home`}>
        <img src="/assets/logo-transparent.png" width="220" height="60" alt="" decoding="async" />
        <span className="micro-divider" aria-hidden="true" />
        {siteKey === 'news' ? <NordeoNewsBrand className="micro-wordmark" /> : <span className="micro-wordmark"><strong>{site.name}</strong></span>}
      </Link>
      <MenuToggle open={menuOpen} toggleRef={toggleRef} controls={`${siteKey}-navigation`} onClick={() => setMenuOpen(value => !value)} />
      <nav id={`${siteKey}-navigation`} aria-label={`${site.name} navigation`} className={`primary-navigation ${menuOpen ? 'is-open' : ''}`}>
        {site.nav.map(item => <SmartLink key={item.label} href={micrositeNavHref(siteKey, item)} className={isActive(item) ? 'active' : undefined} aria-current={isActive(item) ? (item.path ? 'page' : 'location') : undefined}>{item.label}</SmartLink>)}
        <EcosystemMenu current={siteKey} />
        <SmartLink href={cta} className="button button-small button-dark">{site.cta.label}</SmartLink>
        <MobileEcosystems current={siteKey} />
      </nav>
    </div>
  </header>;
}

const footerCopy = {
  news: 'News from the research desk, written to be read and archived to be found again.',
  training: 'Skills that carry research to its readers — from first draft to reviewer response.',
};

export function SiteFooter({ siteKey = 'main' }) {
  const site = siteKey === 'main' ? null : SITES[siteKey];
  const email = site ? contact[siteKey] : contact.general;
  return <footer lang="en" className="site-footer">
    <div className="container">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to={siteHome(siteKey)} aria-label="Nordeo Scholar home"><img src="/assets/logo-light.png" width="240" height="65" alt="Nordeo Scholar Publishing" decoding="async" /></Link>
          <p>{site ? footerCopy[siteKey] : <>A place for knowledge, publishing,<br />{' '}and academic collaboration to grow.</>}</p>
          {site && <p className="footer-site-domain">{site.host}</p>}
        </div>
        <div>
          <h3>Ecosystem</h3>
          {ecosystems.map(item => <SmartLink key={item.id} href={ecosystemHref(item.id)}>{item.title}</SmartLink>)}
        </div>
        <div>
          <h3>For scholars</h3>
          <SmartLink href={mainHref('/author-guide')}>Author Guide</SmartLink>
          <SmartLink href={mainHref('/publication-ethics')}>Publication Ethics</SmartLink>
          <SmartLink href={ecosystemHref('news', '/panduan')}>News Publishing Guide</SmartLink>
          <SmartLink href={mainHref('/about')}>About Nordeo</SmartLink>
        </div>
        <div>
          <h3>Let's connect</h3>
          <a href={`mailto:${email}`}>{email}</a>
          <SmartLink href={mainHref('/contact')}>Contact & Collaboration <Arrow /></SmartLink>
          <a href={officialSocial.instagram}>Instagram @nordeoscholar <Arrow /></a>
          <a href={officialSocial.whatsapp}>WhatsApp Editorial <Arrow /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Nordeo Scholar Publishing.</p>
        <span>Knowledge grows when shared.</span>
        <div><SmartLink href={mainHref('/privacy-policy')}>Privacy Policy</SmartLink><SmartLink href={mainHref('/terms-of-use')}>Terms of Use</SmartLink></div>
      </div>
    </div>
  </footer>;
}
