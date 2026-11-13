import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { newsCategories } from '../../data/news';
import { ecosystems as ecosystemData } from '../../data/ecosystems';
import { htmlToText, sanitizeHtml } from '../../lib/rich-text';
import { formatDate, formatDateTime, makeId, readImage, slugify } from '../../lib/store';
import { ACCESS, MODULES, NEWS_STATUS, ROLES, can } from './admin-store';
import { FormCard, ListEditor, Reader, RecordList, SortableList, Tabs, exportCsv, lines, moveItem, reviewText, reviewTone } from './kit';
import { Btn, Card, Editor, Empty, Icon, IconBtn, Pill } from './ui';

const WORD = { C: 'Buat', R: 'Lihat', U: 'Ubah', D: 'Hapus', A: 'Setujui', E: 'Ekspor' };
const rightsText = (s) => (s ? s.split('').map((c) => WORD[c]).join(', ') : 'Tidak ada akses');
const shortDate = (d) => (d ? formatDate(d, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Plain text of an article body for the admin textarea; rich-text blocks become paragraphs.
const bodyToText = (body) => (body || []).map((b) => b.text || (b.html ? htmlToText(b.html) : '') || (b.items || []).join('\n')).filter(Boolean).join('\n');
// The admin form keeps credits flat; articles store them as { writer, editor, photo }.
const withFlatCredits = (n) => ({ ...n, bodyText: bodyToText(n.body), bodyOriginal: bodyToText(n.body), creditEditor: n.credits?.editor || '', creditPhoto: n.credits?.photo || '' });

// ---------------------------------------------------------------- 1. Dashboard: what is waiting comes first
export function Overview({ data, role, go, a, journalCard }) {
  const { news, submissions, registrations, cms, comments = [] } = data;
  const published = news.filter((n) => n.status === 'published');
  const review = news.filter((n) => n.status === 'review');
  const fresh = submissions.filter((s) => (s.status || 'baru') === 'baru');
  const stale = [...cms.ecosystems.map((e) => ({ name: e.title, date: e.reviewedAt, to: 'ecosystems' })), { name: 'Konten beranda', date: cms.pages.reviewedAt, to: 'pages' }, { name: 'Profil perusahaan', date: cms.profile.reviewedAt, to: 'profile' }]
    .filter((x) => !x.date || (Date.now() - new Date(`${String(x.date).slice(0, 10)}T00:00:00`).getTime()) / 86400000 > 90);
  const tasks = [
    ...(role !== 'marketing' ? review.map((n) => ({ key: n.id, title: n.title, meta: `NordeoNews · ${n.category}`, pill: ['gold', 'In review'], action: role === 'owner' ? 'Tinjau & terbitkan' : 'Buka papan', to: 'news' })) : []),
    ...fresh.slice(0, 3).map((s) => ({ key: s.id, title: s.title || '(tanpa judul)', meta: `Kiriman cerita · ${s.name || 'pengirim'}`, pill: ['teal', 'Baru'], action: 'Buka kiriman', to: 'stories' })),
    ...comments.filter((c) => c.status === 'pending').slice(0, 3).map((c) => ({ key: c.id, title: c.comment.slice(0, 70), meta: `Komentar · ${c.name}`, pill: ['gold', 'Moderasi'], action: 'Moderasi', to: 'comments' })),
    ...registrations.filter((r) => (r.status || 'baru') === 'baru').slice(0, 3).map((r) => ({ key: r.id, title: r.name, meta: 'Peminat Academy baru', pill: ['teal', 'Baru'], action: 'Hubungi', to: 'registrations' })),
    ...stale.map((s) => ({ key: s.name, title: s.name, meta: 'Belum ditinjau lebih dari 90 hari', pill: ['red', 'Perlu cek'], action: 'Cek', to: s.to })),
  ].filter((x) => can(x.to, role, 'R'));
  const accent = {
    owner: { title: ['Tinjau', 'Konten'], value: review.length, unit: ['menunggu', 'persetujuan'], cta: 'Buka antrean', to: 'news' },
    admin: { title: ['Tulis', 'Artikel'], value: published.length, unit: ['artikel', 'terbit'], cta: 'Buat baru', to: 'news' },
    marketing: { title: ['Data', 'Peminat'], value: registrations.length, unit: ['peminat', 'Academy'], cta: 'Buka peminat', to: 'registrations' },
  }[role];
  const recent = (data.activity || []).slice(0, 6);
  return <div className="adm-grid">
    <Card title="Perlu tindakan" className="c19" delay={80} action={<Pill tone={tasks.length ? 'gold' : 'green'}>{tasks.length} item</Pill>}>
      {tasks.length === 0 ? <Empty>Semua beres. Tidak ada yang menunggu Anda.</Empty> : <ul className="adm-task-tiles">
        {tasks.slice(0, 6).map((x) => <li key={x.key}><button type="button" className="adm-task-tile adm-btn" onClick={() => go(x.to)}>
          <span className="adm-task-tile__top"><Pill tone={x.pill[0]}>{x.pill[1]}</Pill><span className="adm-muted">{x.meta}</span></span>
          <b>{x.title}</b>
          <span className="adm-task-tile__cta">{x.action}<Icon name="arrow" size={13} width={2} /></span>
        </button></li>)}
      </ul>}
      {tasks.length > 6 && <p className="adm-muted" style={{ marginTop: 10 }}>dan {tasks.length - 6} hal lain di menu masing-masing.</p>}
    </Card>
    <section className="adm-card adm-rise c5 adm-accent" style={{ animationDelay: '140ms', background: a.color, color: a.ink }}>
      <div className="adm-card__head"><h2 style={{ fontSize: 26, lineHeight: '30px', fontWeight: 400 }}>{accent.title[0]}<br />{accent.title[1]}</h2></div>
      <button type="button" className="adm-b adm-b--light adm-btn" onClick={() => go(accent.to)}><Icon name="plus" size={16} width={1.8} />{accent.cta}</button>
      <div className="adm-accent__num"><span>{accent.value}</span><small>{accent.unit[0]}<br />{accent.unit[1]}</small></div>
    </section>
    {journalCard}
    <Card title="Aktivitas terbaru" className="c14" delay={260} action={can('users', role, 'R') && <IconBtn icon="arrow" label="Lihat log aktivitas" onClick={() => go('users')} />}>
      {recent.length === 0 ? <Empty>Belum ada perubahan dari dashboard ini.</Empty> : <ul className="adm-log">
        {recent.map((l) => <li key={l.id}><span className="adm-log__who">{l.who}</span> {l.action} <b>{l.target}</b><span className="adm-muted"> · {formatDateTime(l.at)}</span></li>)}
      </ul>}
      <div className="adm-access"><span className="adm-muted">Hak akses {ROLES.find((r) => r.id === role).label}:</span>{MODULES.filter((m) => ACCESS[m.id][role]).map((m) => <span key={m.id} className="adm-access__chip" title={rightsText(ACCESS[m.id][role])}>{m.label}</span>)}</div>
    </Card>
    <Card title="Empat ekosistem" className="c24" delay={320}
      action={can('ecosystems', role, 'R') && <IconBtn icon="arrow" label="Kelola ekosistem" onClick={() => go('ecosystems')} />}>
      <div className="adm-eco is-four">
        {cms.ecosystems.filter((e) => e.status !== 'hidden').map((e) => <a key={e.id} className="adm-eco__item" href={e.link} target={e.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <span className="adm-eco__top"><b>{e.short || e.title}</b><Pill tone={e.status === 'live' ? 'green' : 'gold'}>{e.status === 'live' ? 'Aktif' : 'Segera'}</Pill></span>
          <span className="adm-muted">{e.platform}</span>
          <span className="adm-eco__link">Buka platform <Icon name="arrow" size={13} width={2} /></span>
        </a>)}
      </div>
    </Card>
  </div>;
}

// ---------------------------------------------------------------- 2. Beranda: sections by drag and drop
export function PagesModule({ data, rights, toast }) {
  const { cms, update } = data;
  const p = cms.pages;
  const save = (draft) => { update('pages', { ...p, ...draft, updatedAt: data.today() }, 'mengubah', 'konten beranda'); toast('Konten beranda disimpan.'); };
  const sections = p.sections;
  const setSections = (next, action, target) => update('pages', { ...p, sections: next, updatedAt: data.today() }, action, target);
  return <div className="adm-grid">
    <Card title="Susunan section beranda" className="c24" delay={80} action={rights.U && <span className="adm-muted">Seret pegangan, atau pakai tombol naik/turun</span>}>
      <div className="adm-sections2">
        <SortableList items={sections} disabled={!rights.U} itemLabel={(s) => s.label}
          onMove={(from, to) => { setSections(moveItem(sections, from, to), 'mengurutkan section', sections[from].label); toast('Urutan beranda disimpan.'); }}
          render={(s) => <div className="adm-sec-row">
            <b className={s.visible ? '' : 'is-off'}>{s.label}</b>
            {!s.visible && <Pill tone="muted">Disembunyikan</Pill>}
            {rights.U && <IconBtn icon={s.visible ? 'eye' : 'eyeOff'} label={s.visible ? `Sembunyikan ${s.label}` : `Tampilkan ${s.label}`} onClick={() => setSections(sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)), s.visible ? 'menyembunyikan section' : 'menampilkan section', s.label)} />}
          </div>} />
        <div className="adm-pagemap" aria-label="Pratinjau urutan beranda">
          <span className="adm-pagemap__bar" aria-hidden="true" />
          {sections.filter((s) => s.visible).map((s) => <span key={s.id} className={`adm-pagemap__block is-${s.id}`}>{s.label}</span>)}
          <span className="adm-pagemap__foot">Footer</span>
        </div>
      </div>
    </Card>
    <FormCard title="Teks hero" className="c14" delay={140} value={p} rights={rights} onSave={save}
      extra={<Pill tone={reviewTone(p.reviewedAt)}>{reviewText(p.reviewedAt)}</Pill>}
      fields={[
        { key: 'heroLine1', label: 'Judul hero, baris 1', required: true },
        { key: 'heroLine2', label: 'Judul hero, baris 2 (tampil kuning #FFD218)' },
        { key: 'heroCta', label: 'Tombol hero', hint: 'Hanya satu tombol: “Discover the ecosystem”.' },
      ]} />
    <Card title="Pratinjau hero" className="c10" delay={200}>
      <div className="adm-hero-preview">
        <img src="/assets/generated/hero-library-v2.webp" alt="" />
        <div><p className="l1">{p.heroLine1}</p><p className="l2">{p.heroLine2}</p><span className="adm-hero-preview__cta">{p.heroCta}</span></div>
      </div>
      <p className="adm-muted" style={{ marginTop: 12 }}>Tampil sebagai slide pertama di beranda. Visi dan misi diubah di menu Profil perusahaan.</p>
      {rights.U && <Btn icon="check" onClick={() => { update('pages', { ...p, reviewedAt: data.today() }, 'menandai sudah ditinjau', 'konten beranda'); toast('Ditandai sudah ditinjau.'); }}>Tandai sudah ditinjau</Btn>}
    </Card>
  </div>;
}

// ---------------------------------------------------------------- 3. Ekosistem: one card per ecosystem
const ECO_IMAGE = Object.fromEntries(ecosystemData.map((e) => [e.id, e.image]));
const ECO_STATUS = { live: ['green', 'Aktif'], soon: ['gold', 'Segera'], hidden: ['muted', 'Disembunyikan'] };

export function EcosystemsModule({ data, rights, toast }) {
  const { cms, update } = data;
  return <div className="adm-grid">
    <RecordList title="Empat ekosistem" label="ekosistem" delay={80} rights={rights} items={cms.ecosystems}
      onChange={(next, action, target) => { update('ecosystems', next.map((e) => ({ ...e, updatedAt: e.updatedAt || data.today() })), action, target); toast('Ekosistem disimpan.'); }}
      blank={{ title: '', short: '', description: '', platform: '', link: 'https://', cta: 'Buka', status: 'soon', updatedAt: data.today(), reviewedAt: '' }}
      card={(e) => <>
        {ECO_IMAGE[e.id] ? <img className="adm-rcard__img" src={ECO_IMAGE[e.id]} alt="" loading="lazy" /> : <span className="adm-rcard__img is-blank" aria-hidden="true"><Icon name="layers" size={28} /></span>}
        <div className="adm-rcard__body">
          <span className="adm-rcard__top"><b>{e.title}</b><Pill tone={ECO_STATUS[e.status]?.[0]}>{ECO_STATUS[e.status]?.[1]}</Pill></span>
          <span className="adm-muted">{e.platform || 'Belum ada platform'}</span>
          {e.description && <p className="adm-rcard__text">{e.description}</p>}
          <span className="adm-rcard__meta"><a href={e.link} target={e.link?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{e.cta || 'Buka'}</a><Pill tone={reviewTone(e.reviewedAt)}>{reviewText(e.reviewedAt)}</Pill></span>
        </div>
      </>}
      rowActions={(e) => rights.U && <Btn icon="check" onClick={() => { update('ecosystems', cms.ecosystems.map((x) => (x.id === e.id ? { ...x, reviewedAt: data.today() } : x)), 'menandai sudah ditinjau', e.title); toast('Ditandai sudah ditinjau.'); }}>Tandai ditinjau</Btn>}
      fields={[
        { key: 'title', label: 'Nama ekosistem', required: true },
        { key: 'short', label: 'Nama singkat (menu)' },
        { key: 'description', label: 'Informasi layanan', type: 'textarea' },
        { key: 'platform', label: 'Platform', hint: 'Mis. OJS, WordPress, Nordeo Academy' },
        { key: 'link', label: 'Link tujuan', type: 'url', required: true },
        { key: 'cta', label: 'Label tombol' },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'live', label: 'Aktif' }, { value: 'soon', label: 'Segera' }, { value: 'hidden', label: 'Disembunyikan' }] },
      ]} />
  </div>;
}

// ---------------------------------------------------------------- 4. NordeoNews: board by status
const BOARD = ['draft', 'review', 'published', 'archived'];

export function NewsModule({ data, role, rights, toast }) {
  const { news, commitNews } = data;
  const [cat, setCat] = useState('Semua');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const query = q.trim().toLowerCase();
  const list = news.filter((n) => (cat === 'Semua' || n.category === cat) && (!query || `${n.title} ${n.author}`.toLowerCase().includes(query)))
    .sort((x, y) => String(y.date).localeCompare(String(x.date)));
  const setOne = (id, patch, action) => { const n = news.find((x) => x.id === id); commitNews(news.map((x) => (x.id === id ? { ...x, ...patch } : x)), action, n.title); };
  const save = (d) => {
    // Keep the original blocks (headings, lists, rich text) unless the text was edited here.
    const unchanged = d.body?.length && d.bodyText === d.bodyOriginal;
    const body = unchanged ? d.body : lines(d.bodyText).map((text) => ({ type: 'p', text }));
    const credits = { ...(d.credits || {}), writer: d.author || d.credits?.writer || '', editor: d.creditEditor || '', photo: d.creditPhoto || '' };
    const rank = Number.parseInt(d.popularRank, 10);
    const rec = { ...d, popularRank: Number.isFinite(rank) && rank > 0 ? rank : undefined, credits, slug: d.slug || slugify(d.title), titleEn: d.titleEn || d.title, body: body.length ? body : d.body || [], readTime: d.readTime || `${Math.max(1, Math.round(String(d.bodyText || '').split(/\s+/).length / 200))} menit` };
    ['bodyText', 'bodyOriginal', 'creditEditor', 'creditPhoto'].forEach((key) => delete rec[key]);
    const exists = news.some((x) => x.id === rec.id);
    commitNews(exists ? news.map((x) => (x.id === rec.id ? rec : x)) : [rec, ...news], exists ? 'mengubah artikel' : 'membuat draft artikel', rec.title);
    setEditing(null); toast(exists ? 'Artikel disimpan.' : 'Draft artikel dibuat.');
  };
  const hint = { draft: role === 'admin' ? 'Kirim ke review bila siap.' : '', review: 'Hanya Owner yang menerbitkan.', published: 'Tayang di NordeoNews.', archived: 'Turun dari website.' };
  return <div className="adm-grid">
    <Card title="Papan artikel" className="c24 adm-nolift" delay={80}
      action={rights.C && <Btn kind="primary" icon="plus" onClick={() => setEditing({ id: makeId('news'), title: '', category: newsCategories[0], dek: '', author: 'Redaksi Nordeo', date: data.today(), cover: '', featured: false, status: 'draft', bodyText: '' })}>Tulis artikel</Btn>}>
      <div className="adm-toolbar">
        <label className="adm-search-mini"><Icon name="search" size={16} /><span className="adm-sr">Cari artikel</span><input type="search" placeholder="Cari judul atau penulis" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <div role="group" aria-label="Kategori" className="adm-chips">
          {['Semua', ...newsCategories].map((c) => <button key={c} type="button" className="adm-btn" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>
      <div className="adm-board">
        {BOARD.map((k) => {
          const items = list.filter((n) => n.status === k);
          return <section key={k} className={`adm-board__col is-${k}`} aria-labelledby={`col-${k}`}>
            <h3 id={`col-${k}`} className="adm-board__head"><Pill tone={NEWS_STATUS[k].tone}>{NEWS_STATUS[k].label}</Pill><span className="adm-muted">{items.length}</span></h3>
            {hint[k] && <p className="adm-muted adm-board__hint">{hint[k]}</p>}
            {items.length === 0 ? <p className="adm-board__empty">Tidak ada artikel.</p> : <ul>
              {items.map((n) => <li key={n.id} className="adm-kcard">
                <span className="adm-kcard__meta">{n.featured && <span title="Featured story" className="adm-star"><Icon name="star" size={13} width={2} /></span>}{n.category} · {shortDate(n.date)}</span>
                <b>{n.title}</b>
                <span className="adm-muted">{n.author}</span>
                {n.reviewNote && <span className="adm-kcard__note">Catatan Owner: {n.reviewNote}</span>}
                <span className="adm-actions adm-kcard__actions">
                  {role === 'owner' && n.status === 'review' && <>
                    <Btn kind="primary" icon="check" onClick={() => { setOne(n.id, { status: 'published', reviewNote: '' }, 'menyetujui dan menerbitkan'); toast('Artikel terbit di NordeoNews.'); }}>Terbitkan</Btn>
                    <Btn icon="undo" onClick={() => setRejecting(n)}>Tolak</Btn></>}
                  {role === 'admin' && n.status === 'draft' && <Btn icon="arrow" onClick={() => { setOne(n.id, { status: 'review' }, 'mengirim ke review'); toast('Dikirim ke Owner untuk ditinjau.'); }}>Kirim ke review</Btn>}
                  {role === 'admin' && n.status === 'published' && <Btn onClick={() => { setOne(n.id, { status: 'archived' }, 'mengarsipkan'); toast('Artikel diarsipkan dan turun dari website.'); }}>Arsipkan</Btn>}
                  {role === 'admin' && n.status === 'archived' && <Btn icon="undo" onClick={() => setOne(n.id, { status: 'draft' }, 'mengembalikan ke draft')}>Jadikan draft</Btn>}
                  {rights.U && <IconBtn icon="star" label={n.featured ? 'Lepas featured' : 'Jadikan featured'} onClick={() => commitNews(news.map((x) => ({ ...x, featured: x.id === n.id ? !n.featured : (n.featured ? x.featured : false) })), n.featured ? 'melepas featured' : 'menjadikan featured', n.title)} />}
                  {rights.U && <IconBtn icon="edit" label={`Ubah ${n.title}`} onClick={() => setEditing(withFlatCredits(n))} />}
                  {n.status === 'published' && <a className="adm-circle is-sm adm-btn" href={`/news/${n.slug}`} target="_blank" rel="noreferrer" aria-label={`Lihat ${n.title} di website`} title="Lihat di website"><Icon name="eye" size={15} width={1.8} /></a>}
                  {rights.D && n.status === 'draft' && <IconBtn icon="trash" label={`Hapus ${n.title}`} onClick={() => { commitNews(news.filter((x) => x.id !== n.id), 'menghapus draft', n.title); toast('Draft dihapus.'); }} />}
                </span>
              </li>)}
            </ul>}
          </section>;
        })}
      </div>
      <p className="adm-muted" style={{ marginTop: 12 }}>Alur: Draft → In review → Published → Archived. Hanya Owner yang bisa menerbitkan.</p>
    </Card>
    {editing && <Editor title={news.some((x) => x.id === editing.id) ? 'Ubah artikel' : 'Tulis artikel'} value={editing} onClose={() => setEditing(null)} onSave={save} saveLabel="Simpan sebagai draft"
      fields={[
        { key: 'title', label: 'Judul', required: true },
        { key: 'category', label: 'Kategori', type: 'select', options: newsCategories },
        { key: 'dek', label: 'Ringkasan (dek)', type: 'textarea', rows: 3 },
        { key: 'author', label: 'Penulis' },
        { key: 'creditEditor', label: 'Editor', hint: 'Tampil di bawah artikel: Penulis: … | Editor: … | Foto: …' },
        { key: 'creditPhoto', label: 'Kredit foto', hint: 'Contoh: Public Relations' },
        { key: 'date', label: 'Tanggal terbit', type: 'date' },
        { key: 'cover', label: 'Gambar sampul (URL)', hint: 'Pilih dari menu Media, salin alamatnya.' },
        { key: 'bodyText', label: 'Isi artikel', type: 'textarea', rows: 8, hint: 'Satu paragraf per baris. Format dari kiriman (tebal, rata, daftar) tetap tersimpan selama teks ini tidak diubah.' },
        { key: 'popularRank', label: 'Urutan populer di beranda', type: 'number', hint: '1 = paling atas. Kosongkan agar diurutkan menurut jumlah pembaca (FR-24).' },
        { key: 'featured', label: 'Jadikan featured story', type: 'toggle' },
      ]} />}
    {rejecting && <Editor title="Tolak artikel" value={{ note: '' }} saveLabel="Kembalikan ke Admin" onClose={() => setRejecting(null)}
      onSave={(d) => { setOne(rejecting.id, { status: 'draft', reviewNote: d.note }, 'menolak'); setRejecting(null); toast('Dikembalikan ke Admin dengan catatan.'); }}
      fields={[{ key: 'note', label: `Catatan untuk “${rejecting.title}”`, type: 'textarea', required: true }]} />}
  </div>;
}

// ---------------------------------------------------------------- Academy: month calendar
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function firstMonth(programs) {
  const now = monthKey(new Date());
  const dated = programs.map((p) => String(p.date || '').slice(0, 7)).filter(Boolean).sort();
  return dated.find((m) => m >= now) || dated[dated.length - 1] || now;
}

export function AcademyModule({ data, rights, toast }) {
  const { cms, update, registrations } = data;
  const programs = cms.programs;
  const [month, setMonth] = useState(() => firstMonth(programs));
  const [editing, setEditing] = useState(null);
  const countFor = (id) => registrations.filter((r) => r.program === id).length;
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(year, mon - 1, 1);
  const lead = (start.getDay() + 6) % 7; // Monday first
  const days = new Date(year, mon, 0).getDate();
  const cells = Array.from({ length: Math.ceil((lead + days) / 7) * 7 }, (_, i) => {
    const day = i - lead + 1;
    if (day < 1 || day > days) return { key: `x${i}` };
    const iso = `${month}-${String(day).padStart(2, '0')}`;
    return { key: iso, day, iso, items: programs.filter((p) => String(p.date || '').slice(0, 10) === iso) };
  });
  const shift = (d) => setMonth(monthKey(new Date(year, mon - 1 + d, 1)));
  const today = new Date().toISOString().slice(0, 10);
  const undated = programs.filter((p) => !p.date);
  const fields = [
    { key: 'title', label: 'Nama program (Indonesia)', required: true },
    { key: 'titleEn', label: 'Nama program (Inggris, untuk beranda)' },
    { key: 'type', label: 'Jenis', type: 'select', options: ['Seminar', 'Konferensi', 'Modul Pelatihan'] },
    { key: 'date', label: 'Tanggal di kalender', type: 'date', hint: 'Kosongkan bila belum pasti; program masuk daftar “Tanggal menyusul”.' },
    { key: 'dateLabel', label: 'Label jadwal', hint: 'Mis. “November 2026”.' },
    { key: 'mode', label: 'Mode', type: 'select', options: ['Online', 'On-site', 'Hybrid'] },
    { key: 'facilitator', label: 'Fasilitator' },
    { key: 'summary', label: 'Ringkasan', type: 'textarea', rows: 3 },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'published', label: 'Tampil di website' }, { value: 'draft', label: 'Draft' }] },
  ];
  const save = (rec) => {
    const exists = programs.some((x) => x.id === rec.id);
    update('programs', exists ? programs.map((x) => (x.id === rec.id ? rec : x)) : [...programs, rec], exists ? 'mengubah' : 'menambah', rec.title);
    setEditing(null); toast('Program disimpan dan tampil di kalender.');
  };
  const open = (p) => setEditing(rights.U ? p : { ...p, readOnly: true });
  const chip = (p) => <button key={p.id} type="button" className={`adm-cal__event is-${(p.type || '').split(' ')[0].toLowerCase()}${p.status === 'published' ? '' : ' is-draft'}`} onClick={() => open(p)} title={`${p.title} · ${p.mode}`}>{p.title}</button>;
  return <div className="adm-grid">
    <Card title={`${MONTHS[mon - 1]} ${year}`} className="c17 adm-nolift" delay={80}
      action={<span className="adm-actions">
        <IconBtn icon="left" label="Bulan sebelumnya" onClick={() => shift(-1)} />
        <Btn onClick={() => setMonth(monthKey(new Date()))}>Bulan ini</Btn>
        <IconBtn icon="right" label="Bulan berikutnya" onClick={() => shift(1)} />
        {rights.C && <Btn kind="primary" icon="plus" onClick={() => setEditing({ id: makeId('program'), title: '', titleEn: '', type: 'Seminar', date: '', dateLabel: 'Tanggal menyusul', mode: 'Online', facilitator: '', summary: '', status: 'draft' })}>Tambah program</Btn>}
      </span>}>
      <div className="adm-cal" role="grid" aria-label={`Kalender ${MONTHS[mon - 1]} ${year}`}>
        {DAYS.map((d) => <span key={d} className="adm-cal__dow" role="columnheader">{d}</span>)}
        {cells.map((c) => <div key={c.key} className={`adm-cal__cell${c.day ? '' : ' is-out'}${c.iso === today ? ' is-today' : ''}`} role="gridcell">
          {c.day && <span className="adm-cal__day">{c.day}</span>}
          {c.items?.map(chip)}
        </div>)}
      </div>
      <p className="adm-muted" style={{ marginTop: 10 }}>Semua tanggal di kalender publik ditandai tentatif sampai tim Academy mengonfirmasi.</p>
    </Card>
    <Card title="Tanggal menyusul" className="c7" delay={140}>
      {undated.length === 0 ? <Empty>Semua program sudah bertanggal.</Empty> : <ul className="adm-undated">
        {undated.map((p) => <li key={p.id}><button type="button" className="adm-btn" onClick={() => open(p)}><b>{p.title}</b><span className="adm-muted">{p.type} · {p.dateLabel || 'Tanggal menyusul'} · {p.mode}</span></button></li>)}
      </ul>}
    </Card>
    <Card title="Semua program" className="c24" delay={200}>
      <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr><th scope="col">Program</th><th scope="col">Jenis</th><th scope="col">Jadwal</th><th scope="col">Peminat</th><th scope="col">Status</th><th scope="col"><span className="adm-sr">Aksi</span></th></tr></thead>
        <tbody>{programs.map((p) => <tr key={p.id}>
          <td><b>{p.title}</b><div className="adm-muted">{p.facilitator}</div></td>
          <td>{p.type}</td>
          <td>{p.date ? shortDate(p.date) : 'Tanggal menyusul'}<div className="adm-muted">{p.mode}</div></td>
          <td><Pill tone={countFor(p.id) ? 'teal' : 'neutral'}>{countFor(p.id)} peminat</Pill></td>
          <td><Pill tone={p.status === 'published' ? 'green' : 'neutral'}>{p.status === 'published' ? 'Tampil' : 'Draft'}</Pill></td>
          <td className="adm-actions">
            <IconBtn icon={rights.U ? 'edit' : 'eye'} label={`${rights.U ? 'Ubah' : 'Lihat'} ${p.title}`} onClick={() => open(p)} />
            {rights.D && <IconBtn icon="trash" label={`Hapus ${p.title}`} onClick={() => { update('programs', programs.filter((x) => x.id !== p.id), 'menghapus', p.title); toast('Program dihapus.'); }} />}
          </td>
        </tr>)}</tbody>
      </table></div>
    </Card>
    {editing && <Editor title={editing.readOnly ? 'Program' : programs.some((x) => x.id === editing.id) ? 'Ubah program' : 'Tambah program'} fields={fields} value={editing} readOnly={editing.readOnly} onClose={() => setEditing(null)} onSave={save} />}
  </div>;
}

// ---------------------------------------------------------------- NordeoNews: story submissions, two-pane inbox
const STORY_STATUS = ['baru', 'diproses', 'diterima', 'ditolak'];
const STORY_TONE = { baru: 'teal', diproses: 'gold', diterima: 'green', ditolak: 'muted' };

export function StoriesModule({ data, rights, toast, go }) {
  const { submissions, commitSubmissions, news, commitNews } = data;
  const [filter, setFilter] = useState('baru');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const storyCols = [['reference', 'Referensi'], ['title', 'Judul'], ['category', 'Kategori'], ['name', 'Pengirim'], ['email', 'Email'], ['institution', 'Institusi'], ['submittedAt', 'Dikirim'], ['status', 'Status']];
  const statusOf = (s) => s.status || 'baru';
  const list = submissions.filter((s) => filter === 'semua' || statusOf(s) === filter);
  const current = list.find((s) => s.id === selected) || list[0] || null;
  const setStatus = (s, status) => commitSubmissions(submissions.map((x) => (x.id === s.id ? { ...x, status } : x)), `menandai kiriman ${status}`, s.title);
  const toDraft = (s) => {
    const rec = { id: makeId('news'), title: s.title || 'Kiriman tanpa judul', category: s.category || newsCategories[0], dek: s.lead || '', author: s.writer || s.name || 'Kontributor', credits: { writer: s.writer || s.name || '', editor: s.editor || '', photo: s.credit || '' }, date: data.today(), cover: s.image?.dataUrl || '', featured: false, status: 'draft', slug: `${slugify(s.title || 'kiriman')}-${Date.now().toString(36).slice(-4)}`, titleEn: s.title || '', body: s.bodyHtml ? [{ type: 'html', html: sanitizeHtml(s.bodyHtml) }] : lines(s.body).map((text) => ({ type: 'p', text })), readTime: '4 menit' };
    commitNews([rec, ...news], 'membuat draft dari kiriman', rec.title);
    setStatus(s, 'diproses');
    toast(s.imagePath ? 'Draft dibuat. Unggah gambar sampulnya lewat menu Media.' : 'Kiriman dijadikan draft artikel.'); go('news');
  };
  const download = async (path, name) => { const url = await data.fileLink(path); if (url) window.open(url, '_blank', 'noopener'); else toast(`Berkas ${name || ''} tidak dapat dibuka.`); };
  const tabs = [...STORY_STATUS.map((k) => [k, capital(k), submissions.filter((s) => statusOf(s) === k).length]), ['semua', 'Semua', submissions.length]];
  return <div className="adm-grid">
    <Card title="Kotak masuk kiriman" className="c24 adm-nolift" delay={80} action={<Btn icon="export" disabled={!submissions.length} onClick={() => exportCsv(data, toast, submissions, storyCols, 'kiriman-nordeonews')}>Ekspor CSV</Btn>}>
      <Tabs label="Status kiriman" tabs={tabs} value={filter} onChange={(k) => { setFilter(k); setSelected(null); }} />
      {submissions.length === 0 ? <Empty>Belum ada kiriman dari form “Kirim berita” NordeoNews.</Empty> : <div className="adm-inbox">
        <ul className="adm-inbox__list" aria-label="Daftar kiriman">
          {list.length === 0 && <li><Empty>Tidak ada kiriman berstatus {filter}.</Empty></li>}
          {list.map((s) => <li key={s.id}><button type="button" className={`adm-inbox__item adm-btn${current?.id === s.id ? ' is-on' : ''}`} aria-current={current?.id === s.id ? 'true' : undefined} onClick={() => setSelected(s.id)}>
            <span className="adm-inbox__top"><b>{s.title || '(tanpa judul)'}</b><Pill tone={STORY_TONE[statusOf(s)]}>{statusOf(s)}</Pill></span>
            <span className="adm-muted">{s.name || 'Pengirim'} · {formatDateTime(s.submittedAt)}</span>
            <span className="adm-muted">{s.category}{s.mode === 'word' ? ' · template Word' : ''}</span>
          </button></li>)}
        </ul>
        {current ? <article className="adm-inbox__detail" aria-label={`Kiriman ${current.title || ''}`}>
          <div className="adm-inbox__head">
            <div><p className="adm-muted">{current.reference} · {current.category}</p><h3>{current.title || '(tanpa judul)'}</h3></div>
            <label className="adm-inbox__status"><span className="adm-sr">Status</span><select value={statusOf(current)} disabled={!rights.U} onChange={(e) => setStatus(current, e.target.value)}>{STORY_STATUS.map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>
          <dl className="adm-inbox__facts">
            <div><dt>Pengirim</dt><dd>{current.name}<span className="adm-muted"> {current.email}</span></dd></div>
            {current.institution && <div><dt>Institusi</dt><dd>{current.institution}</dd></div>}
            {current.publishDate && <div><dt>Usulan tayang</dt><dd>{shortDate(current.publishDate)} {current.publishSlot ? `${current.publishSlot} WIB` : ''}</dd></div>}
            {current.embargo && <div><dt>Embargo</dt><dd>{current.embargoAt} · {current.embargoReason}</dd></div>}
          </dl>
          {current.lead && <p className="adm-inbox__lead">{current.lead}</p>}
          {current.bodyHtml ? <div className="adm-reader__body adm-inbox__body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(current.bodyHtml) }} /> : <p className="adm-inbox__body">{current.body || 'Isi naskah ada di berkas Word.'}</p>}
          <div className="adm-inbox__files">
            {current.docPath && <Btn icon="export" onClick={() => download(current.docPath, current.docName)}>Berkas Word</Btn>}
            {current.docFile?.dataUrl && <a className="adm-b adm-b--ghost adm-btn" href={current.docFile.dataUrl} download={current.docFile.name}>Berkas Word</a>}
            {current.imagePath && <Btn icon="image" onClick={() => download(current.imagePath, current.imageName)}>Gambar highlight</Btn>}
            <Btn icon="eye" onClick={() => setOpen(true)}>Baca layar penuh</Btn>
          </div>
          {rights.U && <div className="adm-inbox__actions">
            <Btn kind="primary" icon="news" onClick={() => toDraft(current)}>Jadikan draft artikel</Btn>
            {current.email && <a className="adm-b adm-btn" href={`mailto:${current.email}?subject=${encodeURIComponent(`Kiriman NordeoNews ${current.reference || ''}`)}`}>Balas lewat email</a>}
            {statusOf(current) !== 'ditolak' && <Btn icon="close" onClick={() => setStatus(current, 'ditolak')}>Tolak</Btn>}
          </div>}
        </article> : <div className="adm-inbox__detail"><Empty>Pilih kiriman di sebelah kiri.</Empty></div>}
      </div>}
    </Card>
    {open && current && <Reader title={current.title || 'Kiriman'} onClose={() => setOpen(false)}>
      <p className="adm-muted">{current.reference} · {current.name} · {current.email}{current.institution ? ` · ${current.institution}` : ''}</p>
      {current.lead && <p><b>{current.lead}</b></p>}
      {current.bodyHtml ? <div className="adm-reader__body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(current.bodyHtml) }} /> : <p className="adm-reader__body">{current.body || 'Isi naskah ada di berkas Word.'}</p>}
    </Reader>}
  </div>;
}

// ---------------------------------------------------------------- NordeoNews: comments (moderation queue)
export function CommentsModule({ data, rights, toast }) {
  const { comments, commitComments, news } = data;
  const [status, setStatus] = useState('pending');
  const title = (slug) => news.find((n) => n.slug === slug || n.id === slug)?.title || slug;
  const list = comments.filter((c) => status === 'all' || c.status === status);
  const set = (c, next, action) => { commitComments(comments.map((x) => (x.id === c.id ? { ...x, status: next } : x)), action, c.name); toast(next === 'approved' ? 'Komentar tampil di artikel.' : 'Komentar disembunyikan.'); };
  const counts = { pending: comments.filter((c) => c.status === 'pending').length, approved: comments.filter((c) => c.status === 'approved').length, hidden: comments.filter((c) => c.status === 'hidden').length };
  return <div className="adm-grid">
    <Card title="Komentar pembaca" className="c24" delay={80}>
      <Tabs label="Status komentar" value={status} onChange={setStatus} tabs={[['pending', 'Menunggu', counts.pending], ['approved', 'Tampil', counts.approved], ['hidden', 'Disembunyikan', counts.hidden], ['all', 'Semua', comments.length]]} />
      {list.length === 0 ? <Empty>{status === 'pending' ? 'Tidak ada komentar yang menunggu moderasi.' : 'Tidak ada komentar untuk filter ini.'}</Empty> : <ul className="adm-comments">
        {list.map((c) => <li key={c.id}>
          <div><b>{c.name}</b> <span className="adm-muted">{c.email} · {formatDateTime(c.at)}</span></div>
          <p>{c.comment}</p>
          <div className="adm-muted">Pada: {title(c.slug)}</div>
          {rights.U && <span className="adm-actions">
            {c.status !== 'approved' && <Btn kind="primary" icon="check" onClick={() => set(c, 'approved', 'menyetujui komentar')}>Tampilkan</Btn>}
            {c.status !== 'hidden' && <Btn icon="eyeOff" onClick={() => set(c, 'hidden', 'menyembunyikan komentar')}>Sembunyikan</Btn>}
            {rights.D && <IconBtn icon="trash" label={`Hapus komentar ${c.name}`} onClick={() => { commitComments(comments.filter((x) => x.id !== c.id), 'menghapus komentar', c.name); toast('Komentar dihapus.'); }} />}
          </span>}
        </li>)}
      </ul>}
    </Card>
  </div>;
}

// ---------------------------------------------------------------- Academy: registrations, count per programme + table
export function RegistrationsModule({ data, rights, toast }) {
  const { registrations, commitRegistrations, cms } = data;
  const [program, setProgram] = useState(null);
  const programTitle = (id) => cms.programs.find((p) => p.id === id)?.title || id || '—';
  const regCols = [['reference', 'Referensi'], ['name', 'Nama'], ['email', 'Email'], ['institution', 'Institusi'], ['role', 'Peran'], ['program', 'Program'], ['submittedAt', 'Dikirim'], ['status', 'Status']];
  const list = program ? registrations.filter((r) => r.program === program) : registrations;
  const fresh = (id) => registrations.filter((r) => r.program === id && (r.status || 'baru') === 'baru').length;
  return <div className="adm-grid">
    <Card title="Peminat per program" className="c24" delay={80}>
      <ul className="adm-prog-counts">
        {cms.programs.map((p) => {
          const n = registrations.filter((r) => r.program === p.id).length;
          const on = program === p.id;
          return <li key={p.id}><button type="button" className={`adm-prog-count adm-btn${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => setProgram(on ? null : p.id)}>
            <span className="adm-muted">{p.type}</span>
            <b>{p.title}</b>
            <span className="adm-prog-count__num"><strong>{n}</strong> peminat{fresh(p.id) ? <Pill tone="teal">{fresh(p.id)} baru</Pill> : null}</span>
            <span className="adm-muted">{p.date ? `${shortDate(p.date)} · tentatif` : p.dateLabel || 'Tanggal menyusul'}</span>
          </button></li>;
        })}
      </ul>
    </Card>
    <Card title={program ? `Peminat: ${programTitle(program)}` : `Semua peminat (${registrations.length})`} className="c24" delay={140}
      action={<span className="adm-actions">
        {program && <Btn onClick={() => setProgram(null)}>Semua program</Btn>}
        {rights.E && <Btn icon="export" disabled={!list.length} onClick={() => exportCsv(data, toast, list.map((r) => ({ ...r, program: programTitle(r.program) })), regCols, 'peminat-academy')}>Ekspor CSV</Btn>}
      </span>}>
      {list.length === 0 ? <Empty>{registrations.length ? 'Belum ada peminat untuk program ini.' : 'Belum ada pendaftar dari form minat Academy.'}</Empty> : <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr><th scope="col">Peminat</th><th scope="col">Program</th><th scope="col">Dikirim</th><th scope="col">Tindak lanjut</th></tr></thead>
        <tbody>{list.map((r) => <tr key={r.id}>
          <td><b>{r.name}</b><div className="adm-muted">{r.email}{r.institution ? ` · ${r.institution}` : ''}{r.role ? ` · ${r.role}` : ''}</div></td>
          <td>{programTitle(r.program)}</td>
          <td>{formatDateTime(r.submittedAt)}</td>
          <td><select aria-label={`Status ${r.name}`} value={r.status || 'baru'} disabled={!rights.U} onChange={(e) => commitRegistrations(registrations.map((x) => (x.id === r.id ? { ...x, status: e.target.value } : x)), `menandai peminat ${e.target.value}`, r.name)}>{['baru', 'dihubungi', 'terdaftar', 'batal'].map((o) => <option key={o}>{o}</option>)}</select></td>
        </tr>)}</tbody>
      </table></div>}
    </Card>
  </div>;
}

// ---------------------------------------------------------------- Marketing: subscribers, growth + table
export function SubscribersModule({ data, rights, toast }) {
  const { subscribers, commitSubscribers } = data;
  const cols = [['email', 'Email'], ['topics', 'Topik'], ['createdAt', 'Bergabung']];
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); return { key: monthKey(d), label: MONTHS[d.getMonth()].slice(0, 3) }; });
  const bars = months.map((m) => ({ ...m, n: subscribers.filter((s) => String(s.createdAt || '').slice(0, 7) === m.key).length }));
  const max = Math.max(1, ...bars.map((b) => b.n));
  const thisMonth = bars[bars.length - 1].n;
  const lastMonth = bars[bars.length - 2].n;
  return <div className="adm-grid">
    <Card title="Ringkasan" className="c8" delay={80}>
      <div className="adm-kpis">
        <div><span className="adm-muted">Total subscriber</span><strong>{subscribers.length}</strong></div>
        <div><span className="adm-muted">Baru bulan ini</span><strong>{thisMonth}</strong></div>
        <div><span className="adm-muted">Bulan lalu</span><strong>{lastMonth}</strong></div>
      </div>
    </Card>
    <Card title="Pertumbuhan 6 bulan" className="c16" delay={140}>
      <div className="adm-growth" role="img" aria-label={`Subscriber baru per bulan: ${bars.map((b) => `${b.label} ${b.n}`).join(', ')}`}>
        {bars.map((b, i) => <div key={b.key} className="adm-growth__col">
          <span className="adm-growth__n">{b.n}</span>
          <span className={`adm-growth__bar${i === bars.length - 1 ? ' is-now' : ''}`} style={{ height: `${Math.max(4, Math.round((b.n / max) * 120))}px` }} />
          <span className="adm-muted">{b.label}</span>
        </div>)}
      </div>
    </Card>
    <Card title="Daftar subscriber" className="c24" delay={200} action={rights.E && <Btn icon="export" disabled={!subscribers.length} onClick={() => exportCsv(data, toast, subscribers, cols, 'subscriber-nordeonews')}>Ekspor CSV</Btn>}>
      {subscribers.length === 0 ? <Empty>{data.remote ? 'Belum ada yang berlangganan lewat form di halaman NordeoNews.' : 'Mode demo tidak menyimpan subscriber. Masuk dengan akun untuk melihat daftar asli.'}</Empty> : <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr><th scope="col">Email</th><th scope="col">Topik</th><th scope="col">Bergabung</th><th scope="col"><span className="adm-sr">Aksi</span></th></tr></thead>
        <tbody>{subscribers.map((s) => <tr key={s.id}><td><b>{s.email}</b></td><td>{s.topics || '—'}</td><td>{formatDateTime(s.createdAt)}</td>
          <td className="adm-actions">{rights.D && <IconBtn icon="trash" label={`Hapus ${s.email}`} onClick={() => { commitSubscribers(subscribers.filter((x) => x.id !== s.id), 'menghapus subscriber', s.email); toast('Subscriber dihapus.'); }} />}</td></tr>)}</tbody>
      </table></div>}
    </Card>
  </div>;
}

// ---------------------------------------------------------------- Marketing: reviews, partners, FAQ in tabs
export function PromoModule({ data, rights, toast }) {
  const { cms, update } = data;
  const [tab, setTab] = useState('faqs');
  const promo = cms.promo || { testimonials: [], partners: [], faqs: [] };
  const set = (key, next, action, target) => { update('promo', { ...promo, [key]: next }, action, target); toast('Disimpan. Beranda memakai data ini.'); };
  const tabs = [['testimonials', 'Review', (promo.testimonials || []).length], ['partners', 'Mitra', (promo.partners || []).length], ['faqs', 'FAQ', (promo.faqs || []).length]];
  return <div className="adm-grid">
    <div className="c24"><Tabs label="Jenis konten" tabs={tabs} value={tab} onChange={setTab} /></div>
    {tab === 'testimonials' && <RecordList title="Review" label="review" className="c24" delay={60} rights={rights} items={promo.testimonials || []}
      onChange={(next, action, target) => set('testimonials', next.map((r) => ({ ...r, rating: Number(r.rating) || 5 })), action, target)}
      blank={{ quote: '', name: '', role: '', service: 'Journals', rating: 5, sample: false }}
      columns={[
        [(r) => <><b>“{r.quote.slice(0, 90)}{r.quote.length > 90 ? '…' : ''}”</b><div className="adm-muted">{r.name} · {r.role}</div></>, 'Review'],
        [(r) => r.service, 'Layanan'],
        [(r) => <Pill tone={r.sample ? 'red' : 'green'}>{r.sample ? 'Contoh · tidak tampil' : 'Tampil'}</Pill>, 'Status'],
      ]}
      fields={[
        { key: 'quote', label: 'Isi review', type: 'textarea', rows: 4, required: true },
        { key: 'name', label: 'Nama atau peran pemberi review', required: true, hint: 'Pakai kutipan asli yang sudah disetujui pemiliknya.' },
        { key: 'role', label: 'Keterangan', hint: 'Mis. Dosen teknik industri' },
        { key: 'service', label: 'Layanan', type: 'select', options: ['Journals', 'NordeoNews', 'Academy', 'Books'] },
        { key: 'rating', label: 'Nilai (1–5)', type: 'select', options: ['5', '4', '3', '2', '1'] },
        { key: 'sample', label: 'Ini contoh, jangan tampilkan', type: 'toggle' },
      ]} />}
    {tab === 'partners' && <RecordList title="Logo mitra" label="mitra" className="c24" delay={60} rights={rights} items={promo.partners || []}
      onChange={(next, action, target) => set('partners', next, action, target)}
      blank={{ name: '', logo: '', confirmed: false }}
      columns={[[(p) => <span className="adm-logo-cell">{p.logo && <img src={p.logo} alt="" />}<b>{p.name}</b></span>, 'Mitra'], [(p) => <Pill tone={p.confirmed ? 'green' : 'gold'}>{p.confirmed ? 'Disetujui mitra' : 'Perlu konfirmasi'}</Pill>, 'Izin']]}
      fields={[{ key: 'name', label: 'Nama institusi', required: true }, { key: 'logo', label: 'Alamat logo', hint: 'Salin dari menu Media.' }, { key: 'confirmed', label: 'Mitra sudah setuju logonya ditampilkan', type: 'toggle' }]} />}
    {tab === 'faqs' && <Card title="FAQ" className="c24" delay={60}>
      <FaqEditor faqs={promo.faqs || []} rights={rights} onChange={(next, action, target) => set('faqs', next, action, target)} />
    </Card>}
  </div>;
}

function FaqEditor({ faqs, rights, onChange }) {
  const [editing, setEditing] = useState(null);
  const fields = [{ key: 'q', label: 'Pertanyaan', required: true }, { key: 'a', label: 'Jawaban', type: 'textarea', rows: 4, required: true }];
  return <>
    {faqs.length === 0 ? <Empty>Belum ada pertanyaan.</Empty> : <SortableList items={faqs} disabled={!rights.U} itemLabel={(f) => f.q}
      onMove={(from, to) => onChange(moveItem(faqs, from, to), 'mengurutkan FAQ', faqs[from].q)}
      render={(f) => <div className="adm-faq-row"><div><b>{f.q}</b><p className="adm-muted">{f.a}</p></div>
        <span className="adm-actions">
          {rights.U && <IconBtn icon="edit" label={`Ubah ${f.q}`} onClick={() => setEditing(f)} />}
          {rights.D && <IconBtn icon="trash" label={`Hapus ${f.q}`} onClick={() => onChange(faqs.filter((x) => x.id !== f.id), 'menghapus', f.q)} />}
        </span></div>} />}
    {rights.C && <div className="adm-form__foot"><Btn kind="primary" icon="plus" onClick={() => setEditing({ id: makeId('faq'), q: '', a: '' })}>Tambah pertanyaan</Btn></div>}
    {editing && <Editor title={faqs.some((x) => x.id === editing.id) ? 'Ubah pertanyaan' : 'Tambah pertanyaan'} fields={fields} value={editing} onClose={() => setEditing(null)}
      onSave={(rec) => { const exists = faqs.some((x) => x.id === rec.id); onChange(exists ? faqs.map((x) => (x.id === rec.id ? rec : x)) : [...faqs, rec], exists ? 'mengubah' : 'menambah', rec.q); setEditing(null); }} />}
  </>;
}

// ---------------------------------------------------------------- 7. Profil perusahaan: Visi · Misi · Nilai · Layanan
export function ProfileModule({ data, rights, toast }) {
  const { cms, update } = data;
  const p = cms.profile;
  const [tab, setTab] = useState('vision');
  const save = (patch, what) => { update('profile', { ...p, ...patch, updatedAt: data.today() }, 'mengubah', `profil perusahaan (${what})`); toast(`${capital(what)} disimpan.`); };
  const tabs = [['vision', 'Visi'], ['mission', 'Misi', p.mission.length], ['values', 'Nilai', p.values.length], ['services', 'Layanan', p.services.length]];
  return <div className="adm-grid">
    <Card title="Profil perusahaan" className="c24" delay={80}
      action={<span className="adm-actions"><Pill tone={reviewTone(p.reviewedAt)}>{reviewText(p.reviewedAt)}</Pill>{rights.U && <Btn icon="check" onClick={() => { update('profile', { ...p, reviewedAt: data.today() }, 'menandai sudah ditinjau', 'profil perusahaan'); toast('Ditandai sudah ditinjau.'); }}>Tandai ditinjau</Btn>}</span>}>
      <Tabs label="Bagian profil" tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'vision' && <VisionForm key={p.vision} value={p.vision} rights={rights} onSave={(vision) => save({ vision }, 'visi')} />}
      {tab === 'mission' && <ListEditor key={`m${p.mission.join('|')}`} items={p.mission} rights={rights} addLabel="misi" multiline onSave={(mission) => save({ mission }, 'misi')} />}
      {tab === 'values' && <ListEditor key={`v${p.values.join('|')}`} items={p.values} rights={rights} addLabel="nilai" splitTitle onSave={(values) => save({ values }, 'nilai')} />}
      {tab === 'services' && <ListEditor key={`s${p.services.join('|')}`} items={p.services} rights={rights} addLabel="layanan" onSave={(services) => save({ services }, 'layanan')} />}
      <p className="adm-muted" style={{ marginTop: 12 }}>Tampil di halaman Our Story. Admin bisa mengubah isi; menambah dan menghapus butir hanya untuk Owner.</p>
    </Card>
  </div>;
}

function VisionForm({ value, rights, onSave }) {
  const [draft, setDraft] = useState(value);
  return <div className="adm-vision">
    <div className="adm-field is-wide"><label htmlFor="adm-vision">Visi</label><textarea id="adm-vision" rows={4} value={draft} disabled={!rights.U} onChange={(e) => setDraft(e.target.value)} /></div>
    <div className="adm-vision__preview"><span className="adm-muted">Pratinjau</span><p>{draft}</p></div>
    {rights.U && <div className="adm-form__foot"><Btn disabled={draft === value} onClick={() => setDraft(value)}>Batalkan</Btn><Btn kind="primary" icon="check" disabled={draft === value || !draft.trim()} onClick={() => onSave(draft.trim())}>Simpan perubahan</Btn></div>}
  </div>;
}

// ---------------------------------------------------------------- 8. Kemitraan: opportunity cards
export function PartnershipModule({ data, rights, toast }) {
  const { cms, update } = data;
  const items = cms.partnerships;
  const save = (next, action, target) => { update('partnerships', next, action, target); toast('Peluang kemitraan disimpan.'); };
  return <div className="adm-grid">
    <RecordList title="Peluang kemitraan & layanan" label="peluang" delay={80} rights={rights} items={items} onChange={save}
      blank={{ title: '', audience: '', status: 'open', contact: '' }}
      card={(p) => <div className={`adm-rcard__body${p.status === 'open' ? '' : ' is-closed'}`}>
        <span className="adm-rcard__top"><span className="adm-muted">{p.audience || 'Semua mitra'}</span><Pill tone={p.status === 'open' ? 'green' : 'muted'}>{p.status === 'open' ? 'Dibuka' : 'Ditutup'}</Pill></span>
        <b className="adm-rcard__title">{p.title}</b>
        <span className="adm-muted">Kontak: {p.contact || '—'}</span>
      </div>}
      rowActions={(p) => rights.U && <Btn onClick={() => save(items.map((x) => (x.id === p.id ? { ...x, status: p.status === 'open' ? 'closed' : 'open' } : x)), p.status === 'open' ? 'menutup peluang' : 'membuka peluang', p.title)}>{p.status === 'open' ? 'Tutup' : 'Buka lagi'}</Btn>}
      fields={[
        { key: 'title', label: 'Judul peluang', required: true },
        { key: 'audience', label: 'Sasaran mitra' },
        { key: 'contact', label: 'Email kontak', type: 'email' },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Dibuka' }, { value: 'closed', label: 'Ditutup' }] },
      ]} />
  </div>;
}

// ---------------------------------------------------------------- 9. Kontak & lokasi: form + footer preview
export function ContactModule({ data, rights, toast }) {
  const { cms, update } = data;
  const [draft, setDraft] = useState(cms.contact);
  const c = { ...cms.contact, ...draft };
  return <div className="adm-grid">
    <FormCard title="Kontak & lokasi" className="c14" delay={80} value={cms.contact} rights={rights} onDraft={setDraft}
      note="Satu sumber untuk footer dan halaman Contact."
      onSave={(d) => { update('contact', { ...d, updatedAt: data.today() }, 'mengubah', 'kontak & lokasi'); toast('Kontak disimpan.'); }}
      fields={[
        { key: 'address', label: 'Alamat', type: 'textarea', rows: 2, required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'whatsapp', label: 'WhatsApp (link)', type: 'url' },
        { key: 'instagram', label: 'Instagram (link)', type: 'url' },
        { key: 'mapLink', label: 'Link Google Maps', type: 'url' },
      ]} />
    <Card title="Pratinjau footer" className="c10" delay={140}>
      <div className="adm-footer-preview">
        <img src="/assets/logo-light.png" alt="Nordeo Scholar Publishing" />
        <p>{c.address}</p>
        <p>{c.email}</p>
        <p className="adm-footer-preview__links"><span>WhatsApp</span><span>Instagram</span><a href={c.mapLink} target="_blank" rel="noreferrer">Google Maps</a></p>
      </div>
    </Card>
  </div>;
}

// ---------------------------------------------------------------- Footer menu: drag and drop
export function NavigationModule({ data, rights, toast }) {
  const { cms, update } = data;
  const items = cms.navigation?.footer || [];
  const [editing, setEditing] = useState(null);
  const set = (next, action, target) => { update('navigation', { ...cms.navigation, footer: next }, action, target); toast('Menu footer disimpan.'); };
  const fields = [{ key: 'label', label: 'Label', required: true }, { key: 'href', label: 'Link', required: true, hint: 'Halaman website diawali “/”, mis. /author-guide.' }];
  return <div className="adm-grid">
    <Card title="Tautan “For scholars” di footer" className="c14" delay={80} action={rights.C && <Btn kind="primary" icon="plus" onClick={() => setEditing({ id: makeId('nav'), label: '', href: '/' })}>Tambah tautan</Btn>}>
      {items.length === 0 ? <Empty>Belum ada tautan.</Empty> : <SortableList items={items} disabled={!rights.U} itemLabel={(n) => n.label}
        onMove={(from, to) => set(moveItem(items, from, to), 'mengurutkan menu', items[from].label)}
        render={(n) => <div className="adm-faq-row"><div><b>{n.label}</b><p className="adm-muted">{n.href}</p></div>
          <span className="adm-actions">
            {rights.U && <IconBtn icon="edit" label={`Ubah ${n.label}`} onClick={() => setEditing(n)} />}
            {rights.D && <IconBtn icon="trash" label={`Hapus ${n.label}`} onClick={() => set(items.filter((x) => x.id !== n.id), 'menghapus', n.label)} />}
          </span></div>} />}
    </Card>
    <Card title="Pratinjau footer" className="c10" delay={140}>
      <div className="adm-footer-preview">
        <span className="adm-footer-preview__head">For scholars</span>
        <ul>{items.map((n) => <li key={n.id}>{n.label}</li>)}</ul>
      </div>
      <p className="adm-muted" style={{ marginTop: 12 }}>Menu header mengikuti empat ekosistem; nama dan statusnya diubah di menu Ekosistem.</p>
    </Card>
    {editing && <Editor title={items.some((x) => x.id === editing.id) ? 'Ubah tautan' : 'Tambah tautan'} fields={fields} value={editing} onClose={() => setEditing(null)}
      onSave={(rec) => { const exists = items.some((x) => x.id === rec.id); set(exists ? items.map((x) => (x.id === rec.id ? rec : x)) : [...items, rec], exists ? 'mengubah' : 'menambah', rec.label); setEditing(null); }} />}
  </div>;
}

// ---------------------------------------------------------------- Media: gallery grid
export function MediaModule({ data, rights, toast }) {
  const { cms, update } = data;
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('Semua');
  const uses = ['Semua', ...new Set(cms.media.map((m) => m.used || 'Belum dipakai'))];
  const shown = filter === 'Semua' ? cms.media : cms.media.filter((m) => (m.used || 'Belum dipakai') === filter);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const img = data.remote ? null : await readImage(file, 1200);
      const src = await data.uploadMedia(file, img?.dataUrl);
      if (src) { update('media', [...cms.media, { id: makeId('media'), src, name: file.name, alt: '', used: 'Belum dipakai' }], 'mengunggah', file.name); toast('Gambar diunggah. Lengkapi alt text-nya.'); }
    } catch { toast('Gambar tidak dapat dibaca.'); }
    setBusy(false);
  };
  return <div className="adm-grid">
    <Card title="Galeri media" className="c24" delay={80}
      action={rights.C && <label className="adm-b adm-b--primary adm-btn" aria-busy={busy}><Icon name="upload" size={16} width={1.8} />{busy ? 'Mengunggah…' : 'Unggah gambar'}<input type="file" accept="image/*" className="adm-sr" onChange={upload} disabled={busy} /></label>}>
      <div role="group" aria-label="Filter pemakaian" className="adm-chips">{uses.map((u) => <button key={u} type="button" className="adm-btn" aria-pressed={filter === u} onClick={() => setFilter(u)}>{u}</button>)}</div>
      <ul className="adm-media">{shown.map((m) => <li key={m.id}>
        <img src={m.src} alt={m.alt || ''} loading="lazy" />
        <div><b title={m.name}>{m.name}</b><span className="adm-muted">{m.used}</span>{!m.alt && <Pill tone="red">Alt text kosong</Pill>}</div>
        <span className="adm-actions">
          <IconBtn icon="export" label={`Salin alamat ${m.name}`} onClick={() => { navigator.clipboard?.writeText(m.src.startsWith('data:') ? m.name : m.src); toast('Alamat gambar disalin.'); }} />
          {rights.U && <IconBtn icon="edit" label={`Ubah alt text ${m.name}`} onClick={() => setEditing(m)} />}
          {rights.D && !m.src.startsWith('/assets/') && <IconBtn icon="trash" label={`Hapus ${m.name}`} onClick={() => update('media', cms.media.filter((x) => x.id !== m.id), 'menghapus', m.name)} />}
        </span>
      </li>)}</ul>
    </Card>
    {editing && <Editor title="Ubah media" value={editing} onClose={() => setEditing(null)}
      onSave={(d) => { update('media', cms.media.map((x) => (x.id === d.id ? d : x)), 'mengubah alt text', d.name); setEditing(null); toast('Media disimpan.'); }}
      fields={[{ key: 'alt', label: 'Alt text', type: 'textarea', rows: 2, required: true, hint: 'Jelaskan isi gambar untuk pembaca layar.' }, { key: 'used', label: 'Dipakai di' }]} />}
  </div>;
}

// ---------------------------------------------------------------- Users and roles: interactive access matrix
// Staff accounts exist only for invited emails (enforced by a database trigger); the Owner manages the invitations.
function InviteCard({ remote, toast }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ email: '', role: 'admin' });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!remote) return;
    supabase.from('staff_invites').select('*').order('created_at', { ascending: false }).then(({ data }) => setList(data || []));
  }, [remote]);
  const add = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Gunakan alamat email yang valid.'); return; }
    if (list.some((x) => x.email === email)) { toast('Email ini sudah diundang.'); return; }
    const row = { email, role: form.role || null };
    if (remote) {
      setBusy(true);
      const { data: saved, error } = await supabase.from('staff_invites').insert(row).select().single();
      setBusy(false);
      if (error) { toast(error.code === '23505' ? 'Email ini sudah diundang.' : 'Undangan gagal disimpan.'); return; }
      setList((l) => [saved, ...l]);
    } else setList((l) => [{ ...row, created_at: new Date().toISOString(), used_at: null }, ...l]);
    setForm({ email: '', role: 'admin' });
    toast(`Undangan dibuat. ${email} bisa memilih "Aktifkan akun" di halaman masuk.`);
  };
  const remove = async (email) => {
    if (remote) {
      const { error } = await supabase.from('staff_invites').delete().eq('email', email);
      if (error) { toast('Undangan gagal dihapus.'); return; }
    }
    setList((l) => l.filter((x) => x.email !== email));
    toast('Undangan dihapus.');
  };
  const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label || 'Tanpa peran';
  return <Card title="Undang staf" className="c24" delay={70}>
    <form className="adm-invite" onSubmit={add}>
      <div className="adm-field"><label htmlFor="adm-invite-email">Email staf</label><input id="adm-invite-email" type="email" autoComplete="off" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
      <div className="adm-field"><label htmlFor="adm-invite-role">Peran</label><select id="adm-invite-role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}<option value="">Tanpa peran (Owner pilih nanti)</option></select></div>
      <button type="submit" className="adm-b adm-b--primary adm-btn" disabled={busy}><Icon name="plus" size={16} width={2} />{busy ? 'Menyimpan…' : 'Undang'}</button>
    </form>
    {list.length === 0 ? <p className="adm-muted">Belum ada undangan.</p> : <ul className="adm-invite__list">{list.map((x) => <li key={x.email}>
      <div><b>{x.email}</b><span className="adm-muted">{roleLabel(x.role)}</span></div>
      {x.used_at ? <Pill tone="green">Sudah aktif</Pill> : <><Pill tone="gold">Menunggu aktivasi</Pill><IconBtn icon="trash" label={`Hapus undangan ${x.email}`} onClick={() => remove(x.email)} /></>}
    </li>)}</ul>}
  </Card>;
}

export function UsersModule({ data, role, rights, toast }) {
  const { users, commitUsers, activity: log } = data;
  const [focus, setFocus] = useState(role);
  const [row, setRow] = useState(null);
  const userRights = { ...rights, C: rights.C && !data.remote, D: rights.D && !data.remote };
  const roleOptions = [...ROLES.map((r) => ({ value: r.id, label: r.label })), ...(data.remote ? [{ value: 'pending', label: 'Menunggu peran' }] : [])];
  const pending = users.filter((u) => u.role === 'pending' && u.active);
  const focusRole = ROLES.find((r) => r.id === focus) || ROLES[0];
  const rowModule = MODULES.find((m) => m.id === row);
  return <div className="adm-grid">
    {role === 'owner' && <InviteCard remote={data.remote} toast={toast} />}
    {pending.length > 0 && <Card title={`${pending.length} akun menunggu peran`} className="c24 adm-alert" delay={60}>
      <ul className="adm-pending">{pending.map((u) => <li key={u.id}><div><b>{u.name}</b><span className="adm-muted">{u.email}</span></div>
        {rights.U ? <label><span className="adm-sr">Peran untuk {u.name}</span><select defaultValue="" onChange={(e) => { if (!e.target.value) return; commitUsers(users.map((x) => (x.id === u.id ? { ...x, role: e.target.value } : x)), 'memberi peran', u.name); toast(`${u.name} sekarang ${ROLES.find((r) => r.id === e.target.value)?.label}.`); }}><option value="">Pilih peran…</option>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label> : <Pill tone="gold">Menunggu Owner</Pill>}
      </li>)}</ul>
    </Card>}
    <RecordList title="Pengguna dashboard" label="pengguna" className="c24" delay={80} rights={userRights} items={users}
      onChange={(next, action, target) => { commitUsers(next, action, target); toast('Pengguna disimpan.'); }}
      blank={{ name: '', email: '', role: 'admin', active: true }}
      columns={[[(u) => <><b>{u.name}</b><div className="adm-muted">{u.email}</div></>, 'Nama'], [(u) => (u.role === 'pending' ? <Pill tone="gold">Menunggu peran</Pill> : ROLES.find((r) => r.id === u.role)?.label), 'Peran'], [(u) => <Pill tone={u.active ? 'green' : 'muted'}>{u.active ? 'Aktif' : 'Nonaktif'}</Pill>, 'Status']]}
      fields={[
        { key: 'name', label: 'Nama', required: true },
        ...(data.remote ? [] : [{ key: 'email', label: 'Email', type: 'email', required: true }]),
        { key: 'role', label: 'Peran', type: 'select', options: roleOptions },
        { key: 'active', label: 'Akun aktif', type: 'toggle' },
      ]} />
    <Card title="Matriks hak akses" className="c16" delay={140}>
      <p className="adm-muted">Pilih peran untuk menyorot kolomnya, lalu klik baris modul untuk melihat rinciannya.</p>
      <Tabs label="Peran" tabs={ROLES.map((r) => [r.id, r.label])} value={focus} onChange={setFocus} />
      <div className="adm-table-wrap"><table className="adm-table is-compact adm-matrix">
        <thead><tr><th scope="col">Modul</th>{ROLES.map((r) => <th key={r.id} scope="col" className={r.id === focus ? 'is-focus' : ''}>{r.label}</th>)}</tr></thead>
        <tbody>{MODULES.map((m) => <tr key={m.id} className={row === m.id ? 'is-row' : ''} onClick={() => setRow(m.id)}>
          <td><button type="button" className="adm-matrix__mod adm-btn" aria-pressed={row === m.id} onClick={() => setRow(m.id)}>{m.label}</button></td>
          {ROLES.map((r) => <td key={r.id} className={r.id === focus ? 'is-focus' : ''}>
            {ACCESS[m.id][r.id] ? <span className="adm-matrix__chips" aria-label={rightsText(ACCESS[m.id][r.id])}>{ACCESS[m.id][r.id].split('').map((c) => <span key={c} className={`adm-matrix__chip is-${c}`} title={WORD[c]}>{c}</span>)}</span> : <span className="adm-muted">–</span>}
          </td>)}
        </tr>)}</tbody>
      </table></div>
      <p className="adm-muted" style={{ marginTop: 10 }}>C buat · R lihat · U ubah · D hapus · A setujui · E ekspor. Hak akses dijaga juga oleh database.</p>
    </Card>
    <Card title={rowModule ? rowModule.label : `Peran ${focusRole.label}`} className="c8" delay={200}>
      {rowModule ? <>
        <p className="adm-muted">{rowModule.hint}</p>
        <ul className="adm-rights">{ROLES.map((r) => <li key={r.id} className={r.id === focus ? 'is-focus' : ''}><b>{r.label}</b><span>{rightsText(ACCESS[rowModule.id][r.id])}</span></li>)}</ul>
        <Btn onClick={() => setRow(null)}>Ringkasan peran</Btn>
      </> : <>
        <p className="adm-muted">Modul yang bisa dibuka {focusRole.label}:</p>
        <ul className="adm-rights">{MODULES.filter((m) => ACCESS[m.id][focus]).map((m) => <li key={m.id}><b>{m.label}</b><span>{rightsText(ACCESS[m.id][focus])}</span></li>)}</ul>
      </>}
    </Card>
    <Card title="Log aktivitas" className="c24" delay={260}>
      {log.length === 0 ? <Empty>Belum ada aktivitas.</Empty> : <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr><th scope="col">Waktu</th><th scope="col">Pengguna</th><th scope="col">Aktivitas</th></tr></thead>
        <tbody>{log.slice(0, 40).map((l) => <tr key={l.id}><td>{formatDateTime(l.at)}</td><td>{l.who} <span className="adm-muted">({l.role})</span></td><td>{l.action} <b>{l.target}</b></td></tr>)}</tbody>
      </table></div>}
    </Card>
  </div>;
}

// ---------------------------------------------------------------- Site settings: form + Google preview
export function SiteModule({ data, rights, toast }) {
  const { cms, update } = data;
  const [draft, setDraft] = useState(cms.site);
  const title = draft.seoTitle || '';
  const desc = draft.seoDescription || '';
  const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  return <div className="adm-grid">
    <FormCard title="Pengaturan situs" className="c13" delay={80} value={cms.site} rights={rights} onDraft={setDraft}
      onSave={(d) => { update('site', { ...cms.site, ...d }, 'mengubah', 'pengaturan situs'); toast('Pengaturan situs disimpan.'); }}
      fields={[
        { key: 'tagline', label: 'Tagline' },
        { key: 'seoTitle', label: 'Judul di Google', hint: `${title.length}/60 karakter. Tampil sebagai judul tab dan hasil pencarian beranda.` },
        { key: 'seoDescription', label: 'Deskripsi di Google', type: 'textarea', rows: 3, hint: `${desc.length}/160 karakter.` },
      ]} />
    <Card title="Pratinjau di Google" className="c11" delay={140}>
      <div className="adm-serp">
        <span className="adm-serp__site"><img src="/assets/favicon.png" alt="" /><span><b>Nordeo Scholar</b><small>https://nordeoscholar.com</small></span></span>
        <span className="adm-serp__title">{cut(title, 60) || 'Judul halaman'}</span>
        <span className="adm-serp__desc">{cut(desc, 160) || 'Deskripsi halaman'}</span>
      </div>
      <p className="adm-muted" style={{ marginTop: 12 }}>{title.length > 60 || desc.length > 160 ? 'Teks terlalu panjang akan dipotong Google.' : 'Panjang judul dan deskripsi sudah pas.'}</p>
    </Card>
  </div>;
}

export function NoAccess({ module, role }) {
  return <Card title={module.label} className="c24"><Empty>Peran {ROLES.find((r) => r.id === role).label} tidak punya akses ke modul ini.</Empty></Card>;
}

export const MODULE_VIEWS = {
  pages: PagesModule, ecosystems: EcosystemsModule, news: NewsModule, stories: StoriesModule, comments: CommentsModule,
  academy: AcademyModule, registrations: RegistrationsModule, promo: PromoModule, subscribers: SubscribersModule,
  profile: ProfileModule, partnership: PartnershipModule, contact: ContactModule, navigation: NavigationModule,
  media: MediaModule, users: UsersModule, site: SiteModule,
};

export function useRights(moduleId, role) {
  return useMemo(() => Object.fromEntries('CRUDAE'.split('').map((c) => [c, can(moduleId, role, c)])), [moduleId, role]);
}
