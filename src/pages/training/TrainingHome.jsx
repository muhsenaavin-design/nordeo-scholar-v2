import { useState } from 'react';
import { Link } from 'react-router';
import { programTypes, publicationPath, trainingFaq, trainingPrograms, trainingTracks, writingModules } from '../../data/training';
import { contact } from '../../config/links';
import { siteBase } from '../../lib/site';
import { Magnet } from '../../components/effects';
import { Arrow, useDocumentTitle } from '../../components/parts';

export function ProgramCard({ program, base }) {
  return <Link to={`${base}/program/${program.id}`} className="program-card">
    <div className="program-cover"><img src={program.cover} alt="" width="640" height="400" loading="lazy" decoding="async" /><span className="program-type">{program.type}</span></div>
    <div className="program-body">
      <p className="program-date">{program.dateLabel} · {program.mode}</p>
      <h3>{program.title}</h3>
      <p>{program.summary}</p>
      <div className="program-foot"><span className="program-link">Detail program <Arrow /></span></div>
    </div>
  </Link>;
}

export default function TrainingHome() {
  useDocumentTitle('Nordeo Academy');
  const base = siteBase('training');
  const [type, setType] = useState(programTypes[0]);
  const programs = type === programTypes[0] ? trainingPrograms : trainingPrograms.filter(program => program.type === type);
  const showType = next => { setType(next); document.getElementById('jadwal')?.scrollIntoView({ behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth', block: 'start' }); };

  return <>
    <section className="academy-hero" aria-labelledby="academy-heading">
      <div className="academy-hero-art" aria-hidden="true"><span /><span /><span /></div>
      <div className="container academy-hero-inner">
        <h1 id="academy-heading">Menulis, meneliti, <em>dan terbit — bersama.</em></h1>
        <p className="page-intro">Pelatihan penulisan jurnal dan publikasi, seminar, konferensi, dan modul terstruktur — dibawakan oleh editor dan reviewer yang setiap hari membaca naskah.</p>
        <div className="hero-actions academy-actions">
          <Magnet><Link to={`${base}/daftar`} className="button button-gold">Daftar minat </Link></Magnet>
          <Link to={`${base}/#program`} className="text-link">Lihat program <Arrow /></Link>
        </div>
      </div>
    </section>

    <section className="container section-space" id="program" aria-labelledby="tracks-heading">
      <div className="section-heading" data-reveal><div><h2 id="tracks-heading">Empat jalur, <em>satu tujuan: terbit.</em></h2></div><p>Mulai dari seminar singkat, ikuti konferensi, atau dampingi naskah Anda selama beberapa pekan dalam modul kohort.</p></div>
      <div className="track-grid">{trainingTracks.map((track, index) => <button type="button" key={track.id} className={`track-card ${track.id === 'writing' ? 'is-core' : ''}`} onClick={() => showType(track.filter)} data-reveal style={{ '--reveal-delay': `${index * 80}ms` }}>
        <span className="track-number">{track.number}</span>
        <span className="track-label">{track.label}</span>
        <strong>{track.title}</strong>
        <span className="track-copy">{track.copy}</span>
        <span className="track-cta">Lihat jadwal <Arrow /></span>
      </button>)}</div>
    </section>

    <section className="academy-schedule section-space" id="jadwal" aria-labelledby="schedule-heading">
      <div className="container">
        <div className="section-heading" data-reveal><div><h2 id="schedule-heading">Seminar, konferensi, <em>dan modul.</em></h2></div>
          <div className="filter-row" role="group" aria-label="Filter jenis program">{programTypes.map(item => <button key={item} type="button" className={`filter-chip ${type === item ? 'is-active' : ''}`} aria-pressed={type === item} onClick={() => setType(item)}>{item}</button>)}</div>
        </div>
        <p className="placeholder-note" role="note"><strong>Jadwal tentatif.</strong> Program di bawah adalah rencana kurikulum. Tanggal, fasilitator, dan biaya diumumkan setelah final — daftar minat untuk dikabari lebih dulu.</p>
        <p className="sr-only" role="status">{programs.length} program</p>
        <div className="program-grid">{programs.map(program => <ProgramCard key={program.id} program={program} base={base} />)}</div>
      </div>
    </section>

    <section className="container section-space curriculum" id="kurikulum" aria-labelledby="curriculum-heading">
      <div className="curriculum-intro" data-reveal>
        <h2 id="curriculum-heading">Penulisan jurnal, <em>dari pertanyaan sampai respons reviewer.</em></h2>
        <ol className="path-list">{publicationPath.map(step => <li key={step.number}><span>{step.number}</span><div><strong>{step.title}</strong><p>{step.copy}</p></div></li>)}</ol>
      </div>
      <ol className="module-list">{writingModules.map((module, index) => <li key={module.code} data-reveal style={{ '--reveal-delay': `${index * 60}ms` }}><span className="module-code">{module.code}</span><div><strong>{module.title}</strong><p>{module.copy}</p></div></li>)}</ol>
    </section>

    <section className="container institution-band" aria-labelledby="inhouse-heading" data-reveal>
      <div><h2 id="inhouse-heading">Pelatihan in-house <em>untuk fakultas dan LPPM.</em></h2><p>Kurikulum disesuaikan dengan target publikasi dan bidang ilmu peserta.</p></div>
      <a className="button button-gold" href={`mailto:${contact.training}?subject=Pelatihan%20in-house%20Nordeo%20Academy`}>Diskusikan kebutuhan</a>
    </section>

    <section className="container section-space faq" id="faq" aria-labelledby="faq-heading">
      <div className="section-heading" data-reveal><div><h2 id="faq-heading">Pertanyaan <em>yang sering muncul.</em></h2></div></div>
      <div className="faq-list">{trainingFaq.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
    </section>
  </>;
}
