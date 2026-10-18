import { useAnimationPreference } from './motion-preference';
import LogoLoop from './vendor/LogoLoop';
import { discoveryPlatforms } from '../data/discovery';

const logos = discoveryPlatforms.map(platform => ({
  node: <span className="platform-logo"><img src={platform.src} alt="" width="180" height="44" loading="lazy" /><span>{platform.kind}</span></span>,
  href: platform.href,
  ariaLabel: `${platform.name} — ${platform.kind} (tab baru)`,
}));

export default function Discovery() {
  const { reduced, setMode } = useAnimationPreference();
  return <section id="discovery" className="discoverability-section container" aria-labelledby="discovery-heading">
    <div className="discoverability-intro"><div><p className="eyebrow">DISCOVERY & SCHOLARLY METADATA</p><h2 id="discovery-heading">Knowledge,<br /><em>within reach.</em></h2></div><p>Jelajahi jejak publikasi, metadata DOI, dan sumber penelusuran akademik. Setiap platform memiliki peran berbeda dalam perjalanan riset Anda.</p></div>
    <div className="platform-loop-shell">
      {reduced ? <ul className="platform-static">{logos.map((logo, i) => <li key={logo.href}><a href={logo.href} aria-label={logo.ariaLabel} target="_blank" rel="noopener noreferrer">{logos[i].node}</a></li>)}</ul> : <LogoLoop logos={logos} speed={48} direction="left" gap={64} logoHeight={64} pauseOnHover={false} draggable={false} reducedMotion={false} fadeOut fadeOutColor="#ffffff" intro={false} ariaLabel="Platform penelusuran dan metadata akademik" />}
      {reduced && <button className="loop-toggle" type="button" onClick={() => setMode('full')}>Putar logo ↗</button>}
    </div>
    <div className="discovery-evidence-grid"><article><h3>JETSI <span>Engineering & Technology</span></h3><p>13 dokumen tercatat di GARUDA, dengan metadata DOI tersedia di Crossref.</p><div><a href={discoveryPlatforms[0].href}>Lihat entri GARUDA ↗</a><a href="https://api.crossref.org/journals/3164-5208/works">Metadata Crossref ↗</a></div></article><article><h3>JIEL <span>Education & Learning</span></h3><p>Kenali fokus, proses review, dan panduan publikasi. Informasi indeksasi mengikuti pembaruan pada platform jurnal.</p><a href="https://nordeoscholar.com/journal/jiel">Jelajahi JIEL ↗</a></article></div>
  </section>;
}
