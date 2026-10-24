import { Link } from 'react-router';

export function SmartLink({ href, children, ...rest }) {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return <a href={href} {...rest}>{children}</a>;
  return <Link to={href} {...rest}>{children}</Link>;
}

export function Arrow({ diagonal = false, size }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={diagonal ? 'arrow arrow-diagonal' : 'arrow'} style={size ? { width: size, height: size, flexBasis: size } : undefined}><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="icon"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" /><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

export function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="icon"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

export function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="icon"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8 3.5v3M16 3.5v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

export function ImageIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="icon"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5" /><circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.4" /><path d="m5 17 5-4.5 3.2 2.7 2.6-2.2L20 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function DownloadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="icon"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="icon"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function StatusPill({ children, tone = 'preview' }) {
  return <span className={`status status-${tone}`}>{children}</span>;
}

export function Eyebrow({ children, className = '' }) {
  return <p className={`eyebrow ${className}`.trim()}>{children}</p>;
}

export function SectionHeading({ eyebrow, title, copy, id, link, className = '' }) {
  return <div className={`section-heading ${className}`.trim()} data-reveal>
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 id={id}>{title}</h2></div>
    {copy && <div className="section-heading-aside">{typeof copy === 'string' ? <p>{copy}</p> : copy}{link}</div>}
  </div>;
}

export function EmptyState({ title, copy, action }) {
  return <div className="empty-state"><p className="empty-state-mark" aria-hidden="true">∅</p><h3>{title}</h3><p>{copy}</p>{action}</div>;
}
