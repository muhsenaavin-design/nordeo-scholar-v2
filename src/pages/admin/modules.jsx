import { useMemo, useState } from 'react';
import { newsCategories } from '../../data/news';
import { downloadFile, formatDate, formatDateTime, makeId, readImage, slugify } from '../../lib/store';
import { ACCESS, MODULES, NEWS_STATUS, ROLES, can, daysSince, toCsv } from './admin-store';
import { Btn, Card, Editor, Empty, Field, Icon, IconBtn, Pill } from './ui';

const WORD = { C: 'Buat', R: 'Lihat', U: 'Ubah', D: 'Hapus', A: 'Setujui', E: 'Ekspor' };
const rightsText = (s) => (s ? s.split('').map((c) => WORD[c]).join(', ') : 'Tidak ada akses');

// ---------------------------------------------------------------- shared list of records
function RecordList({ title, items, columns, fields, blank, onChange, rights, label, delay = 0, rowActions, className = 'c24' }) {
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const save = (rec) => {
    const exists = items.some((x) => x.id === rec.id);
    onChange(exists ? items.map((x) => (x.id === rec.id ? rec : x)) : [...items, rec], exists ? 'mengubah' : 'menambah', rec.title || rec.label || rec.name);
    setEditing(null);
  };
  return <Card title={title} delay={delay} className={className}
    action={rights.C && <Btn kind="primary" icon="plus" onClick={() => setEditing({ ...blank, id: makeId(label) })}>Tambah {label}</Btn>}>
    {items.length === 0 ? <Empty>Belum ada {label}.</Empty> : <div className="adm-table-wrap"><table className="adm-table">
      <thead><tr>{columns.map(([, head]) => <th key={head} scope="col">{head}</th>)}<th scope="col"><span className="adm-sr">Aksi</span></th></tr></thead>
      <tbody>{items.map((it, i) => <tr key={it.id}>
        {columns.map(([render, head]) => <td key={head}>{render(it, i)}</td>)}
        <td className="adm-actions">
          {rowActions?.(it, i)}
          {rights.U && <IconBtn icon="edit" label={`Ubah ${it.title || it.label || it.name}`} onClick={() => setEditing(it)} />}
          {!rights.U && rights.R && <IconBtn icon="eye" label={`Lihat ${it.title || it.label || it.name}`} onClick={() => setEditing({ ...it, readOnly: true })} />}
          {rights.D && (confirm === it.id
            ? <span className="adm-confirm">Hapus? <Btn kind="danger" onClick={() => { onChange(items.filter((x) => x.id !== it.id), 'menghapus', it.title || it.label || it.name); setConfirm(null); }}>Ya</Btn><Btn onClick={() => setConfirm(null)}>Batal</Btn></span>
            : <IconBtn icon="trash" label={`Hapus ${it.title || it.label || it.name}`} onClick={() => setConfirm(it.id)} />)}
        </td>
      </tr>)}</tbody>
    </table></div>}
    {editing && <Editor title={editing.readOnly ? title : `${items.some((x) => x.id === editing.id) ? 'Ubah' : 'Tambah'} ${label}`} fields={fields} value={editing} readOnly={editing.readOnly} onClose={() => setEditing(null)} onSave={save} />}
  </Card>;
}

// A form over a few fields of a record. Only the listed fields are edited and saved, so other keys
// (review dates, section order) changed elsewhere are never overwritten by a stale draft.
function FormCard({ title, fields, value, onSave, rights, delay, extra, className = 'c24', note }) {
  const pick = (v) => Object.fromEntries(fields.map((f) => [f.key, v[f.key] ?? '']));
  const source = pick(value);
  const [draft, setDraft] = useState(source);
  const dirty = JSON.stringify(draft) !== JSON.stringify(source);
  return <Card title={title} delay={delay} className={className} action={extra}>
    <div className="adm-form">
      {fields.map((f) => <Field key={f.key} field={f} value={draft[f.key]} disabled={!rights.U} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />)}
    </div>
    {rights.U && <div className="adm-form__foot">{note && <small className="adm-muted">{note}</small>}<Btn disabled={!dirty} onClick={() => setDraft(source)}>Batalkan</Btn><Btn kind="primary" icon="check" disabled={!dirty} onClick={() => {
      const missing = fields.find((f) => f.required && !String(draft[f.key] ?? '').trim());
      if (missing) return;
      onSave(draft);
    }}>Simpan perubahan</Btn></div>}
  </Card>;
}

const lines = (text) => String(text || '').split('\n').map((s) => s.trim()).filter(Boolean);
const reviewTone = (date) => (daysSince(date) > 90 ? 'red' : 'green');
const reviewText = (date) => (date ? `Ditinjau ${formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Belum ditinjau');

// ---------------------------------------------------------------- 1. Dashboard
export function Overview({ data, role, go, t, a, journalCard, toast }) {
  const { news, submissions, registrations, cms } = data;
  const published = news.filter((n) => n.status === 'published');
  const review = news.filter((n) => n.status === 'review');
  const fresh = submissions.filter((s) => (s.status || 'baru') === 'baru');
  const stale = [...cms.ecosystems.map((e) => ({ name: e.title, date: e.reviewedAt, to: 'ecosystems' })), { name: 'Konten beranda', date: cms.pages.reviewedAt, to: 'pages' }, { name: 'Profil perusahaan', date: cms.profile.reviewedAt, to: 'profile' }]
    .filter((x) => daysSince(x.date) > 90);
  const tasks = [
    ...(role !== 'marketing' ? review.map((n) => ({ key: n.id, title: n.title, meta: `NordeoNews · ${n.category}`, pill: ['gold', 'In review'], action: role === 'owner' ? 'Tinjau' : 'Buka', to: 'news' })) : []),
    ...fresh.slice(0, 3).map((s) => ({ key: s.id, title: s.title || '(tanpa judul)', meta: `Kiriman cerita · ${s.name || 'pengirim'}`, pill: ['teal', 'Baru'], action: 'Buka', to: 'inbox' })),
    ...stale.map((s) => ({ key: s.name, title: s.name, meta: 'Belum ditinjau lebih dari 90 hari', pill: ['red', 'Perlu cek'], action: 'Cek', to: s.to })),
  ].filter((x) => can(x.to, role, 'R'));
  const accent = {
    owner: { title: ['Tinjau', 'Konten'], value: review.length, unit: ['menunggu', 'persetujuan'], cta: 'Buka antrean', to: 'news' },
    admin: { title: ['Tulis', 'Artikel'], value: published.length, unit: ['artikel', 'terbit'], cta: 'Buat baru', to: 'news' },
    marketing: { title: ['Data', 'Peminat'], value: registrations.length + submissions.length, unit: ['masukan', 'tersimpan'], cta: 'Buka pesan', to: 'inbox' },
  }[role];
  const recent = (cms.log || []).slice(0, 6);
  return <div className="adm-grid">
    <Card title="Empat ekosistem" className="c10" delay={140}
      action={can('ecosystems', role, 'R') && <IconBtn icon="arrow" label="Kelola ekosistem" onClick={() => go('ecosystems')} />}>
      <div className="adm-eco">
        {cms.ecosystems.filter((e) => e.status !== 'hidden').map((e, i) => <a key={e.id} className="adm-eco__item adm-pop" style={{ animationDelay: `${300 + i * 70}ms` }} href={e.link} target={e.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <span className="adm-eco__top"><b>{e.short || e.title}</b><Pill tone={e.status === 'live' ? 'green' : 'gold'}>{e.status === 'live' ? 'Aktif' : 'Segera'}</Pill></span>
          <span className="adm-muted">{e.platform}</span>
          <span className="adm-eco__link">Buka platform <Icon name="arrow" size={13} width={2} /></span>
        </a>)}
      </div>
    </Card>
    <section className="adm-card adm-rise c5 adm-accent" style={{ animationDelay: '200ms', background: a.color, color: a.ink }}>
      <div className="adm-card__head"><h2 style={{ fontSize: 26, lineHeight: '30px', fontWeight: 400 }}>{accent.title[0]}<br />{accent.title[1]}</h2></div>
      <button type="button" className="adm-b adm-b--light adm-btn" onClick={() => go(accent.to)}><Icon name="plus" size={16} width={1.8} />{accent.cta}</button>
      <div className="adm-accent__num"><span>{accent.value}</span><small>{accent.unit[0]}<br />{accent.unit[1]}</small></div>
    </section>
    <Card title="Perlu tindakan" className="c9" delay={260} action={<Pill tone={tasks.length ? 'gold' : 'green'}>{tasks.length} item</Pill>}>
      {tasks.length === 0 ? <Empty>Semua beres. Tidak ada yang menunggu Anda.</Empty> : <ul className="adm-tasks">
        {tasks.slice(0, 5).map((x) => <li key={x.key}><div><b>{x.title}</b><span className="adm-muted">{x.meta}</span></div><Pill tone={x.pill[0]}>{x.pill[1]}</Pill><Btn onClick={() => go(x.to)}>{x.action}</Btn></li>)}
      </ul>}
    </Card>
    {journalCard}
    <Card title="Aktivitas terbaru" className="c14" delay={440} action={can('users', role, 'R') && <IconBtn icon="arrow" label="Lihat log aktivitas" onClick={() => go('users')} />}>
      {recent.length === 0 ? <Empty>Belum ada perubahan dari dashboard ini.</Empty> : <ul className="adm-log">
        {recent.map((l) => <li key={l.id}><span className="adm-log__who">{l.who}</span> {l.action} <b>{l.target}</b><span className="adm-muted"> · {formatDateTime(l.at)}</span></li>)}
      </ul>}
      <div className="adm-access"><span className="adm-muted">Hak akses {ROLES.find((r) => r.id === role).label}:</span>{MODULES.filter((m) => ACCESS[m.id][role]).map((m) => <span key={m.id} className="adm-access__chip" title={rightsText(ACCESS[m.id][role])}>{m.label}</span>)}</div>
    </Card>
  </div>;
}

// ---------------------------------------------------------------- 2. Halaman (homepage & pages)
export function PagesModule({ data, rights, toast }) {
  const { cms, update } = data;
  const p = cms.pages;
  const save = (draft) => { update('pages', { ...p, ...draft, updatedAt: data.today() }, 'mengubah', 'konten beranda'); toast('Konten beranda disimpan.'); };
  const sections = p.sections;
  const setSections = (next, action, target) => update('pages', { ...p, sections: next, updatedAt: data.today() }, action, target);
  const move = (i, d) => { const next = [...sections]; [next[i], next[i + d]] = [next[i + d], next[i]]; setSections(next, 'mengurutkan section', sections[i].label); };
  return <div className="adm-grid">
    <FormCard title="Konten beranda" className="c14" delay={80} value={p} rights={rights} onSave={save}
      extra={<Pill tone={reviewTone(p.reviewedAt)}>{reviewText(p.reviewedAt)}</Pill>}
      fields={[
        { key: 'heroLine1', label: 'Judul hero, baris 1', required: true },
        { key: 'heroLine2', label: 'Judul hero, baris 2 (tampil kuning #FFD218)' },
        { key: 'heroCta', label: 'Tombol hero', hint: 'Hanya satu tombol: “Discover the ecosystem” (FB-02).' },
        { key: 'vision', label: 'Our Vision', type: 'textarea', rows: 3 },
        { key: 'about', label: 'Halaman About', type: 'textarea', rows: 4 },
      ]} />
    <Card title="Pratinjau hero" className="c10" delay={140}>
      <div className="adm-hero-preview">
        <img src="/assets/hero.webp" alt="" />
        <div><p className="l1">{p.heroLine1}</p><p className="l2">{p.heroLine2}</p><span className="adm-hero-preview__cta">{p.heroCta}</span></div>
      </div>
      <p className="adm-muted" style={{ marginTop: 12 }}>Our Vision: {p.vision}</p>
      {rights.U && <Btn icon="check" onClick={() => { update('pages', { ...p, reviewedAt: data.today() }, 'menandai sudah ditinjau', 'konten beranda'); toast('Ditandai sudah ditinjau.'); }}>Tandai sudah ditinjau</Btn>}
    </Card>
    <Card title="Susunan section beranda" className="c24" delay={200}>
      <ol className="adm-sections">{sections.map((s, i) => <li key={s.id} className={s.visible ? '' : 'is-off'}>
        <span className="adm-sections__n">{i + 1}</span><b>{s.label}</b>{!s.visible && <Pill tone="muted">Disembunyikan</Pill>}
        {rights.U && <span className="adm-actions">
          <IconBtn icon="up" label={`Naikkan ${s.label}`} disabled={i === 0} onClick={() => move(i, -1)} />
          <IconBtn icon="down" label={`Turunkan ${s.label}`} disabled={i === sections.length - 1} onClick={() => move(i, 1)} />
          <IconBtn icon={s.visible ? 'eye' : 'eyeOff'} label={s.visible ? `Sembunyikan ${s.label}` : `Tampilkan ${s.label}`} onClick={() => setSections(sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)), s.visible ? 'menyembunyikan section' : 'menampilkan section', s.label)} />
        </span>}
      </li>)}</ol>
    </Card>
  </div>;
}

// ---------------------------------------------------------------- 3. Ekosistem
export function EcosystemsModule({ data, rights, toast }) {
  const { cms, update } = data;
  const tone = { live: ['green', 'Aktif'], soon: ['gold', 'Segera'], hidden: ['muted', 'Disembunyikan'] };
  return <div className="adm-grid">
    <RecordList title="Ekosistem Nordeo" label="ekosistem" delay={80} rights={rights} items={cms.ecosystems}
      onChange={(next, action, target) => { update('ecosystems', next.map((e) => ({ ...e, updatedAt: e.updatedAt || data.today() })), action, target); toast('Ekosistem disimpan.'); }}
      blank={{ title: '', short: '', description: '', platform: '', link: 'https://', cta: 'Buka', status: 'soon', updatedAt: data.today(), reviewedAt: '' }}
      columns={[
        [(e) => <><b>{e.title}</b><div className="adm-muted">{e.description}</div></>, 'Ekosistem'],
        [(e) => e.platform || '—', 'Platform'],
        [(e) => <a href={e.link} target="_blank" rel="noreferrer">{e.cta || 'Buka'}</a>, 'Tujuan'],
        [(e) => <Pill tone={tone[e.status]?.[0]}>{tone[e.status]?.[1]}</Pill>, 'Status'],
        [(e) => <Pill tone={reviewTone(e.reviewedAt)}>{reviewText(e.reviewedAt)}</Pill>, 'Akurasi'],
      ]}
      rowActions={(e) => rights.U && <IconBtn icon="check" label={`Tandai ${e.title} sudah ditinjau`} onClick={() => { update('ecosystems', cms.ecosystems.map((x) => (x.id === e.id ? { ...x, reviewedAt: data.today() } : x)), 'menandai sudah ditinjau', e.title); toast('Ditandai sudah ditinjau.'); }} />}
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

// ---------------------------------------------------------------- 4. NordeoNews
export function NewsModule({ data, role, rights, toast }) {
  const { news, commitNews } = data;
  const [cat, setCat] = useState('Semua');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const list = news.filter((n) => (cat === 'Semua' || n.category === cat) && (status === 'all' || n.status === status))
    .sort((x, y) => String(y.date).localeCompare(String(x.date)));
  const setOne = (id, patch, action) => { const n = news.find((x) => x.id === id); commitNews(news.map((x) => (x.id === id ? { ...x, ...patch } : x)), action, n.title); };
  const save = (d) => {
    const body = lines(d.bodyText).map((text) => ({ type: 'p', text }));
    const rec = { ...d, slug: d.slug || slugify(d.title), titleEn: d.titleEn || d.title, body: body.length ? body : d.body || [], readTime: d.readTime || `${Math.max(1, Math.round(String(d.bodyText || '').split(/\s+/).length / 200))} menit` };
    delete rec.bodyText;
    const exists = news.some((x) => x.id === rec.id);
    commitNews(exists ? news.map((x) => (x.id === rec.id ? rec : x)) : [rec, ...news], exists ? 'mengubah artikel' : 'membuat draft artikel', rec.title);
    setEditing(null); toast(exists ? 'Artikel disimpan.' : 'Draft artikel dibuat.');
  };
  const counts = Object.fromEntries(Object.keys(NEWS_STATUS).map((k) => [k, news.filter((n) => n.status === k).length]));
  return <div className="adm-grid">
    <Card title="NordeoNews" className="c24" delay={80}
      action={rights.C && <Btn kind="primary" icon="plus" onClick={() => setEditing({ id: makeId('news'), title: '', category: newsCategories[0], dek: '', author: 'Redaksi Nordeo', date: data.today(), cover: '', featured: false, status: 'draft', bodyText: '' })}>Tulis artikel</Btn>}>
      <div className="adm-filters">
        <div role="group" aria-label="Status" className="adm-seg-text">
          {[['all', `Semua (${news.length})`], ...Object.entries(NEWS_STATUS).map(([k, v]) => [k, `${v.label} (${counts[k]})`])].map(([k, l]) => <button key={k} type="button" className="adm-btn" aria-pressed={status === k} onClick={() => setStatus(k)}>{l}</button>)}
        </div>
        <div role="group" aria-label="Kategori" className="adm-chips">
          {['Semua', ...newsCategories].map((c) => <button key={c} type="button" className="adm-btn" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>
      {list.length === 0 ? <Empty>Tidak ada artikel untuk filter ini.</Empty> : <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr><th scope="col">Judul</th><th scope="col">Kategori</th><th scope="col">Tanggal</th><th scope="col">Status</th><th scope="col"><span className="adm-sr">Aksi</span></th></tr></thead>
        <tbody>{list.map((n) => <tr key={n.id}>
          <td><b>{n.featured && <span title="Featured story" className="adm-star"><Icon name="star" size={13} width={2} /></span>}{n.title}</b><div className="adm-muted">{n.author}{n.reviewNote ? ` · Catatan Owner: ${n.reviewNote}` : ''}</div></td>
          <td>{n.category}</td>
          <td>{formatDate(n.date, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
          <td><Pill tone={NEWS_STATUS[n.status]?.tone}>{NEWS_STATUS[n.status]?.label}</Pill></td>
          <td className="adm-actions">
            {role === 'owner' && n.status === 'review' && <>
              <Btn kind="primary" icon="check" onClick={() => { setOne(n.id, { status: 'published', reviewNote: '' }, 'menyetujui dan menerbitkan'); toast('Artikel terbit di NordeoNews.'); }}>Setujui</Btn>
              <Btn icon="undo" onClick={() => setRejecting(n)}>Tolak</Btn></>}
            {role === 'admin' && n.status === 'draft' && <Btn icon="arrow" onClick={() => { setOne(n.id, { status: 'review' }, 'mengirim ke review'); toast('Dikirim ke Owner untuk ditinjau.'); }}>Kirim ke review</Btn>}
            {role === 'admin' && n.status === 'published' && <Btn onClick={() => { setOne(n.id, { status: 'archived' }, 'mengarsipkan'); toast('Artikel diarsipkan dan turun dari website.'); }}>Arsipkan</Btn>}
            {role === 'admin' && n.status === 'archived' && <Btn icon="undo" onClick={() => setOne(n.id, { status: 'draft' }, 'mengembalikan ke draft')}>Jadikan draft</Btn>}
            {rights.U && <IconBtn icon="star" label={n.featured ? 'Lepas featured' : 'Jadikan featured'} onClick={() => commitNews(news.map((x) => ({ ...x, featured: x.id === n.id ? !n.featured : (n.featured ? x.featured : false) })), n.featured ? 'melepas featured' : 'menjadikan featured', n.title)} />}
            {rights.U && <IconBtn icon="edit" label={`Ubah ${n.title}`} onClick={() => setEditing({ ...n, bodyText: (n.body || []).filter((b) => b.text).map((b) => b.text).join('\n') })} />}
            {n.status === 'published' && <a className="adm-circle is-sm adm-btn" href={`/news/${n.slug}`} target="_blank" rel="noreferrer" aria-label={`Lihat ${n.title} di website`} title="Lihat di website"><Icon name="eye" size={15} width={1.8} /></a>}
            {rights.D && n.status === 'draft' && <IconBtn icon="trash" label={`Hapus ${n.title}`} onClick={() => { commitNews(news.filter((x) => x.id !== n.id), 'menghapus draft', n.title); toast('Draft dihapus.'); }} />}
          </td>
        </tr>)}</tbody>
      </table></div>}
      <p className="adm-muted" style={{ marginTop: 12 }}>Alur: Draft → In review → Published → Archived. Hanya Owner yang bisa menerbitkan.</p>
    </Card>
    {editing && <Editor title={news.some((x) => x.id === editing.id) ? 'Ubah artikel' : 'Tulis artikel'} value={editing} onClose={() => setEditing(null)} onSave={save} saveLabel="Simpan sebagai draft"
      fields={[
        { key: 'title', label: 'Judul', required: true },
        { key: 'category', label: 'Kategori', type: 'select', options: newsCategories },
        { key: 'dek', label: 'Ringkasan (dek)', type: 'textarea', rows: 3 },
        { key: 'author', label: 'Penulis' },
        { key: 'date', label: 'Tanggal terbit', type: 'date' },
        { key: 'cover', label: 'Gambar sampul (URL)', hint: 'Pilih dari menu Media, salin alamatnya.' },
        { key: 'bodyText', label: 'Isi artikel', type: 'textarea', rows: 8, hint: 'Satu paragraf per baris.' },
        { key: 'featured', label: 'Jadikan featured story', type: 'toggle' },
      ]} />}
    {rejecting && <Editor title="Tolak artikel" value={{ note: '' }} saveLabel="Kembalikan ke Admin" onClose={() => setRejecting(null)}
      onSave={(d) => { setOne(rejecting.id, { status: 'draft', reviewNote: d.note }, 'menolak'); setRejecting(null); toast('Dikembalikan ke Admin dengan catatan.'); }}
      fields={[{ key: 'note', label: `Catatan untuk “${rejecting.title}”`, type: 'textarea', required: true }]} />}
  </div>;
}

// ---------------------------------------------------------------- 5. Academy
export function AcademyModule({ data, rights, toast }) {
  const { cms, update, registrations } = data;
  const countFor = (id) => registrations.filter((r) => r.program === id).length;
  return <div className="adm-grid">
    <RecordList title="Program Academy" label="program" delay={80} rights={rights} items={cms.programs}
      onChange={(next, action, target) => { update('programs', next, action, target); toast('Program disimpan.'); }}
      blank={{ title: '', type: 'Seminar', dateLabel: 'Tanggal menyusul', mode: 'Online', facilitator: '', link: '/training/', status: 'draft' }}
      columns={[
        [(p) => <><b>{p.title}</b><div className="adm-muted">{p.facilitator}</div></>, 'Program'],
        [(p) => p.type, 'Jenis'],
        [(p) => `${p.dateLabel} · ${p.mode}`, 'Jadwal'],
        [(p) => <Pill tone={countFor(p.id) ? 'teal' : 'neutral'}>{countFor(p.id)} peminat</Pill>, 'Pendaftar'],
        [(p) => <Pill tone={p.status === 'published' ? 'green' : 'neutral'}>{p.status === 'published' ? 'Tampil' : 'Draft'}</Pill>, 'Status'],
      ]}
      fields={[
        { key: 'title', label: 'Nama program', required: true },
        { key: 'type', label: 'Jenis', type: 'select', options: ['Seminar', 'Konferensi', 'Modul Pelatihan'] },
        { key: 'dateLabel', label: 'Tanggal' },
        { key: 'mode', label: 'Mode', type: 'select', options: ['Online', 'On-site', 'Hybrid'] },
        { key: 'facilitator', label: 'Fasilitator' },
        { key: 'link', label: 'Link pendaftaran' },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'published', label: 'Tampil' }, { value: 'draft', label: 'Draft' }] },
      ]} />
  </div>;
}

// ---------------------------------------------------------------- 6. Pesan (subscribers & messages)
export function InboxModule({ data, role, rights, toast, go }) {
  const { submissions, commitSubmissions, registrations, news, commitNews, cms } = data;
  const [tab, setTab] = useState('stories');
  const programTitle = (id) => cms.programs.find((p) => p.id === id)?.title || id;
  const canExport = rights.E;
  const exportCsv = (rows, columns, name) => { downloadFile(`${name}-${data.today()}.csv`, toCsv(rows, columns), 'text/csv'); data.log('mengekspor', name); toast('File CSV diunduh.'); };
  const storyCols = [['reference', 'Referensi'], ['title', 'Judul'], ['category', 'Kategori'], ['name', 'Pengirim'], ['email', 'Email'], ['institution', 'Institusi'], ['submittedAt', 'Dikirim'], ['status', 'Status']];
  const regCols = [['reference', 'Referensi'], ['name', 'Nama'], ['email', 'Email'], ['institution', 'Institusi'], ['role', 'Peran'], ['program', 'Program'], ['submittedAt', 'Dikirim']];
  const toDraft = (s) => {
    const rec = { id: makeId('news'), title: s.title || 'Kiriman tanpa judul', category: s.category || newsCategories[0], dek: s.lead || '', author: s.name || 'Kontributor', date: data.today(), cover: s.image?.dataUrl || '', featured: false, status: 'draft', slug: slugify(s.title || 'kiriman'), titleEn: s.title || '', body: lines(s.body).map((text) => ({ type: 'p', text })), readTime: '4 menit' };
    commitNews([rec, ...news], 'membuat draft dari kiriman', rec.title);
    commitSubmissions(submissions.map((x) => (x.id === s.id ? { ...x, status: 'diproses' } : x)));
    toast('Kiriman dijadikan draft di NordeoNews.'); go('news');
  };
  return <div className="adm-grid">
    <Card title="Pesan & data peminat" className="c24" delay={80}
      action={canExport && <Btn icon="export" onClick={() => (tab === 'stories' ? exportCsv(submissions, storyCols, 'kiriman-nordeonews') : exportCsv(registrations.map((r) => ({ ...r, program: programTitle(r.program) })), regCols, 'peminat-academy'))} disabled={tab === 'subs'}>Ekspor CSV</Btn>}>
      <div role="tablist" aria-label="Jenis pesan" className="adm-seg-text">
        {[['stories', `Kiriman cerita (${submissions.length})`], ['academy', `Peminat Academy (${registrations.length})`], ['subs', 'Subscriber']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className="adm-btn" onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === 'stories' && (submissions.length === 0 ? <Empty>Belum ada kiriman dari form “Submit a story” NordeoNews.</Empty> : <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr><th scope="col">Kiriman</th><th scope="col">Pengirim</th><th scope="col">Dikirim</th><th scope="col">Status</th><th scope="col"><span className="adm-sr">Aksi</span></th></tr></thead>
        <tbody>{submissions.map((s) => <tr key={s.id}>
          <td><b>{s.title || '(tanpa judul)'}</b><div className="adm-muted">{s.reference} · {s.category}</div></td>
          <td>{s.name}<div className="adm-muted">{s.email}</div></td>
          <td>{formatDateTime(s.submittedAt)}</td>
          <td><select aria-label={`Status ${s.title}`} value={s.status || 'baru'} disabled={role !== 'admin'} onChange={(e) => commitSubmissions(submissions.map((x) => (x.id === s.id ? { ...x, status: e.target.value } : x)))}>{['baru', 'diproses', 'diterima', 'ditolak'].map((o) => <option key={o}>{o}</option>)}</select></td>
          <td className="adm-actions">{role === 'admin' && <Btn icon="news" onClick={() => toDraft(s)}>Jadikan draft</Btn>}</td>
        </tr>)}</tbody>
      </table></div>)}
      {tab === 'academy' && (registrations.length === 0 ? <Empty>Belum ada pendaftar dari form minat Academy.</Empty> : <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr>{regCols.slice(1).map(([, h]) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{registrations.map((r) => <tr key={r.id}>{regCols.slice(1).map(([k]) => <td key={k}>{k === 'submittedAt' ? formatDateTime(r[k]) : k === 'program' ? (programTitle(r[k]) || '—') : r[k]}</td>)}</tr>)}</tbody>
      </table></div>)}
      {tab === 'subs' && <Empty>Form newsletter belum terhubung ke server, jadi belum ada daftar subscriber yang tersimpan.</Empty>}
    </Card>
  </div>;
}

// ---------------------------------------------------------------- 7. Profil perusahaan
export function ProfileModule({ data, rights, toast }) {
  const { cms, update } = data;
  const p = cms.profile;
  const value = { vision: p.vision, mission: p.mission.join('\n'), values: p.values.join('\n'), services: p.services.join('\n') };
  return <div className="adm-grid">
    <FormCard title="Identitas perusahaan" className="c24" delay={80} value={value} rights={rights}
      extra={<span className="adm-actions"><Pill tone={reviewTone(p.reviewedAt)}>{reviewText(p.reviewedAt)}</Pill>{rights.U && <Btn icon="check" onClick={() => { update('profile', { ...p, reviewedAt: data.today() }, 'menandai sudah ditinjau', 'profil perusahaan'); toast('Ditandai sudah ditinjau.'); }}>Tandai ditinjau</Btn>}</span>}
      onSave={(d) => { update('profile', { ...p, vision: d.vision, mission: lines(d.mission), values: lines(d.values), services: lines(d.services), updatedAt: data.today() }, 'mengubah', 'profil perusahaan'); toast('Profil perusahaan disimpan.'); }}
      fields={[
        { key: 'vision', label: 'Visi', type: 'textarea', rows: 3 },
        { key: 'mission', label: 'Misi (satu per baris)', type: 'textarea', rows: 4 },
        { key: 'values', label: 'Nilai (satu per baris)', type: 'textarea', rows: 4 },
        { key: 'services', label: 'Layanan (satu per baris)', type: 'textarea', rows: 4 },
      ]} />
  </div>;
}

// ---------------------------------------------------------------- 8. Kemitraan & layanan
export function PartnershipModule({ data, rights, toast }) {
  const { cms, update } = data;
  return <div className="adm-grid">
    <RecordList title="Peluang kemitraan & layanan" label="peluang" delay={80} rights={rights} items={cms.partnerships}
      onChange={(next, action, target) => { update('partnerships', next, action, target); toast('Peluang kemitraan disimpan.'); }}
      blank={{ title: '', audience: '', status: 'open', contact: '' }}
      columns={[[(p) => <b>{p.title}</b>, 'Peluang'], [(p) => p.audience, 'Untuk'], [(p) => p.contact, 'Kontak'], [(p) => <Pill tone={p.status === 'open' ? 'green' : 'muted'}>{p.status === 'open' ? 'Dibuka' : 'Ditutup'}</Pill>, 'Status']]}
      fields={[
        { key: 'title', label: 'Judul peluang', required: true },
        { key: 'audience', label: 'Sasaran mitra' },
        { key: 'contact', label: 'Email kontak', type: 'email' },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Dibuka' }, { value: 'closed', label: 'Ditutup' }] },
      ]} />
  </div>;
}

// ---------------------------------------------------------------- 9. Kontak & lokasi
export function ContactModule({ data, rights, toast }) {
  const { cms, update } = data;
  return <div className="adm-grid">
    <FormCard title="Kontak & lokasi" className="c14" delay={80} value={cms.contact} rights={rights}
      note="Satu sumber untuk footer dan halaman Contact."
      onSave={(d) => { update('contact', { ...d, updatedAt: data.today() }, 'mengubah', 'kontak & lokasi'); toast('Kontak disimpan.'); }}
      fields={[
        { key: 'address', label: 'Alamat', type: 'textarea', rows: 2, required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'whatsapp', label: 'WhatsApp (link)', type: 'url' },
        { key: 'instagram', label: 'Instagram (link)', type: 'url' },
        { key: 'mapLink', label: 'Link Google Maps', type: 'url' },
      ]} />
    <Card title="Pratinjau" className="c10" delay={140}>
      <div className="adm-contact">
        <p><Icon name="pin" /> {cms.contact.address}</p>
        <p><Icon name="mail" /> {cms.contact.email}</p>
        <p><a href={cms.contact.mapLink} target="_blank" rel="noreferrer">Buka di Google Maps</a></p>
      </div>
    </Card>
  </div>;
}

// ---------------------------------------------------------------- 10. Navigasi
export function NavigationModule({ data, rights, toast }) {
  const { cms, update } = data;
  const groups = [['header', 'Menu header'], ['footer', 'Menu footer'], ['news', 'Menu NordeoNews']];
  const set = (key, next, action, target) => { update('navigation', { ...cms.navigation, [key]: next }, action, target); toast('Navigasi disimpan.'); };
  return <div className="adm-grid">{groups.map(([key, title], gi) => <RecordList key={key} title={title} label="menu" className="c8" delay={80 + gi * 60} rights={rights}
    items={cms.navigation[key]} onChange={(next, action, target) => set(key, next, action, target)} blank={{ label: '', href: '/' }}
    columns={[[(n) => <><b>{n.label}</b><div className="adm-muted">{n.href}</div></>, 'Item']]}
    rowActions={(n, i) => rights.U && <>
      <IconBtn icon="up" label={`Naikkan ${n.label}`} disabled={i === 0} onClick={() => { const a = [...cms.navigation[key]]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set(key, a, 'mengurutkan menu', n.label); }} />
      <IconBtn icon="down" label={`Turunkan ${n.label}`} disabled={i === cms.navigation[key].length - 1} onClick={() => { const a = [...cms.navigation[key]]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set(key, a, 'mengurutkan menu', n.label); }} /></>}
    fields={[{ key: 'label', label: 'Label', required: true }, { key: 'href', label: 'Link', required: true }]} />)}</div>;
}

// ---------------------------------------------------------------- 11. Media
export function MediaModule({ data, rights, toast }) {
  const { cms, update } = data;
  const [editing, setEditing] = useState(null);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const img = await readImage(file, 1200);
      update('media', [...cms.media, { id: makeId('media'), src: img.dataUrl, name: file.name, alt: '', used: 'Belum dipakai' }], 'mengunggah', file.name);
      toast('Gambar diunggah. Lengkapi alt text-nya.');
    } catch { toast('Gambar tidak dapat dibaca.'); }
  };
  return <div className="adm-grid">
    <Card title="Media" className="c24" delay={80}
      action={rights.C && <label className="adm-b adm-b--primary adm-btn"><Icon name="upload" size={16} width={1.8} />Unggah gambar<input type="file" accept="image/*" className="adm-sr" onChange={upload} /></label>}>
      <ul className="adm-media">{cms.media.map((m) => <li key={m.id}>
        <img src={m.src} alt={m.alt || ''} loading="lazy" />
        <div><b title={m.name}>{m.name}</b><span className="adm-muted">{m.used}</span>{!m.alt && <Pill tone="red">Alt text kosong</Pill>}</div>
        <span className="adm-actions">
          <IconBtn icon="export" label={`Salin alamat ${m.name}`} onClick={() => { navigator.clipboard?.writeText(m.src.startsWith('data:') ? m.name : m.src); toast('Alamat gambar disalin.'); }} />
          {rights.U && <IconBtn icon="edit" label={`Ubah alt text ${m.name}`} onClick={() => setEditing(m)} />}
          {rights.D && m.src.startsWith('data:') && <IconBtn icon="trash" label={`Hapus ${m.name}`} onClick={() => update('media', cms.media.filter((x) => x.id !== m.id), 'menghapus', m.name)} />}
        </span>
      </li>)}</ul>
    </Card>
    {editing && <Editor title="Ubah media" value={editing} onClose={() => setEditing(null)}
      onSave={(d) => { update('media', cms.media.map((x) => (x.id === d.id ? d : x)), 'mengubah alt text', d.name); setEditing(null); toast('Media disimpan.'); }}
      fields={[{ key: 'alt', label: 'Alt text', type: 'textarea', rows: 2, required: true, hint: 'Jelaskan isi gambar untuk pembaca layar.' }, { key: 'used', label: 'Dipakai di' }]} />}
  </div>;
}

// ---------------------------------------------------------------- 12. Pengguna & peran
export function UsersModule({ data, rights, toast }) {
  const { cms, update } = data;
  const log = cms.log || [];
  return <div className="adm-grid">
    <RecordList title="Pengguna dashboard" label="pengguna" className="c12" delay={80} rights={rights} items={cms.users}
      onChange={(next, action, target) => { update('users', next, action, target); toast('Pengguna disimpan.'); }}
      blank={{ name: '', email: '', role: 'admin', active: true }}
      columns={[[(u) => <><b>{u.name}</b><div className="adm-muted">{u.email}</div></>, 'Nama'], [(u) => ROLES.find((r) => r.id === u.role)?.label, 'Peran'], [(u) => <Pill tone={u.active ? 'green' : 'muted'}>{u.active ? 'Aktif' : 'Nonaktif'}</Pill>, 'Status']]}
      fields={[
        { key: 'name', label: 'Nama', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'role', label: 'Peran', type: 'select', options: ROLES.map((r) => ({ value: r.id, label: r.label })) },
        { key: 'active', label: 'Akun aktif', type: 'toggle' },
      ]} />
    <Card title="Matriks hak akses" className="c12" delay={140}>
      <div className="adm-table-wrap"><table className="adm-table is-compact">
        <thead><tr><th scope="col">Modul</th>{ROLES.map((r) => <th key={r.id} scope="col">{r.label}</th>)}</tr></thead>
        <tbody>{MODULES.map((m) => <tr key={m.id}><td>{m.label}</td>{ROLES.map((r) => <td key={r.id} className={ACCESS[m.id][r.id] ? '' : 'adm-muted'}>{ACCESS[m.id][r.id] ? ACCESS[m.id][r.id].split('').join('/') : '–'}</td>)}</tr>)}</tbody>
      </table></div>
      <p className="adm-muted" style={{ marginTop: 10 }}>C buat · R lihat · U ubah · D hapus · A setujui · E ekspor</p>
    </Card>
    <Card title="Log aktivitas" className="c24" delay={200}>
      {log.length === 0 ? <Empty>Belum ada aktivitas.</Empty> : <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr><th scope="col">Waktu</th><th scope="col">Pengguna</th><th scope="col">Aktivitas</th></tr></thead>
        <tbody>{log.slice(0, 40).map((l) => <tr key={l.id}><td>{formatDateTime(l.at)}</td><td>{l.who} <span className="adm-muted">({l.role})</span></td><td>{l.action} <b>{l.target}</b></td></tr>)}</tbody>
      </table></div>}
    </Card>
  </div>;
}

// ---------------------------------------------------------------- 13. Pengaturan situs
export function SiteModule({ data, rights, toast }) {
  const { cms, update } = data;
  return <div className="adm-grid">
    <FormCard title="Pengaturan situs" className="c24" delay={80} value={cms.site} rights={rights}
      onSave={(d) => { update('site', d, 'mengubah', 'pengaturan situs'); toast('Pengaturan situs disimpan.'); }}
      fields={[
        { key: 'tagline', label: 'Tagline' },
        { key: 'accent', label: 'Warna aksen', type: 'select', options: [{ value: '#ffd218', label: 'Kuning Nordeo #FFD218' }, { value: '#1e5566', label: 'Teal Nordeo #1E5566' }, { value: '#c9a227', label: 'Gold Nordeo #C9A227' }] },
        { key: 'seoTitle', label: 'Judul SEO default' },
        { key: 'seoDescription', label: 'Deskripsi SEO default', type: 'textarea', rows: 3 },
      ]} />
  </div>;
}

export function NoAccess({ module, role }) {
  return <Card title={module.label} className="c24"><Empty>Peran {ROLES.find((r) => r.id === role).label} tidak punya akses ke modul ini.</Empty></Card>;
}

export const MODULE_VIEWS = {
  pages: PagesModule, ecosystems: EcosystemsModule, news: NewsModule, academy: AcademyModule, inbox: InboxModule,
  profile: ProfileModule, partnership: PartnershipModule, contact: ContactModule, navigation: NavigationModule,
  media: MediaModule, users: UsersModule, site: SiteModule,
};

export function useRights(moduleId, role) {
  return useMemo(() => Object.fromEntries('CRUDAE'.split('').map((c) => [c, can(moduleId, role, c)])), [moduleId, role]);
}
