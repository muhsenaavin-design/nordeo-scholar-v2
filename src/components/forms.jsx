// Small form kit shared by the News submission and Academy registration forms:
// visible labels, hint and error text wired through aria-describedby, and inline errors.
export function Field({ id, label, hint, error, optional = false, counter, children, className = '' }) {
  return <div className={`field ${error ? 'has-error' : ''} ${className}`.trim()}>
    <div className="field-label-row">
      <label htmlFor={id}>{label}{optional && <span className="field-optional">opsional</span>}</label>
      {counter && <span className="field-counter">{counter}</span>}
    </div>
    {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    {children}
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}

export function describedBy(id, { hint, error }) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
}

// Props for a text-like control bound to form state.
export function bind(form, setForm, errors, name, { hint } = {}) {
  return {
    id: name,
    name,
    value: form[name] ?? '',
    onChange: event => setForm(current => ({ ...current, [name]: event.target.value })),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': describedBy(name, { hint, error: errors[name] }),
  };
}

export function Check({ id, checked, onChange, error, children }) {
  return <div className={`check-field ${error ? 'has-error' : ''}`}>
    <input id={id} type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined} />
    <label htmlFor={id}>{children}</label>
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}

export function ChoiceCards({ name, legend, options, value, onChange, error }) {
  return <fieldset className={`choice-cards ${error ? 'has-error' : ''}`} aria-describedby={error ? `${name}-error` : undefined}>
    <legend>{legend}</legend>
    <div className="choice-grid">
      {options.map(option => <label key={option.id} className={`choice-card ${value === option.id ? 'is-selected' : ''}`}>
        <input type="radio" name={name} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} />
        <strong>{option.label}</strong>
        {option.hint && <small>{option.hint}</small>}
      </label>)}
    </div>
    {error && <p className="field-error" id={`${name}-error`}>{error}</p>}
  </fieldset>;
}

export const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());

// Moves focus to the first invalid control after a failed submit.
export function focusFirstError(errors) {
  const first = Object.keys(errors)[0];
  if (!first) return;
  requestAnimationFrame(() => {
    const node = document.getElementById(first) || document.querySelector(`[name="${first}"]`);
    node?.focus();
    node?.scrollIntoView?.({ block: 'center', behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth' });
  });
}
