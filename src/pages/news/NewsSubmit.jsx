import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { newsCategories, newsTypes } from '../../data/news';
import { contact, newsTemplate } from '../../config/links';
import { aiMode, draftChecks, generateNewsDraft, wordCount } from '../../lib/news-ai';
import { STORE, creditParts, formatDate, humanSize, makeId, makeReference, read, readImage, remove, write } from '../../lib/store';
import { siteBase } from '../../lib/site';
import { Arrow, CheckIcon, DownloadIcon, ImageIcon, useDocumentTitle } from '../../components/parts';
import { Check, ChoiceCards, Field, bind, focusFirstError, isEmail } from '../../components/forms';
import RichTextEditor from '../../components/RichTextEditor';
import { sanitizeHtml, textToHtml } from '../../lib/rich-text';

const STEPS = [
  { id: 'angle', title: 'Jenis & sudut', copy: 'Apa kabarnya, dan mengapa sekarang?' },
  { id: 'content', title: 'Isi berita', copy: 'Naskah, kutipan, dan sumber.' },
  { id: 'media', title: 'Gambar highlight', copy: 'Satu gambar utama beserta kredit.' },
  { id: 'schedule', title: 'Jadwal & kontak', copy: 'Kapan tayang, siapa yang dihubungi.' },
  { id: 'review', title: 'Tinjau & kirim', copy: 'Periksa kelengkapan sebelum dikirim.' },
];

const SLOTS = [['08.00', 'Pagi · 08.00 WIB'], ['12.00', 'Siang · 12.00 WIB'], ['16.00', 'Sore · 16.00 WIB']];
const FOCUS = [['center', 'Tengah'], ['top', 'Atas'], ['bottom', 'Bawah'], ['left', 'Kiri'], ['right', 'Kanan']];
const ROLES = ['Penulis / peneliti', 'Humas institusi', 'Pengelola jurnal', 'Mahasiswa'];
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_DOC = 10 * 1024 * 1024;

const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const daysFromNow = days => { const date = new Date(); date.setDate(date.getDate() + days); return isoDate(date); };

const EMPTY = {
  mode: '', docFile: null,
  type: 'research', category: newsCategories[0], title: '', lead: '', hook: '', keywords: '',
  body: '', bodyHtml: '', writer: '', editor: '', quote: '', quoteSource: '', sourceUrl: '',
  image: null, caption: '', credit: '', alt: '', focus: 'center', imageRights: false,
  publishDate: '', publishSlot: '08.00', embargo: false, embargoAt: '', embargoReason: '',
  name: '', role: ROLES[0], institution: '', email: '', phone: '',
  agreeAccuracy: false, agreeQuote: false, agreeEdit: false,
};

function validate(step, form) {
  const errors = {};
  if (step === 'angle') {
    if (!form.title.trim()) errors.title = 'Tulis judul usulan.';
    else if (form.title.trim().length > 110) errors.title = 'Ringkas judul menjadi maksimal 110 karakter.';
    if (wordCount(form.lead) < 12) errors.lead = 'Lead minimal 12 kata: apa yang terjadi, siapa yang terlibat.';
    if (wordCount(form.hook) < 4) errors.hook = 'Jelaskan singkat mengapa kabar ini relevan sekarang.';
  }
  if (step === 'content') {
    if (wordCount(form.body) < 150) errors.body = `Isi naskah minimal 150 kata (sekarang ${wordCount(form.body)}). Target ideal 400–900 kata.`;
    if (form.type !== 'opinion') {
      if (!form.quote.trim()) errors.quote = 'Sertakan satu kutipan narasumber.';
      if (!form.quoteSource.trim()) errors.quoteSource = 'Tulis nama dan jabatan narasumber.';
    }
    if (!form.writer.trim()) errors.writer = 'Tulis nama penulis yang akan tampil di berita.';
    if (['research', 'journal'].includes(form.type) && !form.sourceUrl.trim()) errors.sourceUrl = 'Untuk rilis riset atau jurnal, sertakan DOI atau tautan artikel.';
    else if (form.sourceUrl.trim() && !/^(https?:\/\/\S+|10\.\d{4,}\/\S+)$/i.test(form.sourceUrl.trim())) errors.sourceUrl = 'Gunakan tautan lengkap (https://…) atau DOI (10.xxxx/…).';
  }
  if (step === 'media') {
    if (!form.image) errors.image = 'Unggah satu gambar highlight.';
    if (!form.caption.trim()) errors.caption = 'Tulis keterangan gambar.';
    if (!form.credit.trim()) errors.credit = 'Tulis kredit gambar, misalnya “Public Relations” atau “Dok. LPPM Universitas X”.';
    if (!form.alt.trim()) errors.alt = 'Deskripsikan isi gambar untuk pembaca layar.';
    if (!form.imageRights) errors.imageRights = 'Konfirmasi bahwa Anda berhak memakai gambar ini.';
  }
  if (step === 'schedule') {
    if (!form.publishDate) errors.publishDate = 'Pilih tanggal tayang yang diusulkan.';
    else if (form.publishDate < daysFromNow(3)) errors.publishDate = `Tanggal tayang paling cepat ${formatDate(daysFromNow(3))}.`;
    if (form.embargo) {
      if (!form.embargoAt) errors.embargoAt = 'Tentukan tanggal dan jam embargo dibuka.';
      if (!form.embargoReason.trim()) errors.embargoReason = 'Sebutkan jurnal atau acara yang menetapkan embargo.';
    }
    if (!form.name.trim()) errors.name = 'Tulis nama lengkap.';
    if (!form.institution.trim()) errors.institution = 'Tulis institusi atau afiliasi.';
    if (!isEmail(form.email)) errors.email = 'Gunakan alamat email yang valid.';
  }
  if (step === 'review') {
    if (!form.agreeAccuracy) errors.agreeAccuracy = 'Wajib disetujui.';
    if (!form.agreeQuote && form.type !== 'opinion') errors.agreeQuote = 'Wajib disetujui.';
    if (!form.agreeEdit) errors.agreeEdit = 'Wajib disetujui.';
  }
  return errors;
}

function validateWord(form) {
  const errors = {};
  if (!form.docFile) errors.docFile = 'Unggah formulir Word yang sudah diisi.';
  if (!form.title.trim()) errors.title = 'Tulis judul usulan.';
  if (!form.writer.trim()) errors.writer = 'Tulis nama penulis yang akan tampil di berita.';
  if (!form.name.trim()) errors.name = 'Tulis nama lengkap.';
  if (!form.institution.trim()) errors.institution = 'Tulis institusi atau afiliasi.';
  if (!isEmail(form.email)) errors.email = 'Gunakan alamat email yang valid.';
  if (!form.agreeAccuracy) errors.agreeAccuracy = 'Wajib disetujui.';
  if (!form.agreeEdit) errors.agreeEdit = 'Wajib disetujui.';
  return errors;
}

function CreditPreview({ form }) {
  const parts = creditParts({ writer: form.writer, editor: form.editor || 'ditetapkan redaksi', photo: form.credit });
  return <p className="credit-preview">{parts.map(([label, value], index) => <span key={label}>{index > 0 && <i aria-hidden="true">|</i>}{label}: <strong>{value}</strong></span>)}</p>;
}

function ModeChooser({ onPick }) {
  return <div className="mode-chooser" role="group" aria-labelledby="mode-heading">
    <h2 id="mode-heading" className="sr-only">Pilih cara mengirim</h2>
    <button type="button" className="mode-card is-primary" onClick={() => onPick('manual')}>
      <span className="mode-badge">Disarankan</span>
      <span className="mode-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      <strong>Isi langsung di sini</strong>
      <span className="mode-copy">Lima langkah, sekitar 15 menit.</span>
      <ul>
        <li>Editor teks seperti Word: tebal, miring, rata kiri-kanan, daftar, tautan</li>
        <li>Asisten draf AI dan pratinjau gambar highlight</li>
        <li>Draf tersimpan otomatis di perangkat ini</li>
      </ul>
      <span className="mode-cta">Mulai isi formulir <Arrow /></span>
    </button>
    <button type="button" className="mode-card" onClick={() => onPick('word')}>
      <span className="mode-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M8.5 12.5l1.2 4.5 1.3-4 1.3 4 1.2-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      <strong>Pakai template Word</strong>
      <span className="mode-copy">Cocok bila naskah sudah disiapkan tim humas.</span>
      <ul>
        <li>Unduh formulir kelengkapan (.docx)</li>
        <li>Isi di komputer Anda, lalu unggah kembali</li>
        <li>Lengkapi kontak dan kredit dalam satu halaman</li>
      </ul>
      <span className="mode-cta">Pakai template <Arrow /></span>
    </button>
  </div>;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('File tidak dapat dibaca. Coba simpan ulang lalu unggah lagi.'));
    reader.readAsDataURL(file);
  });
}

function WordForm({ form, set, field, errors, onSubmit }) {
  const onDoc = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/\.(docx?|DOCX?)$/.test(file.name)) { set({ docFile: null }); onSubmit.setErrors(current => ({ ...current, docFile: 'Gunakan file Word (.docx atau .doc).' })); return; }
    if (file.size > MAX_DOC) { onSubmit.setErrors(current => ({ ...current, docFile: `Ukuran ${humanSize(file.size)} melebihi batas 10 MB.` })); return; }
    try {
      const dataUrl = await readFile(file);
      set({ docFile: { name: file.name, size: file.size, dataUrl } });
      onSubmit.setErrors(({ docFile: _removed, ...rest }) => rest);
    } catch (error) {
      onSubmit.setErrors(current => ({ ...current, docFile: error.message }));
    }
  };
  return <form className="submit-form word-form" noValidate onSubmit={event => { event.preventDefault(); onSubmit.run(); }}>
    <div className="form-step">
      <h2 tabIndex="-1">Kirim dengan template Word</h2>
      {Object.keys(errors).length > 0 && <p className="form-error-summary" role="alert">Ada {Object.keys(errors).length} isian yang perlu dilengkapi.</p>}
      <ol className="word-steps">
        <li>
          <span className="word-step-no">01</span>
          <div><strong>Unduh formulir kelengkapan</strong><p>Berisi kolom judul, lead, isi naskah, kutipan, sumber, dan kredit.</p>
            <a className="button button-outline" href={newsTemplate} download><DownloadIcon /> Unduh template (.docx)</a></div>
        </li>
        <li>
          <span className="word-step-no">02</span>
          <div><strong>Isi dan simpan di komputer Anda</strong><p>Pakai format Word seperti biasa. Simpan sebagai .docx.</p></div>
        </li>
        <li>
          <span className="word-step-no">03</span>
          <div className="word-upload">
            <Field id="docFile" label="Unggah formulir yang sudah diisi" hint="File .docx atau .doc, maksimal 10 MB." error={errors.docFile}>
              <label className={`dropzone ${form.docFile ? 'has-image' : ''}`} htmlFor="docFile" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); onDoc({ target: { files: event.dataTransfer.files } }); }}>
                <DownloadIcon />
                <span>{form.docFile ? <><strong>{form.docFile.name}</strong> · {humanSize(form.docFile.size)}</> : <><strong>Pilih file</strong> atau seret ke sini</>}</span>
                <small>{form.docFile ? 'Klik untuk mengganti' : 'Gambar highlight dapat Anda lampirkan lewat email setelah ini'}</small>
              </label>
              <input id="docFile" name="docFile" className="sr-only" type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onDoc} aria-invalid={errors.docFile ? 'true' : undefined} aria-describedby={`docFile-hint${errors.docFile ? ' docFile-error' : ''}`} />
            </Field>
          </div>
        </li>
      </ol>

      <h3 className="form-subhead">Ringkasan & kredit</h3>
      <div className="field-pair">
        <Field id="title" label="Judul usulan" error={errors.title}><input type="text" maxLength={140} {...field('title')} /></Field>
        <Field id="category" label="Rubrik"><select {...field('category')}>{newsCategories.map(category => <option key={category}>{category}</option>)}</select></Field>
      </div>
      <div className="field-pair">
        <Field id="writer" label="Penulis" hint="Tampil di bawah berita: “Penulis: …”." error={errors.writer}><input type="text" {...field('writer', { hint: true })} /></Field>
        <Field id="editor" label="Editor" hint="Kosongkan bila ingin ditetapkan redaksi." optional><input type="text" {...field('editor', { hint: true })} /></Field>
      </div>
      <Field id="credit" label="Kredit foto" hint="Contoh: Public Relations, atau Dok. LPPM Universitas X." optional><input type="text" {...field('credit', { hint: true })} /></Field>

      <h3 className="form-subhead">Kontak pengirim</h3>
      <div className="field-pair">
        <Field id="name" label="Nama lengkap" error={errors.name}><input type="text" autoComplete="name" {...field('name')} /></Field>
        <Field id="role" label="Peran"><select {...field('role')}>{ROLES.map(role => <option key={role}>{role}</option>)}</select></Field>
      </div>
      <Field id="institution" label="Institusi / afiliasi" error={errors.institution}><input type="text" autoComplete="organization" {...field('institution')} /></Field>
      <div className="field-pair">
        <Field id="email" label="Email" error={errors.email}><input type="email" autoComplete="email" {...field('email')} /></Field>
        <Field id="phone" label="WhatsApp" optional><input type="tel" autoComplete="tel" {...field('phone')} /></Field>
      </div>
      <Check id="agreeAccuracy" checked={form.agreeAccuracy} onChange={agreeAccuracy => set({ agreeAccuracy })} error={errors.agreeAccuracy}>Fakta, data, kutipan, dan tautan dalam formulir ini akurat dan sudah disetujui narasumber.</Check>
      <Check id="agreeEdit" checked={form.agreeEdit} onChange={agreeEdit => set({ agreeEdit })} error={errors.agreeEdit}>Saya bersedia naskah disunting redaksi; versi akhir tayang setelah saya setujui.</Check>
    </div>
    <div className="form-nav">
      <span />
      <button type="submit" className="button button-dark">Kirim ke redaksi</button>
    </div>
  </form>;
}

function Stepper({ step, reached, onJump }) {
  return <ol className="stepper" aria-label="Langkah pengiriman">
    {STEPS.map((item, index) => {
      const state = index === step ? 'current' : index < reached ? 'done' : 'todo';
      return <li key={item.id} className={`stepper-item is-${state}`}>
        <button type="button" onClick={() => onJump(index)} disabled={index > reached} aria-current={index === step ? 'step' : undefined}>
          <span className="stepper-dot">{state === 'done' ? <CheckIcon /> : String(index + 1).padStart(2, '0')}</span>
          <span className="stepper-copy"><strong>{item.title}</strong><small>{item.copy}</small></span>
        </button>
      </li>;
    })}
  </ol>;
}

function AiAssistant({ form, setForm }) {
  const [state, setState] = useState({ status: 'idle', result: null, error: '' });
  const [undo, setUndo] = useState(null);
  const run = async () => {
    setState({ status: 'loading', result: null, error: '' });
    try {
      const result = await generateNewsDraft(form);
      setState({ status: 'done', result, error: '' });
    } catch (error) {
      setState({ status: 'error', result: null, error: error.message });
    }
  };
  const apply = patch => {
    setUndo({ title: form.title, lead: form.lead, body: form.body, bodyHtml: form.bodyHtml });
    setForm(current => ({ ...current, ...patch, ...('body' in patch ? { bodyHtml: textToHtml(patch.body) } : {}) }));
  };
  const { result } = state;
  return <aside className="ai-panel" aria-labelledby="ai-heading">
    <div className="ai-head">
      <div><h3 id="ai-heading">Asisten draf AI</h3><p>{aiMode === 'remote' ? 'Menyusun judul, lead, dan struktur dari isian Anda.' : 'Mode pratinjau: menyusun ulang isian Anda tanpa model AI. Model redaksi akan terhubung di sini.'}</p></div>
    </div>
    <button type="button" className="button button-dark ai-run" onClick={run} disabled={state.status === 'loading'} aria-describedby="ai-note">
      {state.status === 'loading' ? <><span className="spinner" aria-hidden="true" /> Menyusun draf…</> : <>{result ? 'Susun ulang' : 'Susun draf dengan AI'}</>}
    </button>
    <p className="ai-note" id="ai-note">Hasil AI adalah usulan. Anda tetap bertanggung jawab atas fakta dan kutipan.</p>
    <div aria-live="polite">
      {state.status === 'error' && <p className="field-error">{state.error}</p>}
      {result && <div className="ai-result">
        <p className="ai-label">Alternatif judul</p>
        <ul className="ai-headlines">{result.headlines.map(headline => <li key={headline}><span>{headline}</span><button type="button" onClick={() => apply({ title: headline.slice(0, 110) })}>Pakai</button></li>)}</ul>
        <p className="ai-label">Lead usulan</p>
        <p className="ai-lead">{result.lead}</p>
        <button type="button" className="ai-apply" onClick={() => apply({ lead: result.lead })}>Pakai lead ini</button>
        <p className="ai-label">Struktur piramida terbalik</p>
        <ol className="ai-outline">{result.outline.map(item => <li key={item.heading}><strong>{item.heading}</strong><span>{item.note}</span></li>)}</ol>
        <div className="ai-actions">
          <button type="button" className="button button-outline" onClick={() => apply({ body: result.body })}>Masukkan draf ke isi naskah</button>
          {undo && <button type="button" className="text-link finder-text-button" onClick={() => { setForm(current => ({ ...current, ...undo })); setUndo(null); }}>Urungkan</button>}
        </div>
      </div>}
    </div>
    <ul className="ai-checks" aria-label="Pemeriksaan kelengkapan">
      {draftChecks(form).map(check => <li key={check.label} className={check.ok ? 'is-ok' : undefined}><span aria-hidden="true">{check.ok ? '✓' : '·'}</span>{check.label}<span className="sr-only">{check.ok ? ' — terpenuhi' : ' — belum'}</span></li>)}
    </ul>
  </aside>;
}

function ImagePreview({ form, compact = false }) {
  if (!form.image) return null;
  return <figure className={`image-preview ${compact ? 'is-compact' : ''}`}>
    <div className="image-frame"><img src={form.image.dataUrl} alt={form.alt || ''} style={{ objectPosition: form.focus }} /></div>
    <figcaption>{form.caption || 'Keterangan gambar'} <span>{form.credit || 'Kredit'}</span></figcaption>
  </figure>;
}

function Success({ record, onReset }) {
  const credits = creditParts({ writer: record.writer, editor: record.editor, photo: record.credit }).map(([label, value]) => `${label}: ${value}`).join(' | ');
  const contactLine = `Kontak: ${record.name}, ${record.role}, ${record.institution} · ${record.email}${record.phone ? ` · ${record.phone}` : ''}`;
  const mailBody = record.mode === 'word' ? [
    `Referensi: ${record.reference}`, `Rubrik: ${record.category}`, `Judul: ${record.title}`, `Kredit: ${credits || '-'}`, '',
    contactLine, '', `Formulir Word terlampir: ${record.docFile?.name || '-'}`, 'Saya lampirkan formulir Word dan gambar highlight pada email ini.',
  ].join('\n') : [
    `Referensi: ${record.reference}`, `Jenis: ${newsTypes.find(type => type.id === record.type)?.label}`, `Rubrik: ${record.category}`,
    `Judul: ${record.title}`, '', `Lead: ${record.lead}`, '', `Mengapa sekarang: ${record.hook}`,
    `Tayang diusulkan: ${formatDate(record.publishDate)} ${record.publishSlot} WIB${record.embargo ? ` · Embargo: ${record.embargoAt} (${record.embargoReason})` : ''}`,
    `Sumber: ${record.sourceUrl || '-'}`, `Gambar: ${record.image?.name || '-'} — ${record.caption} (${record.credit})`, '',
    `Kredit: ${credits || '-'}`, contactLine, '',
    '--- Isi naskah ---', record.body, '', 'Gambar highlight saya lampirkan pada email ini.',
  ].join('\n');
  const mailto = `mailto:${contact.news}?subject=${encodeURIComponent(`Kiriman berita ${record.reference} — ${record.title}`)}&body=${encodeURIComponent(mailBody)}`;
  return <section className="submit-success" aria-labelledby="success-heading" tabIndex="-1" ref={node => node?.focus()}>
    <span className="success-mark" aria-hidden="true"><CheckIcon /></span>
    <p className="success-ref">Nomor referensi <strong>{record.reference}</strong></p>
    <h1 id="success-heading">Terima kasih. <em>Kabar Anda sudah tercatat.</em></h1>
    <p className="page-intro">{record.mode === 'word' ? 'Satu langkah lagi: kirim email ke meja redaksi dengan formulir Word dan gambar highlight terlampir.' : 'Satu langkah lagi: kirim ringkasan ke meja redaksi lewat email beserta gambar highlight Anda.'} Simpan nomor referensi untuk korespondensi.</p>
    <div className="button-row">
      <a href={mailto} className="button button-dark">Kirim ke {contact.news}</a>
      <button type="button" className="button button-outline" onClick={onReset}>Kirim berita lain</button>
    </div>
    <ol className="success-timeline">
      <li><strong>≤ 2 hari kerja</strong><span>Editor membalas: diterima, perlu revisi, atau belum cocok untuk kanal ini.</span></li>
      <li><strong>2–5 hari kerja</strong><span>Penyuntingan bersama. Naskah tayang hanya setelah Anda menyetujui versi akhir.</span></li>
      {record.publishDate && <li><strong>{formatDate(record.publishDate)}</strong><span>Tanggal tayang yang Anda usulkan{record.embargo ? ', setelah embargo dibuka' : ''}.</span></li>}
    </ol>
    <p className="form-footnote">Formulir ini belum terhubung ke server redaksi. Kiriman disimpan di perangkat ini dan diteruskan melalui email di atas.</p>
  </section>;
}

export default function NewsSubmit() {
  useDocumentTitle('Kirim Berita');
  const restored = useRef(read(STORE.newsDraft, null));
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(restored.current?.form || {}) }));
  const [step, setStep] = useState(() => restored.current?.step || 0);
  const [reached, setReached] = useState(() => restored.current?.reached || 0);
  const [errors, setErrors] = useState({});
  const [imageNote, setImageNote] = useState('');
  const [record, setRecord] = useState(null);
  const [showRestored, setShowRestored] = useState(Boolean(restored.current));
  const headingRef = useRef(null);
  const firstRender = useRef(true);
  const base = siteBase('news');

  useEffect(() => {
    if (record) return;
    // Large images may not fit in storage; fall back to a draft without the image.
    if (!write(STORE.newsDraft, { form, step, reached })) write(STORE.newsDraft, { form: { ...form, image: null, docFile: null }, step, reached });
  }, [form, step, reached, record]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus();
  }, [step]);

  const set = patch => setForm(current => ({ ...current, ...patch }));
  const field = (name, options) => bind(form, setForm, errors, name, options);
  const onBody = useCallback(({ html, text }) => setForm(current => ({ ...current, bodyHtml: html, body: text })), []);
  const current = STEPS[step];

  const go = index => { setErrors({}); setStep(index); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const next = () => {
    const found = validate(current.id, form);
    setErrors(found);
    if (Object.keys(found).length) { focusFirstError(found); return; }
    if (step === STEPS.length - 1) { submit(); return; }
    setReached(value => Math.max(value, step + 1));
    go(step + 1);
  };

  const submit = () => {
    const entry = { id: makeId('news-submission'), reference: makeReference('NWS'), submittedAt: new Date().toISOString(), status: 'baru', ...form, bodyHtml: sanitizeHtml(form.bodyHtml) };
    const list = read(STORE.newsSubmissions, []);
    // Large files may not fit in storage; keep the record and drop the file contents.
    if (!write(STORE.newsSubmissions, [entry, ...list])) write(STORE.newsSubmissions, [{ ...entry, image: entry.image && { ...entry.image, dataUrl: null }, docFile: entry.docFile && { ...entry.docFile, dataUrl: null } }, ...list]);
    remove(STORE.newsDraft);
    setRecord(entry);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const submitWord = () => {
    const found = validateWord(form);
    setErrors(found);
    if (Object.keys(found).length) { focusFirstError(found); return; }
    submit();
  };
  const pickMode = mode => { setErrors({}); set({ mode }); setStep(0); window.scrollTo({ top: 0, behavior: 'instant' }); };

  const reset = () => { remove(STORE.newsDraft); setForm(EMPTY); setStep(0); setReached(0); setErrors({}); setRecord(null); setShowRestored(false); };

  const onImage = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setErrors(current => ({ ...current, image: 'Gunakan JPG, PNG, atau WebP.' })); return; }
    if (file.size > MAX_IMAGE) { setErrors(current => ({ ...current, image: `Ukuran ${humanSize(file.size)} melebihi batas 5 MB.` })); return; }
    try {
      const image = await readImage(file, 1600);
      set({ image: { name: file.name, size: file.size, width: image.width, height: image.height, dataUrl: image.dataUrl } });
      setErrors(({ image: _removed, ...rest }) => rest);
      const notes = [];
      if (image.width && Math.max(image.width, image.height) < 1600) notes.push(`Resolusi ${image.width}×${image.height} px di bawah anjuran 1.600 px; gambar bisa tampak buram di layar besar.`);
      if (image.width && image.height > image.width) notes.push('Gambar potret akan dipotong ke format lanskap 16:9. Atur fokus agar subjek tetap terlihat.');
      setImageNote(notes.join(' '));
    } catch (error) {
      setErrors(current => ({ ...current, image: error.message }));
    }
  };

  if (record) return <div className="container submit-page"><Success record={record} onReset={reset} /></div>;

  const words = wordCount(form.body);
  const typeLabel = newsTypes.find(type => type.id === form.type)?.label;
  const checks = draftChecks(form);

  return <div className="container submit-page">
    <header className="submit-intro">
      <Link to={`${base}/panduan`} className="back-link">Baca panduan publikasi</Link>
      <h1>Kirim kabar riset <em>ke meja redaksi.</em></h1>
      <p className="page-intro">{!form.mode ? 'Pilih cara mengirim: isi formulir langsung di sini, atau pakai template Word yang sudah Anda kenal.' : form.mode === 'word' ? 'Unduh template, isi di komputer Anda, lalu unggah kembali bersama data kontak.' : 'Lima langkah, sekitar 15 menit. Draf tersimpan otomatis di perangkat ini, jadi Anda bisa melanjutkan nanti.'}</p>
      {form.mode && <button type="button" className="template-link mode-switch" onClick={() => pickMode(form.mode === 'word' ? 'manual' : 'word')}>{form.mode === 'word' ? 'Lebih suka mengisi di sini? Pakai formulir online' : <><DownloadIcon /> Lebih suka Word? Pakai template .docx</>}</button>}
    </header>

    {showRestored && <div className="restored-note" role="status"><span>Draf sebelumnya dipulihkan.</span><button type="button" className="text-link finder-text-button" onClick={reset}>Mulai dari awal</button><button type="button" className="text-link finder-text-button" onClick={() => setShowRestored(false)}>Tutup</button></div>}

    {!form.mode && <ModeChooser onPick={pickMode} />}

    {form.mode === 'word' && <div className="submit-layout is-single"><WordForm form={form} set={set} field={field} errors={errors} onSubmit={{ run: submitWord, setErrors }} /></div>}

    {form.mode === 'manual' && <div className="submit-layout">
      <Stepper step={step} reached={reached} onJump={index => index <= reached && go(index)} />

      <form className="submit-form" noValidate onSubmit={event => { event.preventDefault(); next(); }}>
        <div className="form-step" key={current.id}>
          <h2 ref={headingRef} tabIndex="-1">{current.title}</h2>
          {Object.keys(errors).length > 0 && <p className="form-error-summary" role="alert">Ada {Object.keys(errors).length} isian yang perlu dilengkapi.</p>}

          {current.id === 'angle' && <>
            <ChoiceCards name="type" legend="Jenis kiriman" options={newsTypes} value={form.type} onChange={type => set({ type })} />
            <Field id="category" label="Rubrik" hint="Redaksi dapat memindahkan rubrik saat kurasi.">
              <select {...field('category', { hint: true })}>{newsCategories.map(category => <option key={category}>{category}</option>)}</select>
            </Field>
            <Field id="title" label="Judul usulan" hint="Spesifik dan aktif. Hindari singkatan yang belum dijelaskan." error={errors.title} counter={`${form.title.length}/110`}>
              <input type="text" maxLength={140} {...field('title', { hint: true })} />
            </Field>
            <Field id="lead" label="Lead / ringkasan" hint="35–60 kata. Jawab apa, siapa, kapan, di mana, mengapa, dan bagaimana." error={errors.lead} counter={`${wordCount(form.lead)} kata`}>
              <textarea rows={4} {...field('lead', { hint: true })} />
            </Field>
            <Field id="hook" label="Mengapa sekarang?" hint="Momen yang membuat kabar ini relevan: artikel baru terbit, acara, kebijakan, atau isu publik." error={errors.hook}>
              <textarea rows={2} {...field('hook', { hint: true })} />
            </Field>
            <Field id="keywords" label="Kata kunci" hint="Pisahkan dengan koma. Membantu redaksi dan asisten AI." optional>
              <input type="text" {...field('keywords', { hint: true })} />
            </Field>
          </>}

          {current.id === 'content' && <div className="content-step">
            <div className="content-fields">
              <Field id="body" label="Isi naskah" hint="Piramida terbalik: informasi terpenting di atas. Target 400–900 kata. Format seperti di Word; tempel dari Word juga bisa." error={errors.body} counter={<span className={words >= 400 && words <= 900 ? 'is-good' : undefined}>{words} kata</span>}>
                <RichTextEditor id="body" labelId="body-label" describedBy={`body-hint${errors.body ? ' body-error' : ''}`} invalid={Boolean(errors.body)} value={form.bodyHtml || textToHtml(form.body)} onChange={onBody} placeholder="Mulai tulis naskah di sini…" />
              </Field>
              <div className="field-pair">
                <Field id="quote" label="Kutipan narasumber" hint="Kalimat langsung yang sudah disetujui narasumber." error={errors.quote} optional={form.type === 'opinion'}>
                  <textarea rows={3} {...field('quote', { hint: true })} />
                </Field>
                <Field id="quoteSource" label="Nama & jabatan narasumber" error={errors.quoteSource} optional={form.type === 'opinion'}>
                  <input type="text" {...field('quoteSource')} />
                </Field>
              </div>
              <Field id="sourceUrl" label="DOI atau tautan sumber" hint="Contoh: 10.68627/jetsi.v1i2.18 atau https://…" error={errors.sourceUrl} optional={!['research', 'journal'].includes(form.type)}>
                <input type="text" inputMode="url" {...field('sourceUrl', { hint: true })} />
              </Field>
              <h3 className="form-subhead">Kredit tayang</h3>
              <div className="field-pair">
                <Field id="writer" label="Penulis" hint="Tampil di bawah berita: “Penulis: …”." error={errors.writer}><input type="text" {...field('writer', { hint: true })} /></Field>
                <Field id="editor" label="Editor" hint="Kosongkan bila ingin ditetapkan redaksi." optional><input type="text" {...field('editor', { hint: true })} /></Field>
              </div>
              <p className="field-hint">Kredit foto diisi di langkah berikutnya bersama gambar highlight.</p>
            </div>
            <AiAssistant form={form} setForm={setForm} />
          </div>}

          {current.id === 'media' && <div className="media-step">
            <div>
              <Field id="image" label="Gambar highlight" hint="Lanskap 16:9, sisi panjang ≥ 1.600 px, JPG/PNG/WebP ≤ 5 MB." error={errors.image}>
                <label className={`dropzone ${form.image ? 'has-image' : ''}`} htmlFor="image" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); onImage({ target: { files: event.dataTransfer.files } }); }}>
                  <ImageIcon />
                  <span>{form.image ? <><strong>{form.image.name}</strong> · {humanSize(form.image.size)}{form.image.width ? ` · ${form.image.width}×${form.image.height} px` : ''}</> : <><strong>Pilih gambar</strong> atau seret ke sini</>}</span>
                  <small>{form.image ? 'Klik untuk mengganti' : 'Gambar milik sendiri atau berizin tertulis'}</small>
                </label>
                <input id="image" name="image" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImage} aria-invalid={errors.image ? 'true' : undefined} aria-describedby={`image-hint${errors.image ? ' image-error' : ''}`} />
              </Field>
              {imageNote && <p className="field-warning">{imageNote}</p>}
              <fieldset className="field segmented-field">
                <legend>Fokus gambar</legend>
                <p className="field-hint">Bagian yang dipertahankan saat gambar dipotong ke 16:9.</p>
                <div className="segmented">
                  {FOCUS.map(([value, label]) => <label key={value} className={form.focus === value ? 'is-selected' : undefined}><input type="radio" name="focus" value={value} checked={form.focus === value} onChange={() => set({ focus: value })} />{label}</label>)}
                </div>
              </fieldset>
              <Field id="caption" label="Keterangan gambar" error={errors.caption}><input type="text" {...field('caption')} /></Field>
              <Field id="credit" label="Kredit foto" hint="Contoh: Public Relations, atau Dok. LPPM Universitas X. Tampil sebagai “Foto: …”." error={errors.credit}><input type="text" {...field('credit', { hint: true })} /></Field>
              <Field id="alt" label="Teks alternatif (alt text)" hint="Apa yang terlihat di gambar, dalam satu kalimat." error={errors.alt}><input type="text" {...field('alt', { hint: true })} /></Field>
              <Check id="imageRights" checked={form.imageRights} onChange={imageRights => set({ imageRights })} error={errors.imageRights}>Saya memiliki hak atau izin tertulis untuk gambar ini, dan gambar bukan dari situs stok tanpa lisensi penggunaan ulang.</Check>
            </div>
            <div className="media-preview">
              <p className="ai-label">Pratinjau di NordeoNews</p>
              {form.image ? <article className="preview-card">
                <ImagePreview form={form} compact />
                <div><small>{form.category}</small><strong>{form.title || 'Judul berita Anda'}</strong><p>{form.lead || 'Lead akan tampil di sini.'}</p></div>
              </article> : <div className="preview-empty"><ImageIcon /><p>Pratinjau muncul setelah gambar diunggah.</p></div>}
            </div>
          </div>}

          {current.id === 'schedule' && <>
            <div className="field-pair">
              <Field id="publishDate" label="Tanggal tayang yang diusulkan" hint={`Paling cepat ${formatDate(daysFromNow(3))}; ideal 7 hari dari sekarang.`} error={errors.publishDate}>
                <input type="date" min={daysFromNow(3)} {...field('publishDate', { hint: true })} />
              </Field>
              <Field id="publishSlot" label="Jam tayang">
                <select {...field('publishSlot')}>{SLOTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </Field>
            </div>
            {form.publishDate && form.publishDate < daysFromNow(7) && !errors.publishDate && <p className="field-warning">Waktu tunggu kurang dari 7 hari. Redaksi akan berusaha, tetapi jadwal dapat bergeser.</p>}
            <Check id="embargo" checked={form.embargo} onChange={embargo => set({ embargo })}>Kabar ini terikat embargo (dari penerbit jurnal atau penyelenggara acara).</Check>
            {form.embargo && <div className="field-pair embargo-fields">
              <Field id="embargoAt" label="Embargo dibuka" error={errors.embargoAt}><input type="datetime-local" {...field('embargoAt')} /></Field>
              <Field id="embargoReason" label="Ditetapkan oleh" hint="Nama jurnal atau acara." error={errors.embargoReason}><input type="text" {...field('embargoReason', { hint: true })} /></Field>
            </div>}
            <h3 className="form-subhead">Kontak pengirim</h3>
            <div className="field-pair">
              <Field id="name" label="Nama lengkap" error={errors.name}><input type="text" autoComplete="name" {...field('name')} /></Field>
              <Field id="role" label="Peran"><select {...field('role')}>{ROLES.map(role => <option key={role}>{role}</option>)}</select></Field>
            </div>
            <Field id="institution" label="Institusi / afiliasi" error={errors.institution}><input type="text" autoComplete="organization" {...field('institution')} /></Field>
            <div className="field-pair">
              <Field id="email" label="Email" error={errors.email}><input type="email" autoComplete="email" {...field('email')} /></Field>
              <Field id="phone" label="WhatsApp" optional><input type="tel" autoComplete="tel" {...field('phone')} /></Field>
            </div>
          </>}

          {current.id === 'review' && <div className="review-step">
            <article className="review-card">
              <ImagePreview form={form} />
              <div className="review-copy">
                <h3>{form.title}</h3>
                <p className="review-lead">{form.lead}</p>
                <dl className="review-meta">
                  <div><dt>Jenis</dt><dd>{typeLabel} · {form.category}</dd></div>
                  <div><dt>Tayang</dt><dd>{formatDate(form.publishDate)} · {form.publishSlot} WIB</dd></div>
                  {form.embargo && <div><dt>Embargo</dt><dd>{form.embargoAt.replace('T', ' ')} · {form.embargoReason}</dd></div>}
                  <div><dt>Naskah</dt><dd>{words} kata</dd></div>
                  <div><dt>Narasumber</dt><dd>{form.quoteSource || '—'}</dd></div>
                  <div><dt>Sumber</dt><dd>{form.sourceUrl || '—'}</dd></div>
                  <div><dt>Pengirim</dt><dd>{form.name} · {form.institution}</dd></div>
                </dl>
                <CreditPreview form={form} />
                <div className="review-edit">{STEPS.slice(0, -1).map((item, index) => <button key={item.id} type="button" className="text-link finder-text-button" onClick={() => go(index)}>Ubah {item.title.toLowerCase()}</button>)}</div>
              </div>
            </article>
            <div className="review-side">
              <p className="ai-label">Kelengkapan editorial</p>
              <ul className="ai-checks">{checks.map(check => <li key={check.label} className={check.ok ? 'is-ok' : undefined}><span aria-hidden="true">{check.ok ? '✓' : '·'}</span>{check.label}</li>)}</ul>
              <p className="field-hint">Butir yang belum terpenuhi tidak menghalangi pengiriman, tetapi mempercepat kurasi bila dilengkapi.</p>
              <Check id="agreeAccuracy" checked={form.agreeAccuracy} onChange={agreeAccuracy => set({ agreeAccuracy })} error={errors.agreeAccuracy}>Fakta, data, dan tautan dalam kiriman ini akurat dan dapat diverifikasi.</Check>
              {form.type !== 'opinion' && <Check id="agreeQuote" checked={form.agreeQuote} onChange={agreeQuote => set({ agreeQuote })} error={errors.agreeQuote}>Narasumber sudah menyetujui kutipan dan pencantuman namanya.</Check>}
              <Check id="agreeEdit" checked={form.agreeEdit} onChange={agreeEdit => set({ agreeEdit })} error={errors.agreeEdit}>Saya bersedia naskah disunting redaksi; versi akhir tayang setelah saya setujui.</Check>
            </div>
          </div>}
        </div>

        <div className="form-nav">
          {step > 0 ? <button type="button" className="button button-outline" onClick={() => go(step - 1)}>Kembali</button> : <span />}
          <button type="submit" className="button button-dark">{step === STEPS.length - 1 ? 'Kirim ke redaksi' : `Lanjut: ${STEPS[step + 1].title}`}</button>
        </div>
      </form>
    </div>}
  </div>;
}
