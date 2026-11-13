import { useCallback, useEffect, useState } from 'react';
import './admin.css';
import './admin-shell.css';
import AdminDashboard from './AdminDashboard';
import { Icon } from './ui';
import { supabase } from '../../lib/supabase';
import { ADMIN_BASE } from '../../lib/admin-path';

const DEMO_KEY = 'nordeo-admin-demo';
const VARS = {
  '--bg': '#fbf9f5', '--panel': '#ffffff', '--card': '#ffffff', '--chip': '#f5f2ea', '--ink': '#142a32', '--ink2': '#5e7278', '--line': '#e5e1d6',
  '--dark': '#0f3038', '--on-dark': '#ffffff', '--accent': '#ffd218', '--accent-ink': '#142a32', '--focus': '#1e5566', '--red-ink': '#b3261e', '--teal-ink': '#00586f',
};

function Shell({ children }) {
  return <div className="adm" data-theme="light" style={VARS}>{children}</div>;
}

// Wrong passwords: after LOCK_AFTER failures the form waits, starting at one minute and doubling up to 15 minutes.
// Supabase also rate-limits sign-in attempts on the server; this only slows down guessing from one browser.
const LOCK_KEY = 'nordeo-admin-lock';
const LOCK_AFTER = 5;
function readLock() {
  try { return JSON.parse(localStorage.getItem(LOCK_KEY)) || { fails: 0, until: 0 }; } catch { return { fails: 0, until: 0 }; }
}
function writeLock(lock) {
  try { localStorage.setItem(LOCK_KEY, JSON.stringify(lock)); } catch { /* the lock still holds for this page */ }
}
export function nextLock(lock, now) {
  const fails = lock.fails + 1;
  const wait = fails >= LOCK_AFTER ? Math.min(60_000 * 2 ** (fails - LOCK_AFTER), 15 * 60_000) : 0;
  return { fails, until: wait ? now + wait : 0 };
}
const NOT_INVITED = 'Email ini belum diundang. Minta Owner menambahkan email Anda di menu Pengguna & peran.';

// Sign in, activate an invitation (accounts exist only for emails the Owner invited), or reset the password.
function SignIn({ onDemo, notice }) {
  const [tab, setTab] = useState('in');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(notice ? { text: notice } : null);
  const [lock, setLock] = useState(readLock);
  const [now, setNow] = useState(() => Date.now());
  const locked = tab === 'in' && lock.until > now;
  useEffect(() => {
    if (lock.until <= Date.now()) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lock.until]);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const switchTo = (next) => { setTab(next); setMsg(null); };
  const submit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setBusy(true); setMsg(null);
    const redirect = `${window.location.origin}${ADMIN_BASE}`;
    if (tab === 'in') {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
      if (error) {
        const next = nextLock(lock, Date.now());
        writeLock(next); setLock(next); setNow(Date.now());
        setMsg({ error: true, text: error.message === 'Invalid login credentials' ? 'Email atau kata sandi salah.' : error.message });
      } else { writeLock({ fails: 0, until: 0 }); setLock({ fails: 0, until: 0 }); }
    } else if (tab === 'up') {
      const { data, error } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { full_name: form.name.trim() }, emailRedirectTo: redirect } });
      if (error) setMsg({ error: true, text: /database error|not invited|undangan/i.test(error.message) ? NOT_INVITED : error.message });
      else if (!data.session) setMsg({ text: 'Akun diaktifkan. Buka email Anda untuk konfirmasi, lalu masuk.' });
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: redirect });
      setMsg(error ? { error: true, text: error.message } : { text: 'Tautan untuk mengganti kata sandi sudah dikirim ke email Anda.' });
    }
    setBusy(false);
  };
  const wait = Math.max(0, Math.ceil((lock.until - now) / 1000));
  const waitText = wait >= 60 ? `${Math.floor(wait / 60)} menit ${wait % 60} detik` : `${wait} detik`;
  const tiles = [['news', 'NordeoNews'], ['cap', 'Academy'], ['layers', 'Ekosistem'], ['users', 'Peran & akses']];
  return <Shell>
    <main className="adm-auth">
      <section className="adm-auth__art">
        <img className="logo" src="/assets/logo-light.png" alt="Nordeo Scholar Publishing" />
        <div>
          <h1>Satu dashboard untuk <em>empat ekosistem</em> Nordeo.</h1>
          <div className="adm-auth__tiles">{tiles.map(([icon, label]) => <span key={label}><Icon name={icon} size={18} />{label}</span>)}</div>
        </div>
      </section>
      <section className="adm-auth__card" aria-labelledby="auth-title">
        <h2 id="auth-title">{tab === 'in' ? 'Masuk ke dashboard' : tab === 'up' ? 'Aktifkan undangan' : 'Lupa kata sandi'}</h2>
        {tab === 'up' && <p className="adm-auth__fine">Hanya untuk email yang sudah diundang Owner. Peran Anda mengikuti undangan.</p>}
        <form onSubmit={submit}>
          {tab === 'up' && <label>Nama lengkap<input autoComplete="name" required value={form.name} onChange={set('name')} /></label>}
          <label>Email<input type="email" autoComplete="email" required value={form.email} onChange={set('email')} /></label>
          {tab !== 'reset' && <label>Kata sandi<input type="password" autoComplete={tab === 'in' ? 'current-password' : 'new-password'} minLength={8} required value={form.password} onChange={set('password')} /></label>}
          {msg && <p className={`adm-auth__msg${msg.error ? ' is-error' : ''}`} role={msg.error ? 'alert' : 'status'}>{msg.text}</p>}
          {locked && <p className="adm-auth__msg is-error" role="alert">Terlalu banyak percobaan gagal. Coba lagi dalam {waitText}.</p>}
          <button type="submit" className="adm-auth__submit adm-btn" disabled={busy || locked}>{busy ? 'Memproses…' : tab === 'in' ? 'Masuk' : tab === 'up' ? 'Aktifkan akun' : 'Kirim tautan'}</button>
        </form>
        <div className="adm-auth__links">
          {tab === 'in' && <button type="button" className="adm-auth__link adm-btn" onClick={() => switchTo('reset')}>Lupa kata sandi?</button>}
          {tab === 'in' && <button type="button" className="adm-auth__link adm-btn" onClick={() => switchTo('up')}>Punya undangan? Aktifkan akun</button>}
          {tab !== 'in' && <button type="button" className="adm-auth__link adm-btn" onClick={() => switchTo('in')}>Kembali ke halaman masuk</button>}
        </div>
        <button type="button" className="adm-auth__demo adm-btn" onClick={onDemo}>Coba mode demo (tanpa akun)</button>
      </section>
    </main>
  </Shell>;
}

function Waiting({ account, onSignOut }) {
  return <Shell>
    <main className="adm-auth" style={{ gridTemplateColumns: 'minmax(0, 560px)', justifyContent: 'center', alignContent: 'center' }}>
      <section className="adm-auth__card">
        <h2>{account.active ? 'Menunggu peran dari Owner' : 'Akun dinonaktifkan'}</h2>
        <p>{account.active ? `Akun ${account.email} sudah terdaftar. Owner perlu menetapkan peran Anda di menu Pengguna & peran sebelum dashboard terbuka.` : 'Hubungi Owner Nordeo untuk mengaktifkan akun ini kembali.'}</p>
        <button type="button" className="adm-auth__demo adm-btn" onClick={onSignOut}>Keluar</button>
      </section>
    </main>
  </Shell>;
}

/** /admin: sign-in gate in front of the dashboard. Without a database (tests) it opens the demo. */
export default function AdminApp() {
  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow, noarchive';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);
  const [demo, setDemo] = useState(() => !supabase || sessionStorage.getItem(DEMO_KEY) === '1');
  const [account, setAccount] = useState(undefined); // undefined = checking, null = signed out

  const loadAccount = useCallback(async (session) => {
    if (!session) { setAccount(null); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    setAccount({ id: session.user.id, email: session.user.email, name: data?.full_name || session.user.email, role: data?.role || 'pending', active: data?.active ?? true });
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => loadAccount(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => { loadAccount(session); });
    return () => sub.subscription.unsubscribe();
  }, [loadAccount]);

  const signOut = async () => { await supabase.auth.signOut(); setAccount(null); };
  const leaveDemo = () => { sessionStorage.removeItem(DEMO_KEY); setDemo(false); };

  if (account && account.role !== 'pending' && account.active) return <AdminDashboard mode="remote" account={account} onSignOut={signOut} />;
  if (demo) return <AdminDashboard mode="demo" onSignOut={supabase ? leaveDemo : null} />;
  if (account === undefined) return <Shell><p style={{ padding: 40 }} aria-busy="true">Memeriksa sesi…</p></Shell>;
  if (account) return <Waiting account={account} onSignOut={signOut} />;
  return <SignIn onDemo={() => { sessionStorage.setItem(DEMO_KEY, '1'); setDemo(true); }} />;
}
