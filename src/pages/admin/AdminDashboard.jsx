import { useCallback, useEffect, useRef, useState } from 'react';
import './admin.css';

// Brand colours read from each journal's OJS header at nordeoscholar.com/journal/ (30 Oct 2026).
// Impressions come from the Google Search Console export used in the capstone report.
const JOURNALS = {
  jetsi: { name: 'JETSI', color: '#0097b2', deep: '#006798', light: '#5cc6dc', axisMax: 150, id: 93,
    pages: [['Home', 123], ['About', 87], ['Focus', 36], ['Issue 6', 33], ['Archive', 9], ['APC', 6]] },
  jiel: { name: 'JIEL', color: '#780707', deep: '#780707', light: '#e59a9a', axisMax: 75, id: 30,
    pages: [['About', 59], ['Focus', 11], ['APC', 8]] },
  jibdi: { name: 'JIBDI', color: '#065ee0', deep: '#0449b0', light: '#7fb0ff', axisMax: 0, id: 0, pages: [] },
};

const TABS = [
  { id: 'dash', label: 'Dashboard', icon: 'grid', w: 104 },
  { id: 'konten', label: 'Konten', icon: 'file', w: 84 },
  { id: 'eko', label: 'Ekosistem', icon: 'layers', w: 98 },
  { id: 'news', label: 'NordeoNews', icon: 'news', w: 112 },
  { id: 'academy', label: 'Academy', icon: 'cap', w: 92 },
  { id: 'pesan', label: 'Pesan', icon: 'mail', w: 76 },
];

const THEMES = {
  light: { bg: '#efeee9', panel: '#fbf9f5', card: '#ffffff', chip: '#f5f2ea', ink: '#142a32', ink2: '#5e7278', line: '#e5e1d6', hatch: 'rgba(30, 85, 102, 0.16)', dark: '#0f3038', onDark: '#ffffff' },
  dark: { bg: '#06191e', panel: '#0a242b', card: '#0f3038', chip: '#17414f', ink: '#f2f7f7', ink2: '#9db2b7', line: 'rgba(226, 236, 238, 0.14)', hatch: 'rgba(226, 236, 238, 0.16)', dark: '#f2f7f7', onDark: '#0f3038' },
};

const ACCENTS = {
  yellow: { color: '#ffd218', ink: '#142a32', soft: 'rgba(255, 210, 24, 0.24)', label: 'Kuning' },
  teal: { color: '#1e5566', ink: '#ffffff', soft: 'rgba(30, 85, 102, 0.14)', label: 'Teal' },
  gold: { color: '#c9a227', ink: '#142a32', soft: 'rgba(201, 162, 39, 0.2)', label: 'Gold' },
};

const DAYS = [['Sen, 26', 26], ['Sel, 27', 27], ['Rab, 28', 28], ['Kam, 29', 29], ['Jum, 30', 30], ['Sab, 31', 31], ['Min, 1', 1]];
const PLAN = { '08.00': { 28: 'soft', 31: 'solid' }, '10.00': { 26: 'empty', 30: 'solid', 29: 'soft' } };
const STORE = 'nordeo-admin-ui';

const ICON_PATHS = {
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" /></>,
  file: <><path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8L14 3.5Z" /><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4" /></>,
  layers: <><path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z" /><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" /></>,
  news: <><rect x="4" y="4.5" width="13" height="15" rx="2" /><path d="M17 8h2.5v9.5a2 2 0 0 1-2 2H6M7.5 8.5h6M7.5 12h6M7.5 15.5h3.5" /></>,
  cap: <><path d="m2.5 9.5 9.5-5 9.5 5-9.5 5-9.5-5Z" /><path d="M6.5 11.6V16c1.5 1.6 3.4 2.4 5.5 2.4s4-.8 5.5-2.4v-4.4" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  sun: <><circle cx="12" cy="12" r="3.6" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
  moon: <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  export: <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 15v4h14v-4" />,
  chat: <path d="M4.5 19.5 6 15.5A7.5 7.5 0 1 1 9 18.6l-4.5.9Z" />,
  camera: <><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.2" r=".6" fill="currentColor" /></>,
  form: <path d="M5 5h14v10H8l-3 3V5Z" />,
  addCircle: <><circle cx="12" cy="12" r="8.5" /><path d="M12 8.5v7M8.5 12h7" /></>,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
};

function Icon({ name, size = 18, width = 1.7 }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">{ICON_PATHS[name]}</svg>;
}

function readSaved() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
}

const ease = (p) => 1 - Math.pow(1 - p, 3);

function useCountUp(still, deps) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (still) { setP(1); return undefined; }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const next = Math.min(1, (now - start) / 1300);
      setP(next);
      if (next < 1) raf = requestAnimationFrame(tick);
    };
    setP(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still, ...deps]);
  return ease(p);
}

export default function AdminDashboard() {
  const saved = useRef(readSaved()).current;
  const [nav, setNav] = useState(saved.nav === 'left' ? 'left' : 'top');
  const [theme, setTheme] = useState(saved.theme === 'dark' ? 'dark' : 'light');
  const [accentId, setAccentId] = useState(ACCENTS[saved.accent] ? saved.accent : 'yellow');
  const [motion, setMotion] = useState(saved.motion === 'off' ? 'off' : 'on');
  const [tab, setTab] = useState(0);
  const [journal, setJournal] = useState('jetsi');
  const [settings, setSettings] = useState(false);
  const [wipe, setWipe] = useState({ phase: 'idle', color: '#ffd218' });
  const timers = useRef([]);
  const systemReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const still = motion === 'off' || systemReduced;
  const p = useCountUp(still, [nav, theme, journal]);

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify({ nav, theme, accent: accentId, motion })); } catch { /* settings still work without storage */ }
  }, [nav, theme, accentId, motion]);

  useEffect(() => {
    const title = document.title;
    document.title = 'Dashboard Admin | Nordeo Scholar';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => { document.title = title; robots.remove(); timers.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (!settings) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setSettings(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settings]);

  const transition = useCallback((apply, color) => {
    if (still) { apply(); return; }
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setWipe({ phase: 'in', color });
    timers.current.push(setTimeout(() => { apply(); setWipe({ phase: 'out', color }); }, 460));
    timers.current.push(setTimeout(() => setWipe({ phase: 'idle', color }), 980));
  }, [still]);

  const t = THEMES[theme];
  const a = ACCENTS[accentId];
  const isDark = theme === 'dark';
  const J = JOURNALS[journal];
  const n = (v) => Math.round(v * p).toLocaleString('en-US');
  const pillX = TABS.slice(0, tab).reduce((s, x) => s + x.w + 2, 0);
  const logo = isDark ? '/assets/logo-light.png' : '/assets/logo-transparent.png';
  const vars = {
    '--bg': t.bg, '--panel': t.panel, '--card': t.card, '--chip': t.chip, '--ink': t.ink, '--ink2': t.ink2, '--line': t.line,
    '--hatch': t.hatch, '--dark': t.dark, '--on-dark': t.onDark, '--accent': a.color, '--accent-ink': a.ink, '--accent-soft': a.soft,
    '--focus': isDark ? '#6fb3c4' : '#1e5566',
  };

  const changeNav = (value) => { if (value !== nav) transition(() => setNav(value), value === 'left' ? '#1e5566' : a.color); };
  const changeTheme = (value) => { if (value !== theme) transition(() => setTheme(value), THEMES[value].panel); };

  const themeSwitch = <div className="adm-seg" role="group" aria-label="Tema">
    <div aria-hidden="true" className="adm-seg__thumb adm-glide" style={{ transform: `translateX(${isDark ? 40 : 0}px)` }} />
    <button type="button" className="adm-seg__btn adm-btn" onClick={() => changeTheme('light')} aria-label="Tema terang" aria-pressed={!isDark} style={{ color: isDark ? t.ink2 : t.onDark }}><Icon name="sun" size={17} width={1.8} /></button>
    <button type="button" className="adm-seg__btn adm-btn" onClick={() => changeTheme('dark')} aria-label="Tema gelap" aria-pressed={isDark} style={{ color: isDark ? t.onDark : t.ink2 }}><Icon name="moon" size={17} width={1.8} /></button>
  </div>;
  const bell = <button type="button" className="adm-circle is-lg adm-btn" aria-label="Notifikasi" style={{ position: 'relative' }}><Icon name="bell" /><span aria-hidden="true" className="adm-dot" /></button>;
  const gear = (lg) => <button type="button" className={`adm-circle adm-btn${lg ? ' is-lg' : ''}`} onClick={() => setSettings(true)} aria-label="Pengaturan" title="Pengaturan"><Icon name="gear" /></button>;

  const stats = [
    { label: 'Total Konten Terbit', value: n(48), delta: '+12%', chip: '#22a55a' },
    { label: 'Total Subscriber', value: n(312), delta: '+8%', chip: '#22a55a' },
    { label: 'Pesan Belum Dibalas', value: n(9), delta: '-5%', chip: '#ef4444' },
  ];
  const axis = [J.axisMax, Math.round(J.axisMax * 2 / 3), Math.round(J.axisMax / 3), 0];

  const option = (current, value, label, swatch, pick) => {
    const on = current === value;
    return <button key={value} type="button" className="adm-opt adm-btn" aria-pressed={on} onClick={() => !on && pick(value)} style={{ borderColor: on ? a.color : t.line, background: on ? a.soft : t.card }}>
      <span aria-hidden="true" className="adm-opt__sw" style={{ background: swatch }} />
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
    </button>;
  };
  const settingGroups = [
    { title: 'Posisi navigasi', note: 'Menu di atas seperti tab, atau rail ikon di kiri.', cols: 2, options: [option(nav, 'top', 'Atas', t.dark, changeNav), option(nav, 'left', 'Kiri', t.dark, changeNav)] },
    { title: 'Warna aksen', note: 'Dari palet Nordeo; latar tetap putih.', cols: 3, options: Object.keys(ACCENTS).map((k) => option(accentId, k, ACCENTS[k].label, ACCENTS[k].color, setAccentId)) },
    { title: 'Tema', note: 'Terang atau gelap.', cols: 2, options: [option(theme, 'light', 'Terang', THEMES.light.panel, changeTheme), option(theme, 'dark', 'Gelap', THEMES.dark.panel, changeTheme)] },
    { title: 'Animasi', note: 'Matikan bila terasa berlebihan.', cols: 2, options: [option(motion, 'on', 'Aktif', a.color, setMotion), option(motion, 'off', 'Kurangi', t.chip, setMotion)] },
  ];

  return <div className={`adm${still ? ' is-still' : ''}`} style={vars}>
    <div className={`adm-frame${nav === 'left' ? ' is-left' : ''}`}>
      {nav === 'left' && <aside className="adm-rail adm-rise" aria-label="Navigasi">
        <div aria-hidden="true" className="adm-rail__mark">N</div>
        <div className="adm-rail__list">
          <div aria-hidden="true" className="adm-rail__pill adm-glide" style={{ transform: `translateY(${tab * 52}px)` }} />
          {TABS.map((x, i) => <button key={x.id} type="button" className="adm-rail__btn adm-btn" onClick={() => setTab(i)} aria-label={x.label} title={x.label} aria-current={i === tab ? 'page' : undefined} style={{ color: i === tab ? t.onDark : t.ink2 }}><Icon name={x.icon} size={19} /></button>)}
        </div>
        <div className="adm-rail__foot">{gear(false)}<div aria-hidden="true" className="adm-avatar">AD</div></div>
      </aside>}

      <div className="adm-main">
        {nav === 'top' ? <header className="adm-top adm-rise">
          <a className="adm-logo" href="/" aria-label="Nordeo Scholar Publishing, ke beranda"><img src={logo} alt="" /></a>
          <nav className="adm-tabs" aria-label="Menu utama">
            <div aria-hidden="true" className="adm-tabs__pill adm-glide" style={{ width: TABS[tab].w, transform: `translateX(${pillX}px)` }} />
            {TABS.map((x, i) => <button key={x.id} type="button" className="adm-tab adm-btn" onClick={() => setTab(i)} aria-current={i === tab ? 'page' : undefined} style={{ width: x.w, color: i === tab ? t.onDark : t.ink }}>{x.label}</button>)}
          </nav>
          <div className="adm-tools">{themeSwitch}{bell}{gear(true)}<div aria-hidden="true" className="adm-avatar">AD</div></div>
        </header> : <header className="adm-top adm-rise">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a href="/" aria-label="Nordeo Scholar Publishing, ke beranda"><img src={logo} alt="" style={{ height: 30, width: 'auto', display: 'block' }} /></a>
            <span aria-hidden="true" style={{ width: 1, height: 28, background: t.line }} />
            <h1 style={{ fontSize: 18, fontWeight: 500 }}>{TABS[tab].label}</h1>
          </div>
          <div className="adm-tools">{themeSwitch}{bell}</div>
        </header>}

        <section className="adm-hero adm-rise" style={{ animationDelay: '80ms' }}>
          <div className="adm-search">
            <label htmlFor="adm-q" className="adm-sr">Cari konten</label>
            <input id="adm-q" type="search" placeholder="Cari sesuatu..." autoComplete="off" />
            <button type="button" className="adm-circle is-lg adm-btn" aria-label="Cari"><Icon name="search" width={1.8} /></button>
          </div>
          <div className="adm-stats">
            {stats.map((s) => <div key={s.label}>
              <div className="adm-stat__label">{s.label}</div>
              <div className="adm-stat__row"><span className="adm-stat__value">{s.value}</span><span className="adm-delta" style={{ background: s.chip }}>{s.delta}</span></div>
            </div>)}
          </div>
        </section>

        <div className="adm-grid">
          <article className="adm-card adm-rise c10" style={{ animationDelay: '140ms', minHeight: 250, display: 'flex', flexDirection: 'column' }}>
            <div className="adm-card__head"><h2 className="adm-card__title">Kanal Pesan</h2><button type="button" className="adm-circle is-sm adm-btn" aria-label="Tambah kanal"><Icon name="plus" size={16} width={1.8} /></button></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: t.ink2 }}>Rata-rata waktu balas:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 46, lineHeight: '52px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{n(38)}</span><span className="adm-tag" style={{ background: '#22a55a', color: '#fff', fontWeight: 500 }}>Cepat</span></div>
                <div style={{ fontSize: 13, color: t.ink2 }}>Menit · contoh data</div>
              </div>
              <svg aria-hidden="true" viewBox="0 0 240 128" width="240" height="128" style={{ marginRight: -10 }}>
                <path d="M 30 118 A 90 90 0 0 1 210 118" fill="none" stroke="var(--chip)" strokeWidth="36" />
                <path className="adm-gauge__arc" pathLength="100" d="M 30 118 A 90 90 0 0 1 210 118" fill="none" stroke="var(--accent)" strokeWidth="36" style={{ '--to': 32 }} />
                <g className="adm-gauge__needle" style={{ '--deg': '32deg' }}><path d="M120 62 L130 112 L120 104 L110 112 Z" fill="var(--ink)" /></g>
              </svg>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              {[['WhatsApp', 10, 'chat'], ['Email', 8, 'mail'], ['Instagram', 4, 'camera']].map(([name, count, icon]) => <span key={name} title={name} style={{ position: 'relative', width: 50, height: 50, borderRadius: 999, border: `1px solid ${t.line}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} size={20} /><span className="adm-sr">{name}</span><span className="adm-badge">{count}</span>
              </span>)}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 50, padding: '0 16px 0 8px', borderRadius: 999, border: `1px solid ${t.line}` }}>
                <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 10, background: a.soft, color: isDark ? t.ink : '#142a32', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="form" size={18} width={1.8} /></span>
                <span style={{ lineHeight: '16px' }}><span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Form Contact</span><span style={{ fontSize: 12, color: t.ink2 }}><span style={{ display: 'inline-block', padding: '0 6px', borderRadius: 999, background: '#ef4444', color: '#fff', fontSize: 11, marginRight: 4 }}>16</span>pesan baru</span></span>
              </span>
            </div>
          </article>

          <article className="adm-card adm-rise c5" style={{ animationDelay: '200ms', minHeight: 250, background: a.color, color: a.ink, display: 'flex', flexDirection: 'column' }}>
            <div className="adm-card__head"><h2 style={{ fontSize: 26, lineHeight: '30px', fontWeight: 400 }}>Tulis<br />Artikel</h2><span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrow" size={16} width={1.8} /></span></div>
            <button type="button" className="adm-btn" style={{ marginTop: 14, alignSelf: 'flex-start', height: 40, padding: '0 16px 0 12px', border: 0, borderRadius: 999, background: '#fff', color: '#142a32', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="addCircle" size={16} width={1.8} />Buat baru</button>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', gap: 10 }}><span style={{ fontSize: 58, lineHeight: '58px', fontWeight: 300, fontVariantNumeric: 'tabular-nums' }}>{n(12)}</span><span style={{ fontSize: 13, lineHeight: '16px', paddingBottom: 6 }}>Rata-rata<br />per bulan</span></div>
          </article>

          <article className="adm-card adm-rise c4" style={{ animationDelay: '260ms', minHeight: 250, display: 'flex', flexDirection: 'column' }}>
            <div className="adm-card__head"><h2 className="adm-card__title">Catatan<br />Redaksi</h2><button type="button" className="adm-circle is-sm adm-btn" aria-label="Tambah catatan"><Icon name="plus" size={16} width={1.8} /></button></div>
            <div style={{ marginTop: 'auto', position: 'relative', paddingTop: 10 }}>
              <div aria-hidden="true" style={{ position: 'absolute', left: 10, right: 10, top: 0, height: 20, borderRadius: '16px 16px 0 0', background: t.dark, opacity: .85 }} />
              <div style={{ position: 'relative', padding: 14, borderRadius: 16, background: t.card, border: `1px solid ${t.line}`, boxShadow: '0 10px 24px rgba(16,48,56,.08)' }}>
                <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 999, border: `1px solid ${t.line}`, fontSize: 12 }}>2 jam lalu</span>
                <div style={{ marginTop: 10, fontSize: 15, lineHeight: '20px', fontWeight: 500 }}>Rapat redaksi NordeoNews edisi November</div>
                <div style={{ marginTop: 6, fontSize: 12, color: t.ink2 }}>Media &amp; News · Admin</div>
              </div>
            </div>
          </article>

          <article className="adm-card adm-rise c5" style={{ animationDelay: '320ms', minHeight: 250, position: 'relative', overflow: 'hidden' }}>
            <div className="adm-card__head" style={{ position: 'relative', zIndex: 1 }}><h2 className="adm-card__title">Pembaca <span style={{ color: isDark ? J.light : J.deep }}>{J.name}</span><br />per Negara</h2><span aria-hidden="true" className="adm-circle is-sm" style={{ display: 'inline-flex' }}><Icon name="arrow" size={16} width={1.8} /></span></div>
            <svg aria-hidden="true" viewBox="0 0 300 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: '60px 0 0 0', width: '100%', height: 'calc(100% - 60px)' }}><path d="M0 40 H300 M0 110 H300 M0 170 H300 M60 0 V200 M150 0 V200 M230 0 V200 M90 40 L150 110 M200 110 L260 170" stroke="var(--line)" strokeWidth="10" fill="none" /><rect x="100" y="60" width="40" height="30" fill="none" stroke="var(--line)" strokeWidth="2" /></svg>
            <span aria-hidden="true" className="adm-pop" style={{ animationDelay: '700ms', position: 'absolute', left: 0, right: 0, margin: '0 auto', top: 92, width: 30, height: 30, borderRadius: 999, overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,.18)', display: 'flex', flexDirection: 'column' }}><span style={{ flex: '1 1 50%', background: '#e11d2a' }} /><span style={{ flex: '1 1 50%', background: '#fff' }} /></span>
            <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 999, background: t.card, boxShadow: '0 10px 24px rgba(16,48,56,.10)' }}>
              <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 999, background: J.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>ID</span>
              <span style={{ fontSize: 30, fontVariantNumeric: 'tabular-nums' }}>{n(J.id)}</span>
              <span style={{ fontSize: 12, lineHeight: '14px', color: t.ink2 }}>tayang dari<br />Indonesia</span>
              <span aria-hidden="true" style={{ marginLeft: 'auto', width: 40, height: 40, borderRadius: 999, background: t.dark, color: t.onDark, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrow" size={15} width={1.8} /></span>
            </div>
          </article>

          <article className="adm-card adm-rise c10" style={{ animationDelay: '380ms', minHeight: 290, display: 'flex', flexDirection: 'column' }}>
            <div className="adm-card__head" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <h2 className="adm-card__title">Tayangan Halaman</h2>
                <div role="group" aria-label="Pilih jurnal" style={{ display: 'flex', gap: 6 }}>
                  {Object.entries(JOURNALS).map(([k, x]) => {
                    const on = k === journal;
                    const empty = x.pages.length === 0;
                    const tone = isDark ? x.light : x.deep;
                    return <button key={k} type="button" className="adm-jchip adm-btn" aria-pressed={on} aria-disabled={empty} title={empty ? `${x.name} — data Search Console belum ada` : `Tampilkan data ${x.name}`}
                      onClick={() => { if (!empty) setJournal(k); }} style={{ borderColor: tone, background: on ? x.deep : 'transparent', color: on ? '#fff' : tone }}>{x.name}</button>;
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}><span className="adm-chip">Search Console</span><button type="button" className="adm-circle is-sm adm-btn" aria-label="Ekspor"><Icon name="export" size={15} width={1.8} /></button></div>
            </div>
            <div style={{ marginTop: 40, flex: '1 1 auto', display: 'flex', gap: 10 }}>
              <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 12, color: t.ink2, paddingBottom: 26, fontVariantNumeric: 'tabular-nums' }}>{axis.map((v) => <span key={v}>{v}</span>)}</div>
              <div key={journal} style={{ flex: '1 1 auto', display: 'grid', gridTemplateColumns: `repeat(${J.pages.length}, minmax(0, 1fr))`, gap: 12, alignItems: 'end' }}>
                {J.pages.map(([label, value], i) => <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: 54, height: Math.max(14, Math.round((value / J.axisMax) * 170)) }}>
                    {i === 0 && <span className="adm-tip adm-pop" style={{ animationDelay: '900ms', background: J.deep }}>{value}</span>}
                    <div className={`adm-bar${i === 0 ? '' : ' adm-hatch'}`} style={{ animationDelay: `${200 + i * 80}ms`, backgroundColor: i === 0 ? J.color : 'transparent' }} title={`${label}: ${value} tayang`} />
                    {i === 0 && <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, margin: '0 auto', top: 8, width: 10, height: 10, borderRadius: 999, background: '#fff', border: `2px solid ${t.dark}` }} />}
                  </div>
                  <span style={{ fontSize: 12, color: t.ink2, whiteSpace: 'nowrap' }}>{label}</span>
                </div>)}
              </div>
            </div>
          </article>

          <article className="adm-card adm-rise c14" style={{ animationDelay: '440ms', minHeight: 290, position: 'relative', overflow: 'hidden' }}>
            <div className="adm-card__head" style={{ alignItems: 'center' }}><h2 className="adm-card__title">Jadwal Terbit</h2><div style={{ display: 'flex', gap: 8 }}><span className="adm-chip">Oktober 2026</span><button type="button" className="adm-circle is-sm adm-btn" aria-label="Tambah jadwal"><Icon name="plus" size={15} width={1.8} /></button></div></div>
            <div className="adm-cal">
              <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${t.line}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronLeft" size={13} width={2} /></span>
              {DAYS.map(([label, d]) => <span key={label} className="adm-cal__day" style={{ background: d === 30 ? t.dark : 'transparent', color: d === 30 ? t.onDark : t.ink2 }}>{label}</span>)}
              {Object.keys(PLAN).map((time, r) => [
                <span key={time} style={{ fontSize: 13, color: t.ink2 }}>{time}</span>,
                ...DAYS.map(([label, d], c) => {
                  const kind = PLAN[time][d];
                  return <span key={time + label} className="adm-cal__slot adm-pop" style={{ animationDelay: `${500 + (r * 7 + c) * 40}ms`, background: kind === 'solid' ? a.color : kind === 'soft' ? a.soft : 'transparent', border: kind === 'solid' || kind === 'soft' ? 0 : `1.5px dashed ${t.line}` }} />;
                }),
              ])}
            </div>
            <div className="adm-popover adm-pop" role="note" style={{ animationDelay: '1100ms' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div style={{ fontSize: 20, lineHeight: '24px' }}>Terbit Hari Ini</div><span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(127,127,127,.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={12} width={2} /></span></div>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span className="adm-tag" style={{ background: JOURNALS.jetsi.deep, color: '#fff' }}>JETSI</span>
                <span className="adm-tag" style={{ background: a.color, color: a.ink, fontWeight: 500 }}>NordeoNews</span>
                <span className="adm-tag" style={{ border: '1px solid rgba(127,127,127,.4)', fontWeight: 400 }}>10.00 – 11.00</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: '19px' }}>Call for Papers JETSI Volume [X]</div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div className="adm-switch" role="group" aria-label="Posisi navigasi">
      <div aria-hidden="true" className="adm-switch__thumb adm-glide" style={{ transform: `translateX(${nav === 'left' ? 106 : 0}px)` }} />
      <button type="button" className="adm-switch__btn adm-btn" onClick={() => changeNav('top')} aria-pressed={nav === 'top'} style={{ color: nav === 'top' ? t.ink : t.onDark }}><span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: a.color }} />Nav atas</button>
      <button type="button" className="adm-switch__btn adm-btn" onClick={() => changeNav('left')} aria-pressed={nav === 'left'} style={{ color: nav === 'left' ? t.ink : t.onDark }}><span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: '#6fb3c4' }} />Nav kiri</button>
    </div>

    {settings && <div className="adm-overlay">
      <button type="button" className="adm-overlay__close" onClick={() => setSettings(false)} aria-label="Tutup pengaturan" tabIndex={-1} />
      <aside className="adm-drawer" role="dialog" aria-modal="true" aria-labelledby="adm-settings-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 id="adm-settings-title" style={{ fontSize: 26, fontWeight: 400 }}>Pengaturan</h2><button type="button" className="adm-circle adm-btn" onClick={() => setSettings(false)} aria-label="Tutup" autoFocus><Icon name="close" size={14} width={2} /></button></div>
        {settingGroups.map((g) => <div key={g.title}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{g.title}</div>
          <div style={{ fontSize: 13, color: t.ink2, marginTop: 2 }}>{g.note}</div>
          <div role="group" aria-label={g.title} style={{ marginTop: 10, display: 'grid', gridTemplateColumns: `repeat(${g.cols}, minmax(0, 1fr))`, gap: 8 }}>{g.options}</div>
        </div>)}
        <p style={{ marginTop: 'auto', fontSize: 12, lineHeight: '17px', color: t.ink2 }}>Pengaturan tersimpan di browser ini.</p>
      </aside>
    </div>}

    {wipe.phase !== 'idle' && <div aria-hidden="true" className={`adm-wipe is-${wipe.phase}`} style={{ background: wipe.color }} />}
  </div>;
}
