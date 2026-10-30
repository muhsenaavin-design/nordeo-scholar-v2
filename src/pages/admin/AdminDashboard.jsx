import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import './admin.css';
import './admin-modules.css';
import { MODULES, ROLES, can, useAdminData } from './admin-store';
import { MODULE_VIEWS, NoAccess, Overview, useRights } from './modules';
import { Card, Icon, Toast } from './ui';

// Brand colours read from each journal's OJS header at nordeoscholar.com/journal/ (30 Oct 2026).
// Impressions come from the Google Search Console export used in the capstone report.
const JOURNALS = {
  jetsi: { name: 'JETSI', color: '#0097b2', deep: '#006798', light: '#5cc6dc', axisMax: 150, pages: [['Home', 123], ['About', 87], ['Focus', 36], ['Issue 6', 33], ['Archive', 9], ['APC', 6]] },
  jiel: { name: 'JIEL', color: '#780707', deep: '#780707', light: '#e59a9a', axisMax: 75, pages: [['About', 59], ['Focus', 11], ['APC', 8]] },
  jibdi: { name: 'JIBDI', color: '#065ee0', deep: '#0449b0', light: '#7fb0ff', axisMax: 0, pages: [] },
};

const THEMES = {
  light: { bg: '#efeee9', panel: '#fbf9f5', card: '#ffffff', chip: '#f5f2ea', ink: '#142a32', ink2: '#5e7278', line: '#e5e1d6', hatch: 'rgba(30, 85, 102, 0.16)', dark: '#0f3038', onDark: '#ffffff' },
  dark: { bg: '#06191e', panel: '#0a242b', card: '#0f3038', chip: '#17414f', ink: '#f2f7f7', ink2: '#9db2b7', line: 'rgba(226, 236, 238, 0.14)', hatch: 'rgba(226, 236, 238, 0.16)', dark: '#f2f7f7', onDark: '#0f3038' },
};

const ACCENTS = {
  yellow: { color: '#ffd218', ink: '#142a32', soft: 'rgba(255, 210, 24, 0.24)', label: 'Kuning' },
  teal: { color: '#1e5566', ink: '#ffffff', soft: 'rgba(30, 85, 102, 0.14)', label: 'Teal' },
  gold: { color: '#c9a227', ink: '#142a32', soft: 'rgba(201, 162, 39, 0.2)', label: 'Gold' },
};

const UI_STORE = 'nordeo-admin-ui';
const readUi = () => { try { return JSON.parse(localStorage.getItem(UI_STORE)) || {}; } catch { return {}; } };

function JournalCard({ t, isDark }) {
  const [journal, setJournal] = useState('jetsi');
  const J = JOURNALS[journal];
  const axis = [J.axisMax, Math.round(J.axisMax * 2 / 3), Math.round(J.axisMax / 3), 0];
  return <section className="adm-card adm-rise c10" style={{ animationDelay: '380ms', minHeight: 290, display: 'flex', flexDirection: 'column' }}>
    <div className="adm-card__head" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <h2 className="adm-card__title">Tayangan halaman jurnal</h2>
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
      <span className="adm-muted">Google Search Console</span>
    </div>
    <div style={{ marginTop: 40, flex: '1 1 auto', display: 'flex', gap: 10 }}>
      <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 12, color: t.ink2, paddingBottom: 26, fontVariantNumeric: 'tabular-nums' }}>{axis.map((v) => <span key={v}>{v}</span>)}</div>
      <div key={journal} style={{ flex: '1 1 auto', display: 'grid', gridTemplateColumns: `repeat(${J.pages.length}, minmax(0, 1fr))`, gap: 12, alignItems: 'end' }}>
        {J.pages.map(([label, value], i) => <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 54, height: Math.max(14, Math.round((value / J.axisMax) * 170)) }}>
            {i === 0 && <span className="adm-tip adm-pop" style={{ animationDelay: '900ms', background: J.deep }}>{value}</span>}
            <div className={`adm-bar${i === 0 ? '' : ' adm-hatch'}`} style={{ animationDelay: `${200 + i * 80}ms`, backgroundColor: i === 0 ? J.color : 'transparent' }} title={`${label}: ${value} tayang`} />
          </div>
          <span style={{ fontSize: 12, color: t.ink2, whiteSpace: 'nowrap' }}>{label}</span>
        </div>)}
      </div>
    </div>
  </section>;
}

export default function AdminDashboard() {
  const saved = useRef(readUi()).current;
  const location = useLocation();
  const navigate = useNavigate();
  const [nav, setNav] = useState(saved.nav === 'left' ? 'left' : 'top');
  const [theme, setTheme] = useState(saved.theme === 'dark' ? 'dark' : 'light');
  const [accentId, setAccentId] = useState(ACCENTS[saved.accent] ? saved.accent : 'yellow');
  const [motion, setMotion] = useState(saved.motion === 'off' ? 'off' : 'on');
  const [role, setRole] = useState(ROLES.some((r) => r.id === saved.role) ? saved.role : 'admin');
  const [settings, setSettings] = useState(false);
  const [more, setMore] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [wipe, setWipe] = useState({ phase: 'idle', color: '#ffd218' });
  const timers = useRef([]);
  const systemReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const still = motion === 'off' || systemReduced;
  const data = useAdminData(role);

  const segment = location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'dashboard';
  const visible = MODULES.filter((m) => can(m.id, role, 'R'));
  const current = MODULES.find((m) => m.id === segment) || MODULES[0];
  const go = useCallback((id) => { setMore(false); navigate(id === 'dashboard' ? '/admin' : `/admin/${id}`); }, [navigate]);
  const toast = useCallback((m) => setToastMsg(m), []);
  const rights = useRights(current.id, role);

  useEffect(() => {
    try { localStorage.setItem(UI_STORE, JSON.stringify({ nav, theme, accent: accentId, motion, role })); } catch { /* settings still work without storage */ }
  }, [nav, theme, accentId, motion, role]);

  useEffect(() => {
    const title = document.title;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => { document.title = title; robots.remove(); timers.current.forEach(clearTimeout); };
  }, []);
  useEffect(() => { document.title = `${current.label} · Admin | Nordeo Scholar`; }, [current]);

  useEffect(() => {
    if (!settings && !more) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setSettings(false); setMore(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settings, more]);

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
  const person = ROLES.find((r) => r.id === role);
  const logo = isDark ? '/assets/logo-light.png' : '/assets/logo-transparent.png';
  const vars = {
    '--bg': t.bg, '--panel': t.panel, '--card': t.card, '--chip': t.chip, '--ink': t.ink, '--ink2': t.ink2, '--line': t.line,
    '--hatch': t.hatch, '--dark': t.dark, '--on-dark': t.onDark, '--accent': a.color, '--accent-ink': a.ink, '--accent-soft': a.soft,
    '--focus': isDark ? '#6fb3c4' : '#1e5566', '--gold-ink': isDark ? '#e3c76a' : '#7a5a0e', '--green-ink': isDark ? '#6fd39b' : '#1a7a45',
    '--red-ink': isDark ? '#f3a29b' : '#b3261e', '--teal-ink': isDark ? '#8cc8d6' : '#1e5566',
  };

  const changeNav = (value) => { if (value !== nav) transition(() => setNav(value), value === 'left' ? '#1e5566' : a.color); };
  const changeTheme = (value) => { if (value !== theme) transition(() => setTheme(value), THEMES[value].panel); };
  const changeRole = (value) => { setRole(value); if (!can(current.id, value, 'R')) go('dashboard'); };

  const primary = visible.filter((m) => m.primary);
  const secondary = visible.filter((m) => !m.primary);
  const activeInPrimary = primary.findIndex((m) => m.id === current.id);
  const tabW = 104;

  const themeSwitch = <div className="adm-seg" role="group" aria-label="Tema">
    <div aria-hidden="true" className="adm-seg__thumb adm-glide" style={{ transform: `translateX(${isDark ? 40 : 0}px)` }} />
    <button type="button" className="adm-seg__btn adm-btn" onClick={() => changeTheme('light')} aria-label="Tema terang" aria-pressed={!isDark} style={{ color: isDark ? t.ink2 : t.onDark }}><Icon name="sun" size={17} width={1.8} /></button>
    <button type="button" className="adm-seg__btn adm-btn" onClick={() => changeTheme('dark')} aria-label="Tema gelap" aria-pressed={isDark} style={{ color: isDark ? t.onDark : t.ink2 }}><Icon name="moon" size={17} width={1.8} /></button>
  </div>;
  const pendingReview = data.news.filter((n) => n.status === 'review').length;
  const bell = <button type="button" className="adm-circle is-lg adm-btn" aria-label={`Notifikasi: ${pendingReview} konten menunggu persetujuan`} title={`${pendingReview} konten menunggu persetujuan`} onClick={() => go(can('news', role, 'R') ? 'news' : 'dashboard')} style={{ position: 'relative' }}><Icon name="bell" />{pendingReview > 0 && <span aria-hidden="true" className="adm-dot" />}</button>;
  const gear = (lg) => <button type="button" className={`adm-circle adm-btn${lg ? ' is-lg' : ''}`} onClick={() => setSettings(true)} aria-label="Pengaturan tampilan" title="Pengaturan"><Icon name="gear" /></button>;
  const avatar = <button type="button" className="adm-avatar adm-btn" onClick={() => setSettings(true)} aria-label={`${person.person}, ${person.label}. Ganti peran`} title={`${person.person} · ${person.label}`}>{person.initials}</button>;

  const option = (currentValue, value, label, swatch, pick) => {
    const on = currentValue === value;
    return <button key={value} type="button" className="adm-opt adm-btn" aria-pressed={on} onClick={() => !on && pick(value)} style={{ borderColor: on ? a.color : t.line, background: on ? a.soft : t.card }}>
      {swatch && <span aria-hidden="true" className="adm-opt__sw" style={{ background: swatch }} />}
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
    </button>;
  };
  const settingGroups = [
    { title: 'Masuk sebagai', note: 'Menu dan tombol mengikuti hak akses peran (prototipe; belum ada login).', cols: 3, options: ROLES.map((r) => option(role, r.id, r.label, null, changeRole)) },
    { title: 'Posisi navigasi', note: 'Menu di atas seperti tab, atau rail ikon di kiri.', cols: 2, options: [option(nav, 'top', 'Atas', t.dark, changeNav), option(nav, 'left', 'Kiri', t.dark, changeNav)] },
    { title: 'Warna aksen', note: 'Dari palet Nordeo; latar tetap putih.', cols: 3, options: Object.keys(ACCENTS).map((k) => option(accentId, k, ACCENTS[k].label, ACCENTS[k].color, setAccentId)) },
    { title: 'Tema', note: 'Terang atau gelap.', cols: 2, options: [option(theme, 'light', 'Terang', THEMES.light.panel, changeTheme), option(theme, 'dark', 'Gelap', THEMES.dark.panel, changeTheme)] },
    { title: 'Animasi', note: 'Matikan bila terasa berlebihan.', cols: 2, options: [option(motion, 'on', 'Aktif', a.color, setMotion), option(motion, 'off', 'Kurangi', t.chip, setMotion)] },
  ];

  const stats = [
    { label: 'Konten terbit', value: data.news.filter((n) => n.status === 'published').length },
    { label: 'Menunggu persetujuan', value: pendingReview, tone: pendingReview ? '#c9a227' : null },
    { label: 'Masukan baru', value: data.submissions.filter((s) => (s.status || 'baru') === 'baru').length + data.registrations.length },
  ];

  const View = MODULE_VIEWS[current.id];
  const viewProps = { data, role, rights, toast, go, t, a, isDark };
  let body;
  if (!can(current.id, role, 'R')) body = <div className="adm-grid"><NoAccess module={current} role={role} /></div>;
  else if (current.id === 'dashboard') body = <Overview {...viewProps} journalCard={<JournalCard t={t} isDark={isDark} />} />;
  else body = <View key={current.id + role} {...viewProps} />;

  return <div className={`adm${still ? ' is-still' : ''}`} style={vars}>
    <div className={`adm-frame${nav === 'left' ? ' is-left' : ''}`}>
      {nav === 'left' && <aside className="adm-rail adm-rise" aria-label="Navigasi">
        <a href="/" className="adm-rail__mark" aria-label="Nordeo Scholar, ke beranda">N</a>
        <nav className="adm-rail__list">
          <div aria-hidden="true" className="adm-rail__pill adm-glide" style={{ transform: `translateY(${Math.max(0, visible.findIndex((m) => m.id === current.id)) * 52}px)` }} />
          {visible.map((m) => <button key={m.id} type="button" className="adm-rail__btn adm-btn" onClick={() => go(m.id)} aria-label={m.label} title={m.label} aria-current={m.id === current.id ? 'page' : undefined} style={{ color: m.id === current.id ? t.onDark : t.ink2 }}><Icon name={m.icon} size={19} /></button>)}
        </nav>
        <div className="adm-rail__foot">{gear(false)}{avatar}</div>
      </aside>}

      <div className="adm-main">
        {nav === 'top' ? <header className="adm-top adm-rise">
          <a className="adm-logo" href="/" aria-label="Nordeo Scholar Publishing, ke beranda"><img src={logo} alt="" /></a>
          <nav className="adm-tabs-wrap" aria-label="Menu utama">
            <div className="adm-tabs">
              {activeInPrimary >= 0 && <div aria-hidden="true" className="adm-tabs__pill adm-glide" style={{ width: tabW, transform: `translateX(${activeInPrimary * (tabW + 2)}px)` }} />}
              {primary.map((m) => <button key={m.id} type="button" className="adm-tab adm-btn" onClick={() => go(m.id)} aria-current={m.id === current.id ? 'page' : undefined} style={{ width: tabW, color: m.id === current.id ? t.onDark : t.ink }}>{m.label}</button>)}
              {secondary.length > 0 && <button type="button" className="adm-tab adm-btn" aria-expanded={more} aria-haspopup="menu" onClick={() => setMore((v) => !v)}
                style={{ padding: '0 16px', background: activeInPrimary < 0 ? t.dark : 'transparent', color: activeInPrimary < 0 ? t.onDark : t.ink }}>
                {activeInPrimary < 0 ? current.label : 'Lainnya'} <Icon name="chevron" size={14} width={2} /></button>}
            </div>
            {more && <>
              <button type="button" className="adm-menu__scrim" aria-label="Tutup menu" tabIndex={-1} onClick={() => setMore(false)} />
              <div className="adm-menu adm-pop" role="menu">
                {secondary.map((m) => <button key={m.id} type="button" role="menuitem" className="adm-menu__item adm-btn" aria-current={m.id === current.id ? 'page' : undefined} onClick={() => go(m.id)}><Icon name={m.icon} size={17} />{m.label}</button>)}
              </div>
            </>}
          </nav>
          <div className="adm-tools">{themeSwitch}{bell}{gear(true)}{avatar}</div>
        </header> : <header className="adm-top adm-rise">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a href="/" aria-label="Nordeo Scholar Publishing, ke beranda"><img src={logo} alt="" style={{ height: 30, width: 'auto', display: 'block' }} /></a>
            <span aria-hidden="true" style={{ width: 1, height: 28, background: t.line }} />
            <span style={{ fontSize: 18, fontWeight: 500 }}>{current.label}</span>
          </div>
          <div className="adm-tools">{themeSwitch}{bell}</div>
        </header>}

        <section className="adm-hero adm-rise" style={{ animationDelay: '80ms' }}>
          <div>
            <p className="adm-muted">{person.person} · {person.label}</p>
            <h1 className="adm-title">{current.id === 'dashboard' ? `Halo, ${person.person.split(' ')[0]}` : current.label}</h1>
          </div>
          <div className="adm-stats">
            {stats.map((s) => <div key={s.label}>
              <div className="adm-stat__label">{s.label}</div>
              <div className="adm-stat__row"><span className="adm-stat__value">{s.value}</span>{s.tone && <span aria-hidden="true" className="adm-stat__dot" style={{ background: s.tone }} />}</div>
            </div>)}
          </div>
        </section>

        {data.saveError && <Card className="c24"><p className="adm-error" role="alert">Penyimpanan browser penuh atau diblokir. Perubahan terakhir mungkin tidak tersimpan.</p></Card>}
        {body}
      </div>
    </div>

    {settings && <div className="adm-overlay">
      <button type="button" className="adm-overlay__close" onClick={() => setSettings(false)} aria-label="Tutup pengaturan" tabIndex={-1} />
      <aside className="adm-drawer" role="dialog" aria-modal="true" aria-labelledby="adm-settings-title">
        <div className="adm-drawer__head"><h2 id="adm-settings-title">Pengaturan</h2><button type="button" className="adm-circle adm-btn" onClick={() => setSettings(false)} aria-label="Tutup" autoFocus><Icon name="close" size={14} width={2} /></button></div>
        {settingGroups.map((g) => <div key={g.title}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{g.title}</div>
          <div style={{ fontSize: 13, color: t.ink2, marginTop: 2 }}>{g.note}</div>
          <div role="group" aria-label={g.title} style={{ marginTop: 10, display: 'grid', gridTemplateColumns: `repeat(${g.cols}, minmax(0, 1fr))`, gap: 8 }}>{g.options}</div>
        </div>)}
        <p style={{ marginTop: 'auto', fontSize: 12, lineHeight: '17px', color: t.ink2 }}>Pengaturan tampilan tersimpan di browser ini.</p>
      </aside>
    </div>}

    <Toast message={toastMsg} onDone={() => setToastMsg('')} />
    {wipe.phase !== 'idle' && <div aria-hidden="true" className={`adm-wipe is-${wipe.phase}`} style={{ background: wipe.color }} />}
  </div>;
}
