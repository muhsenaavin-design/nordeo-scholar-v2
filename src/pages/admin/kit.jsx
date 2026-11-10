// Building blocks shared by the admin modules: record lists (table or cards), forms over a
// record, a reader drawer, tabs, a drag-and-drop list, and a list editor.
import { useEffect, useState } from 'react';
import { downloadFile, formatDate, makeId } from '../../lib/store';
import { daysSince, toCsv } from './admin-store';
import { Btn, Card, Editor, Empty, Field, Icon, IconBtn } from './ui';

export const lines = (text) => String(text || '').split('\n').map((s) => s.trim()).filter(Boolean);
export const reviewTone = (date) => (daysSince(date) > 90 ? 'red' : 'green');
export const reviewText = (date) => (date ? `Ditinjau ${formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Belum ditinjau');
export const exportCsv = (data, toast, rows, columns, name) => { downloadFile(`${name}-${data.today()}.csv`, toCsv(rows, columns), 'text/csv'); data.log('mengekspor', name); toast('File CSV diunduh.'); };
export const moveItem = (list, from, to) => { const next = [...list]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; };
const nameOf = (it) => it.title || it.label || it.name || it.q || '';

// A list of records shown as a table, or as cards when `card` renders one record.
export function RecordList({ title, items, columns, card, fields, blank, onChange, rights, label, delay = 0, rowActions, className = 'c24', toolbar }) {
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const save = (rec) => {
    const exists = items.some((x) => x.id === rec.id);
    onChange(exists ? items.map((x) => (x.id === rec.id ? rec : x)) : [...items, rec], exists ? 'mengubah' : 'menambah', nameOf(rec));
    setEditing(null);
  };
  const actions = (it, i) => <>
    {rowActions?.(it, i)}
    {rights.U && <IconBtn icon="edit" label={`Ubah ${nameOf(it)}`} onClick={() => setEditing(it)} />}
    {!rights.U && rights.R && <IconBtn icon="eye" label={`Lihat ${nameOf(it)}`} onClick={() => setEditing({ ...it, readOnly: true })} />}
    {rights.D && (confirm === it.id
      ? <span className="adm-confirm">Hapus? <Btn kind="danger" onClick={() => { onChange(items.filter((x) => x.id !== it.id), 'menghapus', nameOf(it)); setConfirm(null); }}>Ya</Btn><Btn onClick={() => setConfirm(null)}>Batal</Btn></span>
      : <IconBtn icon="trash" label={`Hapus ${nameOf(it)}`} onClick={() => setConfirm(it.id)} />)}
  </>;
  let body;
  if (items.length === 0) body = <Empty>Belum ada {label}.</Empty>;
  else if (card) body = <ul className="adm-cards">{items.map((it, i) => <li key={it.id} className="adm-rcard">{card(it, i)}<div className="adm-rcard__foot adm-actions">{actions(it, i)}</div></li>)}</ul>;
  else body = <div className="adm-table-wrap"><table className="adm-table">
    <thead><tr>{columns.map(([, head]) => <th key={head} scope="col">{head}</th>)}<th scope="col"><span className="adm-sr">Aksi</span></th></tr></thead>
    <tbody>{items.map((it, i) => <tr key={it.id}>
      {columns.map(([render, head]) => <td key={head}>{render(it, i)}</td>)}
      <td className="adm-actions">{actions(it, i)}</td>
    </tr>)}</tbody>
  </table></div>;
  return <Card title={title} delay={delay} className={className}
    action={rights.C && <Btn kind="primary" icon="plus" onClick={() => setEditing({ ...blank, id: makeId(label) })}>Tambah {label}</Btn>}>
    {toolbar}
    {body}
    {editing && <Editor title={editing.readOnly ? title : `${items.some((x) => x.id === editing.id) ? 'Ubah' : 'Tambah'} ${label}`} fields={fields} value={editing} readOnly={editing.readOnly} onClose={() => setEditing(null)} onSave={save} />}
  </Card>;
}

// A form over a few fields of a record. Only the listed fields are edited and saved, so other keys
// (review dates, section order) changed elsewhere are never overwritten by a stale draft.
export function FormCard({ title, fields, value, onSave, rights, delay, extra, className = 'c24', note, onDraft }) {
  const pick = (v) => Object.fromEntries(fields.map((f) => [f.key, v[f.key] ?? '']));
  const source = pick(value);
  const [draft, setDraft] = useState(source);
  const dirty = JSON.stringify(draft) !== JSON.stringify(source);
  useEffect(() => { onDraft?.(draft); }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps
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

// A wide read-only drawer for reading a submission.
export function Reader({ title, onClose, children }) {
  return <div className="adm-overlay">
    <button type="button" className="adm-overlay__close" onClick={onClose} aria-label="Tutup" tabIndex={-1} />
    <aside className="adm-drawer is-wide" role="dialog" aria-modal="true" aria-label={title}>
      <div className="adm-drawer__head"><h2>{title}</h2><button type="button" className="adm-circle adm-btn" onClick={onClose} aria-label="Tutup" autoFocus><Icon name="close" size={14} width={2} /></button></div>
      {children}
    </aside>
  </div>;
}

// Tabs over a few views of one module. `tabs` is [[id, label, count?], …].
export function Tabs({ tabs, value, onChange, label }) {
  return <div role="tablist" aria-label={label} className="adm-tabs">
    {tabs.map(([id, text, count]) => <button key={id} type="button" role="tab" className="adm-btn" aria-selected={value === id} onClick={() => onChange(id)}>
      {text}{count !== undefined && <span className="adm-tabs__count">{count}</span>}
    </button>)}
  </div>;
}

// A list that can be reordered by dragging the handle, or with the up/down buttons (keyboard).
export function SortableList({ items, getKey = (it) => it.id, render, onMove, disabled, itemLabel = nameOf, className = '' }) {
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const end = () => { setDrag(null); setOver(null); };
  return <ol className={`adm-sort ${className}`}>
    {items.map((it, i) => {
      const cls = ['adm-sort__item', drag === i ? 'is-drag' : '', over === i && drag !== i ? 'is-over' : ''].filter(Boolean).join(' ');
      return <li key={getKey(it)} className={cls} draggable={!disabled}
        onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); }}
        onDragOver={(e) => { if (drag === null) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (over !== i) setOver(i); }}
        onDrop={(e) => { e.preventDefault(); if (drag !== null && drag !== i) onMove(drag, i); end(); }}
        onDragEnd={end}>
        {!disabled && <span className="adm-sort__handle" aria-hidden="true" title="Seret untuk mengubah urutan"><Icon name="grip" size={16} width={2} /></span>}
        <span className="adm-sort__n" aria-hidden="true">{i + 1}</span>
        <div className="adm-sort__body">{render(it, i)}</div>
        {!disabled && <span className="adm-actions adm-sort__moves">
          <IconBtn icon="up" label={`Naikkan ${itemLabel(it)}`} disabled={i === 0} onClick={() => onMove(i, i - 1)} />
          <IconBtn icon="down" label={`Turunkan ${itemLabel(it)}`} disabled={i === items.length - 1} onClick={() => onMove(i, i + 1)} />
        </span>}
      </li>;
    })}
  </ol>;
}

// Edit a list of short texts (mission lines, services): reorder, add, remove, then save once.
export function ListEditor({ items, onSave, rights, addLabel, multiline, splitTitle }) {
  const toRows = (list) => list.map((text, i) => ({ id: `row-${i}-${text.slice(0, 12)}`, text }));
  const [rows, setRows] = useState(() => toRows(items));
  const dirty = JSON.stringify(rows.map((r) => r.text)) !== JSON.stringify(items);
  const set = (id, text) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, text } : r)));
  return <div className="adm-listedit">
    <SortableList items={rows} disabled={!rights.U} onMove={(from, to) => setRows((rs) => moveItem(rs, from, to))} itemLabel={(r) => r.text.slice(0, 40)}
      render={(r) => {
        if (splitTitle) {
          const at = r.text.indexOf(':');
          const head = at > -1 ? r.text.slice(0, at) : r.text;
          const tail = at > -1 ? r.text.slice(at + 1).trim() : '';
          return <div className="adm-listedit__pair">
            <input aria-label="Judul" value={head} disabled={!rights.U} onChange={(e) => set(r.id, `${e.target.value}: ${tail}`)} />
            <textarea aria-label="Penjelasan" rows={2} value={tail} disabled={!rights.U} onChange={(e) => set(r.id, `${head}: ${e.target.value}`)} />
          </div>;
        }
        return multiline
          ? <textarea aria-label="Isi" rows={2} value={r.text} disabled={!rights.U} onChange={(e) => set(r.id, e.target.value)} />
          : <input aria-label="Isi" value={r.text} disabled={!rights.U} onChange={(e) => set(r.id, e.target.value)} />;
      }} />
    <div className="adm-form__foot">
      {rights.C ? <Btn icon="plus" onClick={() => setRows((rs) => [...rs, { id: makeId('row'), text: splitTitle ? 'Nilai baru: ' : '' }])}>Tambah {addLabel}</Btn> : <small className="adm-muted">Menambah dan menghapus {addLabel} hanya untuk Owner.</small>}
      {rights.D && rows.length > 0 && <Btn icon="trash" onClick={() => setRows((rs) => rs.slice(0, -1))}>Hapus terakhir</Btn>}
      {rights.U && <><Btn disabled={!dirty} onClick={() => setRows(toRows(items))}>Batalkan</Btn><Btn kind="primary" icon="check" disabled={!dirty} onClick={() => onSave(rows.map((r) => r.text.trim()).filter(Boolean))}>Simpan perubahan</Btn></>}
    </div>
  </div>;
}
