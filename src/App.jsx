import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router';
import { externalLinks } from './config/links';
import { pages } from './data/pages';
import { journals } from './data/journals';
import { CountUp, PageFade, Parallax, ScrollProgress, SpotlightCard } from './components/effects';

function Arrow({ diagonal = false }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={diagonal ? 'arrow arrow-diagonal' : 'arrow'}><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const ecosystems = [
  ['01', 'Journals Publishing', 'Research, shared.', 'Dua jurnal peer-review dengan akses terbuka: JETSI untuk teknik dan teknologi, JIEL untuk pendidikan dan pembelajaran.', '/journals', '/assets/ecosystem-journals.webp', 'Suasana penerbitan jurnal akademik', 'Tersedia'],
  ['02', 'Books Publishing', 'Ideas, in depth.', 'Rencana penerbitan buku dan referensi untuk membawa gagasan akademik ke pembaca yang lebih luas.', '/books', '/assets/ecosystem-books.webp', 'Deretan buku dan referensi akademik', 'Coming Soon'],
  ['03', 'Media & News Publishing', 'Knowledge, in conversation.', 'Ruang berbagi perkembangan riset, perspektif, dan cerita dari dunia akademik yang sedang disiapkan.', '/news', '/assets/ecosystem-media.webp', 'Ruang media dan berita akademik', 'Coming Soon'],
  ['04', 'Academic Training', 'Learning, together.', 'Pengembangan program pelatihan untuk mendukung keterampilan riset dan penulisan akademik.', '/services', '/assets/ecosystem-training.webp', 'Sesi pelatihan dan pembelajaran akademik', 'Coming Soon'],
];

const marqueeItems = ['Open access', 'Double-blind peer review', 'Engineering & technology', 'Education & learning', 'Digital transformation', 'Data science', 'Sustainability', 'Research integrity'];

const stats = [
  ['Jurnal akademik aktif', 2, ''],
  ['Bidang fokus JETSI', 5, ''],
  ['Platform indeksasi', 6, ''],
  ['Terbit setiap tahun', 2, '×'],
];

function useReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-reveal]:not(.is-visible)')];
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) { nodes.forEach((node) => node.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);
}

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const { pathname, hash } = useLocation();
  useReveal();
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event) => { if (event.key === 'Escape') { setMenuOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); else window.scrollTo(0, 0); }, [pathname, hash]);
  return <>
    <ScrollProgress />
    <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
    <header aria-label="Nordeo Scholar" className="site-header"><div className="container header-inner">
      <Link to="/" className="brand" aria-label="Nordeo Scholar - Beranda" onClick={() => setMenuOpen(false)}><img src="/assets/logo-transparent.png" width="220" height="60" alt="Nordeo Scholar Publishing" /></Link>
      <button className="menu-toggle" ref={toggleRef} type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><span>{menuOpen ? 'Tutup menu' : 'Menu'}</span><span className={`menu-lines ${menuOpen ? 'is-open' : ''}`} aria-hidden="true"><i /><i /></span></button>
      <nav id="primary-navigation" aria-label="Navigasi utama" className={`primary-navigation ${menuOpen ? 'is-open' : ''}`} onClick={(event) => { if (event.target.closest('a')) setMenuOpen(false); }}><NavLink to="/about">About</NavLink><Link to="/#ecosystem">Ecosystem</Link><NavLink to="/journals">Journals</NavLink><NavLink to="/contact">Contact</NavLink><Link className="button button-small button-dark" to="/journals">Explore Journals <Arrow diagonal /></Link></nav>
    </div></header>
    <main id="main-content" tabIndex="-1"><PageFade routeKey={pathname}>{children}</PageFade></main>
    <footer className="site-footer"><div className="container"><div className="footer-main">
      <div className="footer-brand"><Link to="/" aria-label="Nordeo Scholar - Beranda"><img src="/assets/logo-light.png" width="240" height="65" alt="Nordeo Scholar Publishing" /></Link><p>Ruang bertumbuh bagi pengetahuan,<br />{' '}publikasi, dan kolaborasi akademik.</p></div>
      <div><h2>Discover</h2><Link to="/about">About Nordeo</Link><Link to="/journals">Our Journals</Link><Link to="/#ecosystem">Our Ecosystem</Link></div>
      <div><h2>For scholars</h2><Link to="/author-guide">Panduan Penulis</Link><Link to="/publication-ethics">Publication Ethics</Link><a href={externalLinks.jetsi}>Platform JETSI <Arrow diagonal /></a></div>
      <div><h2>Let's connect</h2><a href="mailto:info@nordeoscholar.com">info@nordeoscholar.com</a><Link to="/contact">Kontak & Kolaborasi <Arrow diagonal /></Link></div>
    </div><div className="footer-bottom"><p>&copy; {new Date().getFullYear()} Nordeo Scholar Publishing.</p><span>Knowledge grows when shared.</span><div><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms-of-use">Terms of Use</Link></div></div></div></footer>
  </>;
}

function JournalCard({ journal, delay = 0 }) {
  return (
    <SpotlightCard className="journal-card" data-reveal style={{ '--reveal-delay': `${delay}ms` }}>
      <div className="journal-frame">
        <span className="frame-bar" aria-hidden="true"><i /><i /><i /><b>{journal.display}</b></span>
        <img src={journal.preview} alt={journal.previewAlt} width="1200" height="900" loading="lazy" />
        {journal.cover && <img className="journal-cover" src={journal.cover} alt={journal.coverAlt} width="180" height="255" loading="lazy" />}
      </div>
      <div className="journal-card-body">
        <p className="journal-badge" lang="en">{journal.short}</p>
        <p className="card-category" lang="en">{journal.field}</p>
        <h3 lang="en">{journal.name}</h3>
        <p className="journal-summary">{journal.summary}</p>
        <ul className="chip-list">{journal.scope.map((item) => <li key={item} lang="en">{item}</li>)}</ul>
        <dl className="journal-facts">{journal.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {journal.indexing.length > 0 && <p className="journal-indexing">Terindeks: {journal.indexing.join(' · ')}</p>}
        <div className="journal-actions">
          <a className="button button-gold" href={journal.url}>Visit {journal.short} <Arrow diagonal /></a>
          <span className="journal-note">Terbuka di platform jurnal (OJS).</span>
        </div>
      </div>
    </SpotlightCard>
  );
}

function Home() {
  return <>
    <section className="hero container" aria-labelledby="hero-heading"><div className="hero-copy"><p className="eyebrow"><span className="gold-line" />NORDEO SCHOLAR PUBLISHING</p><h1 id="hero-heading" lang="en">Advancing<br />{' '}knowledge.<br />{' '}<em>Connecting research.</em></h1><p className="hero-description">Dua jurnal peer-review, satu ekosistem akademik. Jelajahi JETSI dan JIEL, temukan ruang publikasi Anda, dan tumbuh bersama komunitas Nordeo.</p><div className="hero-actions"><Link to="/journals" className="button button-gold">Explore Journals <Arrow diagonal /></Link><a href="#ecosystem" className="text-link">Jelajahi Ekosistem <Arrow /></a></div><p className="hero-footnote">Dari rasa ingin tahu, menuju kontribusi.</p></div>
      <div className="hero-visual"><div className="hero-photo"><Parallax className="hero-photo-media" distance={22}><img src="/assets/hero.webp" alt="Rak buku bertingkat di perpustakaan, ruang bertemunya pengetahuan" width="1400" height="788" fetchPriority="high" /></Parallax><span className="photo-topline">A HOME FOR CURIOUS MINDS</span><p lang="en">Good ideas.<br />{' '}<em>Wider horizons.</em></p><span className="photo-bottomline">RESEARCH &nbsp; / &nbsp; PUBLISHING &nbsp; / &nbsp; CONNECTION</span></div><div className="hero-seal" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none"><path d="M50 8v84M8 50h84M20 20l60 60M20 80l60-60M34 11l32 78M11 34l78 32M11 66l78-32M34 89l32-78" stroke="currentColor" strokeWidth="2" /><circle cx="50" cy="50" r="18" fill="currentColor" /></svg></div><div className="hero-note"><span className="note-index">01 / OUR PURPOSE</span><p>Pengetahuan yang terhubung.<br />{' '}<strong>Kesempatan yang lebih luas.</strong></p><Link to="/about" aria-label="Kenali Nordeo Scholar" className="circle-link"><Arrow diagonal /></Link></div></div>
    </section>
    <div className="marquee" aria-hidden="true"><div className="marquee-track">{[...marqueeItems, ...marqueeItems].map((item, index) => <span key={`${item}-${index}`} lang="en">{item}<i /></span>)}</div></div>
    <nav className="quick-access container" aria-label="Jalur cepat"><div className="quick-intro" data-reveal><span className="eyebrow">START EXPLORING</span><p>Apa yang ingin<br />{' '}Anda temukan?</p></div>{[['01', 'Cari Jurnal', 'Temukan ruang untuk riset Anda', '/journals'], ['02', 'Panduan Penulis', 'Kenali langkah publikasi', '/author-guide'], ['03', 'Kerja Sama', 'Mulai percakapan yang berarti', '/contact']].map(([number, title, copy, to], index) => <Link to={to} key={title} data-reveal style={{ '--reveal-delay': `${index * 70}ms` }}><span className="quick-number">{number}</span><div><strong>{title}</strong><span>{copy}</span></div><Arrow diagonal /></Link>)}</nav>
    <section className="journals-section section-space container" id="journals" aria-labelledby="journals-heading"><div className="section-heading" data-reveal><div><p className="eyebrow">01 / OUR JOURNALS</p><h2 id="journals-heading" lang="en">Two journals.<br />{' '}<em>Open to the world.</em></h2></div><p>JETSI dan JIEL dikelola melalui platform jurnal Nordeo dengan tinjauan double-blind dan akses terbuka. Buka platformnya untuk membaca terbitan atau mengirim naskah.</p></div><div className="journal-grid">{journals.map((journal, index) => <JournalCard key={journal.id} journal={journal} delay={index * 90} />)}</div></section>
    <section className="ecosystem-section section-space container" id="ecosystem" aria-labelledby="ecosystem-heading"><div className="section-heading" data-reveal><div><p className="eyebrow">02 / THE NORDEO ECOSYSTEM</p><h2 id="ecosystem-heading" lang="en">Connected by knowledge.<br />{' '}<em>Built for possibility.</em></h2></div><p>Satu pintu menuju publikasi dan pengembangan akademik. Kenali layanan yang tersedia dan arah yang sedang kami bangun.</p></div><div className="ecosystem-grid">{ecosystems.map(([number, title, category, description, to, image, alt, status], index) => <article className="ecosystem-card" key={title} data-reveal style={{ '--reveal-delay': `${index * 80}ms` }}><div className="ecosystem-photo"><img src={image} alt={alt} width="1000" height="667" loading="lazy" /><span className={`status ${status === 'Tersedia' ? 'status-active' : ''}`}>{status}</span></div><div className="ecosystem-card-copy"><span className="card-number">{number}</span><p className="card-category" lang="en">{category}</p><h3>{title}</h3><p>{description}</p><Link to={to} className="text-link">{status === 'Tersedia' ? 'Lihat Jurnal' : 'Lihat Rencana'} <Arrow diagonal /></Link></div></article>)}</div></section>
    <section className="publishing-section section-space container" aria-labelledby="publishing-heading"><div className="section-heading" data-reveal><div><p className="eyebrow">03 / YOUR PUBLISHING JOURNEY</p><h2 id="publishing-heading" lang="en">Good research.<br />{' '}<em>A clear next step.</em></h2></div><p>Mulai dari jurnal yang tepat. Website Nordeo membantu Anda menemukan arah, lalu melanjutkan proses di platform jurnal terkait.</p></div><ol className="publishing-steps"><li data-reveal><span>01</span><h3>Temukan jurnal Anda</h3><p>Bandingkan ruang lingkup JETSI dan JIEL, lalu pilih yang paling dekat dengan riset Anda.</p><Link to="/journals">Cari Jurnal <Arrow /></Link></li><li data-reveal style={{ '--reveal-delay': '90ms' }}><span>02</span><h3>Kenali panduannya</h3><p>Pelajari ketentuan penulisan dan kebijakan publikasi sebelum menyiapkan naskah.</p><Link to="/author-guide">Panduan Penulis <Arrow /></Link></li><li data-reveal style={{ '--reveal-delay': '180ms' }}><span>03</span><h3>Kirim di platform jurnal</h3><p>Baca terbitan dan temukan informasi pengiriman naskah pada platform jurnal yang dipilih.</p><Link to="/journals">Buka Platform Jurnal <Arrow diagonal /></Link></li></ol></section>
    <section className="stats-section" aria-labelledby="stats-heading"><div className="container stats-inner"><div className="stats-head" data-reveal><p className="eyebrow">04 / KNOWLEDGE IN NUMBERS</p><h2 id="stats-heading" lang="en">Nordeo,<br />{' '}<em>in numbers.</em></h2></div><dl className="stats-grid">{stats.map(([label, value, suffix]) => <div key={label} data-reveal><dd aria-hidden="true"><CountUp value={value} suffix={suffix} /></dd><dt>{label}</dt></div>)}</dl><p className="stats-note" data-reveal>JETSI terindeks di Google Scholar, GARUDA, Crossref, ResearchGate, Dimensions, dan Neliti.</p></div></section>
    <section className="about-section container" aria-labelledby="about-heading"><Parallax className="about-photo" distance={30}><img src="/assets/about-shelves.webp" alt="Rak dan lorong perpustakaan dengan koleksi buku" width="880" height="1100" loading="lazy" /><span className="about-photo-label" aria-hidden="true">KNOWLEDGE<br />WITH PURPOSE.</span></Parallax><div className="about-copy" data-reveal><p className="eyebrow">05 / THE PEOPLE BEHIND THE PAGES</p><h2 id="about-heading" lang="en">Growing knowledge.<br />{' '}<em>Together.</em></h2><p>Nordeo Scholar hadir untuk menghubungkan riset, pendidikan, dan publikasi. Kami membangun ruang bagi penulis, pembaca, dan mitra untuk bertukar gagasan dan membuka kesempatan kolaborasi.</p><div className="about-principles"><span>Integritas</span><span>Transparansi</span><span>Kolaborasi</span></div><div className="about-links"><Link to="/about" className="text-link">Kenali Nordeo <Arrow /></Link><Link to="/publication-ethics" className="text-link">Publication Ethics <Arrow diagonal /></Link></div></div></section>
    <section className="collaboration-section container" aria-labelledby="collaboration-heading" data-reveal><div><p className="eyebrow">LET'S BUILD SOMETHING MEANINGFUL</p><h2 id="collaboration-heading">Gagasan besar dimulai<br />{' '}dari <em>percakapan kecil.</em></h2><p>Punya ide publikasi atau peluang kerja sama? Mari terhubung.</p></div><Link to="/contact" className="button button-gold">Hubungi Nordeo <Arrow diagonal /></Link></section>
  </>;
}

function Journals() {
  return <section className="container inner-page" data-reveal><p className="eyebrow">PUBLICATION PORTFOLIO</p><h1 lang="en">Journals for<br />{' '}<em>useful knowledge.</em></h1><p className="page-intro">Dua jurnal peer-review Nordeo tersedia melalui platform jurnal: JETSI untuk teknik dan teknologi, JIEL untuk pendidikan dan pembelajaran. Keduanya open access dengan tinjauan double-blind.</p><div className="journal-grid journal-grid-page">{journals.map((journal, index) => <JournalCard key={journal.id} journal={journal} delay={index * 90} />)}</div><article className="journal-archive"><div><p className="eyebrow">JURNAL PENGABDIAN</p><h2>Jurnal Pengmas</h2><p>Ruang publikasi pengabdian masyarakat dalam ekosistem Nordeo Scholar. Profil dan informasinya tersedia di website ini.</p></div><Link to="/journals/jurnalpengmas" className="button button-outline">Visit Jurnal Pengmas <Arrow /></Link></article></section>;
}

function Pengmas() {
  return <section className="container inner-page reading-page" data-reveal><Link to="/journals" className="back-link">Kembali ke Journals</Link><p className="eyebrow">NORDEO SCHOLAR JOURNAL</p><h1>Jurnal <em>Pengmas</em></h1><p className="page-intro">Ruang publikasi Nordeo Scholar untuk pengabdian masyarakat, solusi lokal, dan kontribusi ilmu bagi komunitas.</p><div className="information-panel"><h2>Informasi publikasi</h2><p>Hubungi tim Nordeo untuk informasi ketersediaan terbitan, ruang lingkup, dan ketentuan pengiriman naskah Jurnal Pengmas.</p><Link to="/contact" className="button button-dark">Contact editorial team <Arrow diagonal /></Link></div></section>;
}

function AuthorGuide() {
  return <section className="container inner-page reading-page" data-reveal><p className="eyebrow">FOR AUTHORS</p><h1>Panduan <em>Penulis.</em></h1><p className="page-intro">Siapkan langkah pertama publikasi Anda. Ketentuan lengkap mengikuti panduan pada masing-masing platform jurnal.</p><ol className="guide-list"><li><h2>Pilih jurnal sesuai bidang</h2><p>Baca profil dan ruang lingkup JETSI dan JIEL. Pastikan topik serta jenis naskah Anda sesuai sebelum melanjutkan.</p><Link to="/journals" className="text-link">Temukan Jurnal <Arrow /></Link></li><li><h2>Periksa panduan dan kebijakan</h2><p>Di platform jurnal tujuan, baca author guidelines, template naskah, etika publikasi, serta informasi biaya bila berlaku.</p></li><li><h2>Ikuti alur pada platform jurnal</h2><p>Pendaftaran akun dan pengiriman naskah mengikuti sistem jurnal terkait. Website ini membantu Anda menemukan platform yang tepat.</p><Link to="/journals" className="button button-dark">Buka Platform Jurnal <Arrow diagonal /></Link></li></ol></section>;
}

function SimplePage() {
  const { pathname } = useLocation();
  const [title, copy] = pages[pathname] || ['Page not found', 'Halaman yang Anda cari belum tersedia. Kembali ke beranda untuk menjelajahi Nordeo.'];
  const planned = ['/books', '/news', '/services'].includes(pathname);
  const contact = ['/contact', '/collaboration'].includes(pathname);
  return <section className="container inner-page reading-page" data-reveal><Link to="/" className="back-link">Kembali ke Beranda</Link><p className="eyebrow">{planned ? 'EKOSISTEM DALAM PENGEMBANGAN' : 'NORDEO SCHOLAR'}</p><h1>{title}</h1><p className="page-intro">{copy}</p>{planned && <div className="information-panel"><span className="status">Coming Soon</span><h2>Ruang baru sedang disiapkan.</h2><p>Informasi layanan akan diperbarui saat tersedia. Untuk saat ini, jelajahi jurnal Nordeo atau hubungi kami untuk percakapan lebih lanjut.</p><Link className="button button-dark" to="/journals">Explore Journals <Arrow /></Link></div>}{contact && <div className="information-panel contact-panel"><p className="eyebrow">START A CONVERSATION</p><h2>Mari terhubung.</h2><p>Ceritakan kebutuhan publikasi atau rencana kolaborasi Anda melalui email. Sertakan nama, institusi, dan topik yang ingin dibahas.</p><a className="contact-email" href="mailto:info@nordeoscholar.com">info@nordeoscholar.com <Arrow diagonal /></a><small>Tautan membuka aplikasi email Anda.</small></div>}{pathname === '/publication-ethics' && <div className="information-panel"><h2>Informasi kebijakan jurnal</h2><p>Kebijakan lengkap mengenai etika, kepenulisan, dan proses review mengikuti ketentuan jurnal yang dipilih. Baca informasi terbaru pada platform jurnal sebelum mengirimkan naskah.</p><a href={externalLinks.jetsi} className="button button-dark">Baca Kebijakan di Platform JETSI <Arrow diagonal /></a><p><Link to="/contact" className="text-link">Hubungi Tim Nordeo <Arrow /></Link></p></div>}{pathname === '/about' && <div className="information-panel"><h2>Satu ekosistem, banyak kemungkinan.</h2><p>Journals Publishing menjadi pintu awal ekosistem Nordeo dengan dua jurnal aktif, JETSI dan JIEL. Books Publishing, Media & News Publishing, dan Academic Training berada dalam pengembangan.</p><Link to="/#ecosystem" className="button button-dark">Jelajahi Ekosistem <Arrow /></Link></div>}{!pages[pathname] && <Link className="button button-dark" to="/">Kembali ke Beranda <Arrow /></Link>}</section>;
}

export default function App() {
  return <Layout><Routes><Route path="/" element={<Home />} /><Route path="/journals" element={<Journals />} /><Route path="/journals/jurnalpengmas" element={<Pengmas />} /><Route path="/author-guide" element={<AuthorGuide />} /><Route path="*" element={<SimplePage />} /></Routes></Layout>;
}
