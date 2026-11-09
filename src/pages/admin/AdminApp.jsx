import { useCallback, useEffect, useState } from 'react';
import './admin.css';
import './admin-shell.css';
import AdminDashboard from './AdminDashboard';
import { Icon } from './ui';
import { supabase } from '../../lib/supabase';

const DEMO_KEY = 'nordeo-admin-demo';
const VARS = {
  '--bg': '#efeee9', '--panel': '#fbf9f5', '--card': '#ffffff', '--chip': '#f5f2ea', '--ink': '#142a32', '--ink2': '#5e7278', '--line': '#e5e1d6',
  '--dark': '#0f3038', '--on-dark': '#ffffff', '--accent': '#ffd218', '--accent-ink': '#142a32', '--focus': '#1e5566', '--red-ink': '#b3261e',
};

function Shell({ children }) {
  return <div className="adm" style={VARS}>{children}</div>;
}

// Sign in, create an account (it waits for the Owner to give it a role), or open the demo.
function SignIn({ onDemo, notice }) {
  const [tab, setTab] = useState('in');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(notice ? { text: notice } : null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (tab === 'in') {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
      if (error) setMsg({ error: true, text: error.message === 'Invalid login credentials' ? 'Email atau kata sandi salah.' : error.message });
    } else if (tab === 'up') {
      const { data, error } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { full_name: form.name.trim() }, emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) setMsg({ error: true, text: error.message });
      else if (!data.session) setMsg({ text: 'Akun dibuat. Buka email Anda untuk konfirmasi, lalu masuk. Owner akan memberi peran Anda.' });
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: `${window.location.origin}/admin` });
      setMsg(error ? { error: true, text: error.message } : { text: 'Tautan untuk mengganti kata sandi sudah dikirim ke email Anda.' });
    }
    setBusy(false);
  };
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
        <h2 id="auth-title">{tab === 'in' ? 'Masuk ke dashboard' : tab === 'up' ? 'Daftar akun staf' : 'Lupa kata sandi'}</h2>
        <div className="adm-auth__tabs" role="group" aria-label="Pilih">
          <button type="button" className="adm-btn" aria-pressed={tab === 'in'} onClick={() => { setTab('in'); setMsg(null); }}>Masuk</button>
          <button type="button" className="adm-btn" aria-pressed={tab === 'up'} onClick={() => { setTab('up'); setMsg(null); }}>Daftar</button>
        </div>
        <form onSubmit={submit}>
          {tab === 'up' && <label>Nama lengkap<input autoComplete="name" required value={form.name} onChange={set('name')} /></label>}
          <label>Email<input type="email" autoComplete="email" required value={form.email} onChange={set('email')} /></label>
          {tab !== 'reset' && <label>Kata sandi<input type="password" autoComplete={tab === 'in' ? 'current-password' : 'new-password'} minLength={8} required value={form.password} onChange={set('password')} /></label>}
          {msg && <p className={`adm-auth__msg${msg.error ? ' is-error' : ''}`} role={msg.error ? 'alert' : 'status'}>{msg.text}</p>}
          <button type="submit" className="adm-auth__submit adm-btn" disabled={busy}>{busy ? 'Memproses…' : tab === 'in' ? 'Masuk' : tab === 'up' ? 'Buat akun' : 'Kirim tautan'}</button>
        </form>
        {tab === 'in' && <button type="button" className="adm-auth__fine adm-btn" style={{ border: 0, background: 'none', textAlign: 'left', padding: 0 }} onClick={() => { setTab('reset'); setMsg(null); }}>Lupa kata sandi?</button>}
        <button type="button" className="adm-auth__demo adm-btn" onClick={onDemo}>Coba mode demo (tanpa akun)</button>
        <p className="adm-auth__fine">Akun baru menunggu Owner menetapkan perannya (Owner, Admin, atau Marketing) sebelum bisa mengelola konten.</p>
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
