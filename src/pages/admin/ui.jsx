import { useEffect, useId, useState } from 'react';

const ICON_PATHS = {
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" /></>,
  layout: <><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><path d="M3.5 9h17M9 9v11" /></>,
  layers: <><path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z" /><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" /></>,
  news: <><rect x="4" y="4.5" width="13" height="15" rx="2" /><path d="M17 8h2.5v9.5a2 2 0 0 1-2 2H6M7.5 8.5h6M7.5 12h6M7.5 15.5h3.5" /></>,
  cap: <><path d="m2.5 9.5 9.5-5 9.5 5-9.5 5-9.5-5Z" /><path d="M6.5 11.6V16c1.5 1.6 3.4 2.4 5.5 2.4s4-.8 5.5-2.4v-4.4" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  building: <path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V20M15 10h3.5a1.5 1.5 0 0 1 1.5 1.5V20M3.5 20h17M8.5 8h3M8.5 11.5h3M8.5 15h3" />,
  handshake: <path d="m11 7.5-2-1.6a2 2 0 0 0-2.6.1L3 9.2l5.6 6.1a1.6 1.6 0 0 0 2.3.1l.3-.3M13 6.5l1.5-1a2 2 0 0 1 2.4.1L21 9l-6.3 6.6a1.6 1.6 0 0 1-2.3 0L8.8 12a1.6 1.6 0 0 1 0-2.2L11 7.5" />,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="m20.5 15.5-4.5-4.5-8.5 8.5" /></>,
  users: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.6c1.6.6 2.7 2.1 3 4.4" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.6 3.6 5.4 3.6 8.5s-1.2 5.9-3.6 8.5c-2.4-2.6-3.6-5.4-3.6-8.5s1.2-5.9 3.6-8.5Z" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  sun: <><circle cx="12" cy="12" r="3.6" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
  moon: <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  export: <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 15v4h14v-4" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />,
  trash: <path d="M5 7h14M10 11v6M14 11v6M6.5 7l1 12.5h9l1-12.5M9.5 7V4.5h5V7" />,
  up: <path d="m6 14 6-6 6 6" />,
  down: <path d="m6 10 6 6 6-6" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <path d="M4 4l16 16M10.6 6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.4M6.6 7.6C4 9.4 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.5 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  undo: <path d="M9 7 4.5 11.5 9 16M5 11.5h9a5.5 5.5 0 0 1 0 11H11" />,
  star: <path d="m12 4 2.5 5.2 5.6.8-4.1 4 1 5.6L12 17l-5 2.6 1-5.6-4.1-4 5.6-.8L12 4Z" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  upload: <path d="M12 16V5M7.5 9.5 12 5l4.5 4.5M5 16v3h14v-3" />,
};

export function Icon({ name, size = 18, width = 1.7 }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">{ICON_PATHS[name]}</svg>;
}

export function Card({ title, action, className = '', delay = 0, children, style }) {
  return <section className={`adm-card adm-rise ${className}`} style={{ animationDelay: `${delay}ms`, ...style }}>
    {(title || action) && <div className="adm-card__head">{title && <h2 className="adm-card__title">{title}</h2>}{action}</div>}
    {children}
  </section>;
}

export function Btn({ kind = 'ghost', icon, children, ...rest }) {
  return <button type="button" className={`adm-b adm-b--${kind} adm-btn`} {...rest}>{icon && <Icon name={icon} size={16} width={1.8} />}{children}</button>;
}

export function IconBtn({ icon, label, ...rest }) {
  return <button type="button" className="adm-circle is-sm adm-btn" aria-label={label} title={label} {...rest}><Icon name={icon} size={15} width={1.8} /></button>;
}

const TONES = {
  neutral: ['var(--chip)', 'var(--ink2)'], gold: ['rgba(201,162,39,.2)', 'var(--gold-ink)'], green: ['rgba(34,165,90,.15)', 'var(--green-ink)'],
  muted: ['rgba(94,114,120,.12)', 'var(--ink2)'], red: ['rgba(239,68,68,.14)', 'var(--red-ink)'], teal: ['rgba(30,85,102,.14)', 'var(--teal-ink)'],
};
export function Pill({ tone = 'neutral', children }) {
  const [bg, ink] = TONES[tone] || TONES.neutral;
  return <span className="adm-pill" style={{ background: bg, color: ink }}>{children}</span>;
}

export function Empty({ children }) {
  return <p className="adm-empty">{children}</p>;
}

export function Field({ field, value, onChange, disabled }) {
  const id = useId();
  const common = { id, disabled, value: value ?? '', onChange: (e) => onChange(field.type === 'toggle' ? e.target.checked : e.target.value) };
  let control;
  if (field.type === 'textarea') control = <textarea rows={field.rows || 4} {...common} />;
  else if (field.type === 'select') control = <select {...common}>{field.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select>;
  else if (field.type === 'toggle') control = <input type="checkbox" id={id} disabled={disabled} checked={!!value} onChange={common.onChange} />;
  else control = <input type={field.type || 'text'} {...common} />;
  return <div className={`adm-field${field.type === 'toggle' ? ' is-toggle' : ''}${field.type === 'textarea' ? ' is-wide' : ''}`}>
    <label htmlFor={id}>{field.label}</label>
    {control}
    {field.hint && <small>{field.hint}</small>}
  </div>;
}

// Right-side editor driven by a field list. Used by every module that edits records.
export function Editor({ title, fields, value, onSave, onClose, saveLabel = 'Simpan', readOnly }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const submit = (e) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !String(draft[f.key] ?? '').trim());
    if (missing) { setError(`${missing.label} wajib diisi.`); return; }
    onSave(draft);
  };
  return <div className="adm-overlay">
    <button type="button" className="adm-overlay__close" onClick={onClose} aria-label="Tutup editor" tabIndex={-1} />
    <form className="adm-drawer" role="dialog" aria-modal="true" aria-label={title} onSubmit={submit}>
      <div className="adm-drawer__head"><h2>{title}</h2><button type="button" className="adm-circle adm-btn" onClick={onClose} aria-label="Tutup" autoFocus><Icon name="close" size={14} width={2} /></button></div>
      {fields.map((f) => <Field key={f.key} field={f} value={draft[f.key]} disabled={readOnly} onChange={(v) => { setError(''); setDraft((d) => ({ ...d, [f.key]: v })); }} />)}
      {error && <p className="adm-error" role="alert">{error}</p>}
      {!readOnly && <div className="adm-drawer__foot"><Btn onClick={onClose}>Batal</Btn><button type="submit" className="adm-b adm-b--primary adm-btn">{saveLabel}</button></div>}
    </form>
  </div>;
}

export function Toast({ message, onDone }) {
  useEffect(() => { if (!message) return undefined; const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [message, onDone]);
  if (!message) return null;
  return <div className="adm-toast" role="status">{message}</div>;
}
