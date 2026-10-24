import { Link } from 'react-router';
import { ecosystems, journalFacts } from '../data/ecosystems';
import { ecosystemHref } from '../lib/site';
import { BlurText, CountUp, HeroImage, Magnet, Parallax, SpotlightCard } from '../components/effects';
import { MotionNotice } from '../components/motion-preference';
import JournalFinder from '../components/JournalFinder';
import { Arrow, SmartLink, StatusPill } from '../components/parts';

export function Hero() {
  return <section className="hero" aria-labelledby="hero-heading">
    <div className="hero-visual">
      <HeroImage src="/assets/generated/hero-library-v2.webp" alt="Perpustakaan megah bernuansa teal dengan buku terbuka dan lembaran melayang dalam cahaya keemasan" width="1672" height="940" />
    </div>
    <div className="hero-copy container">
      <p className="eyebrow" lang="en">Academic Publishing &amp; Research Support</p>
      <MotionNotice />
      <h1 id="hero-heading" lang="en"><span>Advancing Knowledge.</span>{' '}<span className="hero-heading-accent">Creating Global Impact.</span></h1>
      <p className="hero-description" lang="en"><BlurText text="Nordeo Scholar Publishing is an academic publishing and research support company dedicated to advancing scientific knowledge through scholarly publishing, research consulting, academic training, and knowledge dissemination." /></p>
      <div className="hero-actions">
        <Magnet><Link to="/journals" className="button button-gold">Explore Journals <span className="button-arrow"><Arrow diagonal /></span></Link></Magnet>
        <Link to="/#ecosystem" className="text-link">Jelajahi Ekosistem <Arrow /></Link>
      </div>
    </div>
    <div className="hero-footer container">
      <p className="hero-signature" lang="en">Knowledge grows<br /><em>when shared.</em></p>
      <div className="hero-facts"><div><strong>02</strong><span>Academic journals</span></div><div><strong>04</strong><span>Connected ecosystems</span></div><div><strong lang="en">Open</strong><span>Access to knowledge</span></div></div>
    </div>
  </section>;
}

export function EcosystemSection() {
  return <section className="ecosystem-section section-space container" id="ecosystem" aria-labelledby="ecosystem-heading">
    <div className="section-heading" data-reveal>
      <div><p className="eyebrow">01 / THE NORDEO ECOSYSTEM</p><h2 id="ecosystem-heading">Connected by knowledge.<br /> Built for possibility.</h2></div>
      <div className="section-heading-aside">
        <p>Satu pintu menuju publikasi, cerita, buku, dan pelatihan akademik. Tiga ekosistem baru disiapkan sebagai subdomain dan sudah dapat dijelajahi sebagai pratinjau.</p>
        <p className="domain-note">books · news · training .nordeoscholar.com</p>
      </div>
    </div>
    <div className="ecosystem-grid">
      {ecosystems.map((item, index) => <SpotlightCard className={`ecosystem-card ecosystem-${item.id}`} key={item.id} data-reveal style={{ '--reveal-delay': `${index * 80}ms` }}>
        <div className="ecosystem-photo">
          <img src={item.image} alt={item.alt} width="1600" height="1195" loading="lazy" />
          <StatusPill tone={item.tone}>{item.status}</StatusPill>
          <span className="ecosystem-number" aria-hidden="true">{item.number}</span>
        </div>
        <div className="ecosystem-card-copy">
          <p className="card-category" lang="en">{item.category}</p>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p className="ecosystem-domain">{item.domain}</p>
          <SmartLink href={item.id === 'journals' ? '/journals' : ecosystemHref(item.id)} className="text-link">{item.cta} <Arrow diagonal /></SmartLink>
        </div>
      </SpotlightCard>)}
    </div>
  </section>;
}

function PublishingSteps() {
  return <section className="publishing-section section-space container" aria-labelledby="publishing-heading">
    <div className="section-heading" data-reveal>
      <div><p className="eyebrow">03 / YOUR PUBLISHING JOURNEY</p><h2 id="publishing-heading">Good research.<br /> A clear next step.</h2></div>
      <p>Mulai dari jurnal yang tepat. Website Nordeo membantu Anda menemukan arah, lalu melanjutkan proses di platform jurnal terkait.</p>
    </div>
    <ol className="publishing-steps">
      <li data-reveal><span>01</span><h3>Temukan jurnal Anda</h3><p>Bandingkan ruang lingkup JETSI dan JIEL, lalu pilih yang paling dekat dengan riset Anda.</p><Link to="/journals">Cari Jurnal <Arrow /></Link></li>
      <li data-reveal style={{ '--reveal-delay': '90ms' }}><span>02</span><h3>Kenali panduannya</h3><p>Pelajari ketentuan penulisan dan kebijakan publikasi sebelum menyiapkan naskah.</p><Link to="/author-guide">Panduan Penulis <Arrow /></Link></li>
      <li data-reveal style={{ '--reveal-delay': '180ms' }}><span>03</span><h3>Kirim di platform jurnal</h3><p>Baca terbitan dan temukan informasi pengiriman naskah pada platform jurnal yang dipilih.</p><Link to="/journals">Buka Platform Jurnal <Arrow diagonal /></Link></li>
    </ol>
  </section>;
}

function Stats() {
  return <section className="stats-section" aria-labelledby="stats-heading">
    <div className="container stats-inner">
      <div className="stats-head" data-reveal><p className="eyebrow">04 / KNOWLEDGE IN NUMBERS</p><h2 id="stats-heading">Nordeo,<br /> in numbers.</h2></div>
      <dl className="stats-grid">{journalFacts.map(([label, value, suffix]) => <div key={label} data-reveal><dd><span className="sr-only">{value}{suffix}</span><span aria-hidden="true"><CountUp value={value} suffix={suffix} /></span></dd><dt>{label}</dt></div>)}</dl>
      <p className="stats-note" data-reveal>13 dokumen JETSI tercatat di GARUDA pada 24 Oktober 2026. 14 artikel unik tersedia di pratinjau jurnal, termasuk terbitan terbaru.</p>
    </div>
  </section>;
}

function AboutSection() {
  return <section id="about" className="about-section container" aria-labelledby="about-heading">
    <Parallax className="about-photo" distance={30}>
      <img src="/assets/about-shelves.webp" alt="Rak dan lorong perpustakaan dengan koleksi buku" width="880" height="1100" loading="lazy" />
      <span className="about-photo-label" aria-hidden="true">KNOWLEDGE<br />WITH PURPOSE.</span>
    </Parallax>
    <div className="about-copy" data-reveal>
      <p className="eyebrow">05 / THE PEOPLE BEHIND THE PAGES</p>
      <h2 id="about-heading">Growing knowledge.<br /> Together.</h2>
      <p>Nordeo Scholar hadir untuk menghubungkan riset, pendidikan, dan publikasi. Kami membangun ruang bagi penulis, pembaca, dan mitra untuk bertukar gagasan dan membuka kesempatan kolaborasi.</p>
      <div className="about-principles"><span>Integritas</span><span>Transparansi</span><span>Kolaborasi</span></div>
      <div className="about-links"><Link to="/about" className="text-link">Kenali Nordeo <Arrow /></Link><Link to="/publication-ethics" className="text-link">Publication Ethics <Arrow diagonal /></Link></div>
    </div>
  </section>;
}

function Collaboration() {
  return <section id="contact" className="collaboration-section container" aria-labelledby="collaboration-heading" data-reveal>
    <div><p className="eyebrow">LET'S BUILD SOMETHING MEANINGFUL</p><h2 id="collaboration-heading">Gagasan besar dimulai<br /> dari percakapan kecil.</h2><p>Punya ide publikasi, cerita, buku, atau pelatihan? Mari terhubung.</p></div>
    <Link to="/contact" className="button button-gold">Hubungi Nordeo <Arrow diagonal /></Link>
  </section>;
}

export default function Home() {
  return <>
    <Hero />
    <EcosystemSection />
    <div className="container"><JournalFinder limit={6} /></div>
    <PublishingSteps />
    <Stats />
    <AboutSection />
    <Collaboration />
  </>;
}
