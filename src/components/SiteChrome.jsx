import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ecosystems } from '../data/ecosystems';
import { SITES, ecosystemHref, mainHref, micrositeNavHref, siteBase, siteHome } from '../lib/site';
import { contact, officialSocial } from '../config/links';
import { Arrow, SmartLink, StatusPill } from './parts';

function Chevron() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" className="chevron" fill="none"><path d="m3.5 6 4.5 4 4.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function isActive(pathname, href) {
  if (!href || href.startsWith('http') || href.startsWith('mailto')) return false;
  if (href === '/' || href === '/#ecosystem') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function EcosystemDropdown({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = event => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = event => {
      if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return <div className="nav-dropdown" ref={wrapRef}>
    <button ref={buttonRef} type="button" className={`nav-trigger ${open ? 'is-open' : ''}`} aria-expanded={open} aria-controls="ecosystem-dropdown" onClick={() => setOpen(value => !value)}>
      Ecosystem <Chevron />
    </button>
    {open && <div className="ecosystem-dropdown" id="ecosystem-dropdown" aria-label="Ekosistem Nordeo">
      <div className="dropdown-top"><span>Empat ruang, satu ekosistem</span><Link to="/#ecosystem" onClick={() => { setOpen(false); onNavigate?.(); }}>Lihat ringkasan <Arrow size={16} /></Link></div>
      <div className="dropdown-grid">
        {ecosystems.map(item => <SmartLink key={item.id} href={ecosystemHref(item.id)} className="dropdown-item" onClick={() => { setOpen(false); onNavigate?.(); }}>
          <span className="dropdown-number">{item.number}</span>
          <span className="dropdown-copy"><strong>{item.title}</strong><small>{item.domain}</small></span>
          <StatusPill tone={item.tone}>{item.status}</StatusPill>
        </SmartLink>)}
      </div>
      <p className="dropdown-note">Books, News, dan Academy disiapkan sebagai subdomain. Pratinjau sudah tersedia dari menu ini.</p>
    </div>}
  </div>;
}

function MainHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const { pathname, hash } = useLocation();
  const locationKey = `${pathname}${hash}`;

  useEffect(() => { setMenuOpen(false); }, [locationKey]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = event => {
      if (event.key === 'Escape') { setMenuOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const navItems = [
    { label: 'About', href: '/#about' },
    { label: 'Journals', href: '/journals' },
    { label: 'News', href: ecosystemHref('news') },
    { label: 'Contact', href: '/#contact' },
  ];

  return <header aria-label="Nordeo Scholar" className="site-header main-header">
    <div className="container header-inner">
      <Link to="/" className="brand" aria-label="Nordeo Scholar - Beranda"><img src="/assets/logo-transparent.png" width="220" height="60" alt="Nordeo Scholar Publishing" /></Link>
      <button className="menu-toggle" ref={toggleRef} type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(value => !value)}>
        <span>{menuOpen ? 'Tutup' : 'Menu'}</span><span className={`menu-lines ${menuOpen ? 'is-open' : ''}`} aria-hidden="true"><i /><i /></span>
      </button>
      <nav id="primary-navigation" aria-label="Navigasi utama" className={`primary-navigation ${menuOpen ? 'is-open' : ''}`}>
        {navItems.slice(0, 1).map(item => <SmartLink key={item.label} href={item.href} className={isActive(pathname, item.href) ? 'active' : undefined}>{item.label}</SmartLink>)}
        <EcosystemDropdown onNavigate={() => setMenuOpen(false)} />
        {navItems.slice(1).map(item => <SmartLink key={item.label} href={item.href} className={isActive(pathname, item.href) ? 'active' : undefined}>{item.label}</SmartLink>)}
        <Link className="button button-small button-dark" to="/journals">Explore Journals <Arrow diagonal /></Link>
        <div className="mobile-ecosystem">
          <p className="mobile-label">Ekosistem</p>
          {ecosystems.map(item => <SmartLink key={item.id} href={ecosystemHref(item.id)} className="mobile-ecosystem-link">
            <span>{item.number}</span><strong>{item.title}</strong><StatusPill tone={item.tone}>{item.status}</StatusPill>
          </SmartLink>)}
        </div>
      </nav>
    </div>
  </header>;
}

function MicroHeader({ siteKey }) {
  const site = SITES[siteKey];
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const { pathname, hash } = useLocation();
  const locationKey = `${pathname}${hash}`;
  const home = siteHome(siteKey);

  useEffect(() => { setMenuOpen(false); }, [locationKey]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = event => { if (event.key === 'Escape') { setMenuOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return <header aria-label={site.name} className={`site-header micro-header site-${siteKey}`}>
    <div className="container micro-header-inner">
      <Link to={home} className="brand micro-brand" aria-label={`${site.name} - Beranda`}><img src="/assets/logo-transparent.png" width="220" height="60" alt="Nordeo Scholar Publishing" /></Link>
      <span className="micro-divider" aria-hidden="true" />
      <Link to={home} className="micro-wordmark"><small>{site.label}</small><strong>{site.name}</strong></Link>
      <nav className="micro-nav" aria-label={`Navigasi ${site.name}`}>
        {site.nav.map(item => {
          const href = micrositeNavHref(siteKey, item);
          const active = item.path && pathname === `${siteBase(siteKey)}${item.path}`;
          return <SmartLink key={item.label} href={href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>{item.label}</SmartLink>;
        })}
      </nav>
      <div className="micro-actions">
        <SmartLink href={mainHref('/')} className="micro-parent">Nordeo Scholar</SmartLink>
        <SmartLink href={site.cta.path ? micrositeNavHref(siteKey, site.cta) : site.cta.href} className="button button-small button-dark">{site.cta.label} <Arrow diagonal /></SmartLink>
      </div>
      <button className="menu-toggle" ref={toggleRef} type="button" aria-expanded={menuOpen} aria-controls={`${siteKey}-navigation`} onClick={() => setMenuOpen(value => !value)}>
        <span>{menuOpen ? 'Tutup' : 'Menu'}</span><span className={`menu-lines ${menuOpen ? 'is-open' : ''}`} aria-hidden="true"><i /><i /></span>
      </button>
    </div>
    {menuOpen && <nav id={`${siteKey}-navigation`} className="micro-mobile-panel" aria-label={`Navigasi ${site.name}`}>
      {site.nav.map(item => <SmartLink key={item.label} href={micrositeNavHref(siteKey, item)} onClick={() => setMenuOpen(false)}>{item.label}</SmartLink>)}
      <SmartLink href={mainHref('/')} onClick={() => setMenuOpen(false)}>Nordeo Scholar</SmartLink>
      <SmartLink href={site.cta.path ? micrositeNavHref(siteKey, site.cta) : site.cta.href} className="button button-dark" onClick={() => setMenuOpen(false)}>{site.cta.label} <Arrow diagonal /></SmartLink>
    </nav>}
  </header>;
}

export function SiteHeader({ siteKey }) {
  return siteKey === 'main' ? <MainHeader /> : <MicroHeader siteKey={siteKey} />;
}

const footerCopy = {
  books: 'Buku yang membawa gagasan akademik lebih jauh, dari naskah menjadi bacaan yang bertahan.',
  news: 'Kabar dari ruang riset, ditulis untuk dibaca, dan diarsipkan agar bisa ditemukan kembali.',
  training: 'Keterampilan yang membuat riset sampai ke pembaca — dari draf pertama sampai respons reviewer.',
};

export function SiteFooter({ siteKey }) {
  const site = siteKey === 'main' ? null : SITES[siteKey];
  return <footer className="site-footer" aria-label="Footer">
    <div className="container">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to={siteKey === 'main' ? '/' : siteHome(siteKey)} aria-label="Nordeo Scholar - Beranda"><img src="/assets/logo-light.png" width="240" height="65" alt="Nordeo Scholar Publishing" /></Link>
          <p>{site ? footerCopy[siteKey] : <><span>Ruang bertumbuh bagi pengetahuan,</span><br />publikasi, dan kolaborasi akademik.</>}</p>
          {site && <p className="footer-site-domain">{site.host}</p>}
        </div>
        <div>
          <h2>Ekosistem</h2>
          <SmartLink href={ecosystemHref('journals')}>Journals Publishing</SmartLink>
          <SmartLink href={ecosystemHref('books')}>Books Publishing</SmartLink>
          <SmartLink href={ecosystemHref('news')}>Media & News</SmartLink>
          <SmartLink href={ecosystemHref('training')}>Academic Training</SmartLink>
        </div>
        <div>
          <h2>Jelajahi</h2>
          <SmartLink href={mainHref('/#ecosystem')}>Our Ecosystem</SmartLink>
          <SmartLink href={mainHref('/about')}>About Nordeo</SmartLink>
          <SmartLink href={mainHref('/author-guide')}>Panduan Penulis</SmartLink>
          <SmartLink href={mainHref('/publication-ethics')}>Publication Ethics</SmartLink>
          <Link to="/admin">Admin Panel</Link>
        </div>
        <div>
          <h2>Terhubung</h2>
          <a href={`mailto:${site ? contact[siteKey] : contact.general}`}>{site ? contact[siteKey] : contact.general}</a>
          <a href={officialSocial.instagram}>Instagram @nordeoscholar <Arrow diagonal /></a>
          <a href={officialSocial.whatsapp}>WhatsApp Editorial <Arrow diagonal /></a>
          <SmartLink href={mainHref('/contact')}>Kontak & Kolaborasi <Arrow diagonal /></SmartLink>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Nordeo Scholar Publishing.</p>
        <span>Knowledge grows when shared.</span>
        <div><SmartLink href={mainHref('/privacy-policy')}>Privacy Policy</SmartLink><SmartLink href={mainHref('/terms-of-use')}>Terms of Use</SmartLink><Link to="/admin">Admin</Link></div>
      </div>
    </div>
  </footer>;
}
