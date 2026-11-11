import { journalMarkParts } from './parts';

// A printed-cover look for each journal, drawn in the journal's own colours (as on the
// JETSI cover): field and ISSN on top, the two-tone wordmark, and the issue line below.
export default function JournalCover({ journal, className = '' }) {
  const [lead, accent] = journalMarkParts(journal.id, journal.short);
  const issn = journal.eissn && journal.eissn !== '—' && journal.eissn !== 'In process' ? `E-ISSN ${journal.eissn}` : 'E-ISSN in process';
  return <div className={`jcover jcover-${journal.id} ${className}`.trim()} aria-hidden="true">
    <svg className="jcover-circuit" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
      <path d="M-10 40h70l24 24h60M210 -10v46l26 26h94M-10 168h48l20-20h46M250 210v-40l-22-22h-40" />
      <circle cx="144" cy="64" r="4" /><circle cx="236" cy="72" r="4" /><circle cx="104" cy="148" r="4" /><circle cx="188" cy="148" r="4" />
      <circle cx="290" cy="168" r="13" className="ring" /><circle cx="290" cy="168" r="4.5" />
    </svg>
    <div className="jcover-top"><span>{journal.categoryLabel}</span><span className="jcover-issn">{issn}</span></div>
    <p className="jcover-mark"><span>{lead}</span><b>{accent}</b></p>
    <p className="jcover-issue">{journal.latestIssue}</p>
  </div>;
}
