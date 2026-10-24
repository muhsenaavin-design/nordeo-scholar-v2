import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { manuscriptStages, participantRoles, trainingPrograms } from '../../data/training';
import { contact } from '../../config/links';
import { STORE, makeId, makeReference, read, write } from '../../lib/store';
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

export default function TrainingRegister() {
  useDocumentTitle('Daftar Minat Academy');
  const [params] = useSearchParams();
  const base = siteBase('training');
  const initialProgram = trainingPrograms.some(program => program.id === params.get('program')) ? params.get('program') : '';
  const [form, setForm] = useState({ program: initialProgram, name: '', email: '', institution: '', role: participantRoles[1], stage: manuscriptStages[1], field: '', needs: '', consent: false });
  const [errors, setErrors] = useState({});
  const [record, setRecord] = useState(null);
  const field = (name, options) => bind(form, setForm, errors, name, options);

  const submit = event => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) { focusFirstError(found); return; }
    const entry = { id: makeId('training-interest'), reference: makeReference('ACD'), submittedAt: new Date().toISOString(), ...form };
    write(STORE.trainingRegistrations, [entry, ...read(STORE.trainingRegistrations, [])]);
    setRecord(entry);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (record) {
    const program = trainingPrograms.find(item => item.id === record.program);
    const body = [`Referensi: ${record.reference}`, `Program: ${program?.title}`, `Nama: ${record.name}`, `Email: ${record.email}`, `Institusi: ${record.institution}`, `Peran: ${record.role}`, `Tahap naskah: ${record.stage}`, `Bidang riset: ${record.field || '-'}`, '', `Kebutuhan: ${record.needs || '-'}`].join('\n');
    return <div className="container submit-page"><section className="submit-success" tabIndex="-1" ref={node => node?.focus()} aria-labelledby="registered-heading">
      <span className="success-mark" aria-hidden="true"><CheckIcon /></span>
      <p className="success-ref">Nomor referensi <strong>{record.reference}</strong></p>
      <h1 id="registered-heading">Terima kasih, {record.name.split(' ')[0]}. <em>Kami kabari lebih dulu.</em></h1>
      <p className="page-intro">Minat Anda untuk <strong>{program?.title}</strong> sudah tercatat. Kirim ringkasannya ke tim Academy agar masuk daftar undangan saat jadwal ditetapkan.</p>
      <div className="button-row">
        <a className="button button-dark" href={`mailto:${contact.training}?subject=${encodeURIComponent(`Minat program ${record.reference} — ${program?.title}`)}&body=${encodeURIComponent(body)}`}>Kirim ke {contact.training}</a>
        <Link className="button button-outline" to={`${base}/#jadwal`}>Lihat program lain</Link>
      </div>
      <p className="form-footnote">Formulir ini belum terhubung ke server Academy. Data tersimpan di perangkat ini dan diteruskan melalui email di atas.</p>
    </section></div>;
  }

  return <div className="container submit-page register-page">
    <header className="submit-intro">
      <Link to={`${base}/`} className="back-link">Kembali ke Academy</Link>
      <h1>Satu langkah <em>menuju kelas pertama.</em></h1>
      <p className="page-intro">Jadwal program masih tentatif. Daftarkan minat Anda, dan kami kabari lebih dulu saat tanggal, fasilitator, dan biaya ditetapkan.</p>
    </header>
    <form className="submit-form register-form" noValidate onSubmit={submit}>
      {Object.keys(errors).length > 0 && <p className="form-error-summary" role="alert">Ada {Object.keys(errors).length} isian yang perlu dilengkapi.</p>}
      <Field id="program" label="Program" error={errors.program}>
        <select {...field('program')}><option value="">Pilih program…</option>{trainingPrograms.map(program => <option key={program.id} value={program.id}>{program.type} — {program.title}</option>)}</select>
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
      <div className="form-nav"><span /><button type="submit" className="button button-dark">Daftarkan minat</button></div>
    </form>
  </div>;
}
