import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { adminHref, adminSegment } from '../../lib/admin-path';
import './admin.css';
import './admin-modules.css';
import './admin-shell.css';
import './admin-redesign.css';
import './admin-mockup.css';
import './admin-brand.css';
import { GROUPS, MODULES, ROLES, can, useAdminData } from './admin-store';
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
  // Light theme uses the public site's tokens (src/styles.css): paper, warm, ink, deep teal, line.
  light: { bg: '#fbf9f5', panel: '#ffffff', card: '#ffffff', chip: '#f5f2ea', ink: '#142a32', ink2: '#55676c', line: '#e5e1d6', hatch: 'rgba(0, 88, 111, 0.16)', dark: '#0f3038', onDark: '#ffffff' },
  dark: { bg: '#06191e', panel: '#0a242b', card: '#0f3038', chip: '#17414f', ink: '#f2f7f7', ink2: '#9db2b7', line: 'rgba(226, 236, 238, 0.14)', hatch: 'rgba(226, 236, 238, 0.16)', dark: '#f2f7f7', onDark: '#0f3038' },
};

const ACCENTS = {
  yellow: { color: '#ffd218', ink: '#142a32', soft: 'rgba(255, 210, 24, 0.24)', label: 'Kuning' },
  teal: { color: '#1e5566', ink: '#ffffff', soft: 'rgba(30, 85, 102, 0.14)', label: 'Teal' },
  gold: { color: '#c9a227', ink: '#142a32', soft: 'rgba(201, 162, 39, 0.2)', label: 'Gold' },
};

// One colour per sidebar group, so NordeoNews, Academy, and Marketing are told apart at a glance.
const TONES = {
  ink: { light: ['#142a32', 'rgba(20, 42, 50, .08)'], dark: ['#f2f7f7', 'rgba(242, 247, 247, .10)'] },
  blue: { light: ['#1f5f9e', 'rgba(31, 95, 158, .10)'], dark: ['#8fc0f0', 'rgba(143, 192, 240, .14)'] },
  yellow: { light: ['#8a6a00', 'rgba(255, 210, 24, .28)'], dark: ['#ffd218', 'rgba(255, 210, 24, .16)'] },
  teal: { light: ['#0f7470', 'rgba(15, 116, 112, .12)'], dark: ['#6fd6cf', 'rgba(111, 214, 207, .14)'] },
  gold: { light: ['#8a5a0a', 'rgba(201, 162, 39, .20)'], dark: ['#e3c76a', 'rgba(227, 199, 106, .16)'] },
  slate: { light: ['#4f6470', 'rgba(79, 100, 112, .12)'], dark: ['#b3c4cb', 'rgba(179, 196, 203, .14)'] },
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

/**
 * The dashboard shell: a labelled sidebar grouped by area, a header that says where you are
 * and what the module is for, and the module itself.
 * mode 'remote' = signed in to the database; mode 'demo' = this browser only.
 */
export default function AdminDashboard({ mode = 'demo', account = null, onSignOut = null }) {
  const saved = useRef(readUi()).current;
  const location = useLocation();
  const navigate = useNavigate();
  const remote = mode === 'remote';
  const [compact, setCompact] = useState(saved.nav === 'compact');
  const [mobileNav, setMobileNav] = useState(false);
  const [theme, setTheme] = useState(saved.theme === 'dark' ? 'dark' : 'light');
  const [accentId, setAccentId] = useState(ACCENTS[saved.accent] ? saved.accent : 'yellow');
  const [motion, setMotion] = useState(saved.motion === 'off' ? 'off' : 'on');
  const [demoRole, setDemoRole] = useState(ROLES.some((r) => r.id === saved.role) ? saved.role : 'admin');
  const role = remote ? account?.role : demoRole;
  const [settings, setSettings] = useState(false);
  const [menuQuery, setMenuQuery] = useState('');
  const searchRef = useRef(null);
  const [toastMsg, setToastMsg] = useState('');
  const systemReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const still = motion === 'off' || systemReduced;
  const data = useAdminData(role, mode, account);

  const segment = adminSegment(location.pathname);
  const visible = MODULES.filter((m) => can(m.id, role, 'R'));
  const current = MODULES.find((m) => m.id === segment) || MODULES[0];
  const group = GROUPS.find((g) => g.id === current.group);
  const go = useCallback((id) => { setMobileNav(false); navigate(adminHref(id)); }, [navigate]);
  const toast = useCallback((m) => setToastMsg(m), []);
  const rights = useRights(current.id, role);

  useEffect(() => {
    try { localStorage.setItem(UI_STORE, JSON.stringify({ nav: compact ? 'compact' : 'full', theme, accent: accentId, motion, role: demoRole })); } catch { /* settings still work without storage */ }
  }, [compact, theme, accentId, motion, demoRole]);

  useEffect(() => {
    const title = document.title;
    return () => { document.title = title; };
  }, []);
  useEffect(() => { document.title = `${current.label} · Admin | Nordeo Scholar`; }, [current]);

  // Ctrl K (or Cmd K) jumps to the menu search in the sidebar.
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setMobileNav(true); searchRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!settings && !mobileNav) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setSettings(false); setMobileNav(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settings, mobileNav]);

  const t = THEMES[theme];
  const a = ACCENTS[accentId];
  const isDark = theme === 'dark';
  const roleInfo = ROLES.find((r) => r.id === role) || ROLES[1];
  const logo = isDark ? '/assets/logo-light.png' : '/assets/logo-transparent.png';
  const vars = {
    '--bg': t.bg, '--panel': t.panel, '--card': t.card, '--chip': t.chip, '--ink': t.ink, '--ink2': t.ink2, '--line': t.line,
    '--hatch': t.hatch, '--dark': t.dark, '--on-dark': t.onDark, '--accent': a.color, '--accent-ink': a.ink, '--accent-soft': a.soft,
    '--focus': isDark ? '#6fb3c4' : '#1e5566', '--gold-ink': isDark ? '#e3c76a' : '#7a5a0e', '--green-ink': isDark ? '#6fd39b' : '#1a7a45',
    '--red-ink': isDark ? '#f3a29b' : '#b3261e', '--teal-ink': isDark ? '#8cc8d6' : '#00586f',
  };
  const toneVars = (tone) => { const [ink, soft] = TONES[tone][isDark ? 'dark' : 'light']; return { '--tone': ink, '--tone-soft': soft }; };

  // Badges: what is waiting in each module.
  const pendingReview = data.news.filter((n) => n.status === 'review').length;
  const counts = {
    news: role === 'owner' ? pendingReview : data.news.filter((n) => n.status === 'draft' && n.reviewNote).length,
    stories: data.submissions.filter((s) => (s.status || 'baru') === 'baru').length,
    comments: data.comments.filter((c) => c.status === 'pending').length,
    registrations: data.registrations.filter((r) => (r.status || 'baru') === 'baru').length,
  };
  const waiting = Object.entries(counts).filter(([id]) => can(id, role, 'R')).reduce((sum, [, n]) => sum + n, 0);

  const option = (currentValue, value, label, swatch, pick) => {
    const on = currentValue === value;
    return <button key={value} type="button" className="adm-opt adm-btn" aria-pressed={on} onClick={() => !on && pick(value)} style={{ borderColor: on ? a.color : t.line, background: on ? a.soft : t.card }}>
      {swatch && <span aria-hidden="true" className="adm-opt__sw" style={{ background: swatch }} />}
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
    </button>;
  };
  const changeDemoRole = (value) => { setDemoRole(value); if (!can(current.id, value, 'R')) go('dashboard'); };
  const settingGroups = [
    ...(remote ? [] : [{ title: 'Lihat sebagai (mode demo)', note: 'Menu dan tombol mengikuti hak akses peran ini.', cols: 3, options: ROLES.map((r) => option(demoRole, r.id, r.label, null, changeDemoRole)) }]),
    { title: 'Sidebar', note: 'Lengkap dengan nama menu, atau ringkas berisi ikon saja.', cols: 2, options: [option(compact ? 'compact' : 'full', 'full', 'Lengkap', t.dark, () => setCompact(false)), option(compact ? 'compact' : 'full', 'compact', 'Ringkas', t.chip, () => setCompact(true))] },
    { title: 'Warna aksen', note: 'Dari palet Nordeo.', cols: 3, options: Object.keys(ACCENTS).map((k) => option(accentId, k, ACCENTS[k].label, ACCENTS[k].color, setAccentId)) },
    { title: 'Tema', note: 'Terang atau gelap.', cols: 2, options: [option(theme, 'light', 'Terang', THEMES.light.panel, setTheme), option(theme, 'dark', 'Gelap', THEMES.dark.panel, setTheme)] },
    { title: 'Animasi', note: 'Matikan bila terasa berlebihan.', cols: 2, options: [option(motion, 'on', 'Aktif', a.color, setMotion), option(motion, 'off', 'Kurangi', t.chip, setMotion)] },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const stats = [
    { label: 'Artikel terbit', value: data.news.filter((n) => n.status === 'published').length },
    { label: 'Menunggu persetujuan', value: pendingReview, tone: pendingReview ? '#c9a227' : null },
    { label: 'Masukan baru', value: counts.stories + counts.registrations + counts.comments },
  ];

  const View = MODULE_VIEWS[current.id];
  const viewProps = { data, role, rights, toast, go, t, a, isDark };
  let body;
  if (data.loading) body = <div className="adm-grid"><Card className="c24"><p className="adm-muted" aria-busy="true">Memuat data dari database…</p></Card></div>;
  else if (!can(current.id, role, 'R')) body = <div className="adm-grid"><NoAccess module={current} role={role} /></div>;
  else if (current.id === 'dashboard') body = <Overview {...viewProps} journalCard={<JournalCard t={t} isDark={isDark} />} />;
  else body = <View key={current.id + role} {...viewProps} />;

  const sidebar = <aside className={`adm-side${compact ? ' is-compact' : ''}${mobileNav ? ' is-open' : ''}`} aria-label="Navigasi dashboard">
    <div className="adm-side__brand">
      <a href="/" className="adm-side__logo" aria-label="Nordeo Scholar Publishing, buka website"><img src={logo} alt="" /></a>
      <button type="button" className="adm-circle is-sm adm-btn adm-side__close" onClick={() => setMobileNav(false)} aria-label="Tutup menu"><Icon name="close" size={14} width={2} /></button>
    </div>
    <label className="adm-side__search">
      <Icon name="search" size={16} width={2} />
      <span className="adm-sr">Cari menu</span>
      <input ref={searchRef} type="search" placeholder="Cari menu" value={menuQuery} onChange={(e) => setMenuQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { const hit = visible.find((m) => `${m.label} ${m.hint}`.toLowerCase().includes(menuQuery.trim().toLowerCase())); if (hit) { go(hit.id); setMenuQuery(''); } } }} />
      <kbd aria-hidden="true">Ctrl K</kbd>
    </label>
    <nav className="adm-side__nav">
      {GROUPS.map((g) => {
        const q = menuQuery.trim().toLowerCase();
        const items = visible.filter((m) => m.group === g.id && (!q || `${m.label} ${m.hint}`.toLowerCase().includes(q)));
        if (!items.length) return null;
        return <div key={g.id} className="adm-side__group" style={toneVars(g.tone)}>
          {g.id !== 'home' && <p className="adm-side__label"><i aria-hidden="true" />{g.label}</p>}
          <ul>{items.map((m) => {
            const on = m.id === current.id;
            const n = counts[m.id] || 0;
            return <li key={m.id}><button type="button" className={`adm-side__item adm-btn${on ? ' is-on' : ''}`} onClick={() => go(m.id)} aria-current={on ? 'page' : undefined} title={compact ? `${m.label} — ${m.hint}` : m.hint}>
              <span className="adm-side__tile" aria-hidden="true"><Icon name={m.icon} size={17} width={1.8} /></span>
              <span className="adm-side__text">{m.label}</span>
              {n > 0 && <span className="adm-side__count" aria-label={`${n} menunggu`}>{n}</span>}
            </button></li>;
          })}</ul>
        </div>;
      })}
    </nav>
    <div className="adm-side__foot">
      <button type="button" className="adm-side__item adm-btn" onClick={() => setSettings(true)} title="Tampilan dan peran"><span className="adm-side__tile" aria-hidden="true"><Icon name="gear" size={17} width={1.8} /></span><span className="adm-side__text">Pengaturan</span></button>
      <button type="button" className="adm-side__item adm-btn is-collapse" onClick={() => setCompact((v) => !v)} aria-pressed={compact} title={compact ? 'Tampilkan nama menu' : 'Ringkas sidebar'}><span className="adm-side__tile" aria-hidden="true"><Icon name="panel" size={17} width={1.8} /></span><span className="adm-side__text">{compact ? 'Perlebar' : 'Ringkas sidebar'}</span></button>
      <div className="adm-side__me">
        <span className="adm-avatar" aria-hidden="true">{remote ? data.initials : roleInfo.initials}</span>
        <span className="adm-side__who"><b>{remote ? data.person : roleInfo.person}</b><span>{roleInfo.label}{!remote && ' · Demo'}</span></span>
        {onSignOut && <button type="button" className="adm-circle is-sm adm-btn" onClick={onSignOut} aria-label={remote ? 'Keluar dari dashboard' : 'Keluar dari mode demo'} title={remote ? 'Keluar' : 'Keluar demo'}><Icon name="logout" size={16} width={1.9} /></button>}
      </div>
    </div>
  </aside>;

  return <div className={`adm${still ? ' is-still' : ''}`} data-theme={theme} style={vars}>
    <div className={`adm-shell${compact ? ' is-compact' : ''}`}>
      {sidebar}
      {mobileNav && <button type="button" className="adm-side__scrim" aria-label="Tutup menu" onClick={() => setMobileNav(false)} />}
      <div className="adm-main">
        <header className="adm-head">
          <button type="button" className="adm-circle adm-btn adm-burger" onClick={() => setMobileNav(true)} aria-label="Buka menu"><Icon name="menu" /></button>
          <div className="adm-head__titles">
            <p className="adm-crumbs" style={toneVars(group.tone)}><i aria-hidden="true" />{current.id === 'dashboard' ? today : <>{group.label}<span aria-hidden="true">·</span>{current.label}</>}</p>
            <h1 className="adm-title">{current.id === 'dashboard' ? `${greeting}, ${(remote ? data.person : roleInfo.person).split(' ')[0]}` : current.label}</h1>
            <p className="adm-hint">{current.hint}</p>
          </div>
          <div className="adm-tools">
            {!remote && <span className="adm-mode" title="Data hanya tersimpan di browser ini">Mode demo</span>}
            {remote && <button type="button" className="adm-circle adm-btn" onClick={() => data.refresh()} aria-label="Muat ulang data" title="Muat ulang data"><Icon name="refresh" /></button>}
            <div className="adm-seg" role="group" aria-label="Tema">
              <div aria-hidden="true" className="adm-seg__thumb adm-glide" style={{ transform: `translateX(${isDark ? 36 : 0}px)` }} />
              <button type="button" className="adm-seg__btn adm-btn" onClick={() => setTheme('light')} aria-label="Tema terang" aria-pressed={!isDark} style={{ color: isDark ? t.ink2 : t.onDark }}><Icon name="sun" size={16} width={1.8} /></button>
              <button type="button" className="adm-seg__btn adm-btn" onClick={() => setTheme('dark')} aria-label="Tema gelap" aria-pressed={isDark} style={{ color: isDark ? t.onDark : t.ink2 }}><Icon name="moon" size={16} width={1.8} /></button>
            </div>
            <button type="button" className="adm-circle adm-btn" aria-label={`Notifikasi: ${waiting} hal menunggu`} title={`${waiting} hal menunggu`} onClick={() => go('dashboard')} style={{ position: 'relative' }}><Icon name="bell" />{waiting > 0 && <span aria-hidden="true" className="adm-dot" />}</button>
          </div>
        </header>
        {current.id === 'dashboard' && <div className="adm-stats">
          {stats.map((s) => <div key={s.label} className="adm-stat">
            <div className="adm-stat__label">{s.label}</div>
            <div className="adm-stat__row"><span className="adm-stat__value">{s.value}</span>{s.tone && <span aria-hidden="true" className="adm-stat__dot" style={{ background: s.tone }} />}</div>
          </div>)}
        </div>}

        {!remote && <Card className="c24"><p className="adm-demo-note"><Icon name="key" size={16} /> Mode demo: perubahan hanya tersimpan di browser ini dan tidak tampil di website. Masuk dengan akun staf untuk mengelola website sungguhan.</p></Card>}
        {data.saveError && <Card className="c24"><p className="adm-error" role="alert">{data.saveError}</p></Card>}
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
  </div>;
}
