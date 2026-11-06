import { useCallback, useEffect, useRef, useState } from 'react';
import { htmlToText, sanitizeHtml } from '../lib/rich-text';

// A small Word-style editor for the news submission form: block style, bold, italic,
// underline, strike, alignment (incl. justify), lists, quote, link, and clear formatting.
// It runs on contentEditable and the browser's editing commands, so it needs no extra
// dependency. Pasted content (also from Word) is cleaned to the same short tag list the
// article page renders. The parent receives { html, text } on every change.

const path = d => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ICONS = {
  undo: path('M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11'),
  redo: path('m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13'),
  bold: path('M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z'),
  italic: path('M14 5h-4m4 14h-4m3-14-2 14'),
  underline: path('M7 4v7a5 5 0 0 0 10 0V4M5 20h14'),
  strike: path('M5 12h14M16 6.5C15.3 5 13.8 4 12 4c-2.5 0-4 1.4-4 3.2 0 1.3.8 2.2 2.2 2.8M8 17.5c.7 1.5 2.2 2.5 4 2.5 2.5 0 4-1.4 4-3.3 0-.7-.2-1.3-.6-1.7'),
  left: path('M4 6h16M4 10h10M4 14h16M4 18h10'),
  center: path('M4 6h16M7 10h10M4 14h16M7 18h10'),
  right: path('M4 6h16M10 10h10M4 14h16M10 18h10'),
  justify: path('M4 6h16M4 10h16M4 14h16M4 18h16'),
  bullets: path('M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01'),
  numbers: path('M10 6h10M10 12h10M10 18h10M4 5l1.5-1V9M3.8 14.2c.3-.8 2.2-1 2.2.3 0 .9-2.2 1.9-2.2 3.5H6'),
  quote: path('M7 7h4v4c0 3-1.5 5-4 6M14 7h4v4c0 3-1.5 5-4 6'),
  link: path('M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'),
  clear: path('M6 5h11M11 5 8 19M4 20 20 4'),
};

const TOGGLES = [
  [['bold', 'Tebal (Ctrl+B)', 'bold'], ['italic', 'Miring (Ctrl+I)', 'italic'], ['underline', 'Garis bawah (Ctrl+U)', 'underline'], ['strikeThrough', 'Coret', 'strike']],
  [['justifyLeft', 'Rata kiri', 'left'], ['justifyCenter', 'Rata tengah', 'center'], ['justifyRight', 'Rata kanan', 'right'], ['justifyFull', 'Rata kiri-kanan (justify)', 'justify']],
  [['insertUnorderedList', 'Daftar berpoin', 'bullets'], ['insertOrderedList', 'Daftar bernomor', 'numbers']],
];
const BLOCK_STYLES = [['p', 'Paragraf'], ['h2', 'Subjudul'], ['h3', 'Subjudul kecil'], ['blockquote', 'Kutipan']];

const exec = (command, value = null) => {
  try { return typeof document.execCommand === 'function' && document.execCommand(command, false, value); } catch { return false; }
};
const query = (fn, command) => {
  try { return typeof document[fn] === 'function' ? document[fn](command) : false; } catch { return false; }
};

export default function RichTextEditor({ id, value, onChange, labelId, describedBy, invalid, placeholder = '' }) {
  const area = useRef(null);
  const emitted = useRef(null);
  const savedRange = useRef(null);
  const [active, setActive] = useState({});
  const [block, setBlock] = useState('p');
  const [linking, setLinking] = useState(false);
  const [url, setUrl] = useState('https://');
  const [empty, setEmpty] = useState(!value);

  // Load the stored draft, and accept replacements from outside (the AI draft, undo).
  useEffect(() => {
    if (!area.current || value === emitted.current) return;
    area.current.innerHTML = value || '';
    emitted.current = value;
    setEmpty(!htmlToText(value || ''));
  }, [value]);

  const emit = useCallback(() => {
    const html = area.current?.innerHTML || '';
    const text = htmlToText(html);
    emitted.current = html;
    setEmpty(!text);
    onChange({ html, text });
  }, [onChange]);

  const refresh = useCallback(() => {
    const selection = document.getSelection?.();
    if (!selection || !area.current?.contains(selection.anchorNode)) return;
    const next = {};
    TOGGLES.flat().forEach(([command]) => { next[command] = query('queryCommandState', command); });
    setActive(next);
    const value = String(query('queryCommandValue', 'formatBlock') || 'p').toLowerCase().replace(/[<>]/g, '');
    setBlock(BLOCK_STYLES.some(([tag]) => tag === value) ? value : 'p');
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', refresh);
    return () => document.removeEventListener('selectionchange', refresh);
  }, [refresh]);

  const run = (command, value) => {
    area.current?.focus();
    exec(command, value);
    emit();
    refresh();
  };

  const onPaste = event => {
    const html = event.clipboardData?.getData('text/html');
    const text = event.clipboardData?.getData('text/plain');
    if (!html && !text) return;
    event.preventDefault();
    if (html) exec('insertHTML', sanitizeHtml(html));
    else exec('insertText', text);
    emit();
  };

  const openLink = () => {
    const selection = document.getSelection?.();
    if (selection?.rangeCount && area.current?.contains(selection.anchorNode)) savedRange.current = selection.getRangeAt(0).cloneRange();
    setUrl('https://');
    setLinking(true);
  };
  const applyLink = event => {
    event.preventDefault();
    const href = url.trim();
    setLinking(false);
    area.current?.focus();
    if (savedRange.current) { const selection = document.getSelection(); selection.removeAllRanges(); selection.addRange(savedRange.current); }
    if (/^(https?:\/\/\S+\.\S+|mailto:\S+@\S+)$/i.test(href)) {
      if (savedRange.current?.collapsed) exec('insertHTML', `<a href="${href.replace(/"/g, '%22')}">${href.replace(/</g, '&lt;')}</a>`);
      else exec('createLink', href);
    }
    emit();
  };

  const keep = event => event.preventDefault(); // keep the text selection when clicking a tool

  return <div className={`rte ${invalid ? 'is-invalid' : ''}`}>
    <div className="rte-toolbar" role="toolbar" aria-label="Format teks" aria-controls={id}>
      <div className="rte-group">
        <button type="button" onMouseDown={keep} onClick={() => run('undo')} aria-label="Urungkan (Ctrl+Z)" title="Urungkan (Ctrl+Z)">{ICONS.undo}</button>
        <button type="button" onMouseDown={keep} onClick={() => run('redo')} aria-label="Ulangi (Ctrl+Y)" title="Ulangi (Ctrl+Y)">{ICONS.redo}</button>
      </div>
      <div className="rte-group">
        <label className="sr-only" htmlFor={`${id}-block`}>Gaya paragraf</label>
        <select id={`${id}-block`} className="rte-select" value={block} onChange={event => { setBlock(event.target.value); run('formatBlock', event.target.value); }}>
          {BLOCK_STYLES.map(([tag, label]) => <option key={tag} value={tag}>{label}</option>)}
        </select>
      </div>
      {TOGGLES.map((group, index) => <div className="rte-group" key={index}>
        {group.map(([command, label, icon]) => <button key={command} type="button" onMouseDown={keep} onClick={() => run(command)} aria-label={label} title={label} aria-pressed={Boolean(active[command])}>{ICONS[icon]}</button>)}
      </div>)}
      <div className="rte-group">
        <button type="button" onMouseDown={keep} onClick={() => run('formatBlock', block === 'blockquote' ? 'p' : 'blockquote')} aria-label="Kutipan" title="Kutipan" aria-pressed={block === 'blockquote'}>{ICONS.quote}</button>
        <button type="button" onMouseDown={keep} onClick={openLink} aria-label="Sisipkan tautan" title="Sisipkan tautan" aria-expanded={linking}>{ICONS.link}</button>
        <button type="button" onMouseDown={keep} onClick={() => { run('removeFormat'); run('unlink'); }} aria-label="Hapus format" title="Hapus format">{ICONS.clear}</button>
      </div>
    </div>
    {linking && <div className="rte-linkbar" onKeyDown={event => { if (event.key === 'Escape') { setLinking(false); area.current?.focus(); } }}>
      <label htmlFor={`${id}-url`}>Tautan</label>
      <input id={`${id}-url`} type="url" value={url} onChange={event => setUrl(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') applyLink(event); }} autoFocus />
      <button type="button" className="rte-linkbar-apply" onClick={applyLink}>Pasang</button>
      <button type="button" className="text-link finder-text-button" onClick={() => { setLinking(false); area.current?.focus(); }}>Batal</button>
    </div>}
    <div
      ref={area}
      id={id}
      className={`rte-area ${empty ? 'is-empty' : ''}`}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-invalid={invalid ? 'true' : undefined}
      data-placeholder={placeholder}
      spellCheck
      onFocus={() => { exec('defaultParagraphSeparator', 'p'); exec('styleWithCSS', false); }}
      onInput={emit}
      onBlur={emit}
      onKeyUp={refresh}
      onMouseUp={refresh}
      onPaste={onPaste}
    />
  </div>;
}
