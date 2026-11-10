import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { manuscriptStages, participantRoles } from '../../data/training';
import { contact } from '../../config/links';
import { STORE, makeId, makeReference, read, write } from '../../lib/store';
import { sendRegistration, usePrograms } from '../../lib/content';
import { siteBase } from '../../lib/site';
import { Arrow, CheckIcon, useDocumentTitle } from '../../components/parts';
import { Check, Field, bind, focusFirstError, isEmail } from '../../components/forms';

function validate(form) {
  const errors = {};
  if (!form.program) errors.program = 'Pilih program yang Anda minati.';
  if (!form.name.trim()) errors.name = 'Tulis nama lengkap.';
  if (!isEmail(form.email)) errors.email = 'Gunakan alamat email yang valid.';
  if (!form.institution.trim()) errors.institution = 'Tulis institusi atau afiliasi.';
  if (!form.consent) errors.consent = 'Setujui agar kami dapat menghubungi Anda.';
  return errors;
}

// Left column: what the chosen programme is, so people register knowing what they asked for.
function ProgramSummary({ program, base }) {
  if (!program) return <aside className="register-summary is-empty" aria-label="Ringkasan program">
    <p className="register-summary-kicker">Ringkasan program</p>
    <h2>Pilih program di formulir.</h2>
    <p>Tanggal, format, fasilitator, dan hal yang Anda pelajari akan tampil di sini.</p>
    <Link to={`${base}/#jadwal`} className="text-link">Lihat agenda program <Arrow /></Link>
  </aside>;
  const facts = [['Jadwal', program.date ? `${program.dateLabel}${program.time ? ` · ${program.time}` : ''}` : program.dateLabel], ['Durasi', program.duration], ['Format', program.mode], ['Fasilitator', program.facilitator], ['Kuota', program.seats], ['Level', program.level]].filter(([, value]) => value);
  return <aside className="register-summary" aria-label="Ringkasan program">
    {program.cover && <img src={program.cover} alt="" width="640" height="400" loading="lazy" decoding="async" />}
    <div className="register-summary-body">
      <p className="register-summary-kicker">{program.type}{program.date ? ' · tanggal tentatif' : ''}</p>
      <h2>{program.title}</h2>
      {program.summary && <p>{program.summary}</p>}
      <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {program.outcomes?.length > 0 && <><p className="register-summary-kicker">Yang Anda bawa pulang</p><ul>{program.outcomes.map(item => <li key={item}>{item}</li>)}</ul></>}
      <Link to={`${base}/program/${program.id}`} className="text-link">Detail program <Arrow /></Link>
    </div>
  </aside>;
}

export default function TrainingRegister() {
  useDocumentTitle('Daftar Minat Academy');
  const [params] = useSearchParams();
  const base = siteBase('training');
  const programs = usePrograms();
  const [sending, setSending] = useState(false);
  const initialProgram = programs.some(program => program.id === params.get('program')) ? params.get('program') : '';
  const [form, setForm] = useState({ program: initialProgram, name: '', email: '', institution: '', role: participantRoles[1], stage: manuscriptStages[1], field: '', needs: '', consent: false });
  const [errors, setErrors] = useState({});
  const [record, setRecord] = useState(null);
  const field = (name, options) => bind(form, setForm, errors, name, options);

  const submit = async event => {
    event.preventDefault();
    if (sending) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) { focusFirstError(found); return; }
    const entry = { id: makeId('training-interest'), reference: makeReference('ACD'), submittedAt: new Date().toISOString(), ...form };
    setSending(true);
    const saved = await sendRegistration(entry).catch(() => false);
    setSending(false);
    if (!saved) write(STORE.trainingRegistrations, [entry, ...read(STORE.trainingRegistrations, [])]);
    setRecord({ ...entry, saved });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (record) {
    const program = programs.find(item => item.id === record.program);
    const body = [`Referensi: ${record.reference}`, `Program: ${program?.title}`, `Nama: ${record.name}`, `Email: ${record.email}`, `Institusi: ${record.institution}`, `Peran: ${record.role}`, `Tahap naskah: ${record.stage}`, `Bidang riset: ${record.field || '-'}`, '', `Kebutuhan: ${record.needs || '-'}`].join('\n');
    return <div className="container submit-page"><section className="submit-success" tabIndex="-1" ref={node => node?.focus()} aria-labelledby="registered-heading">
      <span className="success-mark" aria-hidden="true"><CheckIcon /></span>
      <p className="success-ref">Nomor referensi <strong>{record.reference}</strong></p>
      <h1 id="registered-heading">Terima kasih, {record.name.split(' ')[0]}. <em>Kami kabari lebih dulu.</em></h1>
      <p className="page-intro">Minat Anda untuk <strong>{program?.title}</strong> sudah tercatat. {record.saved ? 'Tim Academy akan mengabari Anda lewat email saat jadwal ditetapkan.' : 'Kirim ringkasannya ke tim Academy agar masuk daftar undangan saat jadwal ditetapkan.'}</p>
      <div className="button-row">
        <a className={`button ${record.saved ? 'button-outline' : 'button-dark'}`} href={`mailto:${contact.training}?subject=${encodeURIComponent(`Minat program ${record.reference} — ${program?.title}`)}&body=${encodeURIComponent(body)}`}>Kirim ke {contact.training}</a>
        <Link className="button button-outline" to={`${base}/#jadwal`}>Lihat program lain</Link>
      </div>
      <p className="form-footnote">{record.saved ? 'Data Anda sudah masuk ke tim Academy. Email di atas hanya bila Anda ingin menambahkan catatan.' : 'Data belum sampai ke server Academy (koneksi terputus). Kirim lewat email di atas agar tetap tercatat.'}</p>
    </section></div>;
  }

  return <div className="container submit-page register-page">
    <header className="submit-intro">
      <Link to={`${base}/`} className="back-link">Kembali ke Academy</Link>
      <h1>Satu langkah <em>menuju kelas pertama.</em></h1>
      <p className="page-intro">Jadwal program masih tentatif. Daftarkan minat Anda, dan kami kabari lebih dulu saat tanggal, fasilitator, dan biaya ditetapkan.</p>
    </header>
    <div className="register-layout">
    <ProgramSummary program={programs.find(item => item.id === form.program)} base={base} />
    <form className="submit-form register-form" noValidate onSubmit={submit}>
      {Object.keys(errors).length > 0 && <p className="form-error-summary" role="alert">Ada {Object.keys(errors).length} isian yang perlu dilengkapi.</p>}
      <Field id="program" label="Program" error={errors.program}>
        <select {...field('program')}><option value="">Pilih program…</option>{programs.map(program => <option key={program.id} value={program.id}>{program.type} — {program.title}</option>)}</select>
      </Field>
      <div className="field-pair">
        <Field id="name" label="Nama lengkap" error={errors.name}><input type="text" autoComplete="name" {...field('name')} /></Field>
        <Field id="email" label="Email" error={errors.email}><input type="email" autoComplete="email" {...field('email')} /></Field>
      </div>
      <Field id="institution" label="Institusi / afiliasi" error={errors.institution}><input type="text" autoComplete="organization" {...field('institution')} /></Field>
      <div className="field-pair">
        <Field id="role" label="Peran"><select {...field('role')}>{participantRoles.map(role => <option key={role}>{role}</option>)}</select></Field>
        <Field id="stage" label="Tahap naskah saat ini"><select {...field('stage')}>{manuscriptStages.map(stage => <option key={stage}>{stage}</option>)}</select></Field>
      </div>
      <Field id="field" label="Bidang riset" hint="Membantu kami mengelompokkan kelas dan contoh kasus." optional><input type="text" {...field('field', { hint: true })} /></Field>
      <Field id="needs" label="Apa yang paling ingin Anda pelajari?" optional><textarea rows={4} {...field('needs')} /></Field>
      <Check id="consent" checked={form.consent} onChange={consent => setForm(current => ({ ...current, consent }))} error={errors.consent}>Saya setuju dihubungi tim Nordeo Academy melalui email terkait program ini.</Check>
      <div className="form-nav"><span /><button type="submit" className="button button-dark" disabled={sending}>{sending ? 'Mengirim…' : 'Daftarkan minat'}</button></div>
    </form>
    </div>
  </div>;
}
